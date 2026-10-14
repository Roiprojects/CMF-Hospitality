import fs from 'fs';
import path from 'path';

// WebP parser for VP8 / VP8L / VP8X dimensions
function getWebPDimensions(filePath) {
  const buf = Buffer.alloc(32);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buf, 0, 32, 0);
  fs.closeSync(fd);

  const riff = buf.toString('ascii', 0, 4);
  const webp = buf.toString('ascii', 8, 12);
  if (riff !== 'RIFF' || webp !== 'WEBP') {
    throw new Error('Not a WebP file');
  }

  const format = buf.toString('ascii', 12, 16);
  if (format === 'VP8X') {
    const width = 1 + buf.readUIntLE(24, 3);
    const height = 1 + buf.readUIntLE(27, 3);
    return { format: 'VP8X', width, height };
  } else if (format === 'VP8L') {
    // Lossless WebP
    const b0 = buf[21];
    const b1 = buf[22];
    const b2 = buf[23];
    const b3 = buf[24];
    const width = 1 + (((b1 & 0x3f) << 8) | b0);
    const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    return { format: 'VP8L', width, height };
  } else if (format === 'VP8 ') {
    // Lossy WebP
    const startCode = buf.readUIntLE(23, 3);
    if (startCode !== 0x2a019d) {
      return { format: 'VP8', width: 'unknown', height: 'unknown' };
    }
    const width = buf.readUInt16LE(26) & 0x3fff;
    const height = buf.readUInt16LE(28) & 0x3fff;
    return { format: 'VP8', width, height };
  }
  return { format, width: 'unknown', height: 'unknown' };
}

const inputDir = path.resolve('inputs_and_frames');
console.log('Inspecting directories in:', inputDir);

const dirs = fs.readdirSync(inputDir).filter(f => fs.statSync(path.join(inputDir, f)).isDirectory());

const report = {};

for (const d of dirs) {
  const full = path.join(inputDir, d);
  const files = fs.readdirSync(full).filter(f => f.endsWith('.webp')).sort();
  const count = files.length;
  let missing = [];
  let dimensions = null;

  if (count > 0) {
    const sample = path.join(full, files[0]);
    dimensions = getWebPDimensions(sample);

    // check continuity
    const indices = files.map(f => parseInt(f.replace('.webp', ''), 10));
    const min = Math.min(...indices);
    const max = Math.max(...indices);
    const set = new Set(indices);
    for (let i = min; i <= max; i++) {
      if (!set.has(i)) {
        missing.push(i);
      }
    }

    report[d] = {
      folder: d,
      count,
      min,
      max,
      missing,
      dimensions,
      firstFile: files[0],
      lastFile: files[files.length - 1],
      totalBytes: files.reduce((acc, f) => acc + fs.statSync(path.join(full, f)).size, 0)
    };
  }
}

console.log('Folders report:', JSON.stringify(report, null, 2));
