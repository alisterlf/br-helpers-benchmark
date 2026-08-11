# br-helpers-benchmark

Projeto dedicado a comparar a validação de CPF e CNPJ do `br-helpers` com bibliotecas populares do npm.

Os benchmarks são executados com `Tinybench`, usando configuração padrão mais longa e datasets maiores para reduzir ruído entre execuções.

## Como rodar

```bash
npm install
npm test          # testes de compatibilidade (casos dos specs do br-helpers em todas as libs)
npm run benchmark # benchmark de throughput
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

Assim a comparação sempre reflete a versão instalada do pacote publicado. Para comparar um checkout local antes de publicar, aponte a dependência para a pasta com `npm install ../br-helpers`.

## Testes de compatibilidade

Os casos de teste são portados dos specs do `br-helpers` (`src/cpf.spec.ts` e `src/cnpj.spec.ts`), incluindo os casos de entrada leniente (espaços, separadores deslocados ou duplicados, letras misturadas, caracteres não ASCII e entrada numérica). Cada suíte roda contra todas as bibliotecas; `—` indica que a biblioteca não valida aquele documento. Os valores esperados seguem o contrato do `br-helpers`.

<!-- tests:start -->
- Gerado em: 11/08/2026, 02:36:00

| Pacote | Versão | CPF spec (15) | CPF leniente (5) | CNPJ spec (29) | CNPJ leniente (5) |
| --- | ---: | ---: | ---: | ---: | ---: |
| [br-helpers](https://www.npmjs.com/package/br-helpers) | 3.3.0 | 15/15 | 5/5 | 29/29 | 5/5 |
| [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 2.1.2 | 15/15 | 4/5 | 29/29 | 4/5 |
| [@fnando/cpf](https://www.npmjs.com/package/@fnando/cpf) | 1.0.2 | 15/15 | 5/5 | — | — |
| [@fnando/cnpj](https://www.npmjs.com/package/@fnando/cnpj) | 2.0.0 | — | — | 29/29 | 5/5 |
| [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 0.14.0 | 14/15 | 0/5 | 29/29 | 2/5 |
| [cpf](https://www.npmjs.com/package/cpf) | 3.0.0 | 15/15 | 3/5 | 28/29 | 3/5 |
| [js-brasil](https://www.npmjs.com/package/js-brasil) | 2.8.0 | 15/15 | 2/5 | 28/29 | 2/5 |
| [gerador-validador-cpf](https://www.npmjs.com/package/gerador-validador-cpf) | 6.3.0 | 15/15 | 2/5 | — | — |
| [validar-cpf](https://www.npmjs.com/package/validar-cpf) | 3.1.1 | 15/15 | 4/5 | — | — |
| [stdnum](https://www.npmjs.com/package/stdnum) | 1.12.6 | 14/15 | 3/5 | 28/29 | 3/5 |
| [br-validations](https://www.npmjs.com/package/br-validations) | 0.3.1 | 15/15 | 4/5 | 20/29 | 4/5 |
| [validations-br](https://www.npmjs.com/package/validations-br) | 1.7.0 | 15/15 | 5/5 | 28/29 | 3/5 |
| [validation-br](https://www.npmjs.com/package/validation-br) | 1.6.4 | 15/15 | 4/5 | 29/29 | 4/5 |
<!-- tests:end -->

## Resultados

<!-- benchmark:start -->
### Última execução

- Gerado em: 11/08/2026, 02:45:43
- Node.js: `v24.15.0`
- Plataforma: `win32 10.0.26220` (x64)
- CPU: `AMD Ryzen 9 7950X 16-Core Processor            ` x32
- Dataset por cenário base: 25,000 documentos
- Warmup por tarefa: 1,000 ms
- Medição por tarefa: 3,000 ms

### Tabela comparativa

| Pacote | Versão | CPF | CNPJ | CNPJ alfanumérico |
| --- | ---: | ---: | ---: | ---: |
| [br-helpers](https://www.npmjs.com/package/br-helpers) | 3.3.0 | Sim | Sim | Sim |
| [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 2.1.2 | Sim | Sim | Sim |
| [@fnando/cpf](https://www.npmjs.com/package/@fnando/cpf) | 1.0.2 | Sim | Não | Não |
| [@fnando/cnpj](https://www.npmjs.com/package/@fnando/cnpj) | 2.0.0 | Não | Sim | Sim |
| [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 0.14.0 | Sim | Sim | Sim |
| [cpf](https://www.npmjs.com/package/cpf) | 3.0.0 | Sim | Sim | Sim |
| [js-brasil](https://www.npmjs.com/package/js-brasil) | 2.8.0 | Sim | Sim | Sim |
| [gerador-validador-cpf](https://www.npmjs.com/package/gerador-validador-cpf) | 6.3.0 | Sim | Não | Não |
| [validar-cpf](https://www.npmjs.com/package/validar-cpf) | 3.1.1 | Sim | Não | Não |
| [stdnum](https://www.npmjs.com/package/stdnum) | 1.12.6 | Sim | Sim | Sim |
| [br-validations](https://www.npmjs.com/package/br-validations) | 0.3.1 | Sim | Sim | Não |
| [validations-br](https://www.npmjs.com/package/validations-br) | 1.7.0 | Sim | Sim | Sim |
| [validation-br](https://www.npmjs.com/package/validation-br) | 1.6.4 | Sim | Sim | Sim |

### Benchmark de CPF

#### Ranking por cenário misto

| Posição | Pacote | Versão | Misto ops/s | Relativo ao br-helpers |
| ---: | --- | ---: | ---: | ---: |
| 1 | [br-helpers](https://www.npmjs.com/package/br-helpers) | 3.3.0 | 24,791,341 | 1.00x |
| 2 | [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 2.1.2 | 11,380,794 | 2.18x |
| 3 | [br-validations](https://www.npmjs.com/package/br-validations) | 0.3.1 | 9,863,230 | 2.51x |
| 4 | [validations-br](https://www.npmjs.com/package/validations-br) | 1.7.0 | 7,747,774 | 3.20x |
| 5 | [gerador-validador-cpf](https://www.npmjs.com/package/gerador-validador-cpf) | 6.3.0 | 7,048,243 | 3.52x |
| 6 | [validar-cpf](https://www.npmjs.com/package/validar-cpf) | 3.1.1 | 6,877,705 | 3.60x |
| 7 | [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 0.14.0 | 5,034,351 | 4.92x |
| 8 | [js-brasil](https://www.npmjs.com/package/js-brasil) | 2.8.0 | 4,110,952 | 6.03x |
| 9 | [validation-br](https://www.npmjs.com/package/validation-br) | 1.6.4 | 4,075,544 | 6.08x |
| 10 | [@fnando/cpf](https://www.npmjs.com/package/@fnando/cpf) | 1.0.2 | 2,728,126 | 9.09x |
| 11 | [cpf](https://www.npmjs.com/package/cpf) | 3.0.0 | 2,584,594 | 9.59x |

#### Tabela completa

| Pacote | Válidos sem máscara | Válidos com máscara | Válidos leniente | DV incorreto | Dígitos iguais | Incompletos | Misto | Misto vs br-helpers |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| [br-helpers](https://www.npmjs.com/package/br-helpers) | 26,001,040 | 22,335,388 | 9,797,774 | 21,312,873 | 30,454,379 | 43,081,165 | 24,791,341 | 1.00x |
| [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 11,846,096 | 7,132,261 | 7,230,658 | 8,658,908 | 33,815,772 | 29,765,448 | 11,380,794 | 2.18x |
| [br-validations](https://www.npmjs.com/package/br-validations) | 9,725,734 | 6,722,419 | 7,705,941 | 7,557,893 | 20,547,382 | 26,652,452 | 9,863,230 | 2.51x |
| [validations-br](https://www.npmjs.com/package/validations-br) | 6,675,924 | 5,045,612 | 5,480,653 | 5,512,013 | 24,459,446 | 30,372,980 | 7,747,774 | 3.20x |
| [gerador-validador-cpf](https://www.npmjs.com/package/gerador-validador-cpf) | 7,268,076 | 5,155,702 | 12,304,966 | 5,569,541 | 11,207,244 | 11,528,972 | 7,048,243 | 3.52x |
| [validar-cpf](https://www.npmjs.com/package/validar-cpf) | 6,042,369 | 4,612,802 | 4,977,105 | 4,841,677 | 12,586,216 | 32,028,698 | 6,877,705 | 3.60x |
| [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 4,329,679 | 3,628,131 | 76,335,878 | 3,757,816 | 5,053,568 | 94,984,802 | 5,034,351 | 4.92x |
| [js-brasil](https://www.npmjs.com/package/js-brasil) | 3,831,476 | 3,244,099 | 7,012,819 | 3,346,653 | 3,448,323 | 16,111,362 | 4,110,952 | 6.03x |
| [validation-br](https://www.npmjs.com/package/validation-br) | 5,768,410 | 4,087,238 | 4,883,576 | 3,060,462 | 6,983,045 | 3,455,186 | 4,075,544 | 6.08x |
| [@fnando/cpf](https://www.npmjs.com/package/@fnando/cpf) | 1,938,120 | 1,789,062 | 1,814,066 | 1,798,678 | 27,624,309 | 28,831,738 | 2,728,126 | 9.09x |
| [cpf](https://www.npmjs.com/package/cpf) | 1,961,723 | 1,774,484 | 2,174,613 | 1,738,707 | 10,176,460 | 21,292,905 | 2,584,594 | 9.59x |

#### Cenarios

- `raw_valid`: CPFs válidos com apenas dígitos. (25,000 entradas)
- `masked_valid`: CPFs válidos com pontuação. (25,000 entradas)
- `lenient_valid`: CPFs válidos com formatação fora do padrão (espaços, separadores deslocados ou duplicados). Nem toda biblioteca aceita estes valores; veja os casos de teste lenientes. (25,000 entradas)
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
| 1 | [br-helpers](https://www.npmjs.com/package/br-helpers) | 3.3.0 | 19,995,468 | 1.00x |
| 2 | [br-validations](https://www.npmjs.com/package/br-validations) | 0.3.1 | 6,282,355 | 3.18x |
| 3 | [validations-br](https://www.npmjs.com/package/validations-br) | 1.7.0 | 4,632,904 | 4.32x |
| 4 | [js-brasil](https://www.npmjs.com/package/js-brasil) | 2.8.0 | 3,743,085 | 5.34x |
| 5 | [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 0.14.0 | 3,549,351 | 5.63x |
| 6 | [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 2.1.2 | 3,276,468 | 6.10x |
| 7 | [cpf](https://www.npmjs.com/package/cpf) | 3.0.0 | 2,273,928 | 8.79x |
| 8 | [validation-br](https://www.npmjs.com/package/validation-br) | 1.6.4 | 1,079,296 | 18.53x |
| 9 | [@fnando/cnpj](https://www.npmjs.com/package/@fnando/cnpj) | 2.0.0 | 695,137 | 28.76x |

#### Tabela completa

| Pacote | Válidos sem máscara | Válidos com máscara | Válidos leniente | DV incorreto | Dígitos iguais | Incompletos | Misto | CNPJ alfanumérico | Misto vs br-helpers |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| [br-helpers](https://www.npmjs.com/package/br-helpers) | 20,888,165 | 18,160,686 | 5,887,340 | 17,606,874 | 23,210,473 | 35,360,679 | 19,995,468 | Sim | 1.00x |
| [br-validations](https://www.npmjs.com/package/br-validations) | 6,523,838 | 3,777,177 | 4,056,663 | 4,535,806 | 19,173,249 | 27,027,027 | 6,282,355 | Não | 3.18x |
| [validations-br](https://www.npmjs.com/package/validations-br) | 4,797,175 | 2,864,377 | 4,727,596 | 3,582,124 | 13,489,451 | 17,292,661 | 4,632,904 | Sim | 4.32x |
| [js-brasil](https://www.npmjs.com/package/js-brasil) | 4,341,484 | 2,334,332 | 4,202,458 | 2,766,466 | 8,866,506 | 10,820,169 | 3,743,085 | Sim | 5.34x |
| [brazilian-values](https://www.npmjs.com/package/brazilian-values) | 4,109,983 | 2,369,107 | 4,707,123 | 2,880,383 | 4,168,334 | 15,210,514 | 3,549,351 | Sim | 5.63x |
| [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) | 3,041,825 | 1,898,131 | 2,053,633 | 2,332,786 | 24,367,659 | 21,202,612 | 3,276,468 | Sim | 6.10x |
| [cpf](https://www.npmjs.com/package/cpf) | 2,277,593 | 1,403,288 | 1,507,237 | 1,585,093 | 10,006,805 | 18,949,443 | 2,273,928 | Sim | 8.79x |
| [validation-br](https://www.npmjs.com/package/validation-br) | 1,038,008 | 862,607 | 889,974 | 804,925 | 6,142,582 | 1,437,616 | 1,079,296 | Sim | 18.53x |
| [@fnando/cnpj](https://www.npmjs.com/package/@fnando/cnpj) | 509,802 | 433,588 | 441,220 | 473,870 | 20,520,397 | 20,555,830 | 695,137 | Sim | 28.76x |

#### Cenarios

- `raw_valid`: CNPJs válidos com apenas dígitos. (25,000 entradas)
- `masked_valid`: CNPJs válidos com pontuação. (25,000 entradas)
- `lenient_valid`: CNPJs válidos com formatação fora do padrão (espaços, separadores deslocados ou duplicados). Nem toda biblioteca aceita estes valores; veja os casos de teste lenientes. (25,000 entradas)
- `invalid_wrong_check_digits`: CNPJs inválidos com dígitos verificadores incorretos. (25,000 entradas)
- `invalid_equal_digits`: CNPJs inválidos formados por dígitos iguais repetidos. (25,000 entradas)
- `invalid_incomplete`: CNPJs inválidos com dígitos faltando. (25,000 entradas)
- `mixed`: CNPJs válidos, inválidos, com máscara, repetidos e incompletos misturados. (150,000 entradas)

#### Bibliotecas fora deste benchmark

- `stdnum`: stdnum returned true for CNPJ "repetido 0" but expected false.
<!-- benchmark:end -->
