import https from 'https';
import { URL } from 'url';

export default function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-BPS-Cookie');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const targetUrlStr = reqUrl.searchParams.get('url');
  const cookieHeader = req.headers['x-bps-cookie'] || reqUrl.searchParams.get('cookie') || '';

  if (!targetUrlStr) {
    res.status(400).json({ error: "Missing 'url' query parameter" });
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

    const proxyReq = https.request(targetUrl, options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      if (proxyRes.headers['content-type']) {
        res.setHeader('Content-Type', proxyRes.headers['content-type']);
      }
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      res.status(500).json({ error: `Proxy Error: ${err.message}` });
    });

    proxyReq.end();
  } catch (e) {
    res.status(400).json({ error: `Invalid URL: ${e.message}` });
  }
}
