import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.resolve(__dirname, 'src/data/potikData.json');
const outputFile = path.resolve(__dirname, 'src/data/potikDataFiltered.json');

// Dates in UTC or local? The data has "2025-08-25 10:24:43", so it's a local string.
// Let's parse it without 'Z' to treat it as local time.
const startDate = new Date('2025-08-01T00:00:00');
const endDate = new Date('2026-07-31T23:59:59');

function filterData() {
  try {
    const rawData = fs.readFileSync(inputFile, 'utf-8');
    const data = JSON.parse(rawData);

    const filteredData = data.map(uni => {
      const newUni = { ...uni };
      
      if (newUni.contents) {
        const categories = ['infografis', 'video', 'edukasi', 'kegiatan'];
        let total = 0;
        newUni.contents = { ...uni.contents };
        newUni.contentsCount = { ...uni.contentsCount };

        categories.forEach(cat => {
          if (newUni.contents[cat]) {
            newUni.contents[cat] = newUni.contents[cat].filter(item => {
              if (!item.created_at) return true;
              
              // Replace space with T to make it ISO 8601 compliant for Date parsing
              const dateString = item.created_at.replace(' ', 'T');
              const itemDate = new Date(dateString);
              
              return itemDate >= startDate && itemDate <= endDate;
            });
            newUni.contentsCount[cat] = newUni.contents[cat].length;
            total += newUni.contents[cat].length;
          }
        });
        newUni.contentsCount.total = total;
      }
      return newUni;
    });

    fs.writeFileSync(outputFile, JSON.stringify(filteredData, null, 2));
    console.log(`[${new Date().toISOString()}] Filtered data written to ${outputFile}`);
  } catch (error) {
    console.error('Error filtering data:', error);
  }
}

// Run initially
filterData();

// Watch for changes
let timeout = null;
fs.watch(inputFile, (eventType) => {
  if (eventType === 'change') {
    // Debounce to avoid multiple triggers
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      console.log('potikData.json changed, regenerating filtered data...');
      filterData();
    }, 500);
  }
});
console.log('Watching for changes in potikData.json...');
