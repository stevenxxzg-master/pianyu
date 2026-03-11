import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
  fetchServer,
  fetchExtendedDescription,
  fetchDomainBlocks,
} from 'mastodon/actions/server';
import { Account } from 'mastodon/components/account';
import Column from 'mastodon/components/column';
import { ServerHeroImage } from 'mastodon/components/server_hero_image';
import { Skeleton } from 'mastodon/components/skeleton';
import {
  statusPageUrl,
  termsOfServiceEnabled,
} from 'mastodon/initial_state';
import { LinkFooter } from 'mastodon/features/ui/components/link_footer';
import { PublicPageLayout } from 'mastodon/features/ui/components/public_page_layout';
import { isValidUrl } from 'mastodon/utils/checks';

import { Section } from './components/section';
import { RulesSection } from './components/rules';

const messages = defineMessages({
  title: { id: 'column.about', defaultMessage: 'About' },
  eyebrow: { id: 'about.eyebrow', defaultMessage: 'Public server guide' },
  lede: {
    id: 'about.lede',
    defaultMessage:
      'Moderation standards, admin contacts, and federation context for {server}.',
  },
  navTitle: {
    id: 'public_page.nav_title',
    defaultMessage: 'Public pages',
  },
  navDescription: {
    id: 'public_page.nav_description',
    defaultMessage:
      'Cross-check the server overview, privacy commitments, and participation terms without losing your reading context.',
  },
  aboutDescription: {
    id: 'public_page.about_description',
    defaultMessage: 'Brand, moderation, and contact overview',
  },
  privacyDescription: {
    id: 'public_page.privacy_description',
    defaultMessage: 'Data collection, storage, and disclosure',
  },
  termsDescription: {
    id: 'public_page.terms_description',
    defaultMessage: 'Participation rules and service expectations',
  },
  statusLink: {
    id: 'public_page.status_link',
    defaultMessage: 'Need live service status? Visit the status page.',
  },
  blocks: { id: 'about.blocks', defaultMessage: 'Moderated servers' },
  silenced: {
    id: 'about.domain_blocks.silenced.title',
    defaultMessage: 'Limited',
  },
  silencedExplanation: {
    id: 'about.domain_blocks.silenced.explanation',
    defaultMessage:
      'You will generally not see profiles and content from this server, unless you explicitly look it up or opt into it by following.',
  },
  suspended: {
    id: 'about.domain_blocks.suspended.title',
    defaultMessage: 'Suspended',
  },
  suspendedExplanation: {
    id: 'about.domain_blocks.suspended.explanation',
    defaultMessage:
      'No data from this server will be processed, stored or exchanged, making any interaction or communication with users from this server impossible.',
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

const mapStateToProps = (state) => ({
  server: state.getIn(['server', 'server']),
  extendedDescription: state.getIn(['server', 'extendedDescription']),
  domainBlocks: state.getIn(['server', 'domainBlocks']),
});

class About extends PureComponent {
  static propTypes = {
    server: ImmutablePropTypes.map,
    extendedDescription: ImmutablePropTypes.map,
    domainBlocks: ImmutablePropTypes.contains({
      isLoading: PropTypes.bool,
      isAvailable: PropTypes.bool,
      items: ImmutablePropTypes.list,
    }),
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    multiColumn: PropTypes.bool,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchServer());
    dispatch(fetchExtendedDescription());
  }

  handleDomainBlocksOpen = () => {
    const { dispatch } = this.props;
    dispatch(fetchDomainBlocks());
  };

  render() {
    const { multiColumn, intl, server, extendedDescription, domainBlocks } =
      this.props;
    const isLoading = server.get('isLoading');
    const serverDomain = server.get('domain');
    const contactAccountId = server.getIn(['contact', 'account', 'id']);
    const navItems = [
      {
        to: '/about',
        label: intl.formatMessage(messages.title),
        description: intl.formatMessage(messages.aboutDescription),
        active: true,
      },
      {
        to: '/privacy-policy',
        label: intl.formatMessage({
          id: 'privacy_policy.title',
          defaultMessage: 'Privacy Policy',
        }),
        description: intl.formatMessage(messages.privacyDescription),
        rel: 'privacy-policy',
      },
      ...(termsOfServiceEnabled
        ? [
            {
              to: '/terms-of-service',
              label: intl.formatMessage({
                id: 'terms_of_service.title',
                defaultMessage: 'Terms of Service',
              }),
              description: intl.formatMessage(messages.termsDescription),
              rel: 'terms-of-service',
            },
          ]
        : []),
    ];

  const safeStatusPageUrl =
    statusPageUrl && isValidUrl(statusPageUrl, ['https:', 'http:'])
      ? statusPageUrl
      : undefined;

    return (
      <Column bindToDocument={!multiColumn} label={intl.formatMessage(messages.title)}>
        <PublicPageLayout
          asideDescription={intl.formatMessage(messages.navDescription)}
          asideFooter={
            safeStatusPageUrl ? (
              <a href={safeStatusPageUrl} rel='noopener' target='_blank'>
                {intl.formatMessage(messages.statusLink)}
              </a>
            ) : undefined
          }
          asideTitle={intl.formatMessage(messages.navTitle)}
          className='about'
          eyebrow={intl.formatMessage(messages.eyebrow)}
          feature={
            <div className='about__meta about__meta--featured'>
              <div className='about__meta__column'>
                <h4>
                  <FormattedMessage
                    id='server_banner.administered_by'
                    defaultMessage='Administered by:'
                  />
                </h4>

                {contactAccountId ? (
                  <Account id={contactAccountId} size={36} minimal />
                ) : (
                  <Skeleton width='15ch' />
                )}
              </div>

              <hr className='about__meta__divider' />

              <div className='about__meta__column'>
                <h4>
                  <FormattedMessage id='about.contact' defaultMessage='Contact:' />
                </h4>

                {isLoading ? (
                  <Skeleton width='14ch' />
                ) : (
                  <a className='about__mail' href={`mailto:${server.getIn(['contact', 'email'])}`}>
                    {server.getIn(['contact', 'email'])}
                  </a>
                )}
              </div>
            </div>
          }
          footer={
            <footer className='public-page__footer about__footer'>
              <LinkFooter multiColumn={multiColumn} />
              <p>
                <FormattedMessage
                  id='about.disclaimer'
                  defaultMessage='Mastodon is free, open-source software, and a trademark of Mastodon gGmbH.'
                />
              </p>
            </footer>
          }
          lede={
            <FormattedMessage
              id='about.lede'
              defaultMessage='Moderation standards, admin contacts, and federation context for {server}.'
              values={{ server: serverDomain || 'this server' }}
            />
          }
          media={
            <ServerHeroImage
              blurhash={server.getIn(['thumbnail', 'blurhash'])}
              className='about__hero-media'
              src={server.getIn(['thumbnail', 'url'])}
              srcSet={server
                .getIn(['thumbnail', 'versions'])
                ?.map((value, key) => `${value} ${key.replace('@', '')}`)
                .join(', ')}
            />
          }
          navItems={navItems}
          title={isLoading ? <Skeleton width='10ch' /> : serverDomain}
        >
          <Section open title={intl.formatMessage(messages.title)}>
            {extendedDescription.get('isLoading') ? (
              <div className='public-page__skeleton'>
                <Skeleton width='100%' />
                <Skeleton width='100%' />
                <Skeleton width='92%' />
                <Skeleton width='68%' />
              </div>
            ) : extendedDescription.get('content')?.length > 0 ? (
              <div
                className='prose'
                dangerouslySetInnerHTML={{ __html: extendedDescription.get('content') }}
              />
            ) : (
              <p>
                <FormattedMessage
                  id='about.not_available'
                  defaultMessage='This information has not been made available on this server.'
                />
              </p>
            )}
          </Section>

          <RulesSection />

          <Section
            title={intl.formatMessage(messages.blocks)}
            onOpen={this.handleDomainBlocksOpen}
          >
            {domainBlocks.get('isLoading') ? (
              <div className='public-page__skeleton'>
                <Skeleton width='100%' />
                <Skeleton width='78%' />
              </div>
            ) : domainBlocks.get('isAvailable') ? (
              <>
                <p>
                  <FormattedMessage
                    id='about.domain_blocks.preamble'
                    defaultMessage='Mastodon generally allows you to view content from and interact with users from any other server in the fediverse. These are the exceptions that have been made on this particular server.'
                  />
                </p>

                {domainBlocks.get('items').size > 0 && (
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
                )}
              </>
            ) : (
              <p>
                <FormattedMessage
                  id='about.not_available'
                  defaultMessage='This information has not been made available on this server.'
                />
              </p>
            )}
          </Section>
        </PublicPageLayout>

        <Helmet>
          <title>{intl.formatMessage(messages.title)}</title>
          <meta name='robots' content='all' />
        </Helmet>
      </Column>
    );
  }
}

export default connect(mapStateToProps)(injectIntl(About));
