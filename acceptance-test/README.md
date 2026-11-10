# NewsFlow — Teste de aceitação com Playwright

Atividade da dupla **Gustavo Lopes Oliveira** e **Heitor Canhestro Vieira Moreira**.

Esta pasta é uma entrega independente: contém uma interface de navegador para o fluxo editorial do NewsFlow, três testes de aceitação, configuração com inicialização automática do servidor, matriz de critérios e evidências reais.

## Instalar e executar

Pré-requisitos: Node.js 22 ou 24 com npm, conexão para a primeira instalação e porta 5173 disponível. Abra o terminal nesta pasta e execute:

```sh
npm install
npx playwright install chromium
npx playwright test
```

No Linux, caso faltem bibliotecas do navegador, use `npx playwright install --with-deps chromium`. A instalação do navegador é feita apenas na preparação da máquina. Com o Chromium instalado, o comando de avaliação é **`npm i && npx playwright test`**. Para reproduzir as versões do lockfile, use `npm ci` no lugar de `npm install`.

O Playwright sobe o app, espera sua disponibilidade, executa exatamente três testes e encerra o servidor. Não é necessário iniciar o app manualmente, criar conta ou configurar banco.

```sh
npx playwright show-report
```

O relatório fica em `playwright-report/index.html`, com capturas de tela dos testes. A matriz está em [ACEITACAO.md](ACEITACAO.md).

## Usar o app manualmente

### Nesta máquina, sem Node no PATH

As dependências e o Chromium já foram instalados durante a preparação. Para executar com o Node interno do Codex, abra o terminal nesta pasta e use:

```sh
/Users/heitorvieira/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/@playwright/test/cli.js test
```

Acrescente `--ui` para acompanhar pelo painel ou `--headed --workers=1` para ver o navegador executando um teste por vez. A configuração inicia o servidor com `process.execPath`, usando o mesmo Node que iniciou o Playwright, sem depender do PATH. Esse caminho interno é específico desta máquina e pode mudar com atualizações do Codex; para outras máquinas, siga a instalação padrão acima.

### Com Node e npm no PATH

Execute `npm start` e abra http://127.0.0.1:5173. Crie uma edição como Ana, selecione Bruno para aprová-la e edite o conteúdo para exigir nova revisão. Ana também tem papel de revisora, mas não pode aprovar a própria edição.

O seletor de pessoa simula os atores da atividade; não implementa autenticação. Os dados são locais ao navegador. Encerre o servidor manual antes de rodar os testes, pois a configuração exige iniciar uma instância própria.

## Os três comportamentos

1. **Caminho principal:** criar uma edição e obter aprovação de outro revisor, verificando conteúdo na lista, situação e resumo.
2. **Regra que barra erro:** impedir que a autora aprove a própria edição, apresentar a mensagem e manter o rascunho intacto.
3. **Regra de estado:** alterar uma edição aprovada, invalidar a aprovação e preservar o novo conteúdo e a situação de rascunho após recarregar.

Cada teste começa em um contexto de navegador limpo e cria seus próprios dados somente pela interface. Há várias asserções de comportamento em cada teste, com seletores por papel, rótulo e texto; não há esperas fixas nem acesso ao domínio ou ao localStorage pelos testes.

## Antiteste reproduzível

```sh
npm run test:antiteste
npx playwright test
```

O primeiro comando remove temporariamente, em `src/newsflow.js`, a condição que impede autoaprovação e executa somente C2. O script exige que o teste falhe na asserção da mensagem esperada; uma falha de infraestrutura não conta como sucesso. O arquivo original é restaurado em `finally`, e a evidência é salva em `evidencias/antiteste.json`. O segundo comando confirma o retorno ao verde e atualiza o relatório HTML. Execute esses comandos sequencialmente, sem outra suíte rodando ao mesmo tempo.

Para demonstrar a independência:

```sh
npx playwright test -g "C1"
npx playwright test -g "C2"
npx playwright test -g "C3"
```

## Relação com a atividade anterior

`src/newsflow.js` é uma cópia integral do domínio do NewsFlow da atividade anterior, preservada nesta pasta para permitir entrega independente. A interface chama as regras existentes de criação, revisão e alteração; o servidor adapta apenas a exportação CommonJS para o navegador. A persistência de edições em localStorage é uma camada nova da interface.

O recorte cobre o fluxo editorial e a revisão independente (RN02). Não demonstra agendamento, disparo, consentimento ou salvamento automático a cada 30 segundos. O botão de salvar persiste imediatamente as alterações. O seletor de atores é uma simulação didática e nenhum e-mail real é enviado.

## Entrega

Envie esta pasta sem `node_modules/` e sem `test-results/`. Inclua `playwright-report/` inteiro, `evidencias/`, os testes, fontes, configuração, `package.json`, `package-lock.json`, README e ACEITACAO. Os integrantes e o comando de execução estão acima para copiar ao texto do envio. O envio ao AVA deve ser realizado pela dupla.

Referências técnicas: [seletores do Playwright](https://playwright.dev/docs/locators), [servidor de testes](https://playwright.dev/docs/test-webserver) e [relatório HTML](https://playwright.dev/docs/test-reporters#html-reporter).
