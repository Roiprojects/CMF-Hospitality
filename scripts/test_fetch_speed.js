// Benchmark: Compare Image decode vs fetch+createImageBitmap on localhost
import http from 'http';

console.log('Testing image fetch speed from localhost:3001...');

const testUrl = 'http://localhost:3001/frames/pour/0005.webp';

async function testFetch() {
  const start = performance.now();
  return new Promise((resolve) => {
    http.get(testUrl, (res) => {
      let bytes = 0;
      res.on('data', c => bytes += c.length);
      res.on('end', () => {
        const time = performance.now() - start;
        console.log(`Fetch completed: ${bytes} bytes in ${time.toFixed(1)}ms`);
        resolve(time);
      });
    });
  });
}

async function run() {
  for (let i = 0; i < 5; i++) {
    await testFetch();
  }
}

run();
