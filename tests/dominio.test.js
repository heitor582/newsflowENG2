const test = require('node:test');
const assert = require('node:assert/strict');
const { NewsFlow, MINUTO, HORA, horarioLocal } = require('../src/newsflow');

function contexto() {
  const servico = new NewsFlow();
  const autora = { id: 'ana', papel: 'redator' };
  const revisor = { id: 'bruno', papel: 'revisor' };
  const edicao = servico.criarEdicao(autora);
  const assinante = servico.criarAssinante('leitor@example.test');
  const segmentos = [servico.criarSegmento('Premium', [assinante])];
  return { servico, autora, revisor, edicao, assinante, segmentos };
}

test('RN01 restaura título, corpo e capa em nova versão sem apagar o histórico posterior', () => {
  const { servico, edicao } = contexto();
  servico.alterar(edicao, { titulo: 'Título A', corpo: 'Corpo A', capa: 'capa-a.png' });
  servico.avancarRelogio(30_000);
  servico.alterar(edicao, { titulo: 'Título B', corpo: 'Corpo B', capa: 'capa-b.png' });
  servico.avancarRelogio(30_000);
  servico.restaurar(edicao, 1);
  assert.deepEqual([edicao.titulo, edicao.corpo, edicao.capa], ['Título A', 'Corpo A', 'capa-a.png']);
  assert.equal(edicao.versoes[1].corpo, 'Corpo B');
  assert.equal(edicao.versoes.at(-1).numero, 3);
});

test('RN01 restaurar com histórico cheio elimina somente a versão mais antiga', () => {
  const { servico, edicao } = contexto();
  servico.avancarRelogio(600_000);
  servico.restaurar(edicao, 1);
  assert.equal(edicao.versoes.length, 20);
  assert.deepEqual(edicao.versoes.map(v => v.numero), Array.from({ length: 20 }, (_, i) => i + 2));
});

test('DEC03 restaurar conteúdo aprovado exige nova aprovação', () => {
  const { servico, edicao, revisor, segmentos } = contexto();
  servico.avancarRelogio(30_000);
  servico.revisar(edicao, revisor, 'aprovar');
  servico.restaurar(edicao, 1);
  assert.equal(servico.enviarAgora(edicao, segmentos).mensagem, 'Edição precisa de aprovação vigente');
  servico.revisar(edicao, revisor, 'aprovar');
  assert.equal(servico.enviarAgora(edicao, segmentos).mensagem, 'Envio realizado');
});

test('DEC03 edição agendada não admite alteração nem revisão silenciosa', () => {
  const { servico, edicao, revisor, segmentos } = contexto();
  servico.revisar(edicao, revisor, 'aprovar');
  servico.agendar(edicao, segmentos, servico.agora + 15 * MINUTO);
  const antes = JSON.stringify(edicao);
  assert.equal(servico.alterar(edicao, { corpo: 'Sem revisão' }).mensagem, 'Cancele o agendamento antes de alterar a edição');
  assert.equal(servico.revisar(edicao, revisor, 'reprovar', 'Corrigir').mensagem, 'Cancele o agendamento antes de revisar a edição');
  assert.equal(JSON.stringify(edicao), antes);
});

test('RN03 disparo cancelado não envia e não pode ser reagendado', () => {
  const { servico, edicao, revisor, segmentos } = contexto();
  servico.revisar(edicao, revisor, 'aprovar');
  const { disparo } = servico.agendar(edicao, segmentos, servico.agora + 15 * MINUTO);
  servico.cancelar(disparo);
  assert.equal(servico.reagendar(disparo, servico.agora + 30 * MINUTO).mensagem, 'Disparo não está agendado');
  servico.avancarRelogio(15 * MINUTO);
  assert.equal(servico.mensagens.length, 0);
});

test('RN03 não envia antes da hora nem repete um disparo já concluído', () => {
  const { servico, edicao, revisor, segmentos } = contexto();
  servico.revisar(edicao, revisor, 'aprovar');
  servico.agendar(edicao, segmentos, servico.agora + 15 * MINUTO);
  servico.avancarRelogio(899_000);
  assert.equal(servico.mensagens.length, 0);
  servico.avancarRelogio(1000);
  assert.equal(servico.mensagens.length, 1);
  servico.avancarRelogio(HORA);
  assert.equal(servico.mensagens.length, 1);
});

test('RN03 fuso nomeado mantém a data local ao atravessar meia-noite em UTC', () => {
  const servico = new NewsFlow(Date.parse('2026-11-03T23:50:00Z'));
  assert.equal(horarioLocal(servico.agora + 15 * MINUTO), '03/11/2026 21:05:00');
});

test('RN04 selecionar duas vezes o mesmo segmento não duplica público nem conta duas escolhas', () => {
  const { servico, edicao, revisor, segmentos } = contexto();
  servico.revisar(edicao, revisor, 'aprovar');
  const { disparo } = servico.agendar(edicao, Array(6).fill(segmentos[0]), servico.agora + 15 * MINUTO);
  assert.equal(disparo.segmentos.length, 1);
  servico.avancarRelogio(15 * MINUTO);
  assert.equal(servico.mensagens.length, 1);
});

test('RN04 segmento contendo apenas descadastrados é considerado vazio', () => {
  const { servico, edicao, revisor, assinante, segmentos } = contexto();
  servico.revisar(edicao, revisor, 'aprovar');
  servico.descadastrar(assinante);
  assert.equal(servico.agendar(edicao, segmentos, servico.agora + 15 * MINUTO).mensagem, 'Segmento sem assinantes ativos');
  assert.equal(servico.disparos.length, 0);
});

test('RN06 nova saída invalida a confirmação de retorno ainda pendente', () => {
  const { servico, assinante } = contexto();
  servico.descadastrar(assinante);
  const { token } = servico.solicitarRetorno(assinante);
  servico.descadastrar(assinante);
  assert.equal(servico.confirmarRetorno(token.codigo).mensagem, 'Link de confirmação inválido');
  assert.equal(assinante.ativo, false);
});

test('RN06 confirmação válida permite receber a próxima newsletter sem recuperar envios passados', () => {
  const { servico, edicao, revisor, assinante, segmentos } = contexto();
  servico.revisar(edicao, revisor, 'aprovar');
  servico.descadastrar(assinante);
  const { token } = servico.solicitarRetorno(assinante);
  assert.equal(servico.confirmarRetorno(token.codigo).mensagem, 'Retorno à lista confirmado');
  servico.enviarAgora(edicao, segmentos);
  assert.equal(servico.mensagens.filter(m => m.tipo === 'newsletter').length, 1);
});

test('RN02 autor também não reprova a própria edição', () => {
  const { servico, edicao, autora } = contexto();
  assert.equal(servico.revisar(edicao, { ...autora, papel: 'revisor' }, 'reprovar', 'Corrigir').mensagem, 'Autor não pode avaliar a própria edição');
  assert.equal(edicao.comentario, null);
});
