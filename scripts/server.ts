import { readFile } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { ROOT_PATH } from './constants';

export function startServer() {
  const hostname = '0.0.0.0';
  const PORT = 5500;
  const server = createServer((req, res) => {
    const filePath = join(ROOT_PATH, req.url === '/' ? 'index.html' : req.url || '');
    const fileExtname = String(extname(filePath)).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
    };
    const contentType = mimeTypes[fileExtname] || 'application/octet-stream';
    readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        }
        else {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      }
      else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf8');
      }
    });
  });

  server.listen(PORT, hostname, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
