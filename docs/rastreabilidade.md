# Rastreabilidade de regras e critérios

| Regra | História | Resultados e fronteiras |
| --- | --- | --- |
| RN01 | US01 | 29, 30 e 31 segundos; 19, 20 e 21 versões; restauração e recusa sem efeitos |
| RN02 | US02 e pré-condição de US03 | Revisor independente; autor impedido; comentário obrigatório; conteúdo alterado; envio e agendamento bloqueados |
| RN03 | US03 | 899, 900 e 901 segundos; 0, 1 e 2 reagendamentos anteriores; cancelamento a 299, 300 e 301 segundos; fuso explícito |
| RN04 | US03 | 0, 1, 5 e 6 segmentos; segmento vazio entre válidos; uma mensagem por assinante na união dos segmentos |
| RN06 | US04 e composição de US03 | Link em todos os e-mails; saída imediata; retorno exige confirmação; 172799, 172800 e 172801 segundos; link reutilizado e substituído |
| RN05 | Fora de escopo | Frequência semanal e fila; justificativa no README |
| RN07 | Fora de escopo | Falhas, retentativas e bounce; justificativa no README |
| RN08 | Fora de escopo | Push, silêncio e limite diário; justificativa no README |

## Dos critérios aos exemplos

As tags dos critérios permitem seleção direta, por exemplo: `npx cucumber-js --profile verificacao --tags @CA04_4`.

| Critério | Arquivo | Cenário ou esquema |
| --- | --- | --- |
| CA01_1 | [us01-rascunho.feature](../features/us01-rascunho.feature) | Salvar o rascunho a cada 30 segundos |
| CA01_2 | [us01-rascunho.feature](../features/us01-rascunho.feature) | Salvar o rascunho a cada 30 segundos |
| CA01_1 | [us01-rascunho.feature](../features/us01-rascunho.feature) | Salvar mesmo quando a redatora continua escrevendo |
| CA01_2 | [us01-rascunho.feature](../features/us01-rascunho.feature) | Salvar mesmo quando a redatora continua escrevendo |
| CA01_3 | [us01-rascunho.feature](../features/us01-rascunho.feature) | Reter somente as 20 versões mais recentes |
| CA01_4 | [us01-rascunho.feature](../features/us01-rascunho.feature) | Restaurar sem apagar as versões posteriores |
| CA01_5 | [us01-rascunho.feature](../features/us01-rascunho.feature) | Recusar uma versão indisponível |
| CA02_1 | [us02-aprovacao.feature](../features/us02-aprovacao.feature) | Permitir somente aprovação independente por revisor |
| CA02_2 | [us02-aprovacao.feature](../features/us02-aprovacao.feature) | Permitir somente aprovação independente por revisor |
| CA02_3 | [us02-aprovacao.feature](../features/us02-aprovacao.feature) | Exigir comentário para devolver a edição |
| CA02_4 | [us02-aprovacao.feature](../features/us02-aprovacao.feature) | Retirar a aprovação quando o conteúdo muda |
| CA02_5 | [us02-aprovacao.feature](../features/us02-aprovacao.feature) | Impedir envio imediato sem aprovação vigente |
| CA03_1 | [us03-agendamento.feature](../features/us03-agendamento.feature) | Respeitar a antecedência mínima e a aprovação |
| CA03_2 | [us03-agendamento.feature](../features/us03-agendamento.feature) | Exigir de um a cinco segmentos com público |
| CA03_3 | [us03-agendamento.feature](../features/us03-agendamento.feature) | Contar apenas reagendamentos aceitos |
| CA03_4 | [us03-agendamento.feature](../features/us03-agendamento.feature) | Cancelar até cinco minutos antes do envio |
| CA03_5 | [us03-agendamento.feature](../features/us03-agendamento.feature) | Entregar uma vez apenas quando o disparo permanece agendado |
| CA04_1 | [us04-consentimento.feature](../features/us04-consentimento.feature) | Confirmar a saída sem duplicar mensagens |
| CA04_2 | [us04-consentimento.feature](../features/us04-consentimento.feature) | Respeitar a saída depois que o envio já foi agendado |
| CA04_3 | [us04-consentimento.feature](../features/us04-consentimento.feature) | Solicitar retorno sem reativar a assinatura |
| CA04_4 | [us04-consentimento.feature](../features/us04-consentimento.feature) | Confirmar retorno dentro da validade de 48 horas |
| CA04_5 | [us04-consentimento.feature](../features/us04-consentimento.feature) | Recusar link sem autorização vigente |
| CA02_1 | [us02-aprovacao.feature](../features/us02-aprovacao.feature) | Liberar a edição depois da correção solicitada |
| CA02_3 | [us02-aprovacao.feature](../features/us02-aprovacao.feature) | Liberar a edição depois da correção solicitada |
| CA02_4 | [us02-aprovacao.feature](../features/us02-aprovacao.feature) | Liberar a edição depois da correção solicitada |
| CA03_4 | [us03-agendamento.feature](../features/us03-agendamento.feature) | Entregar uma vez apenas quando o disparo permanece agendado |

## Leitura da cobertura

São **4 histórias, 20 critérios, 20 definições de cenário e 55 casos executados**, com **309 passos**. Os esquemas expandem uma mesma definição em exemplos concretos; não são 55 histórias ou comportamentos sem relação. As definições se distribuem em 5 por história.

Os **12 testes complementares** cobrem interações como restauração de título e capa, histórico cheio, edição agendada protegida, disparo cancelado, deduplicação da escolha de segmentos, retorno pendente e fuso. Eles complementam os exemplos de negócio sem substituir as quatro histórias.

Linhas vizinhas de uma fronteira podem esperar o mesmo resultado: cada uma ancora um lado do corte e detecta deslocamentos diferentes. A auditoria de mutações demonstra que a suíte detecta oito erros escolhidos; isso não é uma alegação de cobertura integral ou de um índice geral de mutação.

A cobertura descreve o recorte implementado. Não demonstra entrega física de e-mail, retentativas, frequência semanal, push nem segurança de produção.
