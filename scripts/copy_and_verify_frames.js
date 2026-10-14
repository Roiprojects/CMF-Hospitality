import fs from 'fs';
import path from 'path';

const srcBase = path.resolve('inputs_and_frames');
const destBase = path.resolve('public/frames');

console.log('Source:', srcBase);
console.log('Destination:', destBase);

const plan = [
  { srcDir: 'pour', destDir: 'pour' },
  { srcDir: 'assembly', destDir: 'assembly' },
  { srcDir: 'inside', destDir: 'inside' },
  { srcDir: 'inside-alternate', destDir: 'inside-alternate' },
  { srcDir: 'occasions-1', destDir: 'occasions' },
  { srcDir: 'occasions-2', destDir: 'occasions' }
];

if (!fs.existsSync(destBase)) {
  fs.mkdirSync(destBase, { recursive: true });
}

let totalCopied = 0;
let totalVerified = 0;

for (const item of plan) {
  const sPath = path.join(srcBase, item.srcDir);
  const dPath = path.join(destBase, item.destDir);
  if (!fs.existsSync(dPath)) {
    fs.mkdirSync(dPath, { recursive: true });
  }

  const files = fs.readdirSync(sPath).filter(f => f.endsWith('.webp'));
  console.log(`Copying ${files.length} frames from ${item.srcDir} to ${item.destDir}...`);

  for (const file of files) {
    const sFile = path.join(sPath, file);
    const dFile = path.join(dPath, file);

    const sStat = fs.statSync(sFile);
    let needCopy = true;
    if (fs.existsSync(dFile)) {
      const dStat = fs.statSync(dFile);
      if (dStat.size === sStat.size) {
        needCopy = false;
        totalVerified++;
      }
    }

    if (needCopy) {
      fs.copyFileSync(sFile, dFile);
      const dStat = fs.statSync(dFile);
      if (dStat.size !== sStat.size) {
        throw new Error(`Size mismatch for ${dFile}: expected ${sStat.size}, got ${dStat.size}`);
      }
      totalCopied++;
    }
  }
}

console.log(`Copy complete. Copied: ${totalCopied}, Already verified: ${totalVerified}`);

// Verify destination directories
const checkDirs = ['pour', 'assembly', 'inside', 'inside-alternate', 'occasions'];
const manifest = {};

for (const d of checkDirs) {
  const dPath = path.join(destBase, d);
  const files = fs.readdirSync(dPath).filter(f => f.endsWith('.webp')).sort();
  const count = files.length;
  const indices = files.map(f => parseInt(f.replace('.webp', ''), 10));
  const missing = [];
  for (let i = 0; i < 240; i++) {
    if (!indices.includes(i)) missing.push(i);
  }

  manifest[d] = {
    folder: d,
    urlPrefix: `/frames/${d}/`,
    frameCount: count,
    firstFrame: files[0],
    lastFrame: files[files.length - 1],
    width: 3840,
    height: 2160,
    missingFrames: missing,
    totalBytes: files.reduce((acc, f) => acc + fs.statSync(path.join(dPath, f)).size, 0)
  };
}

console.log('Final Manifest:');
console.log(JSON.stringify(manifest, null, 2));

fs.writeFileSync(path.resolve('src/content/story-manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Wrote src/content/story-manifest.json successfully.');
