# language: pt
@US02 @RN02
Funcionalidade: Liberar apenas conteúdo revisado
  Como revisora editorial
  Quero aprovar conteúdo de outra pessoa ou devolvê-lo com orientação
  Para impedir a distribuição de uma edição sem revisão independente

  Contexto:
    Dado que existe uma edição em rascunho com o corpo "Texto inicial"

  @feliz @excecao @smoke @CA02_1 @CA02_2
  Esquema do Cenário: Permitir somente aprovação independente por revisor
    Quando a pessoa "<pessoa>" com papel "<papel>" aprova a edição
    Então a mensagem é "<mensagem>"
    E a situação editorial é "<situacao>"

    Exemplos:
      | pessoa | papel   | mensagem                                  | situacao |
      | outra  | revisor | Edição aprovada                           | aprovada |
      | autora | revisor | Autor não pode avaliar a própria edição   | rascunho |
      | outra  | gestor  | Somente revisor pode avaliar a edição     | rascunho |

  @feliz @excecao @CA02_3
  Esquema do Cenário: Exigir comentário para devolver a edição
    Dado que a edição está aprovada por um revisor independente
    Quando o revisor reprova a edição com comentário "<comentario>"
    Então a mensagem é "<mensagem>"
    E a situação editorial é "<situacao>"
    E o comentário registrado é "<registrado>"

    Exemplos:
      | comentario           | mensagem                            | situacao | registrado           |
      | Corrigir a data       | Edição devolvida ao rascunho         | rascunho | Corrigir a data       |
      |                       | Comentário de reprovação obrigatório | aprovada | nenhum               |
      | somente espaços       | Comentário de reprovação obrigatório | aprovada | nenhum               |

  @alternativa @DEC03 @CA02_4
  Cenário: Retirar a aprovação quando o conteúdo muda
    Dado que a edição está aprovada por um revisor independente
    Quando a redatora altera o corpo para "Oferta atualizada"
    Então a mensagem é "Conteúdo atualizado"
    E a situação editorial é "rascunho"
    E não existe aprovação vigente para o corpo "Oferta atualizada"

  @feliz @excecao @CA02_5
  Esquema do Cenário: Impedir envio imediato sem aprovação vigente
    Dado que a condição da edição é "<condicao>"
    E o segmento "Clientes Premium" contém 2 assinantes ativos
    Quando a gestora solicita o envio imediato da edição
    Então a mensagem é "<mensagem>"
    E são gerados <emails> e-mails de newsletter

    Exemplos:
      | condicao             | mensagem                               | emails |
      | rascunho             | Edição precisa de aprovação vigente    | 0      |
      | aprovada             | Envio realizado                        | 2      |
      | alterada após aprovar | Edição precisa de aprovação vigente    | 0      |

  @alternativa @CA02_1 @CA02_3 @CA02_4
  Cenário: Liberar a edição depois da correção solicitada
    Dado que o revisor devolveu a edição com o comentário "Corrigir a data"
    E a redatora corrigiu o corpo para "Evento em 10 de novembro"
    Quando a pessoa "outra" com papel "revisor" aprova a edição
    Então a mensagem é "Edição aprovada"
    E a situação editorial é "aprovada"
    E a aprovação se refere ao corpo "Evento em 10 de novembro"
