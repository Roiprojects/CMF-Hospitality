import fs from 'fs';
import path from 'path';

const sequence = JSON.parse(fs.readFileSync(path.resolve('src/content/story-sequence.json'), 'utf-8'));
const baseDir = path.resolve('public/frames');
const clips = sequence.clips || ['pour', 'assembly', 'inside-alternate', 'occasions'];
const framesPerClip = sequence.framesPerClip || 240;

console.log('=== Story Asset & Memory Benchmark ===');

let totalDiskBytes = 0;
const sceneStats = {};

for (const clip of clips) {
  const clipDir = path.join(baseDir, clip);
  let clipBytes = 0;
  let minSize = Infinity;
  let maxSize = 0;

  for (let i = 0; i < framesPerClip; i++) {
    const filename = String(i).padStart(4, '0') + '.webp';
    const filePath = path.join(clipDir, filename);
    const size = fs.statSync(filePath).size;
    clipBytes += size;
    if (size < minSize) minSize = size;
    if (size > maxSize) maxSize = size;
  }

  totalDiskBytes += clipBytes;
  sceneStats[clip] = {
    totalMB: (clipBytes / (1024 * 1024)).toFixed(2),
    avgKB: (clipBytes / framesPerClip / 1024).toFixed(1),
    minKB: (minSize / 1024).toFixed(1),
    maxKB: (maxSize / 1024).toFixed(1)
  };
}

console.log('Scene Statistics:');
for (const [clip, stats] of Object.entries(sceneStats)) {
  console.log(`- Scene '${clip}': Total ${stats.totalMB} MB, Avg ${stats.avgKB} KB/frame (min: ${stats.minKB} KB, max: ${stats.maxKB} KB)`);
}

console.log(`\nTotal 960 frames disk size: ${(totalDiskBytes / (1024 * 1024)).toFixed(2)} MB`);

// 4K Uncompressed Frame Size: 3840 x 2160 x 4 bytes (RGBA)
const uncompressedFrameBytes = 3840 * 2160 * 4;
const uncompressedFrameMB = uncompressedFrameBytes / (1024 * 1024);

console.log(`\nSingle decoded 4K ImageBitmap: ${uncompressedFrameMB.toFixed(2)} MB RGBA`);
console.log(`If all 960 frames were decoded in memory: ${(960 * uncompressedFrameMB / 1024).toFixed(2)} GB VRAM (WOULD CRASH BROWSER / GPU)`);

// Proposed Two-Tier Architecture bounds:
const MAX_BITMAP_CACHE = 18;
const MAX_COMPRESSED_CACHE = 60;
const avgFrameBytes = totalDiskBytes / (clips.length * framesPerClip);

const bitmapCacheVRAM_MB = MAX_BITMAP_CACHE * uncompressedFrameMB;
const compressedCacheRAM_MB = (MAX_COMPRESSED_CACHE * avgFrameBytes) / (1024 * 1024);
const totalMemoryCeiling_MB = bitmapCacheVRAM_MB + compressedCacheRAM_MB;

console.log('\n--- Proposed Two-Tier Memory Bounds ---');
console.log(`Tier 1 (Compressed Blob Cache, ${MAX_COMPRESSED_CACHE} frames): ~${compressedCacheRAM_MB.toFixed(1)} MB RAM`);
console.log(`Tier 2 (Decoded ImageBitmap Cache, ${MAX_BITMAP_CACHE} frames): ~${bitmapCacheVRAM_MB.toFixed(1)} MB VRAM`);
console.log(`Total memory budget: ~${totalMemoryCeiling_MB.toFixed(1)} MB (safely under standard 1.5GB tab threshold)`);
