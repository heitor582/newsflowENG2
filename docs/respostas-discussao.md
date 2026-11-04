# Respostas de apoio à discussão em sala

## 1 Mudança de 15 para 30 minutos

Mudaríamos **dois Esquemas do Cenário** em `features/us03-agendamento.feature`, porque a antecedência também vale para reagendar.

No esquema **“Respeitar a antecedência mínima e a aprovação”**, as três primeiras linhas passariam de 899, 900 e 901 segundos para **1799, 1800 e 1801 segundos**, com os horários aceitos de **09:30:00 e 09:30:01**, em 3 de novembro de 2026, no fuso de São Paulo. As duas linhas sem aprovação continuam recusadas, independentemente do prazo.

No esquema **“Contar apenas reagendamentos aceitos”**, as três linhas com 900 segundos passariam a **1800**, e a linha de 899 passaria a **1799**. Os dois horários aceitos mudariam para **09:30:00**. As recusas manteriam 10:02:00 e 10:01:00, porque preservam o horário anterior do disparo.

Portanto, seriam **dois esquemas e sete linhas de exemplos alteradas**. Acrescentaríamos uma regressão com 900 segundos recusados para mostrar que o limite antigo deixou de valer. Não mudaríamos as fronteiras de cinco minutos para cancelar nem o limite de dois reagendamentos.

Também ajustaríamos CA03_1 e CA03_3 em `docs/historias.md`, DEC04, a matriz de rastreabilidade, as duas comparações de prazo em `agendar` e `reagendar`, as mensagens correspondentes e os testes complementares que montam agendamentos de 15 minutos. O teste de mutação precisa ter seu alvo atualizado. Os steps de Gherkin continuam parametrizados, sem precisar codificar novos números.

## 2 Dependência entre cenários

**Nenhum cenário da entrega deve depender de outro.** Cada World possui um novo serviço, relógio, edições, assinantes e mensagens. Os dados do Contexto são preparados de novo em cada exemplo, inclusive nas linhas de um esquema.

Um contraexemplo seria usar uma assinante Ana global. Se o cenário “Confirmar a saída sem duplicar mensagens” desativasse essa Ana e o cenário de sobreposição de segmentos a reutilizasse, o segundo esperaria três newsletters, mas só Bruno e Carla receberiam. Ele passaria sozinho e falharia depois do descadastro.

Esse defeito não foi mantido no projeto. Na suíte entregue, o cenário de sobreposição cria suas próprias Ana, Bruno e Carla. Para demonstrar o isolamento, usar `npm run test:parallel` e `npm run test:random`. A ordem aleatória usa a semente fixa 20261103 para ser reproduzível.

## 3 Por que usar Contexto

Na US03, todos os cenários começam com uma edição em rascunho e um segmento de exemplo com dois assinantes. Por isso essas condições comuns ficam no Contexto e são recriadas a cada execução.

A aprovação **não** está no Contexto porque um dos esquemas precisa provar a recusa de rascunho e de conteúdo alterado após aprovação. O horário também não está no Contexto: ele varia em torno de 15 minutos, em reagendamentos e no limite de cancelamento.

O cenário de sobreposição substitui a seleção inicial por dois segmentos com membros explícitos. A existência do segmento inicial não produz envio nem altera a escolha final. Se muitos cenários precisassem substituir várias condições, seria sinal para reduzir o Contexto.

## 4 Garantia observável além do código isolado

O cenário **“Respeitar a saída depois que o envio já foi agendado”** garante que uma decisão atual do assinante prevalece sobre a audiência escolhida antes: Ana recebe zero newsletters depois do descadastro, enquanto Bruno recebe uma. Ele verifica a comunicação produzida, não apenas se o cadastro mudou para inativo.

O código pode ser sintaticamente válido e ainda usar uma lista congelada no agendamento. Nesse caso, a função de descadastro poderia parecer correta isoladamente, mas Ana continuaria recebendo. O cenário torna essa contradição visível e testável em linguagem de negócio.

Outro exemplo é exatamente 15 minutos: trocar `<` por `<=` no bloqueio do agendamento é uma alteração válida em JavaScript, mas recusa um prazo permitido. O exemplo de 900 segundos detecta essa diferença. Os testes de mutação da entrega verificam que erros desse tipo fazem a suíte falhar.

Essas verificações demonstram conformidade do domínio em memória com os exemplos acordados. Não comprovam entrega por um provedor real nem resolvem sozinhas as ambiguidades de negócio documentadas.
