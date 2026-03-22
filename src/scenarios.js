function computeModulo11CheckDigit(sum) {
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function computeWeightedCheckDigit(value, weights) {
  let sum = 0;

  for (let index = 0; index < value.length; index += 1) {
    sum += (value.charCodeAt(index) - 48) * weights[index];
  }

  return computeModulo11CheckDigit(sum);
}

function createRepeatedDigitValues(length) {
  return Array.from({ length: 10 }, (_, digit) => String(digit).repeat(length));
}

function createRepeatedSanityCases(repeatedValues) {
  return repeatedValues.map((value) => ({
    label: `repetido ${value[0]}`,
    value,
    expected: false,
  }));
}

function generateValidCpf(seed) {
  const baseDigits = String(seed).padStart(9, '0').slice(-9);

  if (/^(\d)\1{8}$/.test(baseDigits)) {
    return generateValidCpf(seed + 1);
  }

  let firstSum = 0;
  let secondSum = 0;

  for (let index = 0; index < 9; index += 1) {
    const digit = baseDigits.charCodeAt(index) - 48;
    firstSum += digit * (10 - index);
    secondSum += digit * (11 - index);
  }

  const firstDigit = computeModulo11CheckDigit(firstSum);
  secondSum += firstDigit * 2;
  const secondDigit = computeModulo11CheckDigit(secondSum);

  return `${baseDigits}${firstDigit}${secondDigit}`;
}

function formatCpf(value) {
  return `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
}

const CNPJ_FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function generateValidCnpj(seed) {
  const baseDigits = String(seed).padStart(12, '0').slice(-12);

  if (/^(\d)\1{11}$/.test(baseDigits)) {
    return generateValidCnpj(seed + 1);
  }

  const firstDigit = computeWeightedCheckDigit(baseDigits, CNPJ_FIRST_WEIGHTS);
  const secondDigit = computeWeightedCheckDigit(`${baseDigits}${firstDigit}`, CNPJ_SECOND_WEIGHTS);

  return `${baseDigits}${firstDigit}${secondDigit}`;
}

function formatCnpj(value) {
  return `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(8, 12)}-${value.slice(12)}`;
}

function invalidateNumericDocument(value) {
  const lastDigit = value.charCodeAt(value.length - 1) - 48;
  const nextDigit = (lastDigit + 1) % 10;
  return `${value.slice(0, -1)}${nextDigit}`;
}

function createNumericDataset(size, definition) {
  const validRaw = [];
  const validMasked = [];
  const invalidWrongCheckDigits = [];
  const invalidEqualDigits = [];
  const invalidIncomplete = [];
  const mixed = [];

  for (let seed = definition.seedStart; validRaw.length < size; seed += 1) {
    const index = validRaw.length;
    const validValue = definition.generateValid(seed * definition.seedMultiplier);
    const maskedValue = definition.format(validValue);
    const invalidValue = invalidateNumericDocument(validValue);
    const repeatedValue = definition.repeatedValues[index % definition.repeatedValues.length];

    validRaw.push(validValue);
    validMasked.push(maskedValue);
    invalidWrongCheckDigits.push(index % 2 === 0 ? invalidValue : definition.format(invalidValue));
    invalidEqualDigits.push(repeatedValue);
    invalidIncomplete.push(definition.createIncompleteValue(validValue, maskedValue, index));
    mixed.push(
      validValue,
      maskedValue,
      invalidValue,
      definition.format(invalidValue),
      repeatedValue,
      definition.createIncompleteValue(validValue, maskedValue, index)
    );
  }

  return {
    validRaw,
    validMasked,
    invalidWrongCheckDigits,
    invalidEqualDigits,
    invalidIncomplete,
    mixed,
  };
}

const cpfRepeatedValues = createRepeatedDigitValues(11);
const cnpjRepeatedValues = createRepeatedDigitValues(14);

const documentDefinitions = {
  cpf: {
    id: 'cpf',
    label: 'CPF',
    pluralLabel: 'CPFs',
    generateValid: generateValidCpf,
    format: formatCpf,
    seedStart: 100000,
    seedMultiplier: 7919,
    repeatedValues: cpfRepeatedValues,
    createIncompleteValue(rawValue, maskedValue, index) {
      const variants = [rawValue.slice(0, 3), rawValue.slice(0, 6), maskedValue.slice(0, 7), maskedValue.slice(0, 11)];
      return variants[index % variants.length];
    },
    createSanityCases() {
      return [
        { label: 'válido sem máscara', value: '13768663663', expected: true },
        { label: 'válido com máscara', value: '137.686.636-63', expected: true },
        { label: 'inválido sem máscara', value: '13768663664', expected: false },
        { label: 'inválido com máscara', value: '137.686.636-64', expected: false },
        ...createRepeatedSanityCases(cpfRepeatedValues),
        { label: 'incompleto sem máscara', value: '355123', expected: false },
        { label: 'incompleto com máscara', value: '355.123', expected: false },
        { label: 'dv incorreto sem máscara', value: '53265691081', expected: false },
        { label: 'dv incorreto com máscara', value: '532.656.910-81', expected: false },
      ];
    },
  },
  cnpj: {
    id: 'cnpj',
    label: 'CNPJ',
    pluralLabel: 'CNPJs',
    generateValid: generateValidCnpj,
    format: formatCnpj,
    seedStart: 500000,
    seedMultiplier: 6151,
    repeatedValues: cnpjRepeatedValues,
    createIncompleteValue(rawValue, maskedValue, index) {
      const variants = [rawValue.slice(0, 4), rawValue.slice(0, 8), maskedValue.slice(0, 6), maskedValue.slice(0, 14)];
      return variants[index % variants.length];
    },
    createSanityCases() {
      return [
        { label: 'válido sem máscara', value: '26149878000187', expected: true },
        { label: 'válido com máscara', value: '26.149.878/0001-87', expected: true },
        { label: 'inválido sem máscara', value: '26149878000188', expected: false },
        { label: 'inválido com máscara', value: '26.149.878/0001-88', expected: false },
        ...createRepeatedSanityCases(cnpjRepeatedValues),
        { label: 'incompleto sem máscara', value: '26149878', expected: false },
        { label: 'incompleto com máscara', value: '26.149.878/0001', expected: false },
        { label: 'dv incorreto sem máscara', value: '26149878000188', expected: false },
        { label: 'dv incorreto com máscara', value: '26.149.878/0001-88', expected: false },
      ];
    },
  },
};

function getDocumentDefinition(documentId) {
  const definition = documentDefinitions[documentId];

  if (!definition) {
    throw new Error(`Unknown document type "${documentId}".`);
  }

  return definition;
}

function buildScenarios(documentId, size) {
  const definition = getDocumentDefinition(documentId);
  const dataset = createNumericDataset(size, definition);

  return [
    {
      id: 'raw_valid',
      label: 'Válidos sem máscara',
      description: `${definition.pluralLabel} válidos com apenas dígitos.`,
      values: dataset.validRaw,
    },
    {
      id: 'masked_valid',
      label: 'Válidos com máscara',
      description: `${definition.pluralLabel} válidos com pontuação.`,
      values: dataset.validMasked,
    },
    {
      id: 'invalid_wrong_check_digits',
      label: 'DV incorreto',
      description: `${definition.pluralLabel} inválidos com dígitos verificadores incorretos.`,
      values: dataset.invalidWrongCheckDigits,
    },
    {
      id: 'invalid_equal_digits',
      label: 'Dígitos iguais',
      description: `${definition.pluralLabel} inválidos formados por dígitos iguais repetidos.`,
      values: dataset.invalidEqualDigits,
    },
    {
      id: 'invalid_incomplete',
      label: 'Incompletos',
      description: `${definition.pluralLabel} inválidos com dígitos faltando.`,
      values: dataset.invalidIncomplete,
    },
    {
      id: 'mixed',
      label: 'Misto',
      description: `${definition.pluralLabel} válidos, inválidos, com máscara, repetidos e incompletos misturados.`,
      values: dataset.mixed,
    },
  ];
}

function createSanityCases(documentId) {
  return getDocumentDefinition(documentId).createSanityCases();
}

function createFeatureCases() {
  return {
    cnpjAlphanumeric: [
      { label: 'raw alphanumeric valid', value: '12ABC34501DE35', expected: true },
      { label: 'masked alphanumeric valid', value: '12.ABC.345/01DE-35', expected: true },
      { label: 'raw alphanumeric invalid', value: '12ABC34501DE36', expected: false },
    ],
  };
}

export {
  documentDefinitions,
  buildScenarios,
  createSanityCases,
  createFeatureCases,
};
