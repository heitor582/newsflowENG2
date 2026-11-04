const fs = require('node:fs');
const assert = require('node:assert/strict');
const { Parser, AstBuilder, GherkinClassicTokenMatcher } = require('@cucumber/gherkin');
const { IdGenerator } = require('@cucumber/messages');

const arquivos = fs.readdirSync('features').filter(n => n.endsWith('.feature')).sort();
const historias = fs.readFileSync('docs/historias.md', 'utf8');
assert.equal(arquivos.length, 4);
assert.equal((historias.match(/^## US0[1-4] /gm) || []).length, 4);
let definicoes = 0, exemplos = 0, totalCriterios = 0;
for (let i = 0; i < arquivos.length; i++) {
  const texto = fs.readFileSync(`features/${arquivos[i]}`, 'utf8');
  assert.ok(texto.startsWith('# language: pt'));
  const parser = new Parser(new AstBuilder(IdGenerator.incrementing()), new GherkinClassicTokenMatcher());
  const feature = parser.parse(texto).feature;
  const cenarios = feature.children.filter(c => c.scenario).map(c => c.scenario);
  assert.ok(cenarios.length <= 5);
  assert.ok(cenarios.some(c => c.tags.some(t => t.name === '@feliz')));
  assert.ok(cenarios.some(c => c.tags.some(t => t.name === '@excecao')));
  const tags = cenarios.flatMap(c => c.tags.map(t => t.name));
  const criterios = [...historias.matchAll(new RegExp(`\\*\\*(CA0${i + 1}_\\d+):\\*\\*`, 'g'))].map(m => m[1]);
  assert.ok(criterios.length >= 3 && criterios.length <= 5);
  totalCriterios += criterios.length;
  for (const criterio of criterios) assert.ok(tags.includes(`@${criterio}`), `${criterio} sem cenário`);
  for (const cenario of cenarios) {
    assert.equal(cenario.steps.filter(p => p.keyword.trim() === 'Quando').length, 1, cenario.name);
    assert.ok(cenario.steps.some(p => p.keyword.trim() === 'Então'), cenario.name);
    for (const passo of cenario.steps) assert.ok(!/endpoint|JSON|mock|banco de dados|botão|clico|API/i.test(passo.text), passo.text);
    definicoes++;
    exemplos += cenario.examples.length ? cenario.examples.reduce((n, e) => n + e.tableBody.length, 0) : 1;
  }
}
console.log(`Estrutura válida: 4 histórias, ${definicoes} definições, ${exemplos} casos e ${totalCriterios} critérios rastreados.`);
