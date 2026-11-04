# Ambiguidades e decisões do NewsFlow

As regras do enunciado são a base do projeto. As decisões abaixo preenchem lacunas ou resolvem conflitos de redação para tornar os exemplos executáveis. São propostas para revisão de negócio, não aprovações fictícias do professor ou de um PO real.

## DEC01 Salvamento periódico ou por inatividade

**Pergunta:** O texto precisa ficar 30 segundos sem alterações para ser salvo?

**Evidência do conflito:** RN01, na página 3, diz que a edição é salva automaticamente “a cada 30 segundos”. O modelo de história, na página 4, acrescenta “de inatividade”. Essas duas condições produzem resultados diferentes para quem escreve continuamente.

**Alternativas:** Reiniciar o prazo a cada digitação ou manter uma cadência periódica independente das alterações.

**Decisão proposta:** Priorizar a redação da regra RN01. Enquanto a edição está em rascunho, salvar aos 30, 60, 90 segundos e assim por diante. Alterações feitas antes do próximo instante entram no salvamento sem reiniciar a contagem. Cada ciclo gera uma versão, inclusive se o conteúdo não mudou. Não há versão automática no instante da criação.

**Consequência:** Uma redatora que digita no segundo 29 já tem esse conteúdo protegido no segundo 30. Em contrapartida, longos períodos sem alterações podem ocupar o histórico com conteúdo repetido. O recorte prefere uma regra simples e literal; otimizar versões idênticas exigiria decisão adicional.

**Evidência executável:** US01, “Salvar mesmo quando a redatora continua escrevendo”, com alteração no segundo 29 e salvamento no segundo 30. Se a decisão fosse por inatividade, esse cenário teria de esperar até o segundo 59.

**Onde mudar após revisão:** CA01_1 e CA01_2, os dois primeiros cenários da US01 e `alterar`/`avancarRelogio` em `src/newsflow.js`. Não basta substituir uma frase no README.

## DEC02 Restauração e retenção das versões

**Perguntas:** Restaurar apaga as versões seguintes? Como conciliar essa preservação com o limite de 20? A numeração recomeça?

**Decisão proposta:** A restauração copia título, corpo e capa e cria imediatamente uma nova versão com número crescente. Não remove deliberadamente as posteriores à versão escolhida; aplica apenas a política normal de remover a mais antiga quando houver mais de 20.

**Exemplo:** Restaurar a versão 1 quando existem 1, 2 e 3 cria a 4 e preserva 2 e 3. Restaurar a 1 quando existem 1 a 20 cria a 21 e mantém 2 a 21. Uma versão já descartada não pode ser restaurada.

**Motivo:** Preserva a possibilidade de desfazer a própria restauração sem prometer histórico ilimitado. A numeração identifica a sequência de salvamentos, não a posição atual de uma versão na lista.

**Evidência:** CA01_3 a CA01_5 e testes complementares de restauração com histórico cheio e de todos os campos do conteúdo.

## DEC03 Aprovação depois de uma alteração

**Pergunta central:** Uma edição aprovada continua autorizada se a redatora alterar seu corpo antes do envio?

**Lacuna:** RN02 exige aprovação, mas não declara se ela se refere à edição em abstrato ou ao conteúdo efetivamente avaliado.

**Alternativas consideradas**

- Manter a aprovação: evita nova revisão, mas pode distribuir conteúdo que ninguém avaliou.
- Invalidar a aprovação sempre que o conteúdo mudar: exige nova revisão, mas preserva o significado da autorização.
- Permitir pequenas correções sem revisão: depende de uma definição de “pequena” ausente do enunciado.

**Decisão proposta:** Vincular a aprovação à revisão do conteúdo. Alteração de título, corpo ou capa, inclusive por restauração, devolve a edição ao rascunho e remove a aprovação. Não se tenta classificar automaticamente a relevância da alteração.

**Interação com agendamento:** Com um disparo ativo, a edição fica bloqueada para alteração, restauração e nova decisão editorial. A gestora precisa cancelar o disparo respeitando RN03, depois alterar, revisar e agendar novamente. Nos últimos cinco minutos, o fluxo deste exercício não permite correção do conteúdo; uma operação de interrupção emergencial seria outra política a negociar.

**Consequência:** Há custo editorial de uma nova revisão, inclusive para ajustes pequenos. Esse custo é explicitado, em vez de ocultar uma brecha de autorização.

**Evidência:** CA02_4 e CA02_5, linhas de conteúdo alterado na US03 e testes complementares para restauração e edição já agendada. A proposta precisa de validação do PO; passar no teste demonstra consistência com a escolha, não consenso real.

## DEC04 Fronteiras do agendamento

**Perguntas:** Exatamente 15 minutos bastam? Exatamente cinco minutos ainda permitem cancelar? Tentativa inválida conta como reagendamento?

**Decisão proposta:** Aceitar antecedência maior ou igual a 15 minutos e cancelamento com pelo menos cinco minutos. Contar somente reagendamentos aceitos, no máximo dois; cada novo horário deve respeitar os 15 minutos a partir da solicitação atual. Não há limite adicional para solicitar reagendamento antes de o disparo ocorrer, pois RN03 não o define.

**Horário:** O relógio armazena instantes absolutos. A apresentação usa explicitamente o fuso nomeado `America/Sao_Paulo`, independentemente do fuso do computador. Exemplos usam 3 de novembro de 2026 às 9h locais. O deslocamento de -03:00 nos dados desse dia não substitui o fuso nomeado na apresentação.

**Evidência:** 899, 900 e 901 segundos para agendamento; contadores 0, 1 e 2 antes da tentativa; 299, 300 e 301 segundos para cancelamento. Um teste complementar atravessa meia-noite em UTC para verificar a data local.

## DEC05 O que é um segmento vazio e quem recebe

**Perguntas:** Um segmento com pessoas descadastradas é vazio? Selecionar o mesmo segmento duas vezes consome duas posições? A audiência é congelada ao agendar?

**Decisão proposta:** Contar segmentos distintos por identificador e exigir ao menos um assinante ativo em cada um. No disparo, calcular a união dos membros atuais, filtrar os ativos e eliminar duplicações por assinante. O cadastro em memória mantém uma identidade única para o mesmo endereço de e-mail exato.

**Consequência:** Se todos saírem de um segmento depois de agendar, o disparo já programado pode terminar sem destinatários daquele segmento; os demais ainda recebem. RN04 bloqueia o agendamento quando o segmento já está vazio, mas não exige cancelar toda a edição se o público mudar depois.

**Evidência:** CA03_2 e CA03_5; testes complementares de segmento com todos inativos e seleção repetida. Normalização de aliases, maiúsculas e provedores de e-mail não faz parte do exercício.

## DEC06 Saída após agendamento e mensagens de confirmação

**Pergunta:** Uma pessoa que estava na lista no agendamento recebe mesmo se sair antes do envio? Como enviar confirmação se o descadastro tem efeito imediato?

**Decisão proposta:** Reavaliar o consentimento no disparo e excluir imediatamente quem saiu. A confirmação de descadastro é uma mensagem operacional exigida por RN06, portanto é enviada uma vez mesmo para a assinatura agora inativa. Uma saída repetida não gera outra confirmação. Todos os e-mails produzidos, inclusive os de confirmação, contêm link de descadastro.

**Motivo:** Congelar a lista contrariaria o efeito imediato do opt-out. Suprimir a confirmação contrariaria a outra obrigação da mesma RN. A distinção entre newsletter e confirmação resolve a aparente tensão.

**Evidência:** US04, “Respeitar a saída depois que o envio já foi agendado”: Ana sai, Ana recebe zero newsletters e Bruno recebe uma. O exemplo verifica o resultado final, não apenas uma flag de cadastro.

## DEC07 Validade do retorno e reutilização do link

**Perguntas:** O link é válido exatamente em 48 horas? Um link antigo ainda vale depois de outro pedido de retorno?

**Decisão proposta:** A validade é o intervalo anterior a 48 horas completas; no vencimento, o link expira. Solicitar retorno não reativa a assinatura. Somente a confirmação válida faz isso. O link é de uso único, uma nova solicitação substitui a anterior e um novo opt-out invalida uma confirmação pendente.

**Consequência:** Aos 172800 segundos, a pessoa precisa pedir outro link. A invalidação do anterior evita que uma solicitação antiga volte a ativar uma assinatura depois de uma nova decisão de saída.

**Evidência:** CA04_3 a CA04_5, incluindo 172799, 172800 e 172801 segundos, mais teste complementar de opt-out com retorno pendente. Tokens do serviço são apenas identificadores de teste; segurança criptográfica fica fora do recorte.

## Como conduzir a revisão

Gustavo Lopes Oliveira, no papel de Negócio/PO, deve validar especialmente DEC01 e DEC03. Heitor Canhestro Vieira Moreira, no papel Técnico, deve mostrar os cenários que distinguem as alternativas. Decisões que mudarem precisam ser atualizadas primeiro nos critérios e exemplos, depois no domínio.
