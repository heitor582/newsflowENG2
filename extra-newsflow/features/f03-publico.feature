# language: pt
@US01 @F03 @RN04 @CA05
Funcionalidade: Selecionar o público do disparo
  A edição alcança o público escolhido sem repetir e-mails por sobreposição.

  Contexto:
    Dado que existe uma edição de Ana com o texto "Novidades de novembro"
    E Bruno aprovou a edição

  @feliz @limite
  Cenário: Agendar para cinco segmentos com assinantes
    Dado que a gestora escolheu 5 segmentos distintos com 1 assinante cada
    Quando a gestora agenda o envio para daqui a 1800 segundos
    Então a mensagem é "Envio agendado"
    E o disparo inclui 5 segmentos

  @excecao @limite
  Cenário: Recusar a escolha de seis segmentos
    Dado que a gestora escolheu 6 segmentos distintos com 1 assinante cada
    Quando a gestora agenda o envio para daqui a 1800 segundos
    Então a mensagem é "Escolha de 1 a 5 segmentos"
    E nenhum disparo é criado

  @excecao
  Cenário: Recusar um segmento vazio mesmo quando outro tem assinantes
    Dado que o segmento "Clientes Premium" contém os assinantes "Ana, Bruno"
    E o segmento "Interessados em eventos" está vazio
    Quando a gestora agenda o envio para daqui a 1800 segundos
    Então a mensagem é "Segmento sem assinantes"
    E nenhum disparo é criado

  @alternativa @feliz
  Cenário: Entregar uma única mensagem ao assinante presente em dois segmentos
    Dado que o segmento "Clientes Premium" contém os assinantes "Ana, Bruno"
    E o segmento "Interessados em eventos" contém os assinantes "Ana, Carla"
    E existe um disparo agendado para daqui a 1800 segundos
    Quando chega o horário do disparo
    Então Ana, Bruno e Carla recebem exatamente 1 e-mail cada
    E existem 3 e-mails com o texto "Novidades de novembro"
