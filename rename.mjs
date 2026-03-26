import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else {
      callback(p);
    }
  }
}

function replaceInFile(p) {
  if (!p.endsWith('.json') && !p.endsWith('.tsx') && !p.endsWith('.ts') && !p.endsWith('.html') && !p.endsWith('.mts')) return;
  if (p.includes('node_modules')) return;
  
  let content = fs.readFileSync(p, 'utf8');
  let original = content;
  
  content = content.replace(/(?<!\@)(?<!xp-technologies-dev\/)(?<!github\.com\/)(P-Stream|p-stream|P-stream)/g, (match) => {
    if (match === 'P-Stream' || match === 'P-stream') return 'Basement';
    if (match === 'p-stream') return 'basement';
    return match;
  });
  
  if (content !== original) {
    fs.writeFileSync(p, content, 'utf8');
    console.log('Updated', p);
  }
}

walk('./src', replaceInFile);
replaceInFile('./index.html');
replaceInFile('./vite.config.mts');
console.log('Renaming complete.');
