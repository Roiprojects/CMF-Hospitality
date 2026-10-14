import fs from 'fs';
import path from 'path';

const sequence = JSON.parse(fs.readFileSync(path.resolve('src/content/story-sequence.json'), 'utf-8'));
const baseDir = path.resolve('public/frames');
const clips = sequence.clips || ['pour', 'assembly', 'inside-alternate', 'occasions'];
const framesPerClip = sequence.framesPerClip || 240;

console.log('=== Checking Story Assets ===');
console.log('Frames Directory:', baseDir);

let hasError = false;
let totalChecked = 0;

for (const clip of clips) {
  const clipDir = path.join(baseDir, clip);
  if (!fs.existsSync(clipDir)) {
    console.error(`ERROR: Directory missing for clip '${clip}': ${clipDir}`);
    hasError = true;
    continue;
  }

  const missing = [];
  for (let i = 0; i < framesPerClip; i++) {
    const filename = String(i).padStart(4, '0') + '.webp';
    const filePath = path.join(clipDir, filename);
    if (!fs.existsSync(filePath)) {
      missing.push(filename);
    } else {
      const stat = fs.statSync(filePath);
      if (stat.size < 1000) {
        console.error(`ERROR: File suspiciously small (${stat.size} bytes): ${filePath}`);
        hasError = true;
      }
      totalChecked++;
    }
  }

  if (missing.length > 0) {
    console.error(`ERROR: Clip '${clip}' is missing ${missing.length} frames:`, missing.slice(0, 5), '...');
    hasError = true;
  } else {
    console.log(`PASS: Clip '${clip}' has all ${framesPerClip} frames.`);
  }
}

if (hasError) {
  console.error('\nAsset verification FAILED.');
  process.exit(1);
} else {
  console.log(`\nAsset verification PASSED. All ${totalChecked} frames are present and verified.`);
}
