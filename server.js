const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch (e) {
    res.writeHead(400).end('Bad request');
    return;
  }
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  // Atajos de campana: la misma portada, en una direccion propia, para poder
  // distinguir de donde llega la visita. Cloudflare Web Analytics solo guarda
  // la ruta, no la query string, asi que los UTM no servirian aqui.
  const ATAJOS = {
    '/ig': 'Instagram (liga de la biografia)',
    '/ig/index.html': 'Instagram (liga de la biografia)',
  };
  if (ATAJOS[urlPath]) urlPath = '/index.html';

  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(ROOT, 'index.html'), (e2, home) => {
        if (e2) { res.writeHead(404).end('No encontrado'); return; }
        res.writeHead(404, { 'Content-Type': TYPES['.html'] }).end(home);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream' };
    headers['Cache-Control'] = (ext === '.html')
      ? 'public, max-age=0, must-revalidate'
      : 'public, max-age=31536000, immutable';
    res.writeHead(200, headers).end(data);
  });
}).listen(PORT, () => console.log('Nuestro Dia escuchando en ' + PORT));
