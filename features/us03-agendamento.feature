# language: pt
@US03 @RN03 @RN04
Funcionalidade: Programar o envio para o público escolhido
  Como gestora de comunicação
  Quero programar uma edição aprovada para os segmentos relevantes
  Para alcançar esse público no horário escolhido sem duplicar mensagens

  Contexto:
    Dado que existe uma edição em rascunho com o corpo "Novidades da Vértice"
    E o segmento "Clientes Premium" contém 2 assinantes ativos

  @feliz @excecao @smoke @limite @RN02 @CA03_1
  Esquema do Cenário: Respeitar a antecedência mínima e a aprovação
    Dado que a condição da edição é "<condicao>"
    Quando a gestora agenda para daqui a <segundos> segundos
    Então a mensagem é "<mensagem>"
    E existem <disparos> disparos agendados
    E o horário de envio em São Paulo é "<horario>"

    Exemplos:
      | condicao             | segundos | mensagem                                          | disparos | horario             |
      | aprovada             | 899      | Envio exige antecedência mínima de 15 minutos      | 0        | não agendado        |
      | aprovada             | 900      | Envio agendado                                    | 1        | 03/11/2026 09:15:00 |
      | aprovada             | 901      | Envio agendado                                    | 1        | 03/11/2026 09:15:01 |
      | rascunho             | 1800     | Edição precisa de aprovação vigente                | 0        | não agendado        |
      | alterada após aprovar | 1800     | Edição precisa de aprovação vigente                | 0        | não agendado        |

  @feliz @excecao @limite @CA03_2
  Esquema do Cenário: Exigir de um a cinco segmentos com público
    Dado que a edição está aprovada por um revisor independente
    E a gestora escolhe <segmentos> segmentos distintos com <vazios> segmentos vazios
    Quando a gestora agenda para daqui a 1800 segundos
    Então a mensagem é "<mensagem>"
    E existem <disparos> disparos agendados

    Exemplos:
      | segmentos | vazios | mensagem                            | disparos |
      | 0         | 0      | Escolha de 1 a 5 segmentos           | 0        |
      | 1         | 0      | Envio agendado                       | 1        |
      | 5         | 0      | Envio agendado                       | 1        |
      | 6         | 0      | Escolha de 1 a 5 segmentos           | 0        |
      | 1         | 1      | Segmento sem assinantes ativos       | 0        |
      | 5         | 1      | Segmento sem assinantes ativos       | 0        |

  @limite @excecao @CA03_3
  Esquema do Cenário: Contar apenas reagendamentos aceitos
    Dado que existe um disparo com <anteriores> reagendamentos anteriores
    Quando a gestora reagenda para daqui a <segundos> segundos
    Então a mensagem é "<mensagem>"
    E o disparo registra <total> reagendamentos e horário "<horario>"

    Exemplos:
      | anteriores | segundos | mensagem                                      | total | horario             |
      | 0          | 900      | Envio reagendado                              | 1     | 03/11/2026 09:15:00 |
      | 1          | 900      | Envio reagendado                              | 2     | 03/11/2026 09:15:00 |
      | 2          | 900      | Limite de 2 reagendamentos atingido            | 2     | 03/11/2026 10:02:00 |
      | 1          | 899      | Envio exige antecedência mínima de 15 minutos | 1     | 03/11/2026 10:01:00 |

  @limite @excecao @CA03_4
  Esquema do Cenário: Cancelar até cinco minutos antes do envio
    Dado que existe um disparo com 0 reagendamentos anteriores
    E faltam <segundos> segundos para o horário marcado
    Quando a gestora cancela o disparo
    Então a mensagem é "<mensagem>"
    E a situação do disparo é "<situacao>"

    Exemplos:
      | segundos | mensagem                                                  | situacao  |
      | 301      | Agendamento cancelado                                     | cancelado |
      | 300      | Agendamento cancelado                                     | cancelado |
      | 299      | Cancelamento exige ao menos 5 minutos de antecedência      | agendado  |

  @feliz @alternativa @RN06 @CA03_4 @CA03_5
  Esquema do Cenário: Entregar uma vez apenas quando o disparo permanece agendado
    Dado que a edição aprovada está agendada para os segmentos com Ana e Bruno e com Ana e Carla
    E a situação do envio antes do horário marcado é "<situacao>"
    Quando chega o horário programado para o disparo
    Então Ana, Bruno e Carla recebem <quantidade> e-mails de newsletter cada
    E o disparo termina "<final>" com link de descadastro em cada mensagem enviada

    Exemplos:
      | situacao  | quantidade | final     |
      | agendado  | 1          | enviado   |
      | cancelado | 0          | cancelado |
