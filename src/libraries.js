import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BR_HELPERS_DOCUMENT_CONFIG = {
  cpf: {
    className: 'Cpf',
    packageModuleId: 'br-helpers/cpf',
  },
  cnpj: {
    className: 'Cnpj',
    packageModuleId: 'br-helpers/cnpj',
  },
};

function findPackageJsonPath(fromPath) {
  let currentPath = fs.statSync(fromPath).isDirectory() ? fromPath : path.dirname(fromPath);

  while (true) {
    const candidate = path.join(currentPath, 'package.json');
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      throw new Error(`Could not find package.json starting from "${fromPath}".`);
    }

    currentPath = parentPath;
  }
}

function readPackageMetadataFromFile(packageJsonPath) {
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

function readPackageVersionFromModule(moduleId) {
  const resolvedPath = require.resolve(moduleId);
  const packageJsonPath = findPackageJsonPath(resolvedPath);
  return readPackageMetadataFromFile(packageJsonPath).version;
}

function createLibrary(definition) {
  return definition;
}

function resolveValidators(moduleValue, packageName, validatorsByDocument) {
  const resolvedValidators = {};

  for (const [documentId, resolveValidator] of Object.entries(validatorsByDocument)) {
    const validator = resolveValidator(moduleValue);

    if (typeof validator !== 'function') {
      throw new TypeError(
        `The library "${packageName}" did not expose a validator function for "${documentId}".`
      );
    }

    resolvedValidators[documentId] = validator;
  }

  return resolvedValidators;
}

function createPackageLibrary({ id, label, homepage, packageName, validatorsByDocument }) {
  return createLibrary({
    id,
    label,
    homepage,
    load() {
      const moduleValue = require(packageName);

      return {
        validators: resolveValidators(moduleValue, packageName, validatorsByDocument),
        version: readPackageVersionFromModule(packageName),
        source: 'npm package',
      };
    },
  });
}

function loadBrHelpersDocument(documentId) {
  const configuration = BR_HELPERS_DOCUMENT_CONFIG[documentId];
  const candidate = configuration.packageModuleId;

  try {
    const moduleValue = require(candidate);
    const documentClass = moduleValue[configuration.className] ?? moduleValue.default?.[configuration.className];

    if (!documentClass || typeof documentClass.isValid !== 'function') {
      throw new TypeError(`The module "${candidate}" does not expose ${configuration.className}.isValid.`);
    }

    return {
      validator: documentClass.isValid.bind(documentClass),
      version: readPackageVersionFromModule(candidate),
      source: 'npm package',
    };
  } catch (error) {
    throw new Error(`Could not load br-helpers ${documentId} from npm package "${candidate}": ${error.message}`);
  }
}

function loadBrHelpersLibrary() {
  const cpf = loadBrHelpersDocument('cpf');
  const cnpj = loadBrHelpersDocument('cnpj');

  return {
    validators: {
      cpf: cpf.validator,
      cnpj: cnpj.validator,
    },
    version: cpf.version === cnpj.version ? cpf.version : `${cpf.version} / ${cnpj.version}`,
    source: cpf.source === cnpj.source ? cpf.source : `${cpf.source} + ${cnpj.source}`,
  };
}

const libraryDefinitions = [
  createLibrary({
    id: 'br-helpers',
    label: 'br-helpers',
    homepage: 'https://www.npmjs.com/package/br-helpers',
    load: loadBrHelpersLibrary,
  }),
  createPackageLibrary({
    id: 'cpf-cnpj-validator',
    label: 'cpf-cnpj-validator',
    homepage: 'https://www.npmjs.com/package/cpf-cnpj-validator',
    packageName: 'cpf-cnpj-validator',
    validatorsByDocument: {
      cpf: (moduleValue) => moduleValue.cpf.isValid,
      cnpj: (moduleValue) => moduleValue.cnpj.isValid,
    },
  }),
  createPackageLibrary({
    id: '@fnando/cpf',
    label: '@fnando/cpf',
    homepage: 'https://www.npmjs.com/package/@fnando/cpf',
    packageName: '@fnando/cpf',
    validatorsByDocument: {
      cpf: (moduleValue) => moduleValue.isValid,
    },
  }),
  createPackageLibrary({
    id: '@fnando/cnpj',
    label: '@fnando/cnpj',
    homepage: 'https://www.npmjs.com/package/@fnando/cnpj',
    packageName: '@fnando/cnpj',
    validatorsByDocument: {
      cnpj: (moduleValue) => moduleValue.isValid,
    },
  }),
  createPackageLibrary({
    id: 'brazilian-values',
    label: 'brazilian-values',
    homepage: 'https://www.npmjs.com/package/brazilian-values',
    packageName: 'brazilian-values',
    validatorsByDocument: {
      cpf: (moduleValue) => moduleValue.isCPF,
      cnpj: (moduleValue) => moduleValue.isCNPJ,
    },
  }),
  createPackageLibrary({
    id: 'cpf',
    label: 'cpf',
    homepage: 'https://www.npmjs.com/package/cpf',
    packageName: 'cpf',
    validatorsByDocument: {
      cpf: (moduleValue) => moduleValue.isValid,
    },
  }),
  createPackageLibrary({
    id: 'js-brasil',
    label: 'js-brasil',
    homepage: 'https://www.npmjs.com/package/js-brasil',
    packageName: 'js-brasil',
    validatorsByDocument: {
      cpf: (moduleValue) => moduleValue.validateBr.cpf,
      cnpj: (moduleValue) => moduleValue.validateBr.cnpj,
    },
  }),
  createPackageLibrary({
    id: 'gerador-validador-cpf',
    label: 'gerador-validador-cpf',
    homepage: 'https://www.npmjs.com/package/gerador-validador-cpf',
    packageName: 'gerador-validador-cpf',
    validatorsByDocument: {
      cpf: (moduleValue) => moduleValue.validate,
    },
  }),
  createPackageLibrary({
    id: 'validar-cpf',
    label: 'validar-cpf',
    homepage: 'https://www.npmjs.com/package/validar-cpf',
    packageName: 'validar-cpf',
    validatorsByDocument: {
      cpf: (moduleValue) => moduleValue,
    },
  }),
  createPackageLibrary({
    id: 'stdnum',
    label: 'stdnum',
    homepage: 'https://www.npmjs.com/package/stdnum',
    packageName: 'stdnum',
    validatorsByDocument: {
      cpf: (moduleValue) => (value) => moduleValue.stdnum.BR.cpf.validate(value).isValid,
      cnpj: (moduleValue) => (value) => moduleValue.stdnum.BR.cnpj.validate(value).isValid,
    },
  }),
  createPackageLibrary({
    id: 'br-validations',
    label: 'br-validations',
    homepage: 'https://www.npmjs.com/package/br-validations',
    packageName: 'br-validations',
    validatorsByDocument: {
      cpf: (moduleValue) => moduleValue.cpf.validate,
      cnpj: (moduleValue) => moduleValue.cnpj.validate,
    },
  }),
  createPackageLibrary({
    id: 'validations-br',
    label: 'validations-br',
    homepage: 'https://www.npmjs.com/package/validations-br',
    packageName: 'validations-br',
    validatorsByDocument: {
      cpf: (moduleValue) => moduleValue.validateCPF,
      cnpj: (moduleValue) => moduleValue.validateCNPJ,
    },
  }),
  createPackageLibrary({
    id: 'validation-br',
    label: 'validation-br',
    homepage: 'https://www.npmjs.com/package/validation-br',
    packageName: 'validation-br',
    validatorsByDocument: {
      cpf: (moduleValue) => moduleValue.isCPF,
      cnpj: (moduleValue) => moduleValue.isCNPJ,
    },
  }),
];

function loadLibraries() {
  return libraryDefinitions.map((definition) => {
    const loaded = definition.load();

    return {
      id: definition.id,
      label: definition.label,
      homepage: definition.homepage,
      version: loaded.version,
      source: loaded.source,
      validators: loaded.validators,
    };
  });
}

export { libraryDefinitions, loadLibraries };
