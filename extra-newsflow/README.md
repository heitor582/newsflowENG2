# Exercício extra de BDD do NewsFlow

Uma história de usuário detalhada em três funcionalidades, com automação JavaScript no Cucumber.js e relatório HTML gerado pela execução dos testes.

## Organização exigida

| Item | Quantidade | Arquivo |
| --- | --- | --- |
| História de usuário | 1 | [US01 Programar uma newsletter para o público escolhido](docs/historia.md) |
| F01 Validar a aprovação editorial | 4 cenários | [f01-aprovacao.feature](features/f01-aprovacao.feature) |
| F02 Controlar os prazos do agendamento | 5 cenários | [f02-agendamento.feature](features/f02-agendamento.feature) |
| F03 Selecionar o público do disparo | 4 cenários | [f03-publico.feature](features/f03-publico.feature) |
| Total | 3 features e 13 cenários | Todos executáveis |

Cada cenário tem um único Quando, condições próprias, dados explícitos e resultados observáveis. As três features incluem casos aceitos e recusados. Não há dependência entre cenários nem espera de tempo real.

## Executar

Com Node.js 22 ou 24 e npm, dentro desta pasta:

```sh
npm ci
npm run test:dry
npm test
```

`npm install` também pode ser utilizado. Para verificar isolamento em dois processos, executar `npm run test:parallel`.

## Automação JavaScript

- [src/newsflow.js](src/newsflow.js): regras de aprovação, programação, reagendamento, cancelamento e deduplicação.
- [features/support/world.js](features/support/world.js): cria um serviço e um estado novos para cada cenário.
- [features/step_definitions/newsflow.steps.js](features/step_definitions/newsflow.steps.js): associa o Gherkin às ações e às verificações com `node:assert/strict`.
- [cucumber.js](cucumber.js): configuração de execução e geração dos relatórios.

O domínio usa memória e relógio controlado. A apresentação do horário usa o fuso nomeado America/Sao_Paulo. Os nomes dos segmentos e assinantes representam identificadores únicos nos dados deste exercício. O resultado de entrega é um registro de e-mail em memória; nenhum e-mail real é enviado.

O projeto é independente da atividade anterior: tem seu próprio código, package.json e lockfile. Não utiliza arquivos externos à pasta para funcionar após instalar suas dependências.

## Relatórios

- [Relatório HTML do Cucumber](relatorios/cucumber-report.html).
- [Resultado JSON](relatorios/cucumber-report.json).

`npm test` atualiza ambos. O perfil de verificação usado pelo dry-run e pela execução paralela preserva o relatório completo.

## Resultado da execução

```text
> newsflow-bdd-extra@1.0.0 test
> cucumber-js

..........................................................................................

13 scenarios (13 passed)
90 steps (90 passed)
0m00.018s (executing steps: 0m00.005s)
```

## Escopo e dupla

O foco é uma edição aprovada, programada para uma audiência válida. A parte de aprovação da RN02 e as regras RN03 e RN04 sustentam os cinco critérios da história. Reprovação com comentário, rascunhos, frequência semanal, descadastro, falhas de transporte e push não fazem parte deste extra. As decisões sobre alteração após aprovação e os limites inclusivos estão descritas na história.

**Gustavo Lopes Oliveira:** Negócio e Product Owner. **Heitor:** Desenvolvimento e QA. Gustavo revisa os exemplos pelo valor de negócio; Heitor revisa sua testabilidade e a automação.
