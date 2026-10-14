4K film update validation

Next.js production build and TypeScript: PASS.
Default story: four clips, 960 frames. Optional alternate: 240 frames.
New assembly and inside-alternate: all 480 frames decoded and checked at 3840x2160.
Original three clips: prior validation covered all 720 frames; not re-extracted in this update.
Native source cadence: 24 fps; no extraction decimation.
New clips: lossless WebP pixel equality against FFmpeg BGRA decode at frames 0, 120, 239 PASS.
New original video copies: SHA-256 identical to uploads PASS.
Prior original-clip pixel and hash checks retained in QUALITY_CHECK.json.
No resizing, cropping, colour grading or lossy frame encoding. YUV-to-RGB conversion is necessary.
Browser visual/scrolling/network/memory testing: NOT RUN, supported tooling unavailable.
The 095442 re-upload is identical to the original and is included only once.
