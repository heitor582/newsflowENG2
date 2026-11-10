const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const routes = {
  '/': ['public/index.html', 'text/html'],
  '/app.js': ['public/app.js', 'text/javascript'],
  '/style.css': ['public/style.css', 'text/css'],
  '/dominio.js': ['src/newsflow.js', 'text/javascript'],
};
http.createServer((req, res) => {
  const route = routes[new URL(req.url, 'http://localhost').pathname];
  if (!route) { res.writeHead(404); res.end('Não encontrado'); return; }
  let body = fs.readFileSync(path.join(__dirname, route[0]), 'utf8');
  if (route[0] === 'src/newsflow.js') {
    body = body.replace('module.exports =', 'window.NewsFlowDomain =');
  }
  res.writeHead(200, { 'Content-Type': `${route[1]}; charset=utf-8`, 'Cache-Control': 'no-store' });
  res.end(body);
}).listen(5173, '127.0.0.1', () => console.log('NewsFlow: http://127.0.0.1:5173'));
