import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const parsedData = req.body;
    
    // Di Vercel serverless, filesystem bersifat read-only.
    // Kita coba tulis, jika gagal kita berikan response sukses dengan warning
    // agar aplikasi frontend tetap berjalan menggunakan localStorage.
    try {
      const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'potikData.json');
      fs.writeFileSync(jsonFilePath, JSON.stringify(parsedData, null, 2), 'utf8');
      res.status(200).json({ success: true, message: "Database saved successfully to potikData.json" });
    } catch (fsErr) {
      console.warn(`[API] File write failed (expected on serverless): ${fsErr.message}`);
      res.status(200).json({ 
        success: true, 
        warning: "Serverless filesystem is read-only. Data is saved in your browser's localStorage.",
        errorDetails: fsErr.message
      });
    }
  } catch (err) {
    res.status(400).json({ error: `Failed to save: ${err.message}` });
  }
}
