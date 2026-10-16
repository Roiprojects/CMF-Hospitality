'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const FrameSequence = dynamic(() => import('./FrameSequence'), { ssr: false });

export interface ChapterDef {
  num: string;
  label: string;
  scene: string;
  headline: string;
  supporting: string;
  ctaText?: string;
  ctaHref?: string;
  isPrimaryCta?: boolean;
  stillFrame: string;
}

const chapters: ChapterDef[] = [
  {
    num: '01',
    label: 'THE INVITATION',
    scene: 'The Perfect Pour',
    headline: 'Every great evening begins with a pour.',
    supporting: 'Cocktail experiences by Bar Chef Bengaluru.',
    ctaText: 'Discover our experiences ↓',
    ctaHref: '#story',
    stillFrame: '/frames/pour/0120.webp'
  },
  {
    num: '02',
    label: 'THE INGREDIENTS',
    scene: 'Ingredients in Motion',
    headline: 'A little curiosity. A signature creation.',
    supporting: 'Flavour, texture and detail—made personal.',
    ctaText: 'Explore our services ↗',
    ctaHref: '/services',
    stillFrame: '/frames/assembly/0120.webp'
  },
  {
    num: '03',
    label: 'THE CRAFT',
    scene: 'Inside the Glass',
    headline: 'There’s a world inside every glass.',
    supporting: 'Exploring aroma, clarity, and botanical balance.',
    ctaText: 'Read the cocktail journal ↗',
    ctaHref: '/blogs',
    stillFrame: '/frames/inside/0120.webp'
  },
  {
    num: '04',
    label: 'THE COCKTAIL LAB',
    scene: 'Where Ideas Become Experiences',
    headline: 'Where ideas become experiences.',
    supporting: 'From flavour concept to flawless event execution.',
    ctaText: 'Inside the Cocktail Lab ↗',
    ctaHref: '/about#our-cocktail-lab',
    stillFrame: '/frames/inside-alternate/0120.webp'
  },
  {
    num: '05',
    label: 'THE CELEBRATION',
    scene: 'One Glass, Different Occasions',
    headline: 'One craft. Endless occasions.',
    supporting: 'Weddings, house parties, birthdays, concerts and festivals.',
    ctaText: 'Plan your experience ↗',
    ctaHref: '/contact',
    isPrimaryCta: true,
    stillFrame: '/frames/occasions/0120.webp'
  }
];

export default function StoryExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [framesReady, setFramesReady] = useState(false);

  const handleReady = useCallback((ready: boolean) => {
    setFramesReady(ready);
  }, []);

  // System prefers-reduced-motion listener
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      setMotionEnabled(!mq.matches);
    };
    updateMotion();
    mq.addEventListener('change', updateMotion);

    const onGlobalMotion = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      setMotionEnabled(detail && !mq.matches);
    };
    window.addEventListener('barchef-motion', onGlobalMotion);

    return () => {
      mq.removeEventListener('change', updateMotion);
      window.removeEventListener('barchef-motion', onGlobalMotion);
    };
  }, []);

  // GSAP ScrollTrigger authoritative scroll progress engine
  useEffect(() => {
    if (!motionEnabled || !rootRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const root = rootRef.current;
    const panels = Array.from(root.querySelectorAll<HTMLElement>('.story-panel'));
    let lastActiveChapter = -1;

    const syncPanelsAndProgress = (p: number) => {
      progressRef.current = p;
      root.style.setProperty('--story-progress', p.toFixed(4));

      const numChapters = chapters.length;
      const currentActive = Math.min(
        numChapters - 1,
        Math.max(0, Math.floor(p * numChapters))
      );

      // Only update React state when active chapter transitions
      if (currentActive !== lastActiveChapter) {
        lastActiveChapter = currentActive;
        setActiveChapter(currentActive);
      }

      // Smooth panel fade and parallax with zero layout reflow
      for (let i = 0; i < panels.length; i++) {
        const panel = panels[i];
        const start = i / numChapters;
        const end = (i + 1) / numChapters;
        const mid = (start + end) / 2;
        const halfSpan = (end - start) / 2;

        const dist = (p - mid) / halfSpan;
        const absDist = Math.abs(dist);

        let opacity = 0;
        if (absDist <= 0.55) {
          opacity = 1;
        } else if (absDist < 1.05) {
          const t = (absDist - 0.55) / 0.5;
          opacity = 0.5 * (1 + Math.cos(t * Math.PI));
        }

        const translateY = -dist * 20;

        panel.style.opacity = opacity.toFixed(3);
        panel.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
        panel.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
        panel.inert = opacity < 0.25;
        panel.setAttribute('aria-hidden', String(opacity < 0.25));
      }
    };

    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        syncPanelsAndProgress(self.progress);
      },
      onRefresh: (self) => {
        syncPanelsAndProgress(self.progress);
      }
    });

    stRef.current = st;
    syncPanelsAndProgress(st.progress);

    return () => {
      st.kill();
      stRef.current = null;
      panels.forEach((panel) => {
        panel.removeAttribute('style');
        panel.inert = false;
        panel.removeAttribute('aria-hidden');
      });
    };
  }, [motionEnabled]);

  // Synchronized chapter jump
  const jumpToChapter = (chapterIndex: number) => {
    const targetProgress = (chapterIndex + 0.12) / chapters.length;
    if (stRef.current) {
      const targetScroll =
        stRef.current.start + targetProgress * (stRef.current.end - stRef.current.start);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    } else if (rootRef.current) {
      const root = rootRef.current;
      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      const maxScroll = root.offsetHeight - window.innerHeight;
      const targetY = rootTop + maxScroll * targetProgress;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  const handleSkipStory = (e: React.MouseEvent) => {
    e.preventDefault();
    const nextSection = document.getElementById('story');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={rootRef}
      className={
        'story-experience ' +
        (motionEnabled ? 'story-enabled' : 'story-static') +
        (framesReady ? ' frames-ready' : '')
      }
      id="experience"
    >
      <div className="story-stage">
        {/* Dark matching backdrop (hidden once frames paint) */}
        <div className="story-backdrop" aria-hidden="true" />

        {/* 4K Canvas Sequence Player (Smoky sequence permanently active) */}
        {motionEnabled && (
          <FrameSequence
            progress={progressRef}
            onReady={handleReady}
          />
        )}

        {/* Subtle protective vignette */}
        <div className="story-vignette" aria-hidden="true" />

        {/* Clean, Minimalist Story Header */}
        <header className="story-tools" aria-label="Story controls">
          <span className="story-brand">
            BAR CHEF / 4K CINEMATIC STORY
          </span>

          <a
            href="#story"
            onClick={handleSkipStory}
            className="story-skip-link"
            aria-label="Skip cinematic story to overview"
          >
            Skip story ↓
          </a>

          <button
            type="button"
            className="story-motion-btn"
            onClick={() => {
              setMotionEnabled(!motionEnabled);
              setFramesReady(false);
            }}
            aria-pressed={motionEnabled}
            aria-label={motionEnabled ? 'Disable motion and view stills' : 'Enable scroll-driven motion'}
          >
            {motionEnabled ? 'View without motion' : 'Enter story mode'}
          </button>
        </header>

        {/* Story Chapter Content Panels */}
        <div className="story-panels">
          {chapters.map((chap, i) => (
            <section
              key={chap.num}
              className={`story-panel chapter-${i}`}
              aria-label={`${chap.num} — ${chap.scene}`}
            >
              <div className="story-panel-content">
                <p className="eyebrow">
                  {chap.num} — {chap.label}
                </p>
                {i === 0 ? (
                  <h1 className="story-headline">{chap.headline}</h1>
                ) : (
                  <h2 className="story-headline">{chap.headline}</h2>
                )}
                <p className="story-caption">{chap.supporting}</p>

                {chap.ctaText && chap.ctaHref && (
                  <div className="story-cta-wrap">
                    {chap.isPrimaryCta ? (
                      <Link href={chap.ctaHref} className="button story-cta-btn">
                        {chap.ctaText}
                      </Link>
                    ) : (
                      <Link
                        href={chap.ctaHref}
                        className="text-link story-cta-link"
                        onClick={chap.ctaHref.startsWith('#') ? handleSkipStory : undefined}
                      >
                        {chap.ctaText}
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Representative still image for reduced motion / static mode */}
              {!motionEnabled && (
                <div className="static-frame-preview">
                  <img
                    src={chap.stillFrame}
                    alt={`${chap.scene} - Bar Chef Bengaluru`}
                    loading="lazy"
                    width={960}
                    height={540}
                  />
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Chapter Rail Navigation (Left side) */}
        {motionEnabled && (
          <nav className="chapter-rail" aria-label="Story chapter navigation">
            {chapters.map((chap, i) => (
              <button
                key={chap.num}
                type="button"
                onClick={() => jumpToChapter(i)}
                aria-label={`Jump to Chapter ${chap.num}: ${chap.scene}`}
                aria-current={activeChapter === i ? 'step' : undefined}
                className={activeChapter === i ? 'is-active' : ''}
              >
                <span className="rail-num">{chap.num}</span>
                <i className="rail-dot" />
                <span className="rail-title">{chap.scene}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Bottom Status & Scroll Indicator */}
        {motionEnabled && (
          <div className="story-status" aria-live="polite">
            <span className="story-current-chapter">
              {chapters[activeChapter].num} / 0{chapters.length} · {chapters[activeChapter].scene}
            </span>
            <span className="story-scroll-hint">
              SCROLL TO CONTINUE ↓
            </span>
          </div>
        )}

        {/* Subtle Bottom Progress Line */}
        {motionEnabled && <div className="story-progress" aria-hidden="true" />}

        {/* Subtitle / Spec Note */}
        <span className="scene-caption" aria-hidden="true">
          {framesReady
            ? '4K NATIVE · 24 FPS · LOSSLESS FILM'
            : 'BUFFERING 4K VIDEO'}
        </span>
      </div>
    </div>
  );
}
