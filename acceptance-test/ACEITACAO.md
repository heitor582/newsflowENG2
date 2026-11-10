# Aceitação — NewsFlow

**Dupla:** Gustavo Lopes Oliveira e Heitor Canhestro Vieira Moreira.

**Objetivo:** provar, pelo navegador, três comportamentos essenciais do fluxo editorial. Os testes manipulam apenas a interface pública; a criação de dados também ocorre por cliques e preenchimento de campos.

## Critério → teste → evidência

| Critério de aceite (Dado / Quando / Então) | Teste: arquivo e linha | O que prova / evidência |
| --- | --- | --- |
| **C1 — Caminho principal.** Dado que Ana está no NewsFlow, quando cria “Novidades da Vértice” e Bruno aprova a edição, então há uma edição na lista, a mensagem é “Edição aprovada”, a situação é Aprovada, a revisão é de Bruno e o resumo mostra uma aprovada. | [`tests/aceitacao.spec.js:13`](tests/aceitacao.spec.js#L13) — cria uma edição e recebe aprovação de outro revisor | Confirmação da criação, quantidade e título da edição, confirmação da aprovação, situação, revisor e resumo. Resultado verde e captura no [relatório HTML](playwright-report/index.html), caso C1. |
| **C2 — Regra que barra erro (RN02).** Dado que Ana criou uma edição e também tem papel de revisora, quando tenta aprová-la, então recebe “Autor não pode avaliar a própria edição”, a situação continua Rascunho e a lista mantém a edição e seu conteúdo, sem nenhuma aprovada. | [`tests/aceitacao.spec.js:26`](tests/aceitacao.spec.js#L26) — recusa autoaprovação e mantém a edição como rascunho | Mensagem de recusa, situação, contagem de aprovadas, quantidade de edições e preservação do texto. Resultado verde e captura no relatório, caso C2; falha controlada em [antiteste.json](evidencias/antiteste.json). |
| **C3 — Regra de estado.** Dado que Bruno aprovou uma edição de Ana, quando o título e o conteúdo são alterados e a página é recarregada, então o novo conteúdo permanece, a edição volta a Rascunho, a revisão de Bruno não aparece, não existe o título antigo e há uma única edição com zero aprovações. | [`tests/aceitacao.spec.js:36`](tests/aceitacao.spec.js#L36) — editar invalida a aprovação e mantém conteúdo e estado após recarregar | Verifica aprovação inicial, confirmação da edição e, após reload, título, corpo, situação, resumo, ausência da aprovação anterior e ausência de duplicação. Resultado verde e captura no relatório, caso C3. |

A invalidação da aprovação após edição corresponde à decisão de negócio do NewsFlow anterior. A persistência local foi adicionada à interface desta atividade e não representa implementação de salvamento automático periódico.

## Execução comprovada

Execução em **10/11/2026**, com Node.js 24.22.1, Playwright 1.58.2 e Chromium fornecido pelo Playwright, no macOS.

```text
Running 3 tests using 3 workers
3 passed (1.4s)
```

- [Saída completa da execução final](evidencias/execucao-final.txt).
- Execução isolada comprovada: [C1](evidencias/isolado-C1.txt), [C2](evidencias/isolado-C2.txt) e [C3](evidencias/isolado-C3.txt).
- [Relatório HTML com os três testes verdes](playwright-report/index.html). Para navegar pelos anexos, execute `npx playwright show-report` nesta pasta.

O tempo é o observado nesta máquina, não uma garantia de desempenho em outro ambiente.

## Antiteste: vermelho → restauração → verde

1. O script `scripts/antiteste.js` removeu temporariamente a validação `pessoa.id === edicao.autor.id` do domínio usado pela interface.
2. C2 foi executado sozinho e falhou na asserção de `role="alert"`: esperava “Autor não pode avaliar a própria edição”, mas a mensagem estava vazia, pois a aprovação indevida foi aceita.
3. O script verificou o código de saída e a falha específica da asserção. O registro JSON contém um teste com resultado inesperado; a falha não foi de inicialização do navegador ou servidor.
4. O arquivo original foi restaurado automaticamente. A comparação com o domínio da atividade anterior confirmou conteúdo idêntico.
5. Os três testes foram executados isoladamente e, depois, juntos: todos passaram. O relatório HTML entregue é da execução completa após a restauração.

Reprodução: `npm run test:antiteste` e, em seguida, `npx playwright test`. O JSON guarda a falha e os detalhes do teste; caminhos de anexos temporários registrados nele podem ser substituídos pela próxima execução. O relatório HTML final mantém suas próprias capturas em `playwright-report/data/`.

## Checklist

- [x] Exatamente três testes, um por cenário obrigatório.
- [x] Pelo menos duas asserções diferentes por teste.
- [x] Seletores por papel, rótulo ou texto; sem seletores por posição ou estilo.
- [x] Nenhuma espera fixa.
- [x] Cada teste passa sozinho e usa um contexto de navegador independente.
- [x] Servidor iniciado e encerrado automaticamente pelo `webServer`.
- [x] Suíte completa abaixo de 30 segundos na execução registrada.
- [x] Antiteste realmente falhou na regra removida e voltou ao verde após restauração.
- [x] Matriz critério → arquivo:linha → evidência e relatório HTML incluídos.

## Comando para o envio

Na primeira preparação: `npm install` e `npx playwright install chromium`.

Com o navegador instalado, na pasta desta atividade:

```sh
npm i && npx playwright test
```

Integrantes: **Gustavo Lopes Oliveira e Heitor Canhestro Vieira Moreira**.
