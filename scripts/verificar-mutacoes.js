// Erros controlados em cópias temporárias. Não modifica o domínio da entrega.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const raiz = path.resolve(__dirname, '..');
const original = fs.readFileSync(path.join(raiz, 'src/newsflow.js'), 'utf8');
const alteracoes = [
  ['RN01 perder o instante exato do salvamento', 'edicao.proximoSalvamento <= destino', 'edicao.proximoSalvamento < destino'],
  ['RN01 manter 21 versões', 'edicao.versoes.length > 20', 'edicao.versoes.length > 21'],
  ['RN02 permitir aprovação pelo autor', 'pessoa.id === edicao.autor.id', 'false'],
  ['RN03 rejeitar exatamente 15 minutos', 'horario - this.agora < 15 * MINUTO', 'horario - this.agora <= 15 * MINUTO'],
  ['RN03 aceitar terceiro reagendamento', 'disparo.reagendamentos >= 2', 'disparo.reagendamentos > 2'],
  ['RN03 rejeitar cancelamento exatamente a 5 minutos', 'disparo.horario - this.agora < 5 * MINUTO', 'disparo.horario - this.agora <= 5 * MINUTO'],
  ['RN04 duplicar público sobreposto', 'destinatarios.set(assinante.id, assinante)', 'destinatarios.set(segmento.id + assinante.id, assinante)'],
  ['RN06 aceitar confirmação exatamente em 48 horas', 'this.agora >= token.expiraEm', 'this.agora > token.expiraEm']
];
const resultados = [];
for (const [nome, antes, depois] of alteracoes) {
  if (!original.includes(antes)) throw new Error(`Mutação sem alvo: ${nome}`);
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'newsflow-mutacao-'));
  try {
    fs.cpSync(path.join(raiz, 'features'), path.join(pasta, 'features'), { recursive: true });
    fs.copyFileSync(path.join(raiz, 'cucumber.js'), path.join(pasta, 'cucumber.js'));
    fs.mkdirSync(path.join(pasta, 'src'));
    fs.writeFileSync(path.join(pasta, 'src/newsflow.js'), original.replace(antes, depois));
    fs.symlinkSync(path.join(raiz, 'node_modules'), path.join(pasta, 'node_modules'), 'junction');
    const execucao = spawnSync(process.execPath, [path.join(raiz, 'node_modules/@cucumber/cucumber/bin/cucumber-js'), '--profile', 'verificacao'], { cwd: pasta, encoding: 'utf8' });
    const resumo = execucao.stdout.match(/\d+ scenarios \([^\n]+\)/)?.[0] || '';
    const detectada = execucao.status === 1 && /\d+ failed/.test(resumo);
    resultados.push({ nome, detectada, resumo });
    console.log(`${detectada ? 'DETECTADA' : 'NÃO DETECTADA'}: ${nome} | ${resumo}`);
  } finally { fs.rmSync(pasta, { recursive: true, force: true }); }
}
fs.writeFileSync(path.join(raiz, 'relatorios/mutacoes.json'), JSON.stringify(resultados, null, 2) + '\n');
if (resultados.some(r => !r.detectada)) process.exitCode = 1;
