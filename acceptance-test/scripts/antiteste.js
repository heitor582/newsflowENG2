const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const raiz = path.resolve(__dirname, '..');
const arquivo = path.join(raiz, 'src/newsflow.js');
const original = fs.readFileSync(arquivo, 'utf8');
const regra = "    if (pessoa.id === edicao.autor.id) return { mensagem: 'Autor não pode avaliar a própria edição' };";
if (!original.includes(regra)) throw new Error('Regra de autoaprovação não encontrada');
const cli = require.resolve('@playwright/test/cli');
let execucao;
try {
  fs.writeFileSync(arquivo, original.replace(regra, '    // Regra removida temporariamente pelo antiteste.'));
  execucao = spawnSync(process.execPath, [cli, 'test', '-g', 'C2', '--reporter=json'], {
    cwd: raiz, encoding: 'utf8', env: process.env,
  });
} finally {
  fs.writeFileSync(arquivo, original);
}
fs.mkdirSync(path.join(raiz, 'evidencias'), { recursive: true });
fs.writeFileSync(path.join(raiz, 'evidencias/antiteste.json'), execucao.stdout || '{}');
fs.writeFileSync(path.join(raiz, 'evidencias/antiteste-stderr.txt'), execucao.stderr || '');
let relatorio;
try { relatorio = JSON.parse(execucao.stdout); } catch { throw new Error('Antiteste não produziu relatório JSON.'); }
const casos = relatorio.suites.flatMap(s => s.specs || []);
const falhouNaRegra = casos.length === 1 && casos[0].tests.some(t => t.results.some(r =>
  r.status === 'failed' && r.errors.some(e => (e.message || '').includes('Autor não pode avaliar a própria edição'))));
if (execucao.status !== 1 || !falhouNaRegra) throw new Error('Não foi comprovada a falha da asserção de autoaprovação.');
console.log('Antiteste confirmado: C2 falhou na mensagem de autoaprovação; código original restaurado.');
