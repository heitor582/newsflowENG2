# Histórias de usuário do NewsFlow

O recorte acompanha a edição desde a proteção do texto até um envio aprovado e direcionado, mantendo o controle do assinante sobre o recebimento. Cada história entrega um resultado de negócio próprio. As condições de prazo, autorização e consentimento são exemplos verificáveis, e não tarefas de interface ou persistência.

## US01 Recuperar o conteúdo do rascunho

**Como** redatora que prepara uma edição, **quero** ter cópias automáticas e restaurar um conteúdo anterior, **para** recuperar meu trabalho após uma alteração indesejada sem perder a sequência recente de versões.

**Critérios de aceitação**

- **CA01_1:** A edição nasce em rascunho, sem versão automática inicial. Enquanto permanece em rascunho, o primeiro salvamento ocorre aos 30 segundos e os seguintes a cada 30 segundos, mesmo que a redatora continue escrevendo.
- **CA01_2:** Cada salvamento cria uma versão numerada de forma crescente com título, corpo e capa daquele instante; 29 segundos produzem zero versões, 30 produzem uma e 60 produzem duas.
- **CA01_3:** São mantidas somente as 20 versões mais recentes. Após 21 salvamentos, ficam disponíveis as versões 2 a 21, sem reiniciar a numeração.
- **CA01_4:** Restaurar uma versão disponível recupera seu conteúdo e registra uma nova versão. As versões posteriores à escolhida são preservadas, sujeitas apenas ao limite normal das últimas 20.
- **CA01_5:** A tentativa de restaurar uma versão descartada ou inexistente é recusada com motivo explícito, sem modificar o conteúdo nem o histórico.

**Regras cobertas:** RN01.

**Prioridade:** Alta. O conteúdo é o insumo das demais etapas e sua recuperação reduz retrabalho editorial.

**Cenários:** [us01-rascunho.feature](../features/us01-rascunho.feature).

**Recorte:** Proteção e recuperação do conteúdo, sem editor visual nem sincronização offline. A cadência periódica, em vez de 30 segundos de inatividade, é a decisão **DEC01**: o texto da RN01 e o modelo de história do enunciado divergem nesse ponto.

## US02 Liberar apenas conteúdo revisado

**Como** revisora editorial, **quero** aprovar uma edição de outra pessoa ou devolvê-la com uma orientação concreta, **para** impedir que conteúdo sem revisão independente seja enviado aos assinantes.

**Critérios de aceitação**

- **CA02_1:** Uma pessoa com papel de revisor, diferente do autor, pode aprovar a edição; a autorização fica vinculada à revisão do conteúdo avaliado.
- **CA02_2:** O autor, mesmo com papel de revisor, não pode aprovar a própria edição; uma pessoa sem papel de revisor também é impedida. A recusa mantém o estado anterior.
- **CA02_3:** A reprovação por revisor independente devolve a edição ao rascunho e registra comentário obrigatório. Comentário vazio ou contendo apenas espaços é recusado sem mudar a aprovação anterior.
- **CA02_4:** Alterar o conteúdo de uma edição aprovada sem agendamento ativo invalida imediatamente a aprovação e devolve a edição ao rascunho; outra aprovação é necessária antes de enviar ou agendar.
- **CA02_5:** O envio imediato é permitido somente com aprovação vigente. Rascunho ou conteúdo alterado depois da aprovação não gera e-mail aos assinantes.

**Regras cobertas:** RN02.

**Prioridade:** Alta. A revisão independente é a barreira editorial antes da distribuição do conteúdo.

**Cenários:** [us02-aprovacao.feature](../features/us02-aprovacao.feature).

**Recorte:** Decisão editorial e validade da aprovação. Fluxo de comentários colaborativos e comparação visual de versões ficam fora. A invalidação após alteração é uma interpretação explícita em **DEC03**, não uma regra detalhada pelo enunciado.

## US03 Programar o envio para o público escolhido

**Como** gestora de comunicação, **quero** programar uma edição aprovada para os segmentos relevantes e corrigir o horário dentro dos limites permitidos, **para** alcançar o público certo sem acompanhamento manual nem e-mails duplicados por sobreposição de segmentos.

**Critérios de aceitação**

- **CA03_1:** O agendamento exige aprovação vigente e antecedência de pelo menos 15 minutos, incluindo o instante exato do limite. O horário exibido usa America/Sao_Paulo; recusas não criam um disparo.
- **CA03_2:** A gestora seleciona de 1 a 5 segmentos distintos, todos com ao menos um assinante ativo. Zero segmentos, seis segmentos ou qualquer segmento vazio bloqueiam o agendamento.
- **CA03_3:** Um disparo agendado admite no máximo dois reagendamentos bem-sucedidos. Cada novo horário respeita os 15 minutos a partir da solicitação; uma tentativa recusada preserva horário e contador.
- **CA03_4:** O cancelamento é aceito até exatamente 5 minutos antes do horário marcado. Abaixo disso é recusado, preservando o agendamento. Um disparo cancelado não gera e-mails no horário original.
- **CA03_5:** No horário programado, o disparo gera um único e-mail por assinante ativo da união dos segmentos, mesmo quando a mesma pessoa participa de mais de um. O e-mail contém link de descadastro.

**Regras cobertas:** RN03 e RN04; pré-condição de RN02 e composição com RN06.

**Prioridade:** Alta. É o resultado operacional do fluxo editorial: comunicação no horário e para o público definidos.

**Cenários:** [us03-agendamento.feature](../features/us03-agendamento.feature).

**Recorte:** Agendamento dirigido a segmentos. A seleção do público faz parte do mesmo disparo, não é uma história de cadastro de segmentos. Frequência semanal, retentativas e push são fluxos separados e ficam fora do escopo.

## US04 Controlar a saída e o retorno à lista

**Como** assinante que quer controlar o recebimento, **quero** sair imediatamente da lista e retornar somente depois de confirmar minha intenção, **para** interromper newsletters indesejadas e evitar uma reinscrição sem meu consentimento.

**Critérios de aceitação**

- **CA04_1:** O link de descadastro desativa o recebimento imediatamente e gera um e-mail de confirmação, também com link de descadastro. Repetir a saída mantém a inatividade sem gerar confirmações duplicadas.
- **CA04_2:** Se a saída ocorrer depois do agendamento e antes do disparo, o assinante não recebe a newsletter. Os demais assinantes ativos do segmento continuam recebendo.
- **CA04_3:** Solicitar retorno gera um e-mail com link de confirmação e link de descadastro, mas mantém o assinante inativo enquanto não houver confirmação.
- **CA04_4:** O retorno só ativa a assinatura quando o link válido é confirmado antes de completar 48 horas. Aos 172799 segundos é aceito; aos 172800 e 172801 segundos está expirado e mantém a assinatura inativa.
- **CA04_5:** Link desconhecido, já utilizado ou substituído por nova solicitação de retorno é recusado sem alterar o estado atual da assinatura.

**Regras cobertas:** RN06, com interação com o disparo de RN03 e RN04.

**Prioridade:** Alta. O envio precisa respeitar a intenção atual do assinante, inclusive quando já estava programado.

**Cenários:** [us04-consentimento.feature](../features/us04-consentimento.feature).

**Recorte:** Opt-out imediato e duplo opt-in para retorno. Cadastro inicial, autenticação e entrega por provedores externos não são implementados. Links e e-mails são representações em memória, sem envio real.

## Justificativa do conjunto

As quatro histórias entregam resultados distintos para redatora, revisora, gestora e assinante. Sem US01, perde-se a recuperação do texto; sem US02, falta controle editorial; sem US03, falta distribuição programada e dirigida; sem US04, o público perde o controle do recebimento.

RN01 e RN02 ficam separadas porque preservar conteúdo e autorizar sua distribuição têm atores, riscos e resultados diferentes. RN03 e RN04 ficam juntas porque o horário e a audiência descrevem o mesmo disparo. RN06 fecha a jornada ao garantir que uma decisão de envio não se sobreponha à saída posterior do assinante.

A escolha prioriza profundidade em cinco regras e suas interações. RN05, RN07 e RN08 exigem políticas próprias de semana, recuperação de falhas e janela de notificações. Estão justificadas na seção Fora de escopo do README, sem criar uma quinta história. A ordem US01 a US04 organiza a leitura; nenhum teste depende de outro ter sido executado primeiro.
