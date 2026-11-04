# language: pt
@US04 @RN06
Funcionalidade: Controlar a saída e o retorno à lista
  Como assinante
  Quero sair imediatamente da lista e confirmar qualquer retorno
  Para receber newsletters somente enquanto desejo

  Contexto:
    Dado que Ana é uma assinante ativa

  @feliz @smoke @CA04_1
  Esquema do Cenário: Confirmar a saída sem duplicar mensagens
    Dado que Ana já solicitou o descadastro <anteriores> vezes
    Quando Ana utiliza o link de descadastro
    Então Ana fica "inativa"
    E existe exatamente 1 e-mail de confirmação de descadastro para Ana
    E todos os e-mails gerados contêm link de descadastro

    Exemplos:
      | anteriores |
      | 0          |
      | 1          |

  @alternativa @DEC06 @CA04_2
  Cenário: Respeitar a saída depois que o envio já foi agendado
    Dado que uma edição aprovada está agendada para Ana e Bruno
    E Ana se descadastra antes do horário marcado
    Quando chega o horário programado para o disparo
    Então Ana recebe 0 newsletters e Bruno recebe 1 newsletter

  @feliz @CA04_3
  Cenário: Solicitar retorno sem reativar a assinatura
    Dado que Ana está descadastrada
    Quando Ana solicita o retorno à lista
    Então Ana fica "inativa"
    E existe um e-mail de retorno com link de confirmação válido por 48 horas
    E todos os e-mails gerados contêm link de descadastro

  @feliz @excecao @limite @CA04_4
  Esquema do Cenário: Confirmar retorno dentro da validade de 48 horas
    Dado que Ana está descadastrada e solicitou retorno há <segundos> segundos
    Quando Ana confirma o link de retorno recebido
    Então a mensagem é "<mensagem>"
    E Ana fica "<situacao>"

    Exemplos:
      | segundos | mensagem                         | situacao |
      | 0        | Retorno à lista confirmado       | ativa    |
      | 172799   | Retorno à lista confirmado       | ativa    |
      | 172800   | Link de confirmação expirado     | inativa  |
      | 172801   | Link de confirmação expirado     | inativa  |

  @excecao @CA04_5
  Esquema do Cenário: Recusar link sem autorização vigente
    Dado que o link de retorno de Ana é "<condicao>"
    Quando Ana confirma o link de retorno recebido
    Então a mensagem é "Link de confirmação inválido"
    E Ana fica "<situacao>"

    Exemplos:
      | condicao     | situacao |
      | desconhecido | inativa  |
      | utilizado    | ativa    |
      | substituído  | inativa  |
