# br-helpers-benchmark

Projeto dedicado a comparar a validação de CPF e CNPJ do `br-helpers` com bibliotecas populares do npm.

Os benchmarks são executados com `Tinybench`, usando configuração padrão mais longa e datasets maiores para reduzir ruído entre execuções.

## Como rodar

```bash
npm install
npm run benchmark
```

O comando acima:

1. executa os sanity checks para confirmar que todas as libs concordam com casos conhecidos, incluindo documentos inválidos
2. roda os cenários de benchmark de CPF e CNPJ com `Tinybench`
3. salva o resultado em `results/latest.json`
4. atualiza a seção gerada automaticamente deste `README.md`

Por padrão, a execução usa:

1. `25_000` documentos por cenário base
2. `1_000 ms` de warmup por tarefa
3. `3_000 ms` de medição por tarefa

Se quiser ajustar o custo x precisão, use as variáveis `BENCHMARK_DATASET_SIZE`, `BENCHMARK_WARMUP_TIME_MS`, `BENCHMARK_TIME_MS`, `BENCHMARK_MIN_WARMUP_ITERATIONS` e `BENCHMARK_MIN_ITERATIONS`.

## Como adicionar outra lib

1. instale a dependência com `npm install <pacote>`
2. adicione uma entrada em [src/libraries.js](./src/libraries.js)
3. rode `npm run benchmark`

Cada biblioteca fica declarada em um objeto pequeno com `id`, `label`, `homepage` e validadores por documento, para manter a comparação fácil de estender.

## br-helpers usado no benchmark

O benchmark usa diretamente a versão publicada no npm:

1. `br-helpers/cpf`
2. `br-helpers/cnpj`

Assim a comparação sempre reflete a versão instalada do pacote publicado.

## Resultados

<!-- benchmark:start -->
### Última execução

- Gerado em: 22/03/2026, 06:29:13
- Node.js: `v24.14.0`
- Plataforma: `win32 10.0.26220` (x64)
- CPU: `AMD Ryzen 9 7950X 16-Core Processor            ` x32
- Dataset por cenário base: 25,000 documentos
- Warmup por tarefa: 1,000 ms
- Medição por tarefa: 3,000 ms

### Tabela comparativa

| Pacote | Versão | CPF | CNPJ | CNPJ alfanumérico |
| --- | ---: | ---: | ---: | ---: |
| [br-helpers](https://www.npmjs.com/package/br-helpers) | 3.1.1 | Sim | Sim | Sim |
| [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 1.0.3 | Sim | Sim | Não |
| [@fnando/cpf](https://www.npmjs.com/package/@fnando/cpf) | 1.0.2 | Sim | Não | Não |
| [@fnando/cnpj](https://www.npmjs.com/package/@fnando/cnpj) | 2.0.0 | Não | Sim | Sim |
| [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 0.13.1 | Sim | Sim | Não |
| [cpf](https://www.npmjs.com/package/cpf) | 2.0.1 | Sim | Não | Não |
| [js-brasil](https://www.npmjs.com/package/js-brasil) | 2.6.4 | Sim | Sim | Não |
| [gerador-validador-cpf](https://www.npmjs.com/package/gerador-validador-cpf) | 6.3.0 | Sim | Não | Não |
| [validar-cpf](https://www.npmjs.com/package/validar-cpf) | 3.1.1 | Sim | Não | Não |
| [stdnum](https://www.npmjs.com/package/stdnum) | 1.11.13 | Sim | Sim | Não |
| [br-validations](https://www.npmjs.com/package/br-validations) | 0.3.1 | Sim | Sim | Não |
| [validations-br](https://www.npmjs.com/package/validations-br) | 1.6.1 | Sim | Sim | Não |
| [validation-br](https://www.npmjs.com/package/validation-br) | 1.6.4 | Sim | Sim | Sim |

### Benchmark de CPF

#### Ranking por cenário misto

| Posição | Pacote | Versão | Misto ops/s | Relativo ao br-helpers |
| ---: | --- | ---: | ---: | ---: |
| 1 | [br-helpers](https://www.npmjs.com/package/br-helpers) | 3.1.1 | 12,534,156 | 1.00x |
| 2 | [br-validations](https://www.npmjs.com/package/br-validations) | 0.3.1 | 10,423,544 | 1.20x |
| 3 | [gerador-validador-cpf](https://www.npmjs.com/package/gerador-validador-cpf) | 6.3.0 | 7,163,119 | 1.75x |
| 4 | [validar-cpf](https://www.npmjs.com/package/validar-cpf) | 3.1.1 | 6,696,503 | 1.87x |
| 5 | [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 0.13.1 | 4,865,178 | 2.58x |
| 6 | [validations-br](https://www.npmjs.com/package/validations-br) | 1.6.1 | 4,655,205 | 2.69x |
| 7 | [validation-br](https://www.npmjs.com/package/validation-br) | 1.6.4 | 4,209,947 | 2.98x |
| 8 | [js-brasil](https://www.npmjs.com/package/js-brasil) | 2.6.4 | 4,037,402 | 3.10x |
| 9 | [@fnando/cpf](https://www.npmjs.com/package/@fnando/cpf) | 1.0.2 | 2,717,810 | 4.61x |
| 10 | [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 1.0.3 | 2,622,318 | 4.78x |
| 11 | [cpf](https://www.npmjs.com/package/cpf) | 2.0.1 | 1,742,383 | 7.19x |

#### Tabela completa

| Pacote | Válidos sem máscara | Válidos com máscara | DV incorreto | Dígitos iguais | Incompletos | Misto | Misto vs br-helpers |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| [br-helpers](https://www.npmjs.com/package/br-helpers) | 14,071,031 | 8,125,589 | 9,983,228 | 24,481,003 | 26,123,302 | 12,534,156 | 1.00x |
| [br-validations](https://www.npmjs.com/package/br-validations) | 10,723,861 | 7,477,306 | 8,589,885 | 20,102,119 | 27,019,724 | 10,423,544 | 1.20x |
| [gerador-validador-cpf](https://www.npmjs.com/package/gerador-validador-cpf) | 7,447,902 | 5,098,087 | 5,786,769 | 11,225,864 | 11,207,747 | 7,163,119 | 1.75x |
| [validar-cpf](https://www.npmjs.com/package/validar-cpf) | 5,974,215 | 4,604,984 | 4,875,385 | 12,911,889 | 31,277,368 | 6,696,503 | 1.87x |
| [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 4,173,274 | 3,722,398 | 3,697,350 | 5,238,674 | 93,353,249 | 4,865,178 | 2.58x |
| [validations-br](https://www.npmjs.com/package/validations-br) | 4,065,900 | 3,340,103 | 3,507,960 | 6,729,928 | 29,698,266 | 4,655,205 | 2.69x |
| [validation-br](https://www.npmjs.com/package/validation-br) | 6,180,852 | 4,699,160 | 3,212,046 | 6,946,374 | 3,409,153 | 4,209,947 | 2.98x |
| [js-brasil](https://www.npmjs.com/package/js-brasil) | 3,960,898 | 3,367,502 | 3,440,446 | 3,418,803 | 16,039,007 | 4,037,402 | 3.10x |
| [@fnando/cpf](https://www.npmjs.com/package/@fnando/cpf) | 1,960,492 | 1,845,740 | 1,813,368 | 27,151,779 | 28,775,322 | 2,717,810 | 4.61x |
| [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 1,918,325 | 1,767,484 | 1,768,985 | 28,061,511 | 29,879,288 | 2,622,318 | 4.78x |
| [cpf](https://www.npmjs.com/package/cpf) | 1,311,813 | 1,229,069 | 1,208,693 | 9,437,167 | 9,654,001 | 1,742,383 | 7.19x |

#### Cenarios

- `raw_valid`: CPFs válidos com apenas dígitos. (25,000 entradas)
- `masked_valid`: CPFs válidos com pontuação. (25,000 entradas)
- `invalid_wrong_check_digits`: CPFs inválidos com dígitos verificadores incorretos. (25,000 entradas)
- `invalid_equal_digits`: CPFs inválidos formados por dígitos iguais repetidos. (25,000 entradas)
- `invalid_incomplete`: CPFs inválidos com dígitos faltando. (25,000 entradas)
- `mixed`: CPFs válidos, inválidos, com máscara, repetidos e incompletos misturados. (150,000 entradas)

#### Bibliotecas fora deste benchmark

- `stdnum`: stdnum returned true for CPF "repetido 0" but expected false. | stdnum returned true for CPF "repetido 1" but expected false. | stdnum returned true for CPF "repetido 2" but expected false. | stdnum returned true for CPF "repetido 3" but expected false. | stdnum returned true for CPF "repetido 4" but expected false. | stdnum returned true for CPF "repetido 5" but expected false. | stdnum returned true for CPF "repetido 6" but expected false. | stdnum returned true for CPF "repetido 7" but expected false. | stdnum returned true for CPF "repetido 8" but expected false. | stdnum returned true for CPF "repetido 9" but expected false.

### Benchmark de CNPJ

#### Ranking por cenário misto

| Posição | Pacote | Versão | Misto ops/s | Relativo ao br-helpers |
| ---: | --- | ---: | ---: | ---: |
| 1 | [br-helpers](https://www.npmjs.com/package/br-helpers) | 3.1.1 | 7,041,163 | 1.00x |
| 2 | [br-validations](https://www.npmjs.com/package/br-validations) | 0.3.1 | 5,694,458 | 1.24x |
| 3 | [js-brasil](https://www.npmjs.com/package/js-brasil) | 2.6.4 | 3,960,542 | 1.78x |
| 4 | [validations-br](https://www.npmjs.com/package/validations-br) | 1.6.1 | 3,560,248 | 1.98x |
| 5 | [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 0.13.1 | 3,325,153 | 2.12x |
| 6 | [validation-br](https://www.npmjs.com/package/validation-br) | 1.6.4 | 1,026,318 | 6.86x |
| 7 | [@fnando/cnpj](https://www.npmjs.com/package/@fnando/cnpj) | 2.0.0 | 660,309 | 10.66x |
| 8 | [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 1.0.3 | 607,077 | 11.60x |

#### Tabela completa

| Pacote | Válidos sem máscara | Válidos com máscara | DV incorreto | Dígitos iguais | Incompletos | Misto | CNPJ alfanumérico | Misto vs br-helpers |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| [br-helpers](https://www.npmjs.com/package/br-helpers) | 10,847,399 | 3,896,448 | 5,521,262 | 18,534,994 | 18,588,743 | 7,041,163 | Sim | 1.00x |
| [br-validations](https://www.npmjs.com/package/br-validations) | 6,732,193 | 3,449,918 | 4,318,535 | 18,912,172 | 26,513,946 | 5,694,458 | Não | 1.24x |
| [js-brasil](https://www.npmjs.com/package/js-brasil) | 5,102,666 | 2,365,901 | 3,048,297 | 9,346,843 | 10,651,442 | 3,960,542 | Não | 1.78x |
| [validations-br](https://www.npmjs.com/package/validations-br) | 4,140,787 | 2,286,718 | 2,775,958 | 6,161,278 | 25,773,196 | 3,560,248 | Não | 1.98x |
| [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 3,745,655 | 2,149,641 | 2,600,348 | 4,287,870 | 88,059,176 | 3,325,153 | Não | 2.12x |
| [validation-br](https://www.npmjs.com/package/validation-br) | 1,034,955 | 846,637 | 771,381 | 5,610,791 | 1,373,785 | 1,026,318 | Sim | 6.86x |
| [@fnando/cnpj](https://www.npmjs.com/package/@fnando/cnpj) | 498,416 | 421,932 | 449,309 | 20,678,246 | 20,429,844 | 660,309 | Sim | 10.66x |
| [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 449,454 | 400,924 | 418,080 | 9,938,382 | 26,607,067 | 607,077 | Não | 11.60x |

#### Cenarios

- `raw_valid`: CNPJs válidos com apenas dígitos. (25,000 entradas)
- `masked_valid`: CNPJs válidos com pontuação. (25,000 entradas)
- `invalid_wrong_check_digits`: CNPJs inválidos com dígitos verificadores incorretos. (25,000 entradas)
- `invalid_equal_digits`: CNPJs inválidos formados por dígitos iguais repetidos. (25,000 entradas)
- `invalid_incomplete`: CNPJs inválidos com dígitos faltando. (25,000 entradas)
- `mixed`: CNPJs válidos, inválidos, com máscara, repetidos e incompletos misturados. (150,000 entradas)

#### Bibliotecas fora deste benchmark

- `stdnum`: stdnum returned true for CNPJ "repetido 0" but expected false.
<!-- benchmark:end -->
