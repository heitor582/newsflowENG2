const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');
const { SEGUNDO, MINUTO, HORA, horarioLocal } = require('../../src/newsflow');

function aprovar(mundo) {
  assert.equal(mundo.servico.revisar(mundo.edicao, mundo.revisor, 'aprovar').mensagem, 'Edição aprovada');
}
function criarPublico(mundo, nome, quantidade) {
  const assinantes = Array.from({ length: quantidade }, (_, i) => mundo.servico.criarAssinante(`${nome}-${i}@example.test`));
  return mundo.servico.criarSegmento(nome, assinantes);
}
function agendar(mundo, segundos = 3600) {
  aprovar(mundo);
  const resultado = mundo.servico.agendar(mundo.edicao, mundo.segmentos, mundo.servico.agora + segundos * SEGUNDO);
  assert.equal(resultado.mensagem, 'Envio agendado');
  mundo.disparo = resultado.disparo;
}
function newsletters(mundo, assinante) {
  return mundo.servico.mensagens.filter(m => m.tipo === 'newsletter' && (!assinante || m.destinatario === assinante.id));
}
function fotografia(edicao) {
  return JSON.stringify({ titulo: edicao.titulo, corpo: edicao.corpo, capa: edicao.capa, versoes: edicao.versoes });
}

Given('(que )existe uma edição em rascunho com o corpo {string}', function (corpo) {
  this.edicao = this.servico.criarEdicao(this.autora, 'Informativo Vértice', corpo);
});
When('decorrem {int} segundos de trabalho no rascunho', function (segundos) { this.servico.avancarRelogio(segundos * SEGUNDO); });
When('decorre mais {int} segundo de trabalho no rascunho', function (segundos) { this.servico.avancarRelogio(segundos * SEGUNDO); });
Then('a edição permanece em rascunho', function () { assert.equal(this.edicao.status, 'rascunho'); });
Then('existem {int} versões com o corpo {string}', function (quantidade, corpo) {
  assert.equal(this.edicao.versoes.length, quantidade);
  assert.deepEqual(this.edicao.versoes.map(v => v.numero), Array.from({ length: quantidade }, (_, i) => i + 1));
  assert.ok(this.edicao.versoes.every(v => v.corpo === corpo));
});
Given('(que )a redatora altera o corpo para {string} no segundo {int}', function (corpo, segundo) {
  this.servico.avancarRelogio(segundo * SEGUNDO);
  assert.equal(this.servico.alterar(this.edicao, { corpo }).mensagem, 'Conteúdo atualizado');
});
Then('existe a versão {int} com o corpo {string}', function (numero, corpo) {
  assert.equal(this.edicao.versoes.find(v => v.numero === numero)?.corpo, corpo);
});
When('ocorrem {int} salvamentos automáticos', function (quantidade) { this.servico.avancarRelogio(quantidade * 30 * SEGUNDO); });
Then('permanecem {int} versões numeradas de {int} até {int}', function (quantidade, primeira, ultima) {
  assert.equal(this.edicao.versoes.length, quantidade);
  assert.deepEqual(this.edicao.versoes.map(v => v.numero), Array.from({ length: ultima - primeira + 1 }, (_, i) => primeira + i));
});
Given('(que )existem as seguintes versões salvas', function (dados) {
  for (const { numero, titulo, corpo, capa } of dados.hashes()) {
    this.servico.alterar(this.edicao, { corpo, titulo, capa });
    this.servico.avancarRelogio(30 * SEGUNDO);
    assert.equal(this.edicao.versoes.at(-1).numero, Number(numero));
  }
  this.versoesAnteriores = structuredClone(this.edicao.versoes);
});
When('a redatora restaura a versão {int}', function (numero) {
  this.antes = fotografia(this.edicao);
  this.resultado = this.servico.restaurar(this.edicao, numero);
});
Then('a mensagem é {string}', function (mensagem) { assert.equal(this.resultado.mensagem, mensagem); });
Then('o corpo atual é {string} e a nova versão é a {int}', function (corpo, numero) {
  assert.equal(this.edicao.corpo, corpo);
  assert.equal(this.edicao.versoes.at(-1).numero, numero);
  assert.equal(this.edicao.versoes.at(-1).corpo, corpo);
});
Then('as versões 2 e 3 continuam com seus conteúdos anteriores', function () {
  assert.deepEqual(this.edicao.versoes.slice(1, 3), this.versoesAnteriores.slice(1, 3));
});
Then('o título restaurado é {string} e a capa é {string}', function (titulo, capa) {
  assert.equal(this.edicao.titulo, titulo);
  assert.equal(this.edicao.capa, capa);
  assert.equal(this.edicao.versoes.at(-1).titulo, titulo);
  assert.equal(this.edicao.versoes.at(-1).capa, capa);
});
Given('(que )o revisor devolveu a edição com o comentário {string}', function (comentario) {
  assert.equal(this.servico.revisar(this.edicao, this.revisor, 'reprovar', comentario).mensagem, 'Edição devolvida ao rascunho');
});
Given('(que )a redatora corrigiu o corpo para {string}', function (corpo) {
  assert.equal(this.servico.alterar(this.edicao, { corpo }).mensagem, 'Conteúdo atualizado');
});
Then('a aprovação se refere ao corpo {string}', function (corpo) {
  assert.equal(this.edicao.corpo, corpo);
  assert.equal(this.edicao.aprovacao.revisao, this.edicao.revisao);
});
Given('(que )já ocorreram {int} salvamentos automáticos', function (quantidade) { this.servico.avancarRelogio(quantidade * 30 * SEGUNDO); });
Then('o conteúdo e as versões permanecem inalterados', function () { assert.equal(fotografia(this.edicao), this.antes); });
When('a pessoa {string} com papel {string} aprova a edição', function (pessoa, papel) {
  this.resultado = this.servico.revisar(this.edicao, { id: pessoa === 'autora' ? this.autora.id : this.revisor.id, papel }, 'aprovar');
});
Then('a situação editorial é {string}', function (situacao) {
  assert.equal(this.edicao.status, situacao);
  assert.equal(this.servico.estaAprovada(this.edicao), situacao === 'aprovada');
  if (situacao === 'aprovada') {
    assert.equal(this.edicao.aprovacao.revisor, this.revisor.id);
    assert.equal(this.edicao.aprovacao.revisao, this.edicao.revisao);
  }
});
Given('(que )a edição está aprovada por um revisor independente', function () { aprovar(this); });
When('o revisor reprova a edição com comentário {string}', function (comentario) {
  this.resultado = this.servico.revisar(this.edicao, this.revisor, 'reprovar', comentario === 'somente espaços' ? '   ' : comentario);
});
Then('o comentário registrado é {string}', function (comentario) { assert.equal(this.edicao.comentario, comentario === 'nenhum' ? null : comentario); });
When('a redatora altera o corpo para {string}', function (corpo) { this.resultado = this.servico.alterar(this.edicao, { corpo }); });
Then('não existe aprovação vigente para o corpo {string}', function (corpo) {
  assert.equal(this.edicao.corpo, corpo);
  assert.equal(this.edicao.aprovacao, null);
});
Given('(que )a condição da edição é {string}', function (condicao) {
  if (condicao === 'rascunho') return;
  aprovar(this);
  if (condicao === 'alterada após aprovar') this.servico.alterar(this.edicao, { corpo: 'Conteúdo não revisado' });
  else assert.equal(condicao, 'aprovada');
});
Given('(que )o segmento {string} contém {int} assinantes ativos', function (nome, quantidade) {
  this.segmentos = [criarPublico(this, nome, quantidade)];
});
When('a gestora solicita o envio imediato da edição', function () { this.resultado = this.servico.enviarAgora(this.edicao, this.segmentos); });
Then('são gerados {int} e-mails de newsletter', function (quantidade) { assert.equal(newsletters(this).length, quantidade); });
When('a gestora agenda para daqui a {int} segundos', function (segundos) {
  this.resultado = this.servico.agendar(this.edicao, this.segmentos, this.servico.agora + segundos * SEGUNDO);
  this.disparo = this.resultado.disparo;
});
Then('existem {int} disparos agendados', function (quantidade) {
  assert.equal(this.servico.disparos.filter(d => d.status === 'agendado').length, quantidade);
  assert.equal(this.servico.disparos.length, quantidade);
});
Then('o horário de envio em São Paulo é {string}', function (horario) {
  assert.equal(this.disparo ? horarioLocal(this.disparo.horario) : 'não agendado', horario);
});
Given('(que )a gestora escolhe {int} segmentos distintos com {int} segmentos vazios', function (quantidade, vazios) {
  this.segmentos = Array.from({ length: quantidade }, (_, i) => criarPublico(this, `Público ${i + 1}`, i < vazios ? 0 : 1));
});
Given('(que )existe um disparo com {int} reagendamentos anteriores', function (quantidade) {
  agendar(this);
  for (let i = 1; i <= quantidade; i++) {
    assert.equal(this.servico.reagendar(this.disparo, this.servico.agora + (60 + i) * MINUTO).mensagem, 'Envio reagendado');
  }
});
When('a gestora reagenda para daqui a {int} segundos', function (segundos) {
  this.resultado = this.servico.reagendar(this.disparo, this.servico.agora + segundos * SEGUNDO);
});
Then('o disparo registra {int} reagendamentos e horário {string}', function (quantidade, horario) {
  assert.equal(this.disparo.reagendamentos, quantidade);
  assert.equal(horarioLocal(this.disparo.horario), horario);
});
Given('(que )faltam {int} segundos para o horário marcado', function (segundos) {
  this.servico.avancarRelogio(this.disparo.horario - this.servico.agora - segundos * SEGUNDO);
});
When('a gestora cancela o disparo', function () { this.resultado = this.servico.cancelar(this.disparo); });
Then('a situação do disparo é {string}', function (situacao) { assert.equal(this.disparo.status, situacao); });
Given('(que )a edição aprovada está agendada para os segmentos com Ana e Bruno e com Ana e Carla', function () {
  this.ana = this.servico.criarAssinante('ana@example.test');
  this.bruno = this.servico.criarAssinante('bruno@example.test');
  this.carla = this.servico.criarAssinante('carla@example.test');
  this.segmentos = [this.servico.criarSegmento('Plano Premium', [this.ana, this.bruno]), this.servico.criarSegmento('Interesse em IA', [this.ana, this.carla])];
  agendar(this);
});
When('chega o horário programado para o disparo', function () { this.servico.avancarRelogio(this.disparo.horario - this.servico.agora); });
Given('(que )a situação do envio antes do horário marcado é {string}', function (situacao) {
  if (situacao === 'cancelado') assert.equal(this.servico.cancelar(this.disparo).mensagem, 'Agendamento cancelado');
  else assert.equal(situacao, 'agendado');
});
Then('Ana, Bruno e Carla recebem {int} e-mails de newsletter cada', function (quantidade) {
  assert.equal(newsletters(this).length, 3 * quantidade);
  for (const assinante of [this.ana, this.bruno, this.carla]) assert.equal(newsletters(this, assinante).length, quantidade);
});
Then('o disparo termina {string} com link de descadastro em cada mensagem enviada', function (status) {
  assert.equal(this.disparo.status, status);
  const mensagens = newsletters(this);
  assert.equal(new Set(mensagens.map(m => m.destinatario)).size, mensagens.length);
  for (const mensagem of mensagens) assert.equal(mensagem.linkDescadastro, `https://newsflow.example/descadastro/${mensagem.destinatario}`);
});
Then('todos os e-mails gerados contêm link de descadastro', function () {
  assert.ok(this.servico.mensagens.length > 0);
  for (const mensagem of this.servico.mensagens) assert.equal(mensagem.linkDescadastro, `https://newsflow.example/descadastro/${mensagem.destinatario}`);
});
Given('(que )Ana é uma assinante ativa', function () { this.ana = this.servico.criarAssinante('ana@example.test'); });
Given('(que )Ana já solicitou o descadastro {int} vezes', function (quantidade) {
  for (let i = 0; i < quantidade; i++) this.servico.descadastrar(this.ana);
});
When('Ana utiliza o link de descadastro', function () { this.resultado = this.servico.descadastrar(this.ana); });
Then('Ana fica {string}', function (situacao) { assert.equal(this.ana.ativo, situacao === 'ativa'); });
Then('existe exatamente 1 e-mail de confirmação de descadastro para Ana', function () {
  assert.equal(this.servico.mensagens.filter(m => m.destinatario === this.ana.id && m.tipo === 'confirmação de descadastro').length, 1);
});
Given('(que )uma edição aprovada está agendada para Ana e Bruno', function () {
  this.edicao = this.servico.criarEdicao(this.autora);
  this.bruno = this.servico.criarAssinante('bruno@example.test');
  this.segmentos = [this.servico.criarSegmento('Clientes', [this.ana, this.bruno])];
  agendar(this);
});
Given('(que )Ana se descadastra antes do horário marcado', function () {
  this.servico.avancarRelogio(30 * MINUTO);
  this.servico.descadastrar(this.ana);
});
Then('Ana recebe {int} newsletters e Bruno recebe {int} newsletter', function (ana, bruno) {
  assert.equal(newsletters(this, this.ana).length, ana);
  assert.equal(newsletters(this, this.bruno).length, bruno);
});
Given('(que )Ana está descadastrada', function () { this.servico.descadastrar(this.ana); });
When('Ana solicita o retorno à lista', function () { this.resultado = this.servico.solicitarRetorno(this.ana); });
Then('existe um e-mail de retorno com link de confirmação válido por {int} horas', function (horas) {
  const mensagens = this.servico.mensagens.filter(m => m.tipo === 'confirmação de retorno');
  assert.equal(mensagens.length, 1);
  assert.equal(this.resultado.token.expiraEm - this.servico.agora, horas * HORA);
  assert.equal(mensagens[0].linkConfirmacao, `https://newsflow.example/retorno/${this.resultado.token.codigo}`);
});
Given('(que )Ana está descadastrada e solicitou retorno há {int} segundos', function (segundos) {
  this.servico.descadastrar(this.ana);
  this.codigo = this.servico.solicitarRetorno(this.ana).token.codigo;
  this.servico.avancarRelogio(segundos * SEGUNDO);
});
When('Ana confirma o link de retorno recebido', function () { this.resultado = this.servico.confirmarRetorno(this.codigo); });
Given('(que )o link de retorno de Ana é {string}', function (condicao) {
  this.servico.descadastrar(this.ana);
  this.codigo = this.servico.solicitarRetorno(this.ana).token.codigo;
  if (condicao === 'desconhecido') this.codigo = 'retorno-desconhecido';
  else if (condicao === 'utilizado') assert.equal(this.servico.confirmarRetorno(this.codigo).mensagem, 'Retorno à lista confirmado');
  else if (condicao === 'substituído') this.servico.solicitarRetorno(this.ana);
  else throw new Error(`Condição não prevista: ${condicao}`);
});
