const { setWorldConstructor } = require('@cucumber/cucumber');
const { NewsFlow } = require('../../src/newsflow');

class MundoNewsFlow {
  constructor() {
    this.servico = new NewsFlow();
    this.autora = { id: 'autora-ana', papel: 'redator' };
    this.revisor = { id: 'revisor-bruno', papel: 'revisor' };
    this.resultado = null;
  }
}
setWorldConstructor(MundoNewsFlow);
