import StoryExperience from '@/components/StoryExperience';
import Link from 'next/link';
import data from '@/content/data.json';

export default function Home() {
  return (
    <main id="main">
      {/* 4K Cinematic Scroll-Controlled Story Experience */}
      <StoryExperience />

      {/* Chapter 02 in Homepage Overview / The People */}
      <section className="story section light" id="story">
        <div data-reveal>
          <p className="eyebrow">02 / THE PEOPLE</p>
          <h2>
            Two bartenders.
            <br />
            One very
            <br />
            <em>big vision.</em>
          </h2>
        </div>
        <div className="story-copy" data-reveal>
          <span className="ornament">BC /</span>
          <p>
            We create the experience around the bar — from the cocktail and presentation to the
            service, interaction and overall guest journey.
          </p>
          <p>
            Founded by Monish Raj D A and Bharath Venkatesh, Bar Chef Bengaluru brings together
            cocktail creativity, hospitality and thoughtful preparation.
          </p>
          <Link className="text-link" href="/about">
            Meet the story behind the bar ↗
          </Link>
        </div>
      </section>

      {/* Cocktail Lab / The Craft */}
      <section className="craft section" id="craft">
        <p className="eyebrow" data-reveal>
          03 / THE CRAFT
        </p>
        <h2 data-reveal>
          Where ideas
          <br />
          become <em>experiences.</em>
        </h2>
        <div className="craft-bottom">
          <p>
            Every flavour. Every garnish. Every detail.
            <br />
            Our Cocktail Lab is where ideas are explored,
            <br />
            tested and refined before they reach your event.
          </p>
          <Link href="/about#our-cocktail-lab" className="button">
            Inside the Cocktail Lab ↗
          </Link>
        </div>
      </section>

      {/* Experiences & Occasions */}
      <section className="section" id="experiences">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">04 / YOUR OCCASION</p>
            <h2>
              Every occasion.
              <br />
              <em>A different story.</em>
            </h2>
          </div>
          <p>
            The people. The place. The atmosphere.
            <br />
            We build the bar around it.
          </p>
        </div>
        <div className="service-list">
          {data.services.map((s, i) => (
            <Link data-reveal href={'/services/' + s.slug} className="service-row" key={s.slug}>
              <span className="number">0{i + 1}</span>
              <h3>{s.title}</h3>
              <span className="service-tag">{s.tagline}</span>
              <span className="arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Behind The Experience */}
      <section className="section light">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">05 / BEHIND THE EXPERIENCE</p>
            <h2>
              Effortless takes
              <br />
              <em>preparation.</em>
            </h2>
          </div>
          <p>
            What guests see is only the final part.
            <br />
            Behind it: preparation, logistics, bar layout,
            <br />
            team coordination and attention to detail.
          </p>
        </div>
        <div className="pillars">
          {['Think creatively.', 'Plan thoroughly.', 'Execute professionally.'].map((x, i) => (
            <div key={x} data-reveal>
              <span>0{i + 1}</span>
              <h3>{x}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Journal */}
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FROM THE JOURNAL</p>
            <h2>
              A little <em>inspiration.</em>
            </h2>
          </div>
          <Link href="/blogs" className="text-link">
            All stories ↗
          </Link>
        </div>
        <div className="journal-grid">
          {data.blogs.slice(0, 3).map((b, i) => (
            <Link className="journal-card" href={'/blogs/' + b.slug} key={b.slug}>
              <span className="eyebrow">
                0{i + 1} / {b.category}
              </span>
              <h3>{b.title}</h3>
              <span>Read story ↗</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
