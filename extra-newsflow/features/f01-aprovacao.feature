# language: pt
@US01 @F01 @RN02 @CA01
Funcionalidade: Validar a aprovação editorial
  A programação de uma edição exige revisão independente do conteúdo atual.

  Contexto:
    Dado que existe uma edição de Ana com o texto "Novidades de novembro"
    E o segmento "Clientes Premium" contém os assinantes "Ana, Bruno"

  @feliz
  Cenário: Aprovar conteúdo de outra pessoa
    Quando Bruno avalia a edição como revisor
    Então a mensagem é "Edição aprovada"
    E a edição fica aprovada por Bruno

  @excecao
  Cenário: Recusar aprovação pelo próprio autor
    Quando Ana avalia a edição como revisora
    Então a mensagem é "Autor não pode aprovar a própria edição"
    E a edição continua sem aprovação

  @excecao
  Cenário: Recusar agendamento de conteúdo não aprovado
    Quando a gestora agenda o envio para daqui a 1800 segundos
    Então a mensagem é "Edição precisa de aprovação vigente"
    E nenhum disparo é criado

  @alternativa @excecao
  Cenário: Exigir nova aprovação depois de alterar o conteúdo
    Dado que Bruno aprovou a edição
    E Ana alterou o texto para "Novidades corrigidas"
    Quando a gestora agenda o envio para daqui a 1800 segundos
    Então a mensagem é "Edição precisa de aprovação vigente"
    E nenhum disparo é criado
