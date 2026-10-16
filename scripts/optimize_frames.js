import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const srcBase = path.resolve('inputs_and_frames');
const destBase = path.resolve('public/frames');

const clipsConfig = [
  { clip: 'pour', sources: [{ dir: 'pour', offset: 0 }] },
  { clip: 'assembly', sources: [{ dir: 'assembly', offset: 0 }] },
  { clip: 'inside', sources: [{ dir: 'inside', offset: 0 }] },
  { clip: 'inside-alternate', sources: [{ dir: 'inside-alternate', offset: 0 }] },
  {
    clip: 'occasions',
    sources: [
      { dir: 'occasions-1', offset: 0 },
      { dir: 'occasions-2', offset: 0 }
    ]
  }
];

async function run() {
  console.log('=== Optimizing All 1200 Frames for High-Performance Web & Vercel ===');
  console.log('Source:', srcBase);
  console.log('Destination:', destBase);

  const startTime = Date.now();
  let totalOptimized = 0;
  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;

  for (const cfg of clipsConfig) {
    const targetDir = path.join(destBase, cfg.clip);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    console.log(`\nOptimizing clip '${cfg.clip}' (240 frames)...`);

    for (const src of cfg.sources) {
      const sourceDir = path.join(srcBase, src.dir);
      const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.webp')).sort();

      const batchSize = 16;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async file => {
            const rawIndex = parseInt(file.replace('.webp', ''), 10);
            const targetIndex = rawIndex + src.offset;
            const targetFilename = String(targetIndex).padStart(4, '0') + '.webp';
            const srcPath = path.join(sourceDir, file);
            const destPath = path.join(targetDir, targetFilename);

            const origStat = fs.statSync(srcPath);
            totalOriginalBytes += origStat.size;

            // If already optimized and size is under 150KB, reuse
            if (fs.existsSync(destPath) && fs.statSync(destPath).size < 150000 && fs.statSync(destPath).size > 1000) {
              const existingStat = fs.statSync(destPath);
              totalOptimizedBytes += existingStat.size;
              totalOptimized++;
              return;
            }

            await sharp(srcPath)
              .resize(1600, 900, { fit: 'cover' })
              .webp({ quality: 75, effort: 4 })
              .toFile(destPath);

            const newStat = fs.statSync(destPath);
            totalOptimizedBytes += newStat.size;
            totalOptimized++;
          })
        );
      }
    }
    console.log(`Finished clip '${cfg.clip}'.`);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const origMB = (totalOriginalBytes / 1024 / 1024).toFixed(1);
  const optMB = (totalOptimizedBytes / 1024 / 1024).toFixed(1);
  const reduction = ((1 - totalOptimizedBytes / totalOriginalBytes) * 100).toFixed(1);

  console.log('\n==========================================');
  console.log(`Optimization COMPLETE in ${durationSec}s!`);
  console.log(`Total Frames: ${totalOptimized}`);
  console.log(`Original Size: ${origMB} MB`);
  console.log(`Optimized Size: ${optMB} MB (${reduction}% reduction!)`);
  console.log('==========================================');
}

run().catch(err => {
  console.error('Fatal optimization error:', err);
  process.exit(1);
});
