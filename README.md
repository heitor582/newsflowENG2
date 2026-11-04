# NewsFlow BDD

Projeto completo da atividade sobre o NewsFlow, plataforma de newsletters da Vértice. A entrega reúne quatro histórias, critérios verificáveis, cenários Gherkin em português, domínio em memória, testes Cucumber.js e relatórios reais de execução.

O recorte cobre **RN01, RN02, RN03, RN04 e RN06**: rascunho, aprovação, agendamento, segmentação e consentimento. O diferencial está na justificativa do recorte, nas fronteiras e nas ambiguidades discutidas com alternativas e consequências.

## Executar em até cinco linhas

Pré-requisito: Node.js 22 ou 24 com npm. Na pasta do projeto:

```sh
npm install
npm run test:dry
npm test
```

Para reproduzir exatamente as versões do lockfile, substituir `npm install` por `npm ci`. Abrir `relatorios/cucumber-report.html` no navegador depois da execução. Os testes não precisam de servidor, credenciais, banco ou serviços de e-mail. A instalação das dependências requer acesso ao registro npm ou um cache disponível.

## Entregáveis e ordem de revisão

1. [Histórias](docs/historias.md): US01 a US04, cinco critérios por história, regras, prioridades e valor.
2. [Rascunho](features/us01-rascunho.feature), [aprovação](features/us02-aprovacao.feature), [agendamento](features/us03-agendamento.feature) e [consentimento](features/us04-consentimento.feature): um Gherkin por história.
3. [Relatório HTML](relatorios/cucumber-report.html), [JSON](relatorios/cucumber-report.json).
4. [Dupla](docs/dupla.md), [decisões de negócio](docs/decisoes.md) e [rastreabilidade](docs/rastreabilidade.md).
5. [Perguntas para discussão](docs/perguntas-discussao.md), em arquivo separado, e [respostas de apoio](docs/respostas-discussao.md).

## Dupla

**Gustavo Lopes Oliveira**, Analista de Negócio e Product Owner, responde pelas histórias, recorte, prioridades, critérios e decisões. **Heitor Canhestro Vieira Moreira**, Desenvolvedor e Analista de Qualidade, responde pela automação, casos de borda e evidências. Gustavo Lopes Oliveira revisa os cenários pela ótica dos atores; Heitor revisa a testabilidade das histórias.

Essa distribuição define as responsabilidades da dupla e a revisão cruzada. Os nomes dos atores usados nos testes são dados de exemplo e não representam os cargos da dupla. A preparação é realizada em uma sessão, sem cronograma de três dias.

## Por que estas quatro histórias

- **US01 Recuperar o conteúdo do rascunho:** protege o trabalho da redatora e fornece recuperação concreta, não apenas uma tarefa de salvar dados.
- **US02 Liberar apenas conteúdo revisado:** separa autoria de aprovação e define o que ocorre quando o conteúdo autorizado muda.
- **US03 Programar o envio para o público escolhido:** conecta o horário ao público do mesmo disparo, com limites de alteração e deduplicação.
- **US04 Controlar a saída e o retorno à lista:** preserva a decisão atual do assinante, inclusive quando a newsletter já está agendada.

As quatro fatias fecham um fluxo editorial com controle do recebimento. RN03 e RN04 pertencem à mesma intenção da gestora; RN01 e RN02 ficam separadas porque recuperação e autorização têm resultados e riscos diferentes. RN06 foi escolhida em vez de frequência, retentativas ou push porque testa uma interação crítica: um envio planejado não pode ignorar um opt-out posterior.

Não há histórias técnicas de tela, API ou banco. A quantidade foi limitada a quatro para permitir exceções, adjacências das fronteiras e efeitos das recusas em cada uma.

## Fora de escopo

- **RN05, frequência semanal:** exige definir início e fim da semana, prioridade da fila e transferência do excedente. Acrescentaria uma política de distribuição distinta do agendamento; foi excluída para aprofundar os limites temporais e o consentimento. O serviço não impõe teto semanal.
- **RN07, falha de entrega:** envolve classificação de hard e soft bounce e retentativas. A expressão “até 3 tentativas” com três intervalos também merece esclarecimento antes de automatizar. Foi excluída porque a entrega simula a geração dos e-mails, sem provedor externo nem confirmação de transporte.
- **RN08, push:** possui outro canal, janela de silêncio e limite diário. Foi excluída para manter o foco no fluxo de newsletter por e-mail e evitar misturar relógios de canais diferentes.
- **Infraestrutura:** editor visual, persistência, autenticação, SMTP, entrega física, criptografia de tokens, concorrência distribuída e sincronização offline não são implementados. Links usam `newsflow.example` e endereços usam `example.test`; nenhum e-mail real é enviado.
- **Políticas adicionais:** interrupção emergencial nos últimos cinco minutos, normalização de aliases de e-mail, colaboração simultânea e envio retroativo a quem retorna à lista exigem regras próprias.

As exclusões não removem obrigações das RNs escolhidas. Estão cobertos os 30 segundos, as últimas 20 versões, a revisão independente, os 15 minutos, os dois reagendamentos, os cinco minutos para cancelar, os cinco segmentos, a deduplicação e o retorno confirmado em 48 horas.

## Ambiguidades tratadas explicitamente

**Salvamento periódico ou por inatividade?** A RN01 diz “a cada 30 segundos”; o modelo de história acrescenta “de inatividade”. A decisão proposta prioriza a RN: salvar periodicamente mesmo com digitação contínua. O cenário que altera o texto no segundo 29 e verifica a versão no segundo 30 distingue as interpretações.

**A aprovação continua válida depois de alterar o texto?** A decisão proposta é invalidá-la, pois o novo conteúdo não foi revisado. Se já existe agendamento ativo, a edição precisa ser cancelada dentro do prazo antes de ser alterada. Isso tem uma limitação explícita para correções nos últimos cinco minutos.

**E se alguém sair depois de agendar?** O consentimento é reavaliado no disparo; a pessoa descadastrada não recebe a newsletter, mas recebe a confirmação operacional de saída exigida por RN06.

O [registro de decisões](docs/decisoes.md) detalha sete pontos, suas alternativas, consequências e evidências. São propostas para validação de negócio; testes verdes não substituem essa validação.

## Estrutura e funcionamento

```text
docs/                         Histórias, decisões, dupla, perguntas e evidências
features/*.feature            Um arquivo por história
features/support/world.js     Um serviço e estado novos por cenário
features/step_definitions/    Ações e verificações ligadas ao Gherkin
src/newsflow.js                Domínio independente do Cucumber
tests/dominio.test.js          Verificações complementares das interações
scripts/                      Auditoria estrutural e erros controlados
relatorios/                   HTML, JSON e resultado de mutações
cucumber.js                   Configuração dos perfis
package-lock.json             Versões reproduzíveis
```

O World isola edições, mensagens, assinantes e relógio em cada cenário. O avanço do tempo é simulado, sem `sleep`. O horário é exibido com `Intl.DateTimeFormat` e o fuso `America/Sao_Paulo`, independentemente da configuração da máquina.

Os passos Dado montam o contexto daquele exemplo; Quando chama o domínio; Então compara resultados explícitos. As regras não ficam escondidas nas verificações, nem os testes dependem de outro cenário ter criado ou modificado dados. A seleção por segmento considera assinantes ativos no momento do disparo.

## Comandos adicionais

| Comando | Verificação |
| --- | --- |
| `npm run test:parallel` | Suíte em dois processos |
| `npm run test:random` | Ordem aleatória com semente 20261103 |
| `npm run test:smoke` | Casos centrais marcados com `@smoke` |
| `npm run test:estrutura` | Quatro histórias, critérios rastreados e um Quando por cenário |
| `npm run test:dominio` | Testes complementares com o test runner do Node.js |
| `npm run test:mutacoes` | Oito erros controlados em cópias temporárias para verificar se a suíte os detecta |

Os perfis de verificação não sobrescrevem o relatório completo. Para selecionar uma regra sem substituir o HTML, usar `npx cucumber-js --profile verificacao --tags @RN03`. O dry-run mostra passos `skipped` porque não os executa; nenhum está indefinido ou pendente.

## Saída real de npm test

```text
> newsflow-bdd@1.0.0 test
> cucumber-js

.....................................................................................................................................................................................................................................................................................................................

55 scenarios (55 passed)
309 steps (309 passed)
0m00.035s (executing steps: 0m00.008s)
```

## Referências

- Enunciado fornecido: `exercicio-newsflow.pdf`, capítulos 1 a 7, em especial regras na página 3, histórias na página 4 e checklist nas páginas 9 e 10.
- [Configuração oficial do Cucumber.js](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md).
- [Isolamento pelo World](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md).

Cucumber.js 12.2.0 está fixado no projeto e no lockfile. A revisão final usou Node.js 24.22.1 e npm 10.9.2; a instalação limpa inicial foi validada em Node.js 24.19.0. A avaliação final cabe ao professor; a entrega apresenta as evidências para revisão dos requisitos.
