'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
export default function Shell({children}:{children:React.ReactNode}) {
 const path=usePathname(); const [open,setOpen]=useState(false); const [motion,setMotion]=useState(false);
 useEffect(()=>{setMotion(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)},[]);
 useEffect(()=>{setOpen(false)},[path]);
 useEffect(()=>{if(!motion)return; gsap.registerPlugin(ScrollTrigger); const ctx=gsap.context(()=>{gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el=>gsap.from(el,{y:32,opacity:0,duration:.9,scrollTrigger:{trigger:el,start:'top 94%',once:true}}));if(document.querySelector('.hero'))gsap.to('.hero-image',{yPercent:12,scale:1.06,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}})});return()=>ctx.revert()},[path,motion]);
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <Link href="/" aria-label="Bar Chef Bengaluru home" className="logo">
          <img src="/images/logo.jpg" alt="Bar Chef Bengaluru" width="120" height="80" />
        </Link>
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="nav"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close −' : 'Menu +'}
        </button>
        <nav
          id="nav"
          className={open ? 'open' : ''}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          {[
            ['Our story', '/about'],
            ['Experiences', '/services'],
            ['Gallery', '/gallery'],
            ['Journal', '/blogs'],
          ].map(([s, u]) => (
            <Link key={u} href={u} aria-current={path === u ? 'page' : undefined}>
              {s}
            </Link>
          ))}
          <Link href="/contact" className="button small">
            Plan your event ↗
          </Link>
        </nav>
      </header>
      {children}
      <footer>
        <div className="footer-top">
          <p className="eyebrow">BENGALURU · EXPERIENCES BEYOND THE GLASS</p>
          <Link href="/contact" className="footer-title">
            Let’s make it<br />
            <em>memorable.</em> ↗
          </Link>
        </div>
        <div className="footer-bottom">
          <span>BAR CHEF BENGALURU</span>
          <a
            href="https://wa.me/919945379333"
            target="_blank"
            rel="noopener noreferrer"
            className="developer-credit"
          >
            Developed by ROI Infotech
          </a>
          <Link href="/testimonials">Testimonials</Link>
          <a
            href="https://www.instagram.com/barchefbengaluru/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram ↗
          </a>
          <button
            onClick={() => {
              setMotion(!motion);
              window.dispatchEvent(
                new CustomEvent('barchef-motion', { detail: !motion })
              );
            }}
            aria-pressed={motion}
          >
            Motion {motion ? 'on' : 'off'}
          </button>
        </div>
        <p className="disclosure">
          Design preview · Supplied cocktail films are illustrative concepts, not documentation of client events. Business details await approval.
        </p>
      </footer>
    </>
  );
}
