const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');
const { horarioLocal } = require('../../src/newsflow');

Given('(que )existe uma edição de Ana com o texto {string}', function (texto) {
  this.edicao = this.servico.criarEdicao('Ana', texto);
});
Given('(que )o segmento {string} contém os assinantes {string}', function (nome, pessoas) {
  this.segmentos.push({ nome, assinantes: pessoas.split(',').map(p => p.trim()) });
});
Given('(que )o segmento {string} está vazio', function (nome) {
  this.segmentos.push({ nome, assinantes: [] });
});
Given('(que )Bruno aprovou a edição', function () {
  assert.equal(this.servico.aprovar(this.edicao, { nome: 'Bruno', papel: 'revisor' }).mensagem, 'Edição aprovada');
});
Given('(que )Ana alterou o texto para {string}', function (texto) { this.servico.alterar(this.edicao, texto); });
Given('(que )o horário atual em São Paulo é {string}', function (data) { this.servico.avancarPara(Date.parse(data)); });
Given('(que )existe um disparo agendado para daqui a {int} segundos', function (segundos) {
  const reserva = this.servico.agendar(this.edicao, this.segmentos, this.servico.agora + segundos * 1000);
  assert.equal(reserva.mensagem, 'Envio agendado');
  this.disparo = reserva.disparo;
});
Given('(que )a gestora já o reagendou para {string} e depois para {string}', function (primeiro, segundo) {
  for (const data of [primeiro, segundo]) assert.equal(this.servico.reagendar(this.disparo, Date.parse(data)).mensagem, 'Envio reagendado');
  assert.equal(this.disparo.reagendamentos, 2);
});
Given('(que )faltam {int} segundos para o envio', function (segundos) {
  this.servico.avancarPara(this.disparo.horario - segundos * 1000);
});
Given('(que )a gestora escolheu {int} segmentos distintos com {int} assinante cada', function (quantidade, pessoas) {
  this.segmentos = Array.from({ length: quantidade }, (_, i) => ({ nome: `Segmento ${i + 1}`, assinantes: Array.from({ length: pessoas }, (_, j) => `Assinante ${i + 1}-${j + 1}`) }));
});

When('Bruno avalia a edição como revisor', function () {
  this.resultado = this.servico.aprovar(this.edicao, { nome: 'Bruno', papel: 'revisor' });
});
When('Ana avalia a edição como revisora', function () {
  this.resultado = this.servico.aprovar(this.edicao, { nome: 'Ana', papel: 'revisor' });
});
When('a gestora agenda o envio para daqui a {int} segundos', function (segundos) {
  this.resultado = this.servico.agendar(this.edicao, this.segmentos, this.servico.agora + segundos * 1000);
  this.disparo = this.resultado.disparo;
});
When('a gestora solicita reagendamento para {string}', function (data) {
  this.resultado = this.servico.reagendar(this.disparo, Date.parse(data));
});
When('a gestora cancela o disparo', function () { this.resultado = this.servico.cancelar(this.disparo); });
When('chega o horário do disparo', function () { this.servico.avancarPara(this.disparo.horario); });

Then('a mensagem é {string}', function (mensagem) { assert.equal(this.resultado.mensagem, mensagem); });
Then('a edição fica aprovada por Bruno', function () {
  assert.deepEqual(this.edicao.aprovacao, { revisor: 'Bruno', revisao: this.edicao.revisao });
});
Then('a edição continua sem aprovação', function () { assert.equal(this.edicao.aprovacao, null); });
Then('nenhum disparo é criado', function () {
  assert.equal(this.servico.disparos.length, 0);
  assert.equal(this.servico.emails.length, 0);
});
Then('o disparo está agendado para {string} em São Paulo', function (horario) {
  assert.equal(horarioLocal(this.disparo.horario), horario);
  assert.equal(this.disparo.status, 'agendado');
});
Then('o disparo mantém {int} reagendamentos e o horário {string}', function (total, horario) {
  assert.equal(this.disparo.reagendamentos, total);
  assert.equal(horarioLocal(this.disparo.horario), horario);
});
Then('a situação do disparo é {string}', function (situacao) { assert.equal(this.disparo.status, situacao); });
Then('o disparo inclui {int} segmentos', function (quantidade) { assert.equal(this.disparo.segmentos.length, quantidade); });
Then('Ana, Bruno e Carla recebem exatamente {int} e-mail cada', function (quantidade) {
  for (const nome of ['Ana', 'Bruno', 'Carla']) assert.equal(this.servico.emails.filter(e => e.destinatario === nome).length, quantidade);
});
Then('existem {int} e-mails com o texto {string}', function (quantidade, texto) {
  assert.equal(this.servico.emails.length, quantidade);
  assert.ok(this.servico.emails.every(e => e.texto === texto));
  assert.equal(this.disparo.status, 'enviado');
});
