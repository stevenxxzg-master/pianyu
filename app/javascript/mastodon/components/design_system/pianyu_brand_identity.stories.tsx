import type { Meta, StoryObj } from '@storybook/react-vite';

import favicon32 from '@/icons/favicon-32x32.png';
import appIcon from '@/images/app-icon.svg';
import { IconLogo, SymbolLogo, WordmarkLogo } from 'mastodon/components/logo';

import styles from './pianyu_brand_identity.module.scss';

const meta = {
  title: 'Design System/M5/PianYu Brand Identity',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const namingRules = [
  {
    label: 'Primary lockup',
    title: '片语 with PianYu as the supporting Latin line',
    body: 'Use the bilingual lockup anywhere the product introduces itself: auth, public headers, app shell entry points, and reusable design references.',
  },
  {
    label: 'Metadata',
    title: 'Use `片语 PianYu` for browser-visible names',
    body: 'Page titles, manifest naming, and OG site names should keep both scripts together so the brand stays recognizable outside the UI chrome.',
  },
  {
    label: 'Compact label',
    title: 'Use `片语` when space is extremely constrained',
    body: 'Compact browser labels and icon-adjacent captions can shorten to the Chinese name, but should not introduce a third naming variant.',
  },
];

const surfaceRules = [
  {
    label: 'App shell',
    body: 'Lead the primary navigation rail with the full wordmark and switch to the icon only in dense column headers or compact breakpoints.',
  },
  {
    label: 'Auth',
    body: 'Keep the centered wordmark generous, paired with restrained copy and warm neutrals so the entry experience feels calm rather than corporate.',
  },
  {
    label: 'Public / About',
    body: 'Reuse the same lockup and metadata treatment so landing and informational pages feel like the same product, not a Mastodon default skin.',
  },
  {
    label: 'Browser assets',
    body: 'Use the layered-card glyph for favicons, app icons, mask icons, and badges, always on the warm sand palette.',
  },
];

const guardrails = {
  do: [
    'Keep surfaces light, airy, and editorial with quiet spacing.',
    'Let the indigo glyph carry authority and the warm accent carry warmth.',
    'Treat the icon like a layered note card, not a social-media mascot.',
  ],
  avoid: [
    'Do not reintroduce the Mastodon wordmark, mascot, or purple gradients.',
    'Do not split `片语` and `PianYu` into unrelated visual styles.',
    'Do not use the glyph as a noisy sticker or brightly saturated badge.',
  ],
};

export const Reference: Story = {
  render: () => (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>M5 Brand Foundation</span>
          <h1>片语 / PianYu</h1>
          <p>
            A quiet, modern identity built for low-pressure posting and a more
            thoughtful pace. The system centers on a layered-card glyph and a
            bilingual wordmark that can travel cleanly from app shell to public
            pages to browser chrome.
          </p>
          <div className={styles.wordmarkFrame}>
            <WordmarkLogo />
          </div>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.appIconCard}>
            <img
              src={appIcon}
              alt='片语 PianYu app icon'
              className={styles.appIcon}
            />
            <div>
              <span className={styles.cardLabel}>Browser asset</span>
              <strong>
                Warm sand background, indigo structure, one warm accent.
              </strong>
              <p>
                The icon should feel like a stack of thoughtful notes: soft,
                composed, and unmistakably different from the default Mastodon
                badge language.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Core Assets</span>
          <h2>One glyph, three main formats</h2>
          <p>
            The same layered-card construction carries the logo, favicon, and
            application icon so every surface feels intentionally related.
          </p>
        </div>

        <div className={styles.assetGrid}>
          <article className={styles.assetCard}>
            <span className={styles.cardLabel}>Wordmark</span>
            <div className={styles.assetWordmark}>
              <WordmarkLogo />
            </div>
            <p>
              Primary introduction mark for navigation, auth pages, and shared
              public headers.
            </p>
          </article>

          <article className={styles.assetCard}>
            <span className={styles.cardLabel}>Symbol</span>
            <div className={styles.assetSymbol}>
              <IconLogo />
              <SymbolLogo />
            </div>
            <p>
              Use the monochrome SVG in shell chrome and the full-color asset
              for standalone previews or noscript fallbacks.
            </p>
          </article>

          <article className={styles.assetCard}>
            <span className={styles.cardLabel}>Favicon / app icon</span>
            <div className={styles.assetBrowser}>
              <img
                src={favicon32}
                alt='片语 PianYu favicon preview'
                className={styles.favicon}
              />
              <img
                src={appIcon}
                alt='片语 PianYu mobile app icon preview'
                className={styles.appIconMini}
              />
            </div>
            <p>
              Always preserve the warm neutral field. It keeps the browser
              chrome feeling calm and editorial.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.sectionSplit}>
        <div>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Naming</span>
            <h2>Consistent bilingual treatment</h2>
          </div>
          <div className={styles.ruleStack}>
            {namingRules.map((rule) => (
              <article key={rule.label} className={styles.ruleCard}>
                <span>{rule.label}</span>
                <strong>{rule.title}</strong>
                <p>{rule.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Surface Usage</span>
            <h2>How the brand shows up across the product</h2>
          </div>
          <div className={styles.surfaceStack}>
            {surfaceRules.map((rule) => (
              <article key={rule.label} className={styles.surfaceCard}>
                <strong>{rule.label}</strong>
                <p>{rule.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionSplit}>
        <article className={styles.guardrailCard}>
          <span className={styles.eyebrow}>Do</span>
          <h2>Keep it quiet and precise</h2>
          <ul>
            {guardrails.do.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className={styles.guardrailCardWarning}>
          <span className={styles.eyebrow}>Avoid</span>
          <h2>Protect the new language</h2>
          <ul>
            {guardrails.avoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  ),
};
