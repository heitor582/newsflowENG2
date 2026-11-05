'use strict';

const MINUTO = 60_000;
const FUSO = 'America/Sao_Paulo';

function horarioLocal(instante) {
  const partes = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(instante);
  const valor = tipo => partes.find(p => p.type === tipo).value;
  return `${valor('day')}/${valor('month')}/${valor('year')} ${valor('hour')}:${valor('minute')}:${valor('second')}`;
}

class NewsFlow {
  constructor() {
    this.agora = Date.parse('2026-11-05T09:00:00-03:00');
    this.disparos = [];
    this.emails = [];
  }

  criarEdicao(autor, texto) { return { autor, texto, revisao: 1, aprovacao: null }; }

  aprovar(edicao, pessoa) {
    if (pessoa.papel !== 'revisor') return { mensagem: 'Somente revisor pode aprovar' };
    if (pessoa.nome === edicao.autor) return { mensagem: 'Autor não pode aprovar a própria edição' };
    edicao.aprovacao = { revisor: pessoa.nome, revisao: edicao.revisao };
    return { mensagem: 'Edição aprovada' };
  }

  alterar(edicao, texto) {
    if (this.disparos.some(d => d.edicao === edicao && d.status === 'agendado')) throw new Error('Edição agendada não pode ser alterada');
    edicao.texto = texto;
    edicao.revisao++;
    edicao.aprovacao = null;
  }

  agendar(edicao, segmentos, horario) {
    if (!edicao.aprovacao || edicao.aprovacao.revisao !== edicao.revisao) return { mensagem: 'Edição precisa de aprovação vigente' };
    if (!Number.isFinite(horario) || horario - this.agora < 15 * MINUTO) return { mensagem: 'Antecedência mínima de 15 minutos' };
    const distintos = [...new Map(segmentos.map(s => [s.nome, s])).values()];
    if (distintos.length < 1 || distintos.length > 5) return { mensagem: 'Escolha de 1 a 5 segmentos' };
    if (distintos.some(s => s.assinantes.length === 0)) return { mensagem: 'Segmento sem assinantes' };
    if (this.disparos.some(d => d.edicao === edicao && d.status === 'agendado')) return { mensagem: 'Edição já possui agendamento' };
    const disparo = { edicao, segmentos: distintos, horario, reagendamentos: 0, status: 'agendado' };
    this.disparos.push(disparo);
    return { mensagem: 'Envio agendado', disparo };
  }

  reagendar(disparo, horario) {
    if (disparo.status !== 'agendado') return { mensagem: 'Disparo não está agendado' };
    if (disparo.reagendamentos >= 2) return { mensagem: 'Limite de 2 reagendamentos atingido' };
    if (!Number.isFinite(horario) || horario - this.agora < 15 * MINUTO) return { mensagem: 'Antecedência mínima de 15 minutos' };
    disparo.horario = horario;
    disparo.reagendamentos++;
    return { mensagem: 'Envio reagendado' };
  }

  cancelar(disparo) {
    if (disparo.status !== 'agendado') return { mensagem: 'Disparo não está agendado' };
    if (disparo.horario - this.agora < 5 * MINUTO) return { mensagem: 'Cancelamento exige ao menos 5 minutos de antecedência' };
    disparo.status = 'cancelado';
    return { mensagem: 'Agendamento cancelado' };
  }

  avancarPara(instante) {
    if (!Number.isFinite(instante) || instante < this.agora) throw new Error('Instante inválido');
    this.agora = instante;
    for (const disparo of this.disparos) {
      if (disparo.status !== 'agendado' || disparo.horario > instante) continue;
      if (disparo.edicao.aprovacao?.revisao !== disparo.edicao.revisao) {
        disparo.status = 'bloqueado';
        continue;
      }
      const pessoas = new Set(disparo.segmentos.flatMap(s => s.assinantes));
      for (const destinatario of pessoas) this.emails.push({ destinatario, texto: disparo.edicao.texto, enviadoEm: disparo.horario });
      disparo.status = 'enviado';
    }
  }
}

module.exports = { NewsFlow, horarioLocal };
