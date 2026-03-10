import type { Meta, StoryObj } from '@storybook/react-vite';

import styles from './m5_visual_direction.module.scss';

interface KeySignal {
  label: string;
  value: string;
}

interface Principle {
  title: string;
  body: string;
}

interface PaletteSwatch {
  name: string;
  hex: string;
  usage: string;
}

interface DensityRule {
  tier: string;
  spacing: string;
  description: string;
}

interface PageRecipe {
  title: string;
  summary: string;
  rules: string[];
}

interface Guardrail {
  title: string;
  points: string[];
  tone?: 'avoid';
}

interface MotionRule {
  label: string;
  timing: string;
  guidance: string;
}

const keySignals: KeySignal[] = [
  {
    label: 'Light-led surfaces',
    value:
      'Keep roughly 85-90% of every screen in paper, mist, or soft neutral fills.',
  },
  {
    label: 'Accent budget',
    value:
      'Use one restrained accent family per screen. Saturation signals intent, not decoration.',
  },
  {
    label: 'Card rhythm',
    value:
      'Radius 20-24px, 1px low-contrast border, soft lift only when separation is needed.',
  },
  {
    label: 'Motion ceiling',
    value:
      'Favor opacity and short translateY moves under 12px; avoid looping spectacle.',
  },
];

const principles: Principle[] = [
  {
    title: 'Quiet confidence',
    body: 'The interface feels composed and self-assured. It should read as premium because it is edited down, not because it is loud.',
  },
  {
    title: 'Modern without platform aggression',
    body: 'Borrow editorial calm, measured spacing, and product clarity from modern AI tools, but never copy their gradients, silhouettes, or CTA signatures.',
  },
  {
    title: 'Fanfou calm stays intact',
    body: 'Preserve the low-pressure, reflective atmosphere. Priority comes from typography and spacing rather than badges, motion, or alarm colors.',
  },
  {
    title: 'Readable at a glance',
    body: 'Every screen needs one primary message, one supporting layer, and subdued utilities. If two blocks compete, remove one emphasis level.',
  },
];

const palette: PaletteSwatch[] = [
  {
    name: 'Paper',
    hex: '#f7f3ec',
    usage: 'Default canvas for pages, settings surfaces, and large sections.',
  },
  {
    name: 'Mist',
    hex: '#ece6db',
    usage: 'Secondary panels, section bands, and quiet grouping backgrounds.',
  },
  {
    name: 'Stone line',
    hex: '#d6cec0',
    usage: 'Hairline borders, dividers, and low-pressure focus frames.',
  },
  {
    name: 'Ink',
    hex: '#1f2530',
    usage: 'Primary text, strong titles, and high-confidence UI anchors.',
  },
  {
    name: 'Slate',
    hex: '#5c687c',
    usage: 'Secondary text, metadata, and supporting icons.',
  },
  {
    name: 'Deep river',
    hex: '#29425d',
    usage:
      'Primary accent for key actions, links, and active navigation states.',
  },
  {
    name: 'Sage',
    hex: '#66745f',
    usage: 'Success and affirmation states without neon energy.',
  },
  {
    name: 'Amber clay',
    hex: '#a47643',
    usage: 'Warnings, counters, and warm data emphasis.',
  },
];

const densityRules: DensityRule[] = [
  {
    tier: 'Hero / intro',
    spacing: '40-56px gaps',
    description:
      'Use large breathing room for orientation moments, section intros, and landing surfaces.',
  },
  {
    tier: 'Primary content',
    spacing: '24-32px gaps',
    description:
      'Default rhythm for feed containers, settings sections, and profile modules.',
  },
  {
    tier: 'Utility rows',
    spacing: '12-16px gaps',
    description:
      'Reserve tighter density for metadata, filters, and table-like controls. Never use this tier for the full page.',
  },
];

const hierarchyRules: Principle[] = [
  {
    title: 'One dominant title per viewport',
    body: 'If a page already has a page title, cards inside it step down to sectional headings rather than competing headline styles.',
  },
  {
    title: 'Metadata stays quiet',
    body: 'Timestamps, counters, and helper text live in muted tones and smaller sizes. They support scanning but never outrank the main idea.',
  },
  {
    title: 'Actions follow commitment',
    body: 'Primary actions appear only after the user understands the content. Avoid multiple filled CTAs in the same block.',
  },
];

const cardGrammar: Principle[] = [
  {
    title: 'Cards are shells, not billboards',
    body: 'Use cards to gather related content with gentle radius, soft borders, and quiet shadows. Do not stack multiple decorative treatments in one container.',
  },
  {
    title: 'One card, one emphasis move',
    body: 'Choose either a tonal background shift, a border emphasis, or a compact accent chip. Never combine all three as the default.',
  },
  {
    title: 'Utility belongs on the edge',
    body: 'Secondary controls, counts, and status labels should sit in rails or corners so the center area can remain readable and calm.',
  },
];

const motionRules: MotionRule[] = [
  {
    label: 'Hover / focus',
    timing: '120-160ms',
    guidance:
      'Use short color, shadow, and 2-4px lift adjustments to confirm interactivity without sparkle.',
  },
  {
    label: 'Enter / reveal',
    timing: '180-220ms',
    guidance:
      'Favor fade plus 8-12px translateY. Stagger only section-level groups, not every atom on the page.',
  },
  {
    label: 'Overlays / modals',
    timing: '220-280ms',
    guidance:
      'Dim the background, scale sparingly, and keep easing soft. Overlays should settle, not bounce.',
  },
  {
    label: 'Never do',
    timing: '0 loops',
    guidance:
      'No infinite shimmer, marquee drift, oversized parallax, or celebratory motion in default product flows.',
  },
];

const pageRecipes: PageRecipe[] = [
  {
    title: 'Feed and timeline pages',
    summary:
      'Quiet scrolling stacks with one strong anchor and restrained supporting chrome.',
    rules: [
      'Keep the reading column visually dominant and let side rails recede through mist surfaces.',
      'Group filters and composer affordances near the top; do not scatter action clusters between cards.',
      'Use cards to separate content states only when whitespace alone is insufficient.',
    ],
  },
  {
    title: 'Profile and identity pages',
    summary:
      'Lead with presence, not spectacle. The account header should feel editorial and spacious.',
    rules: [
      'Prefer large typography, subtle avatar framing, and one accent action over decorative hero art.',
      'Metrics and badges should read as supporting evidence rather than the hero of the page.',
      'Pinned modules stack in quiet rails with shared card grammar.',
    ],
  },
  {
    title: 'Settings and management flows',
    summary:
      'Structured, low-stress control surfaces with clear sectioning and generous labels.',
    rules: [
      'Use consistent section bands, form spacing, and calm dividers to reduce cognitive switching.',
      'Warnings appear through tone and placement rather than large red blocks unless the action is destructive.',
      'Primary save actions stay stable in position; inline actions remain subtle.',
    ],
  },
  {
    title: 'Compose and creation paths',
    summary:
      'Support expression while keeping the surrounding chrome silent and supportive.',
    rules: [
      'The input area is the visual center; metadata, suggestions, and attachments step down in contrast.',
      'Show only the next relevant control cluster. Hide optional affordances until needed.',
      'Success should feel reassuring and concise, never confetti-like.',
    ],
  },
];

const guardrails: Guardrail[] = [
  {
    title: 'Preserve',
    points: [
      'Soft light backgrounds with visible but low-contrast structure.',
      'Editorial typography, calm spacing, and deliberate action placement.',
      'Muted state colors that communicate without stress.',
      'A sense of solitude and reflection borrowed from Fanfou-era quiet social products.',
    ],
  },
  {
    title: 'Avoid',
    tone: 'avoid',
    points: [
      'Full-bleed saturated gradients, neon accents, or gaming-like glow.',
      'Three or more equally strong cards or CTAs fighting in one viewport.',
      'Feed designs that resemble high-stimulation content platforms.',
      'Branded assets, icon silhouettes, or layout signatures lifted from reference products.',
    ],
  },
];

const borrowSignals: string[] = [
  'Atmosphere: editorial calm, measured whitespace, and product confidence.',
  'Structure: clear reading rails, obvious hierarchy, and reduced chrome noise.',
  'Interaction tone: restrained motion, steady transitions, and purposeful defaults.',
];

const doNotCopySignals: string[] = [
  'Wordmarks, logos, icon silhouettes, or mascot cues.',
  'Signature gradients, exact CTA styling, or distinctive hero compositions.',
  'Page skeletons that make the product feel like a clone rather than a neighbor.',
];

interface SectionTitleProps {
  eyebrow: string;
  title: string;
  body: string;
}

const SectionTitle = ({ eyebrow, title, body }: SectionTitleProps) => {
  return (
    <div className={styles.sectionHeader}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
};

const M5VisualDirectionPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>M5 visual direction</span>
          <h1>
            Light, restrained, premium, and modern - without losing quietness.
          </h1>
          <p>
            This page is the executable design brief for M5. It translates mood
            into front-end rules so future page work can align on layout,
            hierarchy, card grammar, and motion boundaries without drifting.
          </p>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.compositionCard}>
            <div className={styles.compositionHeader}>
              <span>North star composition</span>
              <span>calm, edited, clear</span>
            </div>
            <div className={styles.compositionBody}>
              <div className={styles.compositionPrimary}>
                <span className={styles.cardKicker}>Primary message</span>
                <strong>
                  Lead with one strong idea and let secondary content breathe.
                </strong>
                <p>
                  Surfaces stay light. Contrast comes from ink text, measured
                  spacing, and one deep accent rather than decorative noise.
                </p>
              </div>
              <div className={styles.compositionRail}>
                <div />
                <div />
                <div />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <SectionTitle
          eyebrow='Mood'
          title='North-star signals'
          body='If a future screen fails more than one of these signals, it is probably drifting away from M5.'
        />
        <div className={styles.signalGrid}>
          {keySignals.map((signal) => (
            <article className={styles.signalCard} key={signal.label}>
              <h3>{signal.label}</h3>
              <p>{signal.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle
          eyebrow='Principles'
          title='The feel to preserve'
          body='These principles define the emotional baseline before any individual component or page pattern is designed.'
        />
        <div className={styles.principleGrid}>
          {principles.map((principle) => (
            <article className={styles.principleCard} key={principle.title}>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle
          eyebrow='Color'
          title='Color emotion and accent discipline'
          body='The palette stays warm-neutral and paper-led. Color should guide reading and intent, never create pressure by itself.'
        />
        <div className={styles.paletteGrid}>
          {palette.map((swatch) => (
            <article className={styles.swatch} key={swatch.name}>
              <div
                className={styles.swatchColor}
                style={{ backgroundColor: swatch.hex }}
              />
              <div>
                <h3>{swatch.name}</h3>
                <span>{swatch.hex}</span>
                <p>{swatch.usage}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sectionSplit}>
        <div className={styles.sectionColumn}>
          <SectionTitle
            eyebrow='Spacing'
            title='Whitespace and density'
            body='Density should step down intentionally. The product feels premium because it edits itself, not because it wastes space.'
          />
          <div className={styles.ruleStack}>
            {densityRules.map((rule) => (
              <article className={styles.ruleCard} key={rule.tier}>
                <div>
                  <span className={styles.ruleLabel}>{rule.tier}</span>
                  <strong>{rule.spacing}</strong>
                </div>
                <p>{rule.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.sectionColumn}>
          <SectionTitle
            eyebrow='Hierarchy'
            title='Information order'
            body='Typography and placement create importance. Alerts, colors, and badges only reinforce what the layout already makes clear.'
          />
          <div className={styles.ruleStack}>
            {hierarchyRules.map((rule) => (
              <article className={styles.ruleCard} key={rule.title}>
                <div>
                  <span className={styles.ruleLabel}>Rule</span>
                  <strong>{rule.title}</strong>
                </div>
                <p>{rule.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionSplit}>
        <div className={styles.sectionColumn}>
          <SectionTitle
            eyebrow='Card grammar'
            title='How containers should behave'
            body='Cards exist to reduce ambiguity and organize information, not to make the UI louder.'
          />
          <div className={styles.ruleStack}>
            {cardGrammar.map((rule) => (
              <article className={styles.ruleCard} key={rule.title}>
                <div>
                  <span className={styles.ruleLabel}>Card rule</span>
                  <strong>{rule.title}</strong>
                </div>
                <p>{rule.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.sectionColumn}>
          <div className={styles.cardExample}>
            <div className={styles.cardExampleHeader}>
              <span className={styles.cardKicker}>Card anatomy</span>
              <span>single emphasis, quiet utilities</span>
            </div>
            <strong>Profile summary</strong>
            <p>
              The headline and body do the talking. Status, metadata, and tools
              sit in the edges with muted contrast.
            </p>
            <div className={styles.cardMetaRow}>
              <span>Edited spacing</span>
              <span>1 accent</span>
              <span>Subtle lift</span>
            </div>
            <div className={styles.cardActionRow}>
              <button type='button'>Primary action</button>
              <button type='button'>Secondary</button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle
          eyebrow='Motion'
          title='Animation boundaries'
          body='Motion should reassure and orient. If it calls attention to itself, it is already too strong for the default product experience.'
        />
        <div className={styles.motionGrid}>
          {motionRules.map((rule) => (
            <article className={styles.motionCard} key={rule.label}>
              <span>{rule.label}</span>
              <strong>{rule.timing}</strong>
              <p>{rule.guidance}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle
          eyebrow='Page playbook'
          title='Direction for key page types'
          body='These page recipes remove high-impact ambiguity for the next M5 tasks.'
        />
        <div className={styles.recipeGrid}>
          {pageRecipes.map((recipe) => (
            <article className={styles.recipeCard} key={recipe.title}>
              <div className={styles.recipeFrame}>
                <div className={styles.recipeColumn}>
                  <div className={styles.recipeLineLg} />
                  <div className={styles.recipeLine} />
                  <div className={styles.recipeBlock} />
                </div>
                <div className={styles.recipeRail}>
                  <div className={styles.recipeLine} />
                  <div className={styles.recipeBlock} />
                </div>
              </div>
              <h3>{recipe.title}</h3>
              <p>{recipe.summary}</p>
              <ul>
                {recipe.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sectionSplit}>
        <div className={styles.sectionColumn}>
          <SectionTitle
            eyebrow='Guardrails'
            title='Keep the calm, reject the noise'
            body='This is where the M5 direction stays aligned with the older Fanfou-like emotional baseline.'
          />
          <div className={styles.guardrailGrid}>
            {guardrails.map((entry) => (
              <article
                className={
                  entry.tone === 'avoid'
                    ? styles.guardrailCardAvoid
                    : styles.guardrailCard
                }
                key={entry.title}
              >
                <h3>{entry.title}</h3>
                <ul>
                  {entry.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.sectionColumn}>
          <SectionTitle
            eyebrow='Reference boundary'
            title='Use reference products as mood boards, not templates'
            body='openai.com and Codex for mac can inform the emotional register, but the shipped product must remain unmistakably PianYu.'
          />
          <div className={styles.referenceGrid}>
            <article className={styles.referenceCard}>
              <h3>Safe to borrow</h3>
              <ul>
                {borrowSignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </article>
            <article className={styles.referenceCardWarning}>
              <h3>Must not copy</h3>
              <ul>
                {doNotCopySignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};

const meta = {
  title: 'Design System/M5/Visual Direction',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['test'],
  render() {
    return <M5VisualDirectionPage />;
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Reference: Story = {};
