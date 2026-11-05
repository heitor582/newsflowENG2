# language: pt
@US01 @F02 @RN03
Funcionalidade: Controlar os prazos do agendamento
  A gestora programa, reagenda e cancela o disparo dentro dos limites definidos.

  Contexto:
    Dado que existe uma edição de Ana com o texto "Novidades de novembro"
    E Bruno aprovou a edição
    E o segmento "Clientes Premium" contém os assinantes "Ana, Bruno"
    E o horário atual em São Paulo é "2026-11-05T09:00:00-03:00"

  @feliz @limite @CA02
  Cenário: Agendar exatamente quinze minutos à frente
    Quando a gestora agenda o envio para daqui a 900 segundos
    Então a mensagem é "Envio agendado"
    E o disparo está agendado para "05/11/2026 09:15:00" em São Paulo

  @excecao @limite @CA02
  Cenário: Recusar antecedência de quatorze minutos e cinquenta e nove segundos
    Quando a gestora agenda o envio para daqui a 899 segundos
    Então a mensagem é "Antecedência mínima de 15 minutos"
    E nenhum disparo é criado

  @excecao @limite @CA03
  Cenário: Preservar a programação após a terceira tentativa de reagendar
    Dado que existe um disparo agendado para daqui a 3600 segundos
    E a gestora já o reagendou para "2026-11-05T10:30:00-03:00" e depois para "2026-11-05T11:00:00-03:00"
    Quando a gestora solicita reagendamento para "2026-11-05T11:30:00-03:00"
    Então a mensagem é "Limite de 2 reagendamentos atingido"
    E o disparo mantém 2 reagendamentos e o horário "05/11/2026 11:00:00"

  @feliz @limite @CA04
  Cenário: Cancelar exatamente cinco minutos antes
    Dado que existe um disparo agendado para daqui a 3600 segundos
    E faltam 300 segundos para o envio
    Quando a gestora cancela o disparo
    Então a mensagem é "Agendamento cancelado"
    E a situação do disparo é "cancelado"

  @excecao @limite @CA04
  Cenário: Recusar cancelamento a quatro minutos e cinquenta e nove segundos
    Dado que existe um disparo agendado para daqui a 3600 segundos
    E faltam 299 segundos para o envio
    Quando a gestora cancela o disparo
    Então a mensagem é "Cancelamento exige ao menos 5 minutos de antecedência"
    E a situação do disparo é "agendado"
