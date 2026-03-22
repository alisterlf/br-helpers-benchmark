import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { Bench } from 'tinybench';

import { loadLibraries } from './libraries.js';
import {
  documentDefinitions,
  buildScenarios,
  createSanityCases,
  createFeatureCases,
} from './scenarios.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const README_PATH = path.resolve(__dirname, '..', 'README.md');
const RESULTS_PATH = path.resolve(__dirname, '..', 'results', 'latest.json');
const README_START_MARKER = '<!-- benchmark:start -->';
const README_END_MARKER = '<!-- benchmark:end -->';
const DEFAULT_BASELINE_LIBRARY_ID = 'br-helpers';
const DOCUMENT_IDS = Object.keys(documentDefinitions);
const DEFAULT_DATASET_SIZE = 25_000;
const DEFAULT_BENCHMARK_TIME_MS = 3_000;
const DEFAULT_WARMUP_TIME_MS = 1_000;
const DEFAULT_MIN_ITERATIONS = 1;
const DEFAULT_MIN_WARMUP_ITERATIONS = 1;

function parsePositiveInteger(value, fallbackValue) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallbackValue;
}

function getBenchmarkOptions() {
  return {
    datasetSize: parsePositiveInteger(process.env.BENCHMARK_DATASET_SIZE, DEFAULT_DATASET_SIZE),
    benchmarkTimeMs: parsePositiveInteger(process.env.BENCHMARK_TIME_MS, DEFAULT_BENCHMARK_TIME_MS),
    warmupTimeMs: parsePositiveInteger(process.env.BENCHMARK_WARMUP_TIME_MS, DEFAULT_WARMUP_TIME_MS),
    minIterations: parsePositiveInteger(process.env.BENCHMARK_MIN_ITERATIONS, DEFAULT_MIN_ITERATIONS),
    minWarmupIterations: parsePositiveInteger(
      process.env.BENCHMARK_MIN_WARMUP_ITERATIONS,
      DEFAULT_MIN_WARMUP_ITERATIONS
    ),
    baselineLibraryId: process.env.BENCHMARK_BASELINE_LIBRARY_ID || DEFAULT_BASELINE_LIBRARY_ID,
  };
}

function runBatch(validator, values) {
  let truthyCount = 0;

  for (let index = 0; index < values.length; index += 1) {
    if (validator(values[index])) {
      truthyCount += 1;
    }
  }

  return truthyCount;
}

function executeValidator(validator, value) {
  try {
    return validator(value);
  } catch {
    return Symbol.for('validator:error');
  }
}

function supportsAlphanumericCnpj(validator) {
  const featureCases = createFeatureCases().cnpjAlphanumeric;

  return featureCases.every((featureCase) => executeValidator(validator, featureCase.value) === featureCase.expected);
}

function createLibraryCatalog(libraries) {
  return libraries.map(({ validators, ...library }) => ({
    ...library,
    supports: {
      cpf: typeof validators.cpf === 'function',
      cnpj: typeof validators.cnpj === 'function',
      cnpjAlphanumeric:
        typeof validators.cnpj === 'function' ? supportsAlphanumericCnpj(validators.cnpj) : false,
    },
  }));
}

function collectSanityFailures(documentId, library, sanityCases) {
  const failures = [];
  const validator = library.validators[documentId];

  for (const sanityCase of sanityCases) {
    const actualValue = executeValidator(validator, sanityCase.value);

    if (actualValue !== sanityCase.expected) {
      failures.push(
        `${library.label} returned ${String(actualValue)} for ${documentId.toUpperCase()} ` +
          `"${sanityCase.label}" but expected ${sanityCase.expected}.`
      );
    }
  }

  return failures;
}

function stripLibraryMetadata(library) {
  const { validators, ...metadata } = library;
  return metadata;
}

function partitionLibrariesBySanity(documentId, libraries, sanityCases) {
  const compatibleLibraries = [];
  const skippedLibraries = [];

  for (const library of libraries) {
    const failures = collectSanityFailures(documentId, library, sanityCases);

    if (failures.length === 0) {
      compatibleLibraries.push(library);
      continue;
    }

    skippedLibraries.push({
      ...stripLibraryMetadata(library),
      failures,
    });
  }

  return {
    compatibleLibraries,
    skippedLibraries,
  };
}

function assertBaselineLibraryPresent(documentId, libraries, baselineLibraryId) {
  if (libraries.some((library) => library.id === baselineLibraryId)) {
    return;
  }

  throw new Error(
    `Baseline library "${baselineLibraryId}" is not available for ${documentId.toUpperCase()} after sanity filtering.`
  );
}

function createEnvironmentSummary() {
  const cpuInfo = os.cpus();
  return {
    node: process.version,
    platform: `${os.platform()} ${os.release()}`,
    arch: os.arch(),
    cpuModel: cpuInfo[0]?.model ?? 'Unknown CPU',
    cpuCount: cpuInfo.length,
  };
}

function toOpsPerSecond(value, batchSize) {
  return value * batchSize;
}

function createMeasurementFromTask(task, batchSize, truthyCountPerBatch) {
  const { result, runs } = task;

  if (!result || result.state !== 'completed') {
    throw new Error(`Task "${task.name}" did not complete successfully.`);
  }

  return {
    medianOpsPerSecond: toOpsPerSecond(result.throughput.p50, batchSize),
    meanOpsPerSecond: toOpsPerSecond(result.throughput.mean, batchSize),
    minOpsPerSecond: toOpsPerSecond(result.throughput.min, batchSize),
    maxOpsPerSecond: toOpsPerSecond(result.throughput.max, batchSize),
    relativeMarginOfError: result.throughput.rme,
    sampleCount: result.throughput.samplesCount,
    totalTimeMs: result.totalTime,
    periodMsPerBatch: result.period,
    checksum: truthyCountPerBatch * runs,
    runs,
  };
}

async function measureScenario(libraries, documentId, scenario, options) {
  const bench = new Bench({
    time: options.benchmarkTimeMs,
    warmupTime: options.warmupTimeMs,
    iterations: options.minIterations,
    warmupIterations: options.minWarmupIterations,
    throws: true,
  });
  const sink = { value: 0 };
  const taskMetadata = new Map();

  for (const library of libraries) {
    const validator = library.validators[documentId];
    const truthyCountPerBatch = runBatch(validator, scenario.values);

    taskMetadata.set(library.id, {
      batchSize: scenario.values.length,
      truthyCountPerBatch,
    });

    bench.add(library.id, () => {
      sink.value ^= runBatch(validator, scenario.values);
    });
  }

  await bench.run();

  if (sink.value === Number.MIN_SAFE_INTEGER) {
    throw new Error('Unexpected benchmark sink state.');
  }

  const measurements = {};

  for (const task of bench.tasks) {
    const metadata = taskMetadata.get(task.name);
    measurements[task.name] = createMeasurementFromTask(task, metadata.batchSize, metadata.truthyCountPerBatch);
  }

  return measurements;
}

async function createDocumentBenchmark(documentId, libraries, options, skippedLibraries) {
  const scenarios = buildScenarios(documentId, options.datasetSize);
  const measurements = {};

  for (const scenario of scenarios) {
    measurements[scenario.id] = await measureScenario(libraries, documentId, scenario, options);
  }

  return {
    id: documentId,
    label: documentDefinitions[documentId].label,
    libraries: libraries.map(stripLibraryMetadata),
    skippedLibraries,
    scenarios: scenarios.map(({ values, ...scenario }) => ({
      ...scenario,
      sampleSize: values.length,
    })),
    measurements,
  };
}

async function buildResults(libraries, options) {
  const benchmarks = {};

  for (const documentId of DOCUMENT_IDS) {
    const documentLibraries = libraries.filter((library) => typeof library.validators[documentId] === 'function');
    const sanityCases = createSanityCases(documentId);
    const { compatibleLibraries, skippedLibraries } = partitionLibrariesBySanity(
      documentId,
      documentLibraries,
      sanityCases
    );

    assertBaselineLibraryPresent(documentId, compatibleLibraries, options.baselineLibraryId);
    benchmarks[documentId] = await createDocumentBenchmark(
      documentId,
      compatibleLibraries,
      options,
      skippedLibraries
    );
  }

  return {
    generatedAt: new Date().toISOString(),
    environment: createEnvironmentSummary(),
    options,
    libraries: createLibraryCatalog(libraries),
    benchmarks,
  };
}

function sortLibrariesByScenario(benchmark, scenarioId) {
  return [...benchmark.libraries].sort((left, right) => {
    const rightMeasurement = benchmark.measurements[scenarioId][right.id].medianOpsPerSecond;
    const leftMeasurement = benchmark.measurements[scenarioId][left.id].medianOpsPerSecond;
    return rightMeasurement - leftMeasurement;
  });
}

function formatInteger(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function formatRatio(value) {
  return `${value.toFixed(2)}x`;
}

function formatSupport(value) {
  return value ? 'Sim' : 'Não';
}

function createCoverageTable(results) {
  const lines = [
    '| Pacote | Versão | CPF | CNPJ | CNPJ alfanumérico |',
    '| --- | ---: | ---: | ---: | ---: |',
  ];

  for (const library of results.libraries) {
    lines.push(
      `| [${library.label}](${library.homepage}) | ${library.version} | ${formatSupport(library.supports.cpf)} | ${formatSupport(
        library.supports.cnpj
      )} | ${formatSupport(library.supports.cnpjAlphanumeric)} |`
    );
  }

  return lines.join('\n');
}

function createRankingTable(benchmark, baselineLibraryId) {
  const baselineOps = benchmark.measurements.mixed[baselineLibraryId].medianOpsPerSecond;
  const rankedLibraries = sortLibrariesByScenario(benchmark, 'mixed');

  const lines = [
    '| Posição | Pacote | Versão | Misto ops/s | Relativo ao br-helpers |',
    '| ---: | --- | ---: | ---: | ---: |',
  ];

  rankedLibraries.forEach((library, index) => {
    const measurement = benchmark.measurements.mixed[library.id].medianOpsPerSecond;
    const relativeToBaseline = baselineOps / measurement;

    lines.push(
      `| ${index + 1} | [${library.label}](${library.homepage}) | ${library.version} | ${formatInteger(
        measurement
      )} | ${formatRatio(relativeToBaseline)} |`
    );
  });

  return lines.join('\n');
}

function createScenarioTable(benchmark, baselineLibraryId, coverageByLibraryId) {
  const baselineMixedOps = benchmark.measurements.mixed[baselineLibraryId].medianOpsPerSecond;
  const libraries = sortLibrariesByScenario(benchmark, 'mixed');
  const isCnpjBenchmark = benchmark.id === 'cnpj';
  const scenarioColumns = benchmark.scenarios.map((scenario) => ({
    id: scenario.id,
    label: scenario.label,
  }));
  const lines = isCnpjBenchmark
    ? [
        `| Pacote | ${scenarioColumns.map((scenario) => scenario.label).join(' | ')} | CNPJ alfanumérico | Misto vs br-helpers |`,
        `| --- | ${scenarioColumns.map(() => '---:').join(' | ')} | ---: | ---: |`,
      ]
    : [
        `| Pacote | ${scenarioColumns.map((scenario) => scenario.label).join(' | ')} | Misto vs br-helpers |`,
        `| --- | ${scenarioColumns.map(() => '---:').join(' | ')} | ---: |`,
      ];

  for (const library of libraries) {
    const scenarioValues = scenarioColumns.map((scenario) =>
      formatInteger(benchmark.measurements[scenario.id][library.id].medianOpsPerSecond)
    );
    const mixedOps = benchmark.measurements.mixed[library.id].medianOpsPerSecond;

    if (isCnpjBenchmark) {
      const coverage = coverageByLibraryId.get(library.id);

      lines.push(
        `| [${library.label}](${library.homepage}) | ${scenarioValues.join(' | ')} | ${formatSupport(
          coverage?.supports.cnpjAlphanumeric ?? false
        )} | ${formatRatio(baselineMixedOps / mixedOps)} |`
      );

      continue;
    }

    lines.push(
      `| [${library.label}](${library.homepage}) | ${scenarioValues.join(' | ')} | ${formatRatio(
        baselineMixedOps / mixedOps
      )} |`
    );
  }

  return lines.join('\n');
}

function renderBenchmarkSection(benchmark, baselineLibraryId, coverageByLibraryId) {
  const lines = [
    `### Benchmark de ${benchmark.label}`,
    '',
    '#### Ranking por cenário misto',
    '',
    createRankingTable(benchmark, baselineLibraryId),
    '',
    '#### Tabela completa',
    '',
    createScenarioTable(benchmark, baselineLibraryId, coverageByLibraryId),
    '',
    '#### Cenarios',
    '',
    ...benchmark.scenarios.map(
      (scenario) => `- \`${scenario.id}\`: ${scenario.description} (${formatInteger(scenario.sampleSize)} entradas)`
    ),
  ];

  if (benchmark.skippedLibraries.length > 0) {
    lines.push('');
    lines.push('#### Bibliotecas fora deste benchmark');
    lines.push('');

    for (const skippedLibrary of benchmark.skippedLibraries) {
      lines.push(`- \`${skippedLibrary.label}\`: ${skippedLibrary.failures.join(' | ')}`);
    }
  }

  return lines.join('\n');
}

function renderReadmeSection(results) {
  const generatedAt = new Date(results.generatedAt).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  });
  const coverageByLibraryId = new Map(results.libraries.map((library) => [library.id, library]));
  const sections = [
    [
      '### Última execução',
      '',
      `- Gerado em: ${generatedAt}`,
      `- Node.js: \`${results.environment.node}\``,
      `- Plataforma: \`${results.environment.platform}\` (${results.environment.arch})`,
      `- CPU: \`${results.environment.cpuModel}\` x${results.environment.cpuCount}`,
      `- Dataset por cenário base: ${formatInteger(results.options.datasetSize)} documentos`,
      `- Warmup por tarefa: ${formatInteger(results.options.warmupTimeMs)} ms`,
      `- Medição por tarefa: ${formatInteger(results.options.benchmarkTimeMs)} ms`,
    ].join('\n'),
    ['### Tabela comparativa', '', createCoverageTable(results)].join('\n'),
    ...DOCUMENT_IDS.map((documentId) =>
      renderBenchmarkSection(results.benchmarks[documentId], results.options.baselineLibraryId, coverageByLibraryId)
    ),
  ];

  return sections.join('\n\n');
}

function updateReadme(results) {
  const currentReadme = fs.readFileSync(README_PATH, 'utf8');
  const renderedSection = renderReadmeSection(results);
  const replacement = `${README_START_MARKER}\n${renderedSection}\n${README_END_MARKER}`;

  if (!currentReadme.includes(README_START_MARKER) || !currentReadme.includes(README_END_MARKER)) {
    throw new Error('README markers were not found.');
  }

  const updatedReadme = currentReadme.replace(
    new RegExp(`${README_START_MARKER}[\\s\\S]*${README_END_MARKER}`),
    replacement
  );

  fs.writeFileSync(README_PATH, updatedReadme);
}

function saveResults(results) {
  fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
  fs.writeFileSync(RESULTS_PATH, `${JSON.stringify(results, null, 2)}\n`);
}

function loadStoredResults() {
  if (!fs.existsSync(RESULTS_PATH)) {
    throw new Error(`Could not find ${RESULTS_PATH}. Run npm run benchmark first.`);
  }

  return JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
}

function printSummary(results, { readmeUpdated }) {
  console.log('Benchmark finished.');
  console.log(readmeUpdated ? `README updated: ${README_PATH}` : `README not updated: ${README_PATH}`);
  console.log(`Results saved to: ${RESULTS_PATH}`);

  for (const documentId of DOCUMENT_IDS) {
    const benchmark = results.benchmarks[documentId];
    const ranking = sortLibrariesByScenario(benchmark, 'mixed');

    console.log('');
    console.log(`${benchmark.label}:`);

    for (const library of ranking) {
      const mixedOps = benchmark.measurements.mixed[library.id].medianOpsPerSecond;
      console.log(`${library.label}: ${formatInteger(mixedOps)} ops/s`);
    }
  }
}

async function main() {
  const argumentsSet = new Set(process.argv.slice(2));

  if (argumentsSet.has('--readme-only')) {
    const storedResults = loadStoredResults();
    updateReadme(storedResults);
    console.log(`README updated from stored results: ${README_PATH}`);
    return;
  }

  const options = getBenchmarkOptions();
  const libraries = loadLibraries();
  const results = await buildResults(libraries, options);

  saveResults(results);
  const readmeUpdated = !argumentsSet.has('--no-readme');

  if (readmeUpdated) {
    updateReadme(results);
  }

  printSummary(results, { readmeUpdated });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
