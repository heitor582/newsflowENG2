'use strict';

const SEGUNDO = 1000;
const MINUTO = 60 * SEGUNDO;
const HORA = 60 * MINUTO;
const FUSO = 'America/Sao_Paulo';

function horarioLocal(instante) {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(instante);
  const campo = tipo => partes.find(p => p.type === tipo).value;
  return `${campo('day')}/${campo('month')}/${campo('year')} ${campo('hour')}:${campo('minute')}:${campo('second')}`;
}

class NewsFlow {
  constructor(agora = Date.parse('2026-11-03T09:00:00-03:00')) {
    this.agora = agora;
    this.edicoes = [];
    this.disparos = [];
    this.assinantes = [];
    this.mensagens = [];
    this.tokens = [];
    this.sequencia = 0;
  }

  id(prefixo) { return `${prefixo}-${++this.sequencia}`; }

  criarEdicao(autor, titulo = 'Informativo Vértice', corpo = 'Texto inicial') {
    const edicao = {
      id: this.id('edicao'), autor, titulo, corpo, capa: '', status: 'rascunho',
      revisao: 1, aprovacao: null, comentario: null,
      versoes: [], numeroVersao: 0, proximoSalvamento: this.agora + 30 * SEGUNDO
    };
    this.edicoes.push(edicao);
    return edicao;
  }

  salvar(edicao, instante = this.agora) {
    edicao.versoes.push({ numero: ++edicao.numeroVersao, titulo: edicao.titulo,
      corpo: edicao.corpo, capa: edicao.capa, instante });
    if (edicao.versoes.length > 20) edicao.versoes.shift();
  }

  temAgendamento(edicao) { return this.disparos.some(d => d.edicao === edicao && d.status === 'agendado'); }

  alterar(edicao, conteudo) {
    if (this.temAgendamento(edicao)) return { mensagem: 'Cancele o agendamento antes de alterar a edição' };
    const estavaAprovada = edicao.status === 'aprovada';
    for (const campo of ['titulo', 'corpo', 'capa']) {
      if (Object.hasOwn(conteudo, campo)) edicao[campo] = conteudo[campo];
    }
    edicao.revisao++;
    edicao.aprovacao = null;
    edicao.status = 'rascunho';
    if (estavaAprovada) edicao.proximoSalvamento = this.agora + 30 * SEGUNDO;
    return { mensagem: 'Conteúdo atualizado' };
  }

  restaurar(edicao, numero) {
    if (this.temAgendamento(edicao)) return { mensagem: 'Cancele o agendamento antes de alterar a edição' };
    const versao = edicao.versoes.find(v => v.numero === numero);
    if (!versao) return { mensagem: 'Versão indisponível para restauração' };
    this.alterar(edicao, versao);
    this.salvar(edicao);
    return { mensagem: 'Versão restaurada' };
  }

  revisar(edicao, pessoa, decisao, comentario = '') {
    if (pessoa.papel !== 'revisor') return { mensagem: 'Somente revisor pode avaliar a edição' };
    if (pessoa.id === edicao.autor.id) return { mensagem: 'Autor não pode avaliar a própria edição' };
    if (!['aprovar', 'reprovar'].includes(decisao)) return { mensagem: 'Decisão inválida' };
    if (this.temAgendamento(edicao)) return { mensagem: 'Cancele o agendamento antes de revisar a edição' };
    if (decisao === 'reprovar' && !comentario.trim()) return { mensagem: 'Comentário de reprovação obrigatório' };
    edicao.status = decisao === 'aprovar' ? 'aprovada' : 'rascunho';
    edicao.aprovacao = decisao === 'aprovar' ? { revisor: pessoa.id, revisao: edicao.revisao } : null;
    edicao.comentario = decisao === 'reprovar' ? comentario.trim() : null;
    edicao.proximoSalvamento = this.agora + 30 * SEGUNDO;
    return { mensagem: decisao === 'aprovar' ? 'Edição aprovada' : 'Edição devolvida ao rascunho' };
  }

  estaAprovada(edicao) { return edicao.status === 'aprovada' && edicao.aprovacao?.revisao === edicao.revisao; }

  validarPublico(edicao, segmentos) {
    if (!this.estaAprovada(edicao)) return 'Edição precisa de aprovação vigente';
    const unicos = [...new Map(segmentos.map(s => [s.id, s])).values()];
    if (!unicos.length || unicos.length > 5) return 'Escolha de 1 a 5 segmentos';
    if (unicos.some(s => !s.assinantes.some(a => a.ativo))) return 'Segmento sem assinantes ativos';
    return null;
  }

  agendar(edicao, segmentos, horario) {
    const erro = this.validarPublico(edicao, segmentos);
    if (erro) return { mensagem: erro };
    if (!Number.isFinite(horario) || horario - this.agora < 15 * MINUTO) return { mensagem: 'Envio exige antecedência mínima de 15 minutos' };
    if (this.temAgendamento(edicao)) return { mensagem: 'Edição já possui envio agendado' };
    const disparo = { id: this.id('disparo'), edicao, segmentos: [...new Map(segmentos.map(s => [s.id, s])).values()],
      horario, status: 'agendado', reagendamentos: 0 };
    this.disparos.push(disparo);
    return { mensagem: 'Envio agendado', disparo };
  }

  reagendar(disparo, horario) {
    if (disparo.status !== 'agendado') return { mensagem: 'Disparo não está agendado' };
    if (disparo.reagendamentos >= 2) return { mensagem: 'Limite de 2 reagendamentos atingido' };
    if (!Number.isFinite(horario) || horario - this.agora < 15 * MINUTO) return { mensagem: 'Envio exige antecedência mínima de 15 minutos' };
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

  criarAssinante(email, ativo = true) {
    const existente = this.assinantes.find(a => a.email === email);
    if (existente) return existente;
    const assinante = { id: this.id('assinante'), email, ativo };
    this.assinantes.push(assinante);
    return assinante;
  }

  criarSegmento(nome, assinantes) { return { id: this.id('segmento'), nome, assinantes }; }

  registrarEmail(assinante, tipo, conteudo, instante = this.agora) {
    const mensagem = { id: this.id('email'), destinatario: assinante.id, email: assinante.email,
      tipo, conteudo, instante, linkDescadastro: `https://newsflow.example/descadastro/${assinante.id}` };
    this.mensagens.push(mensagem);
    return mensagem;
  }

  entregar(disparo, instante = this.agora) {
    if (!this.estaAprovada(disparo.edicao)) { disparo.status = 'bloqueado'; return; }
    const destinatarios = new Map();
    for (const segmento of disparo.segmentos) {
      for (const assinante of segmento.assinantes) if (assinante.ativo) destinatarios.set(assinante.id, assinante);
    }
    for (const assinante of destinatarios.values()) this.registrarEmail(assinante, 'newsletter', disparo.edicao.corpo, instante);
    disparo.status = 'enviado';
    disparo.destinatarios = [...destinatarios.keys()];
  }

  enviarAgora(edicao, segmentos) {
    const erro = this.validarPublico(edicao, segmentos);
    if (erro) return { mensagem: erro };
    const disparo = { id: this.id('disparo'), edicao, segmentos, horario: this.agora, status: 'agendado', reagendamentos: 0 };
    this.disparos.push(disparo);
    this.entregar(disparo);
    return { mensagem: 'Envio realizado', disparo };
  }

  descadastrar(assinante) {
    assinante.tokenRetorno = null;
    if (assinante.ativo) {
      assinante.ativo = false;
      this.registrarEmail(assinante, 'confirmação de descadastro', 'Descadastro confirmado');
    }
    return { mensagem: 'Descadastro confirmado' };
  }

  solicitarRetorno(assinante) {
    if (assinante.ativo) return { mensagem: 'Assinante já está ativo' };
    const token = { codigo: this.id('retorno'), assinante, expiraEm: this.agora + 48 * HORA, usado: false };
    this.tokens.push(token);
    assinante.tokenRetorno = token.codigo;
    const email = this.registrarEmail(assinante, 'confirmação de retorno', 'Confirme seu retorno à lista');
    email.linkConfirmacao = `https://newsflow.example/retorno/${token.codigo}`;
    return { mensagem: 'Confirmação de retorno enviada', token };
  }

  confirmarRetorno(codigo) {
    const token = this.tokens.find(t => t.codigo === codigo);
    if (!token || token.usado || token.assinante.tokenRetorno !== codigo) return { mensagem: 'Link de confirmação inválido' };
    if (this.agora >= token.expiraEm) return { mensagem: 'Link de confirmação expirado' };
    token.usado = true;
    token.assinante.ativo = true;
    token.assinante.tokenRetorno = null;
    return { mensagem: 'Retorno à lista confirmado' };
  }

  avancarRelogio(milisegundos) {
    if (milisegundos < 0) throw new Error('O relógio não pode retroceder');
    const destino = this.agora + milisegundos;
    // Relógio injetado: processa os vencimentos sem esperas reais.
    for (const edicao of this.edicoes) {
      if (edicao.status !== 'rascunho') continue;
      while (edicao.proximoSalvamento <= destino) {
        this.salvar(edicao, edicao.proximoSalvamento);
        edicao.proximoSalvamento += 30 * SEGUNDO;
      }
    }
    const vencidos = this.disparos.filter(d => d.status === 'agendado' && d.horario <= destino).sort((a, b) => a.horario - b.horario);
    for (const disparo of vencidos) this.entregar(disparo, disparo.horario);
    this.agora = destino;
  }
}

module.exports = { NewsFlow, SEGUNDO, MINUTO, HORA, FUSO, horarioLocal };
