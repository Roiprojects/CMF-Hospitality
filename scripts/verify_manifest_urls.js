import fs from 'fs';
import path from 'path';

const manifestPath = path.resolve('src/content/story-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

console.log('=== Verifying Manifest URLs ===');
let totalUrls = 0;
let errors = 0;

for (const [key, clip] of Object.entries(manifest)) {
  const prefix = clip.urlPrefix; // e.g. /frames/pour/
  const count = clip.frameCount; // 240
  console.log(`Checking clip: ${key} (${count} URLs)...`);

  for (let i = 0; i < count; i++) {
    const filename = String(i).padStart(4, '0') + '.webp';
    const relativeUrl = prefix + filename;
    // Map URL to local public folder
    const diskPath = path.resolve('public' + relativeUrl);

    if (!fs.existsSync(diskPath)) {
      console.error(`URL FAILS TO RESOLVE: ${relativeUrl} -> missing at ${diskPath}`);
      errors++;
    } else {
      totalUrls++;
    }
  }
}

if (errors > 0) {
  console.error(`\nFAILED: ${errors} URLs failed to resolve.`);
  process.exit(1);
} else {
  console.log(`\nSUCCESS: All ${totalUrls} manifest URLs resolve to valid files.`);
}
