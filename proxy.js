import http from 'http';
import https from 'https';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';

const PORT = 3001;

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-BPS-Cookie');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  if (reqUrl.pathname === '/api/save-database' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsedData = JSON.parse(body);
        const jsonContent = JSON.stringify(parsedData, null, 2);
        
        // Simpan ke src/data/potikData.json (backup lokal)
        const srcFilePath = path.join(process.cwd(), 'src', 'data', 'potikData.json');
        fs.writeFileSync(srcFilePath, jsonContent, 'utf8');
        
        // Simpan ke public/potikData.json (sumber data untuk Vercel deploy)
        const publicFilePath = path.join(process.cwd(), 'public', 'potikData.json');
        fs.writeFileSync(publicFilePath, jsonContent, 'utf8');
        
        console.log(`[PROXY] Database successfully saved back to file: ${srcFilePath}`);
        console.log(`[PROXY] Database successfully saved to public: ${publicFilePath}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: "Database saved successfully to potikData.json" }));
      } catch (err) {
        console.error(`[PROXY] Error saving database: ${err.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Failed to save: ${err.message}` }));
      }
    });
    return;
  }

  if (reqUrl.pathname === '/api/fetch') {
    const targetUrlStr = reqUrl.searchParams.get('url');
    const cookieHeader = req.headers['x-bps-cookie'] || reqUrl.searchParams.get('cookie') || '';

    if (!targetUrlStr) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: "Missing 'url' query parameter" }));
      return;
    }

    try {
      const targetUrl = new URL(targetUrlStr);
      
      const options = {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          'X-Requested-With': 'XMLHttpRequest'
        }
      };

      if (cookieHeader) {
        options.headers['Cookie'] = cookieHeader;
      }

      console.log(`[PROXY] Forwarding GET request to: ${targetUrl.href}`);

      const proxyReq = https.request(targetUrl, options, (proxyRes) => {
        console.log(`[PROXY] BPS responded with status: ${proxyRes.statusCode} for URL: ${targetUrl.href}`);
        // Forward headers and status
        res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        console.error(`[PROXY] Error forwarding request: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Proxy Error: ${err.message}` }));
      });

      proxyReq.on('timeout', () => {
        console.error(`[PROXY] Request timed out`);
        proxyReq.destroy();
      });

      proxyReq.end();
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Invalid URL: ${e.message}` }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "Not Found. Use /api/fetch?url=...&cookie=..." }));
  }
});

server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`   Pojok Statistik BPS Local CORS Proxy Active!`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Ready to tunnel requests to BPS safely...`);
  console.log(`==================================================`);
});
