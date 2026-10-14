async function testServer() {
  const urls = [
    'http://localhost:3000/',
    'http://localhost:3000/about/',
    'http://localhost:3000/services/',
    'http://localhost:3000/contact/',
    'http://localhost:3000/frames/pour/0000.webp',
    'http://localhost:3000/frames/pour/0239.webp',
    'http://localhost:3000/frames/assembly/0000.webp',
    'http://localhost:3000/frames/assembly/0239.webp',
    'http://localhost:3000/frames/inside/0000.webp',
    'http://localhost:3000/frames/inside/0239.webp',
    'http://localhost:3000/frames/inside-alternate/0000.webp',
    'http://localhost:3000/frames/inside-alternate/0239.webp',
    'http://localhost:3000/frames/occasions/0000.webp',
    'http://localhost:3000/frames/occasions/0239.webp'
  ];

  console.log('=== Testing HTTP Server Endpoints ===');
  let failures = 0;
  for (const u of urls) {
    try {
      const res = await fetch(u);
      const ct = res.headers.get('content-type');
      const cl = res.headers.get('content-length');
      if (res.ok) {
        console.log(`[PASS] ${res.status} ${ct} (${cl} bytes) -> ${u}`);
      } else {
        console.error(`[FAIL] ${res.status} -> ${u}`);
        failures++;
      }
    } catch (e) {
      console.error(`[ERROR] ${u} -> ${e.message}`);
      failures++;
    }
  }

  // Also verify that homepage HTML contains the expected headlines and elements
  const homeRes = await fetch('http://localhost:3000/');
  const html = await homeRes.text();
  const checks = [
    'Every great evening begins with a pour.',
    'Cocktail experiences by Bar Chef Bengaluru.',
    'A little curiosity. A signature creation.',
    'Flavour, texture and detail—made personal.',
    'There’s a world inside every glass.',
    'Explore the craft behind the experience.',
    'One craft. Endless occasions.',
    'Weddings, house parties, birthdays and live celebrations.',
    'Plan your experience',
    'Skip story',
    'story-experience',
    'chapter-rail'
  ];

  console.log('\n=== Verifying Homepage HTML Contents ===');
  for (const c of checks) {
    if (html.includes(c)) {
      console.log(`[PASS] Contains: "${c}"`);
    } else {
      console.error(`[FAIL] Missing in HTML: "${c}"`);
      failures++;
    }
  }

  if (failures > 0) {
    console.error(`\nCompleted with ${failures} failures.`);
    process.exit(1);
  } else {
    console.log('\nAll endpoints and HTML validations PASSED successfully!');
  }
}

testServer();
