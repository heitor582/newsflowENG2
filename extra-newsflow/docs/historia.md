# US01 Programar uma newsletter para o público escolhido

**Como** gestora de comunicação da Vértice, **quero** agendar uma edição revisada para os segmentos relevantes e ajustar ou cancelar sua programação dentro dos limites permitidos, **para** distribuir o conteúdo aprovado no horário escolhido, sem enviar mensagens duplicadas aos assinantes.

**Prioridade:** Alta. A programação conecta o conteúdo revisado à comunicação com o público e evita acompanhamento manual do horário de envio.

## Critérios de aceitação

- **CA01:** Somente um revisor diferente do autor pode aprovar o conteúdo. Edição sem aprovação ou alterada após aprovação não pode ser agendada.
- **CA02:** O agendamento exige pelo menos 15 minutos de antecedência, incluindo o instante exato do limite, com horário apresentado no fuso America/Sao_Paulo.
- **CA03:** Um disparo pode ser reagendado até duas vezes. Uma terceira tentativa é recusada sem modificar o horário nem o contador; novos horários respeitam a antecedência mínima.
- **CA04:** Cancelar é permitido até exatamente cinco minutos antes do horário previsto. Abaixo desse limite, a recusa preserva o disparo agendado.
- **CA05:** A escolha contém de um a cinco segmentos, nenhum vazio. Ao chegar o horário, cada assinante da união dos segmentos recebe um único e-mail, mesmo que pertença a mais de um segmento.

**Regras cobertas:** RN02, RN03 e RN04 do NewsFlow.

## Funcionalidades da mesma história

| Feature | Objetivo | Cenários | Critérios |
| --- | --- | --- | --- |
| F01 Validar a aprovação editorial | Garantir que somente conteúdo revisado possa ser programado | 4 | CA01 |
| F02 Controlar os prazos do agendamento | Aplicar antecedência, limite de reagendamentos e cancelamento | 5 | CA02, CA03, CA04 |
| F03 Selecionar o público do disparo | Validar segmentos e evitar duplicidade de e-mail | 4 | CA05 |

Há **uma única história**, detalhada em **três arquivos .feature e treze cenários**. As features representam condições e comportamentos necessários para entregar o objetivo da gestora; não são histórias de banco, tela ou API.

## Divisão da dupla

- **Gustavo Lopes Oliveira — Negócio e Product Owner:** recorte, valor, critérios, decisões e revisão dos exemplos.
- **Heitor — Desenvolvimento e QA:** automação em JavaScript, verificação dos limites, isolamento dos cenários e relatório.

## Decisões explícitas

1. A aprovação vale para a revisão do conteúdo avaliado. Alterar uma edição aprovada invalida sua aprovação. RN02 exige aprovação, mas não esclarece essa situação; manter a autorização permitiria enviar conteúdo que o revisor não leu.
2. Os limites de 15 minutos para agendar e de cinco minutos para cancelar são inclusivos. O terceiro reagendamento é recusado, e tentativas recusadas não consomem contador nem alteram horário.
3. A contagem considera segmentos distintos. Um assinante é identificado por seu cadastro, mesmo quando participa de vários segmentos.

## Fora de escopo

RN01, salvamento e versões, não integra a intenção de programar uma edição já escrita. RN05, frequência semanal, adicionaria fila e uma política de distribuição distinta. RN06, consentimento, RN07, falhas de transporte, e RN08, push, exigem outros fluxos e não são implementados neste exercício extra. Os assinantes dos cenários já estão aptos a receber. Os e-mails são registros em memória, sem envio real.
