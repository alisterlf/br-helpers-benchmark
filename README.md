# br-helpers-benchmark

Projeto dedicado a comparar a validacao de CPF e CNPJ do `br-helpers` com bibliotecas populares do npm.

Os benchmarks sao executados com `Tinybench`, usando configuracao padrao mais longa e datasets maiores para reduzir ruido entre execucoes.

## Como rodar

```bash
npm install
npm run benchmark
```

O comando acima:

1. executa os sanity checks para confirmar que todas as libs concordam com casos conhecidos, incluindo documentos invalidos
2. roda os cenarios de benchmark de CPF e CNPJ com `Tinybench`
3. salva o resultado em `results/latest.json`
4. atualiza a secao gerada automaticamente deste `README.md`

Por padrao, a execucao usa:

1. `25_000` documentos por cenario base
2. `1_000 ms` de warmup por tarefa
3. `3_000 ms` de medicao por tarefa

Se quiser ajustar o custo x precisao, use as variaveis `BENCHMARK_DATASET_SIZE`, `BENCHMARK_WARMUP_TIME_MS`, `BENCHMARK_TIME_MS`, `BENCHMARK_MIN_WARMUP_ITERATIONS` e `BENCHMARK_MIN_ITERATIONS`.

## Como adicionar outra lib

1. instale a dependencia com `npm install <pacote>`
2. adicione uma entrada em [src/libraries.js](./src/libraries.js)
3. rode `npm run benchmark`

Cada biblioteca fica declarada em um objeto pequeno com `id`, `label`, `homepage` e validadores por documento, para manter a comparacao facil de estender.

## br-helpers usado no benchmark

O benchmark usa diretamente a versao publicada no npm:

1. `br-helpers/cpf`
2. `br-helpers/cnpj`

Assim a comparacao sempre reflete a versao instalada do pacote publicado.

## Resultados

<!-- benchmark:start -->
### Ultima execucao

- Gerado em: 22/03/2026, 06:09:18
- Node.js: `v24.14.0`
- Plataforma: `win32 10.0.26220` (x64)
- CPU: `AMD Ryzen 9 7950X 16-Core Processor            ` x32
- Dataset por cenario base: 25,000 documentos
- Warmup por tarefa: 1,000 ms
- Medicao por tarefa: 3,000 ms

### Tabela comparativa

| Package | Version | Source | CPF | CNPJ | CNPJ alfanumerico |
| --- | ---: | --- | ---: | ---: | ---: |
| [br-helpers](https://www.npmjs.com/package/br-helpers) | 3.1.1 | npm package | Yes | Yes | Yes |
| [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 1.0.3 | npm package | Yes | Yes | No |
| [@fnando/cpf](https://www.npmjs.com/package/@fnando/cpf) | 1.0.2 | npm package | Yes | No | No |
| [@fnando/cnpj](https://www.npmjs.com/package/@fnando/cnpj) | 2.0.0 | npm package | No | Yes | Yes |
| [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 0.13.1 | npm package | Yes | Yes | No |
| [cpf](https://www.npmjs.com/package/cpf) | 2.0.1 | npm package | Yes | No | No |
| [js-brasil](https://www.npmjs.com/package/js-brasil) | 2.6.4 | npm package | Yes | Yes | No |
| [gerador-validador-cpf](https://www.npmjs.com/package/gerador-validador-cpf) | 6.3.0 | npm package | Yes | No | No |
| [validar-cpf](https://www.npmjs.com/package/validar-cpf) | 3.1.1 | npm package | Yes | No | No |
| [stdnum](https://www.npmjs.com/package/stdnum) | 1.11.13 | npm package | Yes | Yes | No |
| [br-validations](https://www.npmjs.com/package/br-validations) | 0.3.1 | npm package | Yes | Yes | No |
| [validations-br](https://www.npmjs.com/package/validations-br) | 1.6.1 | npm package | Yes | Yes | No |
| [validation-br](https://www.npmjs.com/package/validation-br) | 1.6.4 | npm package | Yes | Yes | Yes |

### Benchmark de CPF

#### Ranking por cenario misto

| Rank | Package | Version | Source | Mixed ops/s | Relative to br-helpers |
| ---: | --- | ---: | --- | ---: | ---: |
| 1 | [br-helpers](https://www.npmjs.com/package/br-helpers) | 3.1.1 | npm package | 12,624,137 | 1.00x |
| 2 | [br-validations](https://www.npmjs.com/package/br-validations) | 0.3.1 | npm package | 10,753,459 | 1.17x |
| 3 | [gerador-validador-cpf](https://www.npmjs.com/package/gerador-validador-cpf) | 6.3.0 | npm package | 6,787,453 | 1.86x |
| 4 | [validar-cpf](https://www.npmjs.com/package/validar-cpf) | 3.1.1 | npm package | 6,755,540 | 1.87x |
| 5 | [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 0.13.1 | npm package | 5,028,950 | 2.51x |
| 6 | [validations-br](https://www.npmjs.com/package/validations-br) | 1.6.1 | npm package | 4,666,240 | 2.71x |
| 7 | [validation-br](https://www.npmjs.com/package/validation-br) | 1.6.4 | npm package | 4,192,702 | 3.01x |
| 8 | [js-brasil](https://www.npmjs.com/package/js-brasil) | 2.6.4 | npm package | 4,051,262 | 3.12x |
| 9 | [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 1.0.3 | npm package | 2,738,661 | 4.61x |
| 10 | [@fnando/cpf](https://www.npmjs.com/package/@fnando/cpf) | 1.0.2 | npm package | 2,722,491 | 4.64x |
| 11 | [cpf](https://www.npmjs.com/package/cpf) | 2.0.1 | npm package | 1,765,276 | 7.15x |

#### Tabela completa

| Package | Raw valid | Masked valid | Wrong DV | Equal digits | Incomplete | Mixed | Mixed vs br-helpers |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| [br-helpers](https://www.npmjs.com/package/br-helpers) | 14,418,363 | 8,875,320 | 10,525,429 | 25,757,264 | 25,963,236 | 12,624,137 | 1.00x |
| [br-validations](https://www.npmjs.com/package/br-validations) | 11,011,033 | 7,807,620 | 8,789,354 | 20,135,309 | 27,317,926 | 10,753,459 | 1.17x |
| [gerador-validador-cpf](https://www.npmjs.com/package/gerador-validador-cpf) | 7,111,364 | 4,971,414 | 5,640,031 | 10,965,634 | 10,863,425 | 6,787,453 | 1.86x |
| [validar-cpf](https://www.npmjs.com/package/validar-cpf) | 6,193,868 | 4,463,289 | 5,133,997 | 12,804,753 | 31,216,832 | 6,755,540 | 1.87x |
| [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 4,193,013 | 3,729,256 | 3,851,398 | 5,217,899 | 92,729,970 | 5,028,950 | 2.51x |
| [validations-br](https://www.npmjs.com/package/validations-br) | 4,069,607 | 3,386,249 | 3,598,883 | 6,479,454 | 29,474,181 | 4,666,240 | 2.71x |
| [validation-br](https://www.npmjs.com/package/validation-br) | 6,100,984 | 4,438,448 | 3,232,605 | 6,811,432 | 3,528,283 | 4,192,702 | 3.01x |
| [js-brasil](https://www.npmjs.com/package/js-brasil) | 4,032,583 | 3,289,733 | 3,443,526 | 3,346,160 | 16,228,497 | 4,051,262 | 3.12x |
| [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 1,995,371 | 1,805,791 | 1,838,654 | 28,597,575 | 29,786,727 | 2,738,661 | 4.61x |
| [@fnando/cpf](https://www.npmjs.com/package/@fnando/cpf) | 1,970,972 | 1,833,060 | 1,847,036 | 27,578,599 | 28,851,702 | 2,722,491 | 4.64x |
| [cpf](https://www.npmjs.com/package/cpf) | 1,320,686 | 1,226,554 | 1,234,464 | 9,367,155 | 9,380,159 | 1,765,276 | 7.15x |

#### Cenarios

- `raw_valid`: Valid CPFs with digits only. (25,000 entradas)
- `masked_valid`: Valid CPFs with punctuation. (25,000 entradas)
- `invalid_wrong_check_digits`: Invalid CPFs with incorrect check digits. (25,000 entradas)
- `invalid_equal_digits`: Invalid CPFs made of repeated equal digits. (25,000 entradas)
- `invalid_incomplete`: Invalid CPFs with missing digits. (25,000 entradas)
- `mixed`: Valid, invalid, masked, repeated and incomplete CPFs mixed together. (150,000 entradas)

#### Bibliotecas fora deste benchmark

- `stdnum`: stdnum returned true for CPF "repeated 0" but expected false. | stdnum returned true for CPF "repeated 1" but expected false. | stdnum returned true for CPF "repeated 2" but expected false. | stdnum returned true for CPF "repeated 3" but expected false. | stdnum returned true for CPF "repeated 4" but expected false. | stdnum returned true for CPF "repeated 5" but expected false. | stdnum returned true for CPF "repeated 6" but expected false. | stdnum returned true for CPF "repeated 7" but expected false. | stdnum returned true for CPF "repeated 8" but expected false. | stdnum returned true for CPF "repeated 9" but expected false.

### Benchmark de CNPJ

#### Ranking por cenario misto

| Rank | Package | Version | Source | Mixed ops/s | Relative to br-helpers |
| ---: | --- | ---: | --- | ---: | ---: |
| 1 | [br-helpers](https://www.npmjs.com/package/br-helpers) | 3.1.1 | npm package | 3,533,635 | 1.00x |
| 2 | [br-validations](https://www.npmjs.com/package/br-validations) | 0.3.1 | npm package | 2,979,815 | 1.19x |
| 3 | [js-brasil](https://www.npmjs.com/package/js-brasil) | 2.6.4 | npm package | 1,917,910 | 1.84x |
| 4 | [validations-br](https://www.npmjs.com/package/validations-br) | 1.6.1 | npm package | 1,853,144 | 1.91x |
| 5 | [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 0.13.1 | npm package | 1,720,479 | 2.05x |
| 6 | [validation-br](https://www.npmjs.com/package/validation-br) | 1.6.4 | npm package | 554,814 | 6.37x |
| 7 | [@fnando/cnpj](https://www.npmjs.com/package/@fnando/cnpj) | 2.0.0 | npm package | 431,606 | 8.19x |
| 8 | [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 1.0.3 | npm package | 367,685 | 9.61x |

#### Tabela completa

| Package | Raw valid | Masked valid | Wrong DV | Equal digits | Incomplete | Mixed | CNPJ alfanumerico | Mixed vs br-helpers |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| [br-helpers](https://www.npmjs.com/package/br-helpers) | 10,230,388 | 4,130,081 | 2,757,100 | 9,444,476 | 9,352,437 | 3,533,635 | Yes | 1.00x |
| [br-validations](https://www.npmjs.com/package/br-validations) | 6,844,440 | 1,777,829 | 2,202,148 | 9,168,592 | 14,388,903 | 2,979,815 | No | 1.19x |
| [js-brasil](https://www.npmjs.com/package/js-brasil) | 4,977,204 | 1,167,128 | 1,511,126 | 4,814,080 | 5,766,481 | 1,917,910 | No | 1.84x |
| [validations-br](https://www.npmjs.com/package/validations-br) | 4,274,893 | 1,165,602 | 1,403,398 | 3,128,794 | 13,882,719 | 1,853,144 | No | 1.91x |
| [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 3,856,001 | 2,174,622 | 1,322,860 | 2,168,896 | 46,939,542 | 1,720,479 | No | 2.05x |
| [validation-br](https://www.npmjs.com/package/validation-br) | 1,044,932 | 428,743 | 423,261 | 3,062,093 | 705,193 | 554,814 | Yes | 6.37x |
| [@fnando/cnpj](https://www.npmjs.com/package/@fnando/cnpj) | 496,415 | 422,492 | 264,972 | 10,449,321 | 10,663,709 | 431,606 | Yes | 8.19x |
| [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 453,175 | 404,868 | 239,443 | 5,212,025 | 14,275,110 | 367,685 | No | 9.61x |

#### Cenarios

- `raw_valid`: Valid CNPJs with digits only. (25,000 entradas)
- `masked_valid`: Valid CNPJs with punctuation. (25,000 entradas)
- `invalid_wrong_check_digits`: Invalid CNPJs with incorrect check digits. (25,000 entradas)
- `invalid_equal_digits`: Invalid CNPJs made of repeated equal digits. (25,000 entradas)
- `invalid_incomplete`: Invalid CNPJs with missing digits. (25,000 entradas)
- `mixed`: Valid, invalid, masked, repeated and incomplete CNPJs mixed together. (150,000 entradas)

#### Bibliotecas fora deste benchmark

- `stdnum`: stdnum returned true for CNPJ "repeated 0" but expected false.
<!-- benchmark:end -->
