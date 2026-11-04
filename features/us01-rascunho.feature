# language: pt
@US01 @RN01
Funcionalidade: Recuperar o conteúdo do rascunho
  Como redatora
  Quero recuperar cópias do conteúdo que escrevo
  Para desfazer alterações indesejadas sem perder o histórico recente

  Contexto:
    Dado que existe uma edição em rascunho com o corpo "Texto inicial"

  @feliz @smoke @limite @CA01_1 @CA01_2
  Esquema do Cenário: Salvar o rascunho a cada 30 segundos
    Quando decorrem <segundos> segundos de trabalho no rascunho
    Então a edição permanece em rascunho
    E existem <quantidade> versões com o corpo "Texto inicial"

    Exemplos:
      | segundos | quantidade |
      | 0        | 0          |
      | 29       | 0          |
      | 30       | 1          |
      | 31       | 1          |
      | 59       | 1          |
      | 60       | 2          |

  @alternativa @DEC01 @CA01_1 @CA01_2
  Cenário: Salvar mesmo quando a redatora continua escrevendo
    Dado que a redatora altera o corpo para "Texto em andamento" no segundo 29
    Quando decorre mais 1 segundo de trabalho no rascunho
    Então existe a versão 1 com o corpo "Texto em andamento"

  @limite @CA01_3
  Esquema do Cenário: Reter somente as 20 versões mais recentes
    Quando ocorrem <salvamentos> salvamentos automáticos
    Então permanecem <quantidade> versões numeradas de <primeira> até <ultima>

    Exemplos:
      | salvamentos | quantidade | primeira | ultima |
      | 19          | 19         | 1        | 19     |
      | 20          | 20         | 1        | 20     |
      | 21          | 20         | 2        | 21     |

  @feliz @CA01_4
  Cenário: Restaurar sem apagar as versões posteriores
    Dado que existem as seguintes versões salvas
      | numero | titulo   | corpo          | capa       |
      | 1      | Título 1 | Texto original | capa-1.png |
      | 2      | Título 2 | Texto revisado | capa-2.png |
      | 3      | Título 3 | Texto final    | capa-3.png |
    Quando a redatora restaura a versão 1
    Então a mensagem é "Versão restaurada"
    E o corpo atual é "Texto original" e a nova versão é a 4
    E o título restaurado é "Título 1" e a capa é "capa-1.png"
    E as versões 2 e 3 continuam com seus conteúdos anteriores

  @excecao @CA01_5
  Esquema do Cenário: Recusar uma versão indisponível
    Dado que já ocorreram 21 salvamentos automáticos
    Quando a redatora restaura a versão <numero>
    Então a mensagem é "Versão indisponível para restauração"
    E o conteúdo e as versões permanecem inalterados

    Exemplos:
      | numero |
      | 1      |
      | 99     |
