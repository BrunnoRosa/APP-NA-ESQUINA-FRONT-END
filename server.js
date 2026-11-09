// Servidor simples para publicar o app web (pasta dist) no Railway.
// Não precisa instalar nada: usa só o Node. Qualquer rota volta para o index.html.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PASTA = path.join(__dirname, 'dist');
const PORTA = process.env.PORT || 3000;

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.map': 'application/json', '.txt': 'text/plain',
};

function enviar(res, arquivo, status = 200) {
  const tipo = TIPOS[path.extname(arquivo).toLowerCase()] || 'application/octet-stream';
  const cache = arquivo.includes(`${path.sep}_expo${path.sep}`) || arquivo.includes(`${path.sep}assets${path.sep}`)
    ? 'public, max-age=31536000, immutable' : 'no-cache';
  res.writeHead(status, { 'Content-Type': tipo, 'Cache-Control': cache });
  fs.createReadStream(arquivo).pipe(res);
}

http.createServer((req, res) => {
  const caminho = decodeURIComponent((req.url || '/').split('?')[0]);
  const arquivo = path.normalize(path.join(PASTA, caminho));
  if (!arquivo.startsWith(PASTA)) { res.writeHead(403); return res.end(); }

  fs.stat(arquivo, (erro, info) => {
    if (!erro && info.isFile()) return enviar(res, arquivo);
    enviar(res, path.join(PASTA, 'index.html')); // app de página única
  });
}).listen(PORTA, '0.0.0.0', () => console.log(`Na Esquina web na porta ${PORTA}`));
