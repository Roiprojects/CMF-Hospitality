import fs from 'fs';
import path from 'path';

const base = path.resolve('inputs_and_frames');
console.log('Inspecting inputs_and_frames:', base);

function inspectDir(dir, depth = 0) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const indent = '  '.repeat(depth);
    if (item.isDirectory()) {
      const children = fs.readdirSync(fullPath);
      const isAllFiles = children.every(c => {
        try {
          return fs.statSync(path.join(fullPath, c)).isFile();
        } catch {
          return false;
        }
      });
      if (isAllFiles) {
        console.log(`${indent}[DIR] ${item.name}: ${children.length} files. (first: ${children[0]}, last: ${children[children.length - 1]})`);
      } else {
        console.log(`${indent}[DIR] ${item.name}: ${children.length} items`);
        inspectDir(fullPath, depth + 1);
      }
    } else {
      console.log(`${indent}[FILE] ${item.name} (${(fs.statSync(fullPath).size / 1024).toFixed(1)} KB)`);
    }
  }
}

inspectDir(base);

// Check if there are archives anywhere in inputs_and_frames or project
function findArchives(dir) {
  const results = [];
  function search(d) {
    const items = fs.readdirSync(d, { withFileTypes: true });
    for (const item of items) {
      const full = path.join(d, item.name);
      if (item.isDirectory() && item.name !== 'node_modules' && item.name !== '.next') {
        search(full);
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext) || item.name.includes('.zip.') || item.name.includes('.z0')) {
          results.push({ path: full, size: fs.statSync(full).size });
        }
      }
    }
  }
  search(dir);
  return results;
}

console.log('\nScanning for archives in workspace...');
const archives = findArchives(path.resolve('.'));
console.log('Found archives:', archives);
