(() => {
'use strict';
const { NewsFlow } = window.NewsFlowDomain;
const app = new NewsFlow();
const chave = 'newsflow-aceitacao-v1';
const pessoas = {
  ana: { id: 'ana', nome: 'Ana', papel: 'revisor' },
  bruno: { id: 'bruno', nome: 'Bruno', papel: 'revisor' },
};
const campo = id => document.getElementById(id);
let editando = null;
try {
  const salvo = JSON.parse(localStorage.getItem(chave));
  if (salvo && Array.isArray(salvo.edicoes)) {
    app.edicoes = salvo.edicoes;
    app.sequencia = salvo.sequencia;
  }
} catch { campo('erro').textContent = 'Não foi possível recuperar os rascunhos salvos.'; }
function persistir() {
  localStorage.setItem(chave, JSON.stringify({ edicoes: app.edicoes, sequencia: app.sequencia }));
}
function avisar(texto, erro = false) {
  campo('erro').textContent = erro ? texto : '';
  campo('sucesso').textContent = erro ? '' : texto;
}
function encerrarEdicao() {
  editando = null;
  campo('formulario').reset();
  campo('editor').textContent = 'Nova edição';
  campo('salvar').textContent = 'Criar rascunho';
  campo('cancelar').hidden = true;
}
function renderizar() {
  campo('lista').replaceChildren();
  campo('vazio').hidden = app.edicoes.length > 0;
  const aprovadas = app.edicoes.filter(e => app.estaAprovada(e)).length;
  campo('resumo').textContent = `${app.edicoes.length} edição(ões) · ${aprovadas} aprovada(s)`;
  for (const edicao of app.edicoes) {
    const item = document.createElement('li');
    const adicionar = (tag, texto) => {
      const elemento = document.createElement(tag);
      elemento.textContent = texto;
      item.append(elemento);
      return elemento;
    };
    adicionar('h3', edicao.titulo);
    adicionar('p', edicao.corpo);
    adicionar('p', `Autoria: ${edicao.autor.nome}`);
    adicionar('p', `Situação: ${app.estaAprovada(edicao) ? 'Aprovada' : 'Rascunho'}`);
    if (edicao.aprovacao) adicionar('p', `Revisão: ${pessoas[edicao.aprovacao.revisor].nome}`);
    adicionar('button', 'Editar').onclick = () => {
      editando = edicao;
      campo('titulo').value = edicao.titulo;
      campo('corpo').value = edicao.corpo;
      campo('editor').textContent = 'Editar edição';
      campo('salvar').textContent = 'Salvar alterações';
      campo('cancelar').hidden = false;
      campo('titulo').focus();
    };
    adicionar('button', 'Aprovar').onclick = () => {
      const resultado = app.revisar(edicao, pessoas[campo('pessoa').value], 'aprovar');
      avisar(resultado.mensagem, resultado.mensagem !== 'Edição aprovada');
      persistir();
      renderizar();
    };
    campo('lista').append(item);
  }
}
campo('cancelar').onclick = encerrarEdicao;
campo('formulario').onsubmit = event => {
  event.preventDefault();
  const titulo = campo('titulo').value.trim();
  const corpo = campo('corpo').value.trim();
  if (!titulo || !corpo) { avisar('Preencha título e conteúdo.', true); return; }
  if (editando) {
    app.alterar(editando, { titulo, corpo });
    avisar('Alterações salvas. A edição precisa de nova aprovação.');
  } else {
    app.criarEdicao(pessoas[campo('pessoa').value], titulo, corpo);
    avisar('Rascunho criado');
  }
  persistir();
  encerrarEdicao();
  renderizar();
};
renderizar();

})();
