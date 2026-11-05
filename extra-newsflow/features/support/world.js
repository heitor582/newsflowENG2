const { setWorldConstructor } = require('@cucumber/cucumber');
const { NewsFlow } = require('../../src/newsflow');

class MundoNewsFlow {
  constructor() {
    this.servico = new NewsFlow();
    this.segmentos = [];
    this.edicao = null;
    this.disparo = null;
    this.resultado = null;
  }
}

setWorldConstructor(MundoNewsFlow);
