import { useCallback, useEffect } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import GroupIcon from '@/material-icons/400-24px/group.svg?react';
import GroupsIcon from '@/material-icons/400-24px/groups.svg?react';
import LanguageIcon from '@/material-icons/400-24px/language.svg?react';
import MailIcon from '@/material-icons/400-24px/mail.svg?react';
import OpenInNewIcon from '@/material-icons/400-24px/open_in_new.svg?react';
import PublicIcon from '@/material-icons/400-24px/public.svg?react';
import TrendingUpIcon from '@/material-icons/400-24px/trending_up.svg?react';
import VisibilityIcon from '@/material-icons/400-24px/visibility.svg?react';
import { fetchServer, fetchExtendedDescription, fetchDomainBlocks } from 'mastodon/actions/server';
import { Account } from 'mastodon/components/account';
import Column from 'mastodon/components/column';
import { IconLogo } from 'mastodon/components/logo';
import { PublicAuthButtons } from 'mastodon/components/public_auth_buttons';
import { ServerHeroImage } from 'mastodon/components/server_hero_image';
import { ShortNumber } from 'mastodon/components/short_number';
import { Skeleton } from 'mastodon/components/skeleton';
import { LinkFooter } from 'mastodon/features/ui/components/link_footer';
import {
  localLiveFeedAccess,
  profile_directory as canProfileDirectory,
  statusPageUrl,
} from 'mastodon/initial_state';
import { useAppDispatch, useAppSelector } from 'mastodon/store';
import { isValidUrl } from 'mastodon/utils/checks';

import { Section } from './components/section';
import { RulesSection } from './components/rules';

const messages = defineMessages({
  title: { id: 'column.about', defaultMessage: 'About PianYu' },
  blocks: { id: 'about.blocks', defaultMessage: 'Moderated servers' },
  heroTitle: {
    id: 'public_home.hero.title',
    defaultMessage: 'A quieter home for public writing, local context, and calmer timelines.',
  },
  heroFallback: {
    id: 'public_home.hero.fallback',
    defaultMessage: 'PianYu brings a more deliberate community entrance to the open social web so people can read the room before they join it.',
  },
  heroEyebrow: {
    id: 'public_home.hero.eyebrow',
    defaultMessage: 'Quiet community / open web',
  },
  browseExamples: {
    id: 'public_home.cta.examples',
    defaultMessage: 'Browse public examples',
  },
  browseLocal: {
    id: 'public_home.cta.local',
    defaultMessage: 'See this server\'s pulse',
  },
  activeUsers: {
    id: 'public_home.stats.active_users',
    defaultMessage: 'active readers in the last 30 days',
  },
  discoverySurfaces: {
    id: 'public_home.stats.discovery_surfaces',
    defaultMessage: 'Public discovery',
  },
  discoveryValueLocal: {
    id: 'public_home.stats.discovery_value.local',
    defaultMessage: 'Trending + local pulse',
  },
  discoveryValueDirectory: {
    id: 'public_home.stats.discovery_value.directory',
    defaultMessage: 'Trending + directory',
  },
  communityGuidance: {
    id: 'public_home.stats.community_guidance',
    defaultMessage: 'Community guidance',
  },
  guidanceFallback: {
    id: 'public_home.stats.guidance_fallback',
    defaultMessage: 'About + support notes',
  },
  previewTitle: {
    id: 'public_home.preview.title',
    defaultMessage: 'What a first visit should make obvious',
  },
  previewDescription: {
    id: 'public_home.preview.description',
    defaultMessage: 'PianYu should feel composed, trustworthy, and quietly distinct before someone ever creates an account.',
  },
  previewReadTitle: {
    id: 'public_home.preview.read.title',
    defaultMessage: 'Read before you speak',
  },
  previewReadDescription: {
    id: 'public_home.preview.read.description',
    defaultMessage: 'The public surfaces let people understand tone, moderation, and local habits before committing to join.',
  },
  previewLocalTitle: {
    id: 'public_home.preview.local.title',
    defaultMessage: 'Local rhythm over noise',
  },
  previewLocalDescription: {
    id: 'public_home.preview.local.description',
    defaultMessage: 'Discovery emphasizes community pulse and thoughtful curation instead of a generic growth funnel.',
  },
  previewOpenTitle: {
    id: 'public_home.preview.open.title',
    defaultMessage: 'Open protocol, warmer shell',
  },
  previewOpenDescription: {
    id: 'public_home.preview.open.description',
    defaultMessage: 'The product still runs on the open social web, but the public entry now feels unmistakably like PianYu.',
  },
  showcaseTitle: {
    id: 'public_home.showcase.title',
    defaultMessage: 'Three ways to get a feel for the community',
  },
  showcaseDescription: {
    id: 'public_home.showcase.description',
    defaultMessage: 'From editorial discovery to the live community pulse, each public surface now acts like part of one modern home system.',
  },
  showcaseExploreTitle: {
    id: 'public_home.showcase.explore.title',
    defaultMessage: 'Editorial discovery',
  },
  showcaseExploreDescription: {
    id: 'public_home.showcase.explore.description',
    defaultMessage: 'See trending posts, links, and people through a quieter exploration flow.',
  },
  showcaseCommunityTitle: {
    id: 'public_home.showcase.community.title',
    defaultMessage: 'Local pulse',
  },
  showcaseCommunityDescription: {
    id: 'public_home.showcase.community.description',
    defaultMessage: 'Drop into the public timeline to understand how this server actually sounds in motion.',
  },
  showcaseNotebookTitle: {
    id: 'public_home.showcase.notebook.title',
    defaultMessage: 'Community notebook',
  },
  showcaseNotebookDescription: {
    id: 'public_home.showcase.notebook.description',
    defaultMessage: 'Review the server notes, rules, and moderation posture before taking part.',
  },
  notebookTitle: {
    id: 'public_home.notebook.title',
    defaultMessage: 'Community notes',
  },
  notebookFallback: {
    id: 'public_home.notebook.fallback',
    defaultMessage: 'This server has not published a longer introduction yet, so the public entry now carries the main brand narrative and onboarding cues.',
  },
  adminTitle: {
    id: 'public_home.admin.title',
    defaultMessage: 'Stewardship and support',
  },
  supportDescription: {
    id: 'public_home.admin.description',
    defaultMessage: 'The public entry keeps the essential trust links close at hand so first-time visitors can quickly verify who runs the space and how to get help.',
  },
  status: { id: 'footer.status', defaultMessage: 'Status' },
  directory: { id: 'footer.directory', defaultMessage: 'Profiles directory' },
  privacy: { id: 'footer.privacy_policy', defaultMessage: 'Privacy policy' },
  notAvailable: {
    id: 'about.not_available',
    defaultMessage: 'This information has not been made available on this server.',
  },
  silenced: { id: 'about.domain_blocks.silenced.title', defaultMessage: 'Limited' },
  silencedExplanation: {
    id: 'about.domain_blocks.silenced.explanation',
    defaultMessage: 'You will generally not see profiles and content from this server, unless you explicitly look it up or opt into it by following.',
  },
  suspended: { id: 'about.domain_blocks.suspended.title', defaultMessage: 'Suspended' },
  suspendedExplanation: {
    id: 'about.domain_blocks.suspended.explanation',
    defaultMessage: 'No data from this server will be processed, stored or exchanged, making any interaction or communication with users from this server impossible.',
  },
});

const severityMessages = {
  silence: {
    title: messages.silenced,
    explanation: messages.silencedExplanation,
  },
  suspend: {
    title: messages.suspended,
    explanation: messages.suspendedExplanation,
  },
};

const About = ({ multiColumn }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const server = useAppSelector((state) => state.getIn(['server', 'server']));
  const extendedDescription = useAppSelector((state) =>
    state.getIn(['server', 'extendedDescription']),
  );
  const domainBlocks = useAppSelector((state) =>
    state.getIn(['server', 'domainBlocks']),
  );

  useEffect(() => {
    dispatch(fetchServer());
    dispatch(fetchExtendedDescription());
  }, [dispatch]);

  const handleDomainBlocksOpen = useCallback(() => {
    dispatch(fetchDomainBlocks());
  }, [dispatch]);

  const isLoading = server.get('isLoading');
  const activeUsers = server.getIn(['usage', 'users', 'active_month']);
  const rulesCount = server.get('rules')?.size ?? 0;
  const showLocalPulse = localLiveFeedAccess === 'public';
  const safeStatusPageUrl =
    statusPageUrl && isValidUrl(statusPageUrl, ['https:', 'http:'])
      ? statusPageUrl
      : null;
  const description =
    !isLoading && server.get('description')
      ? server.get('description')
      : intl.formatMessage(messages.heroFallback);
  const contactEmail = server.getIn(['contact', 'email']);
  const contactAccountId = server.getIn(['contact', 'account', 'id']);
  const heroImageVersions = server
    .getIn(['thumbnail', 'versions'])
    ?.map((value, key) => `${value} ${key.replace('@', '')}`)
    .join(', ');

  const previewCards = [
    {
      icon: VisibilityIcon,
      title: intl.formatMessage(messages.previewReadTitle),
      description: intl.formatMessage(messages.previewReadDescription),
    },
    {
      icon: GroupsIcon,
      title: intl.formatMessage(messages.previewLocalTitle),
      description: intl.formatMessage(messages.previewLocalDescription),
    },
    {
      icon: LanguageIcon,
      title: intl.formatMessage(messages.previewOpenTitle),
      description: intl.formatMessage(messages.previewOpenDescription),
    },
  ];

  const showcaseCards = [
    {
      icon: TrendingUpIcon,
      title: intl.formatMessage(messages.showcaseExploreTitle),
      description: intl.formatMessage(messages.showcaseExploreDescription),
      href: '/explore',
      internal: true,
    },
    showLocalPulse
      ? {
          icon: PublicIcon,
          title: intl.formatMessage(messages.showcaseCommunityTitle),
          description: intl.formatMessage(messages.showcaseCommunityDescription),
          href: '/public/local',
          internal: true,
        }
      : {
          icon: GroupIcon,
          title: intl.formatMessage(messages.showcaseCommunityTitle),
          description: intl.formatMessage(messages.showcaseCommunityDescription),
          href: '/directory',
          internal: true,
        },
    {
      icon: MailIcon,
      title: intl.formatMessage(messages.showcaseNotebookTitle),
      description: intl.formatMessage(messages.showcaseNotebookDescription),
      href: '#community-briefing',
      internal: false,
    },
  ];

  return (
    <Column bindToDocument={!multiColumn} label={intl.formatMessage(messages.title)}>
      <div className='scrollable about'>
        <div className='public-home'>
          <section className='public-home__hero'>
            <div className='public-home__hero__content'>
              <div className='public-home__eyebrow'>
                <span className='public-home__eyebrow__line' />
                <FormattedMessage
                  id='public_home.hero.eyebrow.label'
                  defaultMessage='片语 · {label}'
                  values={{ label: intl.formatMessage(messages.heroEyebrow) }}
                />
              </div>

              <div className='public-home__hero__mark'>
                <IconLogo className='public-home__hero__mark-icon' />
              </div>

              <h1>{intl.formatMessage(messages.heroTitle)}</h1>
              <p>{description}</p>

              <div className='public-home__hero__actions'>
                <PublicAuthButtons className='public-home__auth' />

                <div className='public-home__hero__links'>
                  <Link to='/explore'>{intl.formatMessage(messages.browseExamples)}</Link>
                  {showLocalPulse && (
                    <Link to='/public/local'>
                      {intl.formatMessage(messages.browseLocal)}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className='public-home__hero__visual'>
              <ServerHeroImage
                blurhash={server.getIn(['thumbnail', 'blurhash'])}
                src={server.getIn(['thumbnail', 'url'])}
                srcSet={heroImageVersions}
                className='public-home__hero__image'
              />

              <div className='public-home__hero__cards'>
                <div className='public-home__stat-card'>
                  <span className='public-home__stat-card__label'>
                    {intl.formatMessage(messages.activeUsers)}
                  </span>
                  <strong>
                    {isLoading ? (
                      <Skeleton width='6ch' />
                    ) : (
                      <ShortNumber value={activeUsers || 0} />
                    )}
                  </strong>
                </div>

                <div className='public-home__stat-card'>
                  <span className='public-home__stat-card__label'>
                    {intl.formatMessage(messages.discoverySurfaces)}
                  </span>
                  <strong>
                    {intl.formatMessage(
                      showLocalPulse
                        ? messages.discoveryValueLocal
                        : messages.discoveryValueDirectory,
                    )}
                  </strong>
                </div>

                <div className='public-home__stat-card'>
                  <span className='public-home__stat-card__label'>
                    {intl.formatMessage(messages.communityGuidance)}
                  </span>
                  <strong>
                    {rulesCount > 0 ? (
                      <FormattedMessage
                        id='public_home.stats.rule_count'
                        defaultMessage='{count, plural, one {# community rule} other {# community rules}}'
                        values={{ count: rulesCount }}
                      />
                    ) : (
                      intl.formatMessage(messages.guidanceFallback)
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section className='public-home__section'>
            <div className='public-home__section__intro'>
              <p className='public-home__section__eyebrow'>
                <FormattedMessage
                  id='public_home.preview.eyebrow'
                  defaultMessage='Brand direction'
                />
              </p>
              <h2>{intl.formatMessage(messages.previewTitle)}</h2>
              <p>{intl.formatMessage(messages.previewDescription)}</p>
            </div>

            <div className='public-home__feature-grid'>
              {previewCards.map((card) => {
                const IconComponent = card.icon;

                return (
                  <article className='public-home__feature-card' key={card.title}>
                    <div className='public-home__feature-card__icon'>
                      <IconComponent />
                    </div>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className='public-home__section'>
            <div className='public-home__section__intro'>
              <p className='public-home__section__eyebrow'>
                <FormattedMessage
                  id='public_home.showcase.eyebrow'
                  defaultMessage='Public surfaces'
                />
              </p>
              <h2>{intl.formatMessage(messages.showcaseTitle)}</h2>
              <p>{intl.formatMessage(messages.showcaseDescription)}</p>
            </div>

            <div className='public-home__showcase-grid'>
              {showcaseCards.map((card) => {
                const IconComponent = card.icon;
                const cardBody = (
                  <>
                    <div className='public-home__showcase-card__icon'>
                      <IconComponent />
                    </div>
                    <div className='public-home__showcase-card__content'>
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                    </div>
                    <OpenInNewIcon className='public-home__showcase-card__arrow' />
                  </>
                );

                return card.internal ? (
                  <Link className='public-home__showcase-card' key={card.title} to={card.href}>
                    {cardBody}
                  </Link>
                ) : (
                  <a className='public-home__showcase-card' key={card.title} href={card.href}>
                    {cardBody}
                  </a>
                );
              })}
            </div>
          </section>

          <div className='public-home__detail-grid' id='community-briefing'>
            <section className='public-home__panel' id='community-notes'>
              <div className='public-home__panel__header'>
                <p className='public-home__section__eyebrow'>
                  <FormattedMessage
                    id='public_home.notebook.eyebrow'
                    defaultMessage='Community writing'
                  />
                </p>
                <h2>{intl.formatMessage(messages.notebookTitle)}</h2>
              </div>

              {extendedDescription.get('isLoading') ? (
                <div className='public-home__panel__skeleton'>
                  <Skeleton width='100%' />
                  <Skeleton width='100%' />
                  <Skeleton width='70%' />
                </div>
              ) : extendedDescription.get('content')?.length > 0 ? (
                <div
                  className='prose public-home__prose'
                  dangerouslySetInnerHTML={{
                    __html: extendedDescription.get('content'),
                  }}
                />
              ) : (
                <p className='public-home__panel__empty'>
                  {intl.formatMessage(messages.notebookFallback)}
                </p>
              )}
            </section>

            <section className='public-home__panel public-home__panel--support'>
              <div className='public-home__panel__header'>
                <p className='public-home__section__eyebrow'>
                  <FormattedMessage
                    id='public_home.admin.eyebrow'
                    defaultMessage='Trust layer'
                  />
                </p>
                <h2>{intl.formatMessage(messages.adminTitle)}</h2>
                <p>{intl.formatMessage(messages.supportDescription)}</p>
              </div>

              <div className='public-home__support-grid'>
                <article className='public-home__support-card'>
                  <span className='public-home__support-card__label'>
                    <FormattedMessage
                      id='server_banner.administered_by'
                      defaultMessage='Administered by:'
                    />
                  </span>
                  {contactAccountId ? (
                    <Account id={contactAccountId} size={36} minimal />
                  ) : (
                    <p>{intl.formatMessage(messages.notAvailable)}</p>
                  )}
                </article>

                <article className='public-home__support-card'>
                  <span className='public-home__support-card__label'>
                    <FormattedMessage id='about.contact' defaultMessage='Contact:' />
                  </span>
                  {isLoading ? (
                    <Skeleton width='12ch' />
                  ) : contactEmail ? (
                    <a className='public-home__support-link' href={`mailto:${contactEmail}`}>
                      {contactEmail}
                    </a>
                  ) : (
                    <p>{intl.formatMessage(messages.notAvailable)}</p>
                  )}
                </article>

                {safeStatusPageUrl && (
                  <article className='public-home__support-card'>
                    <span className='public-home__support-card__label'>
                      {intl.formatMessage(messages.status)}
                    </span>
                    <a className='public-home__support-link' href={safeStatusPageUrl} rel='noopener' target='_blank'>
                      {safeStatusPageUrl}
                    </a>
                  </article>
                )}

                {canProfileDirectory && (
                  <article className='public-home__support-card'>
                    <span className='public-home__support-card__label'>
                      {intl.formatMessage(messages.directory)}
                    </span>
                    <Link className='public-home__support-link' to='/directory'>
                      <FormattedMessage
                        id='public_home.directory.link'
                        defaultMessage='Browse member profiles'
                      />
                    </Link>
                  </article>
                )}

                <article className='public-home__support-card'>
                  <span className='public-home__support-card__label'>
                    {intl.formatMessage(messages.privacy)}
                  </span>
                  <Link className='public-home__support-link' to='/privacy-policy'>
                    <FormattedMessage
                      id='public_home.privacy.link'
                      defaultMessage='Read data and privacy notes'
                    />
                  </Link>
                </article>
              </div>
            </section>
          </div>

          <div id='community-guidelines'>
            <RulesSection />
          </div>

          <Section
            title={intl.formatMessage(messages.blocks)}
            onOpen={handleDomainBlocksOpen}
          >
            {domainBlocks.get('isLoading') ? (
              <div className='public-home__panel__skeleton'>
                <Skeleton width='100%' />
                <Skeleton width='80%' />
              </div>
            ) : domainBlocks.get('isAvailable') ? (
              <>
                <p className='public-home__section-copy'>
                  <FormattedMessage
                    id='about.domain_blocks.preamble'
                    defaultMessage='Mastodon generally allows you to view content from and interact with users from any other server in the fediverse. These are the exceptions that have been made on this particular server.'
                  />
                </p>

                {domainBlocks.get('items').size > 0 ? (
                  <div className='about__domain-blocks'>
                    {domainBlocks.get('items').map((block) => (
                      <div className='about__domain-blocks__domain' key={block.get('domain')}>
                        <div className='about__domain-blocks__domain__header'>
                          <h6>
                            <span title={`SHA-256: ${block.get('digest')}`}>
                              {block.get('domain')}
                            </span>
                          </h6>
                          <span
                            className='about__domain-blocks__domain__type'
                            title={intl.formatMessage(
                              severityMessages[block.get('severity')].explanation,
                            )}
                          >
                            {intl.formatMessage(
                              severityMessages[block.get('severity')].title,
                            )}
                          </span>
                        </div>

                        <p>
                          {(block.get('comment') || '').length > 0 ? (
                            block.get('comment')
                          ) : (
                            <FormattedMessage
                              id='about.domain_blocks.no_reason_available'
                              defaultMessage='Reason not available'
                            />
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='public-home__panel__empty'>
                    <FormattedMessage
                      id='about.domain_blocks.none'
                      defaultMessage='No moderated servers are publicly listed right now.'
                    />
                  </p>
                )}
              </>
            ) : (
              <p className='public-home__panel__empty'>
                {intl.formatMessage(messages.notAvailable)}
              </p>
            )}
          </Section>
        </div>

        <LinkFooter multiColumn={multiColumn} />

        <div className='about__footer'>
          <p>
            <FormattedMessage
              id='about.disclaimer'
              defaultMessage='Mastodon is free, open-source software, and a trademark of Mastodon gGmbH.'
            />
          </p>
        </div>
      </div>

      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name='robots' content='all' />
      </Helmet>
    </Column>
  );
};

export default About;
