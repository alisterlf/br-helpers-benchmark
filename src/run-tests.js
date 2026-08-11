// Compatibility matrix: test cases ported from br-helpers (src/cpf.spec.ts and
// src/cnpj.spec.ts), limited to the isValid cases, run against every library.
// Expected values follow the br-helpers contract, including lenient input.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { loadLibraries } from './libraries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const README_PATH = path.resolve(__dirname, '..', 'README.md');
const RESULTS_PATH = path.resolve(__dirname, '..', 'results', 'tests-latest.json');
const README_START_MARKER = '<!-- tests:start -->';
const README_END_MARKER = '<!-- tests:end -->';
const REFERENCE_LIBRARY_ID = 'br-helpers';

const cpfCases = [
  { label: 'Should return false to an empty string', value: '', expected: false },
  { label: 'Should return true to a valid CPF starting with 0', value: '06325112733', expected: true },
  { label: 'Should return true to a valid CPF just with digits', value: '13768663663', expected: true },
  { label: 'Should return true to a valid CPF with separator -', value: '137686636-63', expected: true },
  { label: 'Should return true to a valid CPF with separator - and .', value: '137.686.636-63', expected: true },
  { label: 'Should return false when is not a valid CPF just with digits', value: '06487598710', expected: false },
  { label: 'Should return false when is not a valid CPF with separator -', value: '064875987-10', expected: false },
  { label: 'Should return false when is not a valid CPF with separator - and .', value: '064.875.987-10', expected: false },
  { label: 'Should return false when is mixing digits and letter', value: 'a064.875.987-10', expected: false },
  { label: 'Should return false to special characters', value: '0&.*00.00a-00', expected: false },
  { label: 'Should return false is 11 repeat digits', value: '00000000000', expected: false },
  { label: 'Checker 1 = 0', value: '76381842202', expected: true },
  { label: 'Checker 1 > 1', value: '125.828.106-65', expected: true },
  { label: 'Checker 2 = 0', value: '433.787.588-30', expected: true },
  { label: 'Checker 2 > 1', value: '855.178.021-25', expected: true },
];

const cnpjCases = [
  { label: 'Should validate custom CNPJ code 2C.B1S.6Z0/0001-20', value: '2C.B1S.6Z0/0001-20', expected: true },
  { label: 'Should validate custom CNPJ code V1.3N0.P6L/0001-69', value: 'V1.3N0.P6L/0001-69', expected: true },
  { label: 'Should validate custom CNPJ code 3X.3ZY.B12/0001-10', value: '3X.3ZY.B12/0001-10', expected: true },
  { label: 'Should validate custom CNPJ code 3X.3ZY.B12/A7E3-81', value: '3X.3ZY.B12/A7E3-81', expected: true },
  { label: 'Should validate custom CNPJ code 2C.2GL.8D3/0001-26', value: '2C.2GL.8D3/0001-26', expected: true },
  { label: 'Should return true to a valid CNPJ starting with 0', value: '06860123000189', expected: true },
  { label: 'Should return true to a valid CNPJ just with digits', value: '26533854000127', expected: true },
  { label: 'Should return true to a valid CNPJ with separator -', value: '261498780001-87', expected: true },
  { label: 'Should return true to a valid CNPJ with separator - and /', value: '26149878/0001-87', expected: true },
  { label: 'Should return true to a valid CNPJ with separator - and / and .', value: '26.149.878/0001-87', expected: true },
  { label: 'Should return true to a valid alphanumeric CNPJ', value: '12ABC34501DE35', expected: true },
  { label: 'Should return true to a valid alphanumeric CNPJ typed in lowercase', value: '12abc34501de35', expected: true },
  { label: 'Should return true to another valid alphanumeric CNPJ', value: '1345C3A5000106', expected: true },
  { label: 'Should return true to an all-letter valid alphanumeric CNPJ', value: 'ABCDEFGHIJKL80', expected: true },
  { label: 'Should return false when is not a valid CNPJ just with digits', value: '06860123000188', expected: false },
  { label: 'Should return false when is not a valid CNPJ with separator -', value: '068601230001-88', expected: false },
  { label: 'Should return false when is not a valid CNPJ with separator - and / and .', value: '26.149.878/0001-88', expected: false },
  { label: 'Should return false to an invalid alphanumeric CNPJ', value: 'a1.775.044/0001-31', expected: false },
  { label: 'Should return false to special characters', value: '*1.775.044/0001-31', expected: false },
  { label: 'Should return false is 14 repeat digits', value: '00000000000000', expected: false },
  { label: 'Should return false to an alphanumeric CNPJ with invalid check digits', value: '12ABC34501DE36', expected: false },
  { label: 'Should return false when the first check digit is a letter', value: '12ABC34501DEP5', expected: false },
  { label: 'Should return false when the second check digit is a letter', value: '12ABC34501DE3P', expected: false },
  { label: 'Should return false to an alphanumeric CNPJ that is too short', value: '12ABC34501DE3', expected: false },
  { label: 'Should return false to an alphanumeric CNPJ that is too long', value: '12ABC34501DE350', expected: false },
  { label: 'Should return true to a valid CNPJ with first checker = 0', value: '04.096.776/0001-08', expected: true },
  { label: 'Should return true to a valid CNPJ with first checker 1 >= 1', value: '29.613.398/0001-13', expected: true },
  { label: 'Should return true to a valid CNPJ with second checker = 0', value: '35.661.025/0001-10', expected: true },
  { label: 'Should return true to a valid CNPJ with second checker 2 >= 1', value: '53.638.687/0001-51', expected: true },
];

const cpfLenientCases = [
  { label: 'Should ignore spaces around and between digits', value: ' 137 686 636 63 ', expected: true },
  { label: 'Should ignore separators at unusual positions', value: '1.3.7.6.8.6.6.3.6.6.3', expected: true },
  { label: 'Should ignore doubled separators', value: '137..686..636--63', expected: true },
  { label: 'Should ignore letters mixed into a valid CPF', value: 'a13768663663', expected: true },
  { label: 'Should accept numeric input', value: 13768663663, expected: true },
];

const cnpjLenientCases = [
  { label: 'Should ignore spaces around and between characters', value: ' 26 149 878 0001 87 ', expected: true },
  { label: 'Should ignore separators at unusual positions', value: '2.6.1.4.9.8.7.8.0.0.0.1.8.7', expected: true },
  { label: 'Should ignore doubled separators', value: '26..149..878//0001--87', expected: true },
  { label: 'Should ignore non-ASCII characters', value: 'é26.149.878/0001-87', expected: true },
  { label: 'Should accept numeric input', value: 26533854000127, expected: true },
];

const suites = [
  { id: 'cpf-spec', documentId: 'cpf', label: 'CPF spec', cases: cpfCases },
  { id: 'cpf-lenient', documentId: 'cpf', label: 'CPF leniente', cases: cpfLenientCases },
  { id: 'cnpj-spec', documentId: 'cnpj', label: 'CNPJ spec', cases: cnpjCases },
  { id: 'cnpj-lenient', documentId: 'cnpj', label: 'CNPJ leniente', cases: cnpjLenientCases },
];

function runValidator(validator, value) {
  try {
    return Boolean(validator(value));
  } catch (error) {
    return `threw (${error.message})`;
  }
}

function runSuite(library, suite) {
  const validator = library.validators[suite.documentId];

  if (typeof validator !== 'function') {
    return null;
  }

  const failures = [];

  for (const testCase of suite.cases) {
    const actual = runValidator(validator, testCase.value);

    if (actual !== testCase.expected) {
      failures.push({ ...testCase, actual });
    }
  }

  return {
    total: suite.cases.length,
    passed: suite.cases.length - failures.length,
    failures,
  };
}

function buildResults() {
  const libraries = loadLibraries();

  return {
    generatedAt: new Date().toISOString(),
    suites: suites.map(({ id, documentId, label, cases }) => ({
      id,
      documentId,
      label,
      total: cases.length,
    })),
    libraries: libraries.map((library) => {
      const suiteResults = {};

      for (const suite of suites) {
        suiteResults[suite.id] = runSuite(library, suite);
      }

      return {
        id: library.id,
        label: library.label,
        homepage: library.homepage,
        version: library.version,
        suites: suiteResults,
      };
    }),
  };
}

function formatCell(suiteResult) {
  if (suiteResult === null) {
    return '—';
  }

  return `${suiteResult.passed}/${suiteResult.total}`;
}

function renderReadmeSection(results) {
  const generatedAt = new Date(results.generatedAt).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  });
  const lines = [
    `- Gerado em: ${generatedAt}`,
    '',
    `| Pacote | Versão | ${results.suites.map((suite) => `${suite.label} (${suite.total})`).join(' | ')} |`,
    `| --- | ---: | ${results.suites.map(() => '---:').join(' | ')} |`,
  ];

  for (const library of results.libraries) {
    const cells = results.suites.map((suite) => formatCell(library.suites[suite.id]));
    lines.push(`| [${library.label}](${library.homepage}) | ${library.version} | ${cells.join(' | ')} |`);
  }

  return lines.join('\n');
}

function updateReadme(results) {
  const currentReadme = fs.readFileSync(README_PATH, 'utf8');

  if (!currentReadme.includes(README_START_MARKER) || !currentReadme.includes(README_END_MARKER)) {
    throw new Error('README test markers were not found.');
  }

  const replacement = `${README_START_MARKER}\n${renderReadmeSection(results)}\n${README_END_MARKER}`;
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

function printSummary(results) {
  for (const library of results.libraries) {
    console.log(`\n=== ${library.label} (${library.version}) ===`);

    for (const suite of results.suites) {
      const suiteResult = library.suites[suite.id];

      if (suiteResult === null) {
        console.log(`[—]    ${suite.label}: não suportado`);
        continue;
      }

      const status = suiteResult.failures.length === 0 ? 'PASS' : 'FAIL';
      console.log(`[${status}] ${suite.label}: ${suiteResult.passed}/${suiteResult.total} passed`);

      for (const failure of suiteResult.failures) {
        console.log(`  ✗ ${failure.label}`);
        console.log(`      value: ${JSON.stringify(failure.value)} | expected: ${failure.expected} | actual: ${failure.actual}`);
      }
    }
  }
}

function main() {
  const argumentsSet = new Set(process.argv.slice(2));
  const results = buildResults();

  printSummary(results);
  saveResults(results);
  console.log(`\nResults saved to: ${RESULTS_PATH}`);

  if (!argumentsSet.has('--no-readme')) {
    updateReadme(results);
    console.log(`README updated: ${README_PATH}`);
  }

  const reference = results.libraries.find((library) => library.id === REFERENCE_LIBRARY_ID);
  const referenceFailures = Object.values(reference.suites).reduce(
    (count, suiteResult) => count + (suiteResult ? suiteResult.failures.length : 0),
    0
  );

  if (referenceFailures > 0) {
    console.log(`\n${REFERENCE_LIBRARY_ID} failed ${referenceFailures} of its own spec case(s).`);
    process.exitCode = 1;
  } else {
    console.log(`\n${REFERENCE_LIBRARY_ID} passes all of its spec cases. Other libraries' failures are informational.`);
  }
}

main();
