'use client';
import { useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import sequence from '@/content/story-sequence.json';

interface FrameSequenceProps {
  progress: MutableRefObject<number>;
  onReady: (ready: boolean) => void;
}

const CLIPS: string[] = sequence.clips || ['pour', 'assembly', 'inside', 'inside-alternate', 'occasions'];
const FRAMES_PER_CLIP = sequence.framesPerClip || 240;
const TOTAL_FRAMES = CLIPS.length * FRAMES_PER_CLIP; // 1200 frames across the 5 cinematic scenes
const LAST_FRAME = TOTAL_FRAMES - 1; // 1199

export default function FrameSequence({ progress, onReady }: FrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('Buffering 4K film sequence…');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Solid opaque 2D canvas for instant hardware blit
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let disposed = false;
    let rafId = 0;
    let lastTime = performance.now();

    // Authoritative playhead state (strictly bound to user's scroll)
    let smoothedPlayhead = Math.min(LAST_FRAME, Math.max(0, (progress.current || 0) * LAST_FRAME));
    let paintedFrame = -1;
    let scrollDirection: 1 | -1 = 1;
    let prevProgress = progress.current || 0;
    let initialReadyNotified = false;

    // Complete image registry for all 1200 frames
    const images: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES).fill(null);
    const inFlight = new Set<number>();
    const failedSet = new Set<number>();

    const getUrl = (frameIndex: number): string => {
      const clipIdx = Math.min(CLIPS.length - 1, Math.max(0, Math.floor(frameIndex / FRAMES_PER_CLIP)));
      const frameNum = frameIndex % FRAMES_PER_CLIP;
      return `/frames/${CLIPS[clipIdx]}/${String(frameNum).padStart(4, '0')}.webp`;
    };

    // Draw single 100% solid frame onto canvas (no ghosting, razor-sharp details)
    const drawFrame = (frameIndex: number, img: HTMLImageElement) => {
      ctx.drawImage(img, 0, 0, 3840, 2160);

      // Clean restrained 2-frame cinema shutter cut at scene boundaries only
      const frameInClip = frameIndex % FRAMES_PER_CLIP;
      const isBoundaryEnd = frameInClip >= FRAMES_PER_CLIP - 2 && frameIndex < LAST_FRAME;
      const isBoundaryStart = frameInClip <= 1 && frameIndex > 0;

      if (isBoundaryEnd || isBoundaryStart) {
        let shutterAlpha = 0;
        if (isBoundaryEnd) {
          shutterAlpha = frameInClip === FRAMES_PER_CLIP - 2 ? 0.45 : 0.85;
        } else {
          shutterAlpha = frameInClip === 0 ? 0.85 : 0.45;
        }
        ctx.fillStyle = `rgba(2, 8, 9, ${shutterAlpha})`;
        ctx.fillRect(0, 0, 3840, 2160);
      }

      paintedFrame = frameIndex;

      if (!initialReadyNotified) {
        initialReadyNotified = true;
        onReady(true);
        setStatus('');
      }
    };

    // Helper to check if an image is loaded and ready to draw
    const isImageReady = (idx: number): boolean => {
      const img = images[idx];
      return Boolean(img && img.complete && img.naturalWidth > 0);
    };

    // Preload a single frame into the images array
    const preloadFrame = (frameIndex: number, priority = false): void => {
      if (
        frameIndex < 0 ||
        frameIndex > LAST_FRAME ||
        disposed ||
        isImageReady(frameIndex) ||
        inFlight.has(frameIndex) ||
        failedSet.has(frameIndex)
      ) {
        return;
      }

      // If not priority and too many requests in flight, defer
      if (!priority && inFlight.size >= 12) {
        return;
      }

      inFlight.add(frameIndex);
      const img = new Image();
      images[frameIndex] = img;
      img.src = getUrl(frameIndex);

      img
        .decode()
        .then(() => {
          inFlight.delete(frameIndex);
          if (disposed) return;

          // If the playhead is currently waiting on this exact frame, paint it immediately!
          const currentTarget = Math.min(LAST_FRAME, Math.max(0, Math.round(smoothedPlayhead)));
          if (frameIndex === currentTarget && paintedFrame !== currentTarget) {
            drawFrame(frameIndex, img);
          }
        })
        .catch(() => {
          inFlight.delete(frameIndex);
          failedSet.add(frameIndex);
        });
    };

    // High-priority window preloader around current playhead
    const updatePreloadWindow = (focusFrame: number, dir: 1 | -1) => {
      // 1. Immediate priority: load the target frame and next 3 frames immediately
      preloadFrame(focusFrame, true);
      for (let i = 1; i <= 3; i++) {
        preloadFrame(focusFrame + dir * i, true);
      }

      // 2. High-priority forward window: preload 30 frames ahead in direction of scroll
      for (let i = 4; i <= 30; i++) {
        const f = focusFrame + dir * i;
        if (f >= 0 && f <= LAST_FRAME) {
          preloadFrame(f, false);
        }
      }

      // 3. Reverse safety margin: keep 10 frames behind for instant scroll reversal
      for (let i = 1; i <= 10; i++) {
        const r = focusFrame - dir * i;
        if (r >= 0 && r <= LAST_FRAME) {
          preloadFrame(r, false);
        }
      }
    };

    // Direct scroll-coupled animation loop (NO AUTONOMOUS VIDEO PLAYBACK)
    const loop = (now: number) => {
      if (disposed) return;

      const dt = Math.min(0.06, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // Authoritative target directly from user's scroll
      const rawProgress = Math.min(1, Math.max(0, progress.current || 0));
      const targetPlayhead = rawProgress * LAST_FRAME;

      // Detect scroll direction
      if (rawProgress !== prevProgress) {
        scrollDirection = rawProgress >= prevProgress ? 1 : -1;
        prevProgress = rawProgress;
      }

      // Fast, responsive damping: settles in ~60-80ms so it halts INSTANTLY when scroll stops
      const blend = 1 - Math.exp(-34 * dt);
      const diff = targetPlayhead - smoothedPlayhead;

      if (Math.abs(diff) < 0.05) {
        smoothedPlayhead = targetPlayhead;
      } else {
        smoothedPlayhead += diff * blend;
      }

      const frameToDraw = Math.min(LAST_FRAME, Math.max(0, Math.round(smoothedPlayhead)));

      // Draw ONLY when the integer frame changes
      if (frameToDraw !== paintedFrame) {
        if (isImageReady(frameToDraw)) {
          drawFrame(frameToDraw, images[frameToDraw]!);
        } else {
          // If the exact frame is still loading, find the closest available loaded frame
          // so the animation NEVER freezes or stays stuck on frame 50!
          let closest = -1;
          for (let f = frameToDraw; scrollDirection > 0 ? f >= 0 : f <= LAST_FRAME; f -= scrollDirection) {
            if (isImageReady(f)) {
              closest = f;
              break;
            }
          }

          if (closest !== -1 && closest !== paintedFrame) {
            drawFrame(closest, images[closest]!);
          }

          // Prioritize loading frameToDraw immediately
          preloadFrame(frameToDraw, true);
        }
      }

      updatePreloadWindow(frameToDraw, scrollDirection);
      rafId = requestAnimationFrame(loop);
    };

    // 1. Load initial frame 0 immediately
    preloadFrame(0, true);

    // 2. Pre-buffer the first 30 frames for instantaneous initial scrubbing
    for (let i = 1; i <= 30; i++) {
      preloadFrame(i, true);
    }

    // 3. Progressive background preloader: gradually caches all 1200 frames across all 5 scenes
    let bgIndex = 31;
    const bgInterval = setInterval(() => {
      if (disposed || bgIndex > LAST_FRAME) {
        clearInterval(bgInterval);
        return;
      }
      if (inFlight.size < 6) {
        for (let k = 0; k < 4 && bgIndex <= LAST_FRAME; k++, bgIndex++) {
          preloadFrame(bgIndex, false);
        }
      }
    }, 40);

    rafId = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearInterval(bgInterval);

      // Clean up references on unmount
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          images[i]!.src = '';
          images[i] = null;
        }
      }
      inFlight.clear();
      failedSet.clear();
    };
  }, [progress, onReady]);

  return (
    <div className="frame-sequence" aria-hidden="true">
      <canvas
        ref={canvasRef}
        width={3840}
        height={2160}
        aria-label="Bar Chef Bengaluru scroll-controlled cocktail story"
        role="img"
      />
      {status ? (
        <span className="frame-loading" role="status">
          {status}
        </span>
      ) : null}
    </div>
  );
}
