# Bar Chef Bengaluru — native 4K film story

## Open in Antigravity
Extract the project ZIP and ALL accompanying frame ZIPs into the same parent folder. Each archive contains a `bar-chef-next/` root and merges into it. The finished structure must include `bar-chef-next/public/frames/pour/0000.webp`, `inside/0000.webp` and `occasions/0000.webp`.

Open `bar-chef-next` in Antigravity. Run `npm ci` then `npm run dev`, and visit http://localhost:3000. Use Node 20.9 or newer. `npm run build` produces a static export in `out/`; serve it with a static web server, not by opening HTML directly. This project does not use `next start`.

## Quality policy
All five unique uploads are 3840 × 2160, 24 fps, 240 frames (10 seconds) each. Every frame is extracted at its native dimensions with no cropping, resizing, frame-rate conversion or lossy re-encoding. WebP lossless preserves the decoded RGB pixel data. Video YUV-to-RGB conversion is still required; frame files are not byte-identical to compressed H.264 source packets. Original MP4s remain unchanged in `source-videos/` with SHA-256 hashes in `src/content/video-manifest.json`.

The 4K canvas retains the full composition using contain, including on mobile. Browser display fitting is unavoidable on smaller viewports and does not change the source images. Black space may appear around the 16:9 scene on portrait screens. Text and a readability gradient are separate interface layers; the underlying frame files are unchanged.

No resolution-reduced alternatives have been generated. Lossless 4K delivery is large and network-heavy. The player loads the requested frame and nearby frames only, uses a four-bitmap cache and at most two parallel requests, and retains the previous frame during loading. Each fully decoded RGBA 4K frame is roughly 33 MB, so mobile memory and slow-network testing matter. Fast scrolling can skip displayed frames; all 960 active story frames remain available. This is scroll scrubbing, not fixed-rate video playback.

## Story order
1. Pour — 240 frames.
2. Ingredients in Motion / assembly — 240 frames.
3. Inside the Cocktail, original 095442 — 240 frames.
4. Celebrations — 240 frames.

960 active frames at 3840×2160. The additional smoky 095808 version is extracted as 240 optional frames in `inside-alternate/`. To use it, replace `inside` with `inside-alternate` in `src/content/story-sequence.json`; do not add both unless a repeated journey is desired. The 095442 re-upload is byte-identical to the earlier original and is not duplicated.

All four concepts are now represented. The films remain illustrative generated concepts, not footage of actual client events. No source-video resizing, colour grading or lossy recompression was applied. The clips have different compositions at their boundaries and are not described as seamless.

## Archive installation update
Keep the earlier POUR, INSIDE and OCCASIONS_A/B frame packs. Add the new ASSEMBLY and INSIDE_ALTERNATE packs. Extract every archive into the same parent directory so their `bar-chef-next/` folders merge. Replace the project source with the newly downloaded project ZIP. The alternate pack is optional for the default story but required if selecting the smoky version.

## Implementation
- Next.js App Router, TypeScript and CSS.
- `src/components/FrameSequence.tsx`: native 4K canvas, bounded asynchronous frame loading.
- `src/components/StoryExperience.tsx`: six text chapters, chapter jumps, skip-story link and motion controls.
- `src/components/CocktailScene.tsx`: earlier procedural 3D alternative retained but no longer loaded on the homepage.
- `src/content/data.json`: full About source, six service drafts and six full editorial blog drafts.
- `src/components/Inquiry.tsx`: local event-brief download. No enquiry is transmitted.
- `scripts/extract_frames.py`: regenerate complete lossless sequences from original files; requires FFmpeg in PATH.

## Before launch
Await approved event media, contact details, founder photos, testimonials and final service details. Connect and test actual enquiry delivery before replacing the local-brief workflow. Add privacy information and domain-specific metadata when those details exist. Draft pages remain noindex.

Production build and source quality checks are described in VALIDATION.md. Browser visual and network-performance QA were unavailable in the build environment and must be completed in Antigravity before publishing.
