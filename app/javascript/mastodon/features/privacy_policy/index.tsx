import { useState, useEffect } from 'react';

import { FormattedMessage, useIntl, defineMessages } from 'react-intl';

import { Helmet } from 'react-helmet';

import { apiGetPrivacyPolicy } from 'mastodon/api/instance';
import type { ApiPrivacyPolicyJSON } from 'mastodon/api_types/instance';
import { Column } from 'mastodon/components/column';
import { FormattedDateWrapper } from 'mastodon/components/formatted_date';
import { Skeleton } from 'mastodon/components/skeleton';
import { LinkFooter } from 'mastodon/features/ui/components/link_footer';
import { PublicPageLayout } from 'mastodon/features/ui/components/public_page_layout';
import {
  domain as siteDomain,
  statusPageUrl,
  termsOfServiceEnabled,
  title as siteTitle,
} from 'mastodon/initial_state';
import { isValidUrl } from 'mastodon/utils/checks';

const messages = defineMessages({
  title: { id: 'privacy_policy.title', defaultMessage: 'Privacy Policy' },
  eyebrow: {
    id: 'privacy_policy.eyebrow',
    defaultMessage: 'Data & privacy',
  },
  lede: {
    id: 'privacy_policy.lede',
    defaultMessage:
      'Understand how {server} collects, stores, and shares information across public pages, moderation workflows, and signed-in usage.',
  },
  featureLabel: {
    id: 'privacy_policy.feature_label',
    defaultMessage: 'Latest revision',
  },
  featureHint: {
    id: 'privacy_policy.feature_hint',
    defaultMessage:
      'This page covers personal data handling, moderation records, and disclosure expectations for the service.',
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
  featureUnavailable: {
    id: 'privacy_policy.feature_unavailable',
    defaultMessage: 'Unavailable',
  },
  unavailable: {
    id: 'privacy_policy.unavailable',
    defaultMessage: 'This privacy policy is currently unavailable.',
  },
});

const PrivacyPolicy: React.FC<{
  multiColumn: boolean;
}> = ({ multiColumn }) => {
  const intl = useIntl();
  const [response, setResponse] = useState<ApiPrivacyPolicyJSON>();
  const [loading, setLoading] = useState(true);
  const serverName = siteTitle ?? siteDomain ?? 'this server';

  useEffect(() => {
    apiGetPrivacyPolicy()
      .then((data) => {
        setResponse(data);
        setLoading(false);
        return '';
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const navItems = [
    {
      to: '/about',
      label: intl.formatMessage({
        id: 'column.about',
        defaultMessage: 'About',
      }),
      description: intl.formatMessage(messages.aboutDescription),
    },
    {
      to: '/privacy-policy',
      label: intl.formatMessage(messages.title),
      description: intl.formatMessage(messages.privacyDescription),
      active: true,
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
    <Column
      bindToDocument={!multiColumn}
      label={intl.formatMessage(messages.title)}
    >
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
        className='privacy-policy'
        eyebrow={intl.formatMessage(messages.eyebrow)}
        feature={
          <div className='public-page__summary'>
            <span className='public-page__summary__eyebrow'>
              {intl.formatMessage(messages.featureLabel)}
            </span>
            <strong>
              {loading ? (
                <Skeleton width='10ch' />
              ) : response ? (
                <FormattedDateWrapper
                  value={response.updated_at}
                  year='numeric'
                  month='short'
                  day='2-digit'
                />
              ) : (
                intl.formatMessage(messages.featureUnavailable)
              )}
            </strong>
            <p>{intl.formatMessage(messages.featureHint)}</p>
          </div>
        }
        footer={
          <footer className='public-page__footer'>
            <LinkFooter multiColumn={multiColumn} />
          </footer>
        }
        lede={intl.formatMessage(messages.lede, { server: serverName })}
        navItems={navItems}
        title={intl.formatMessage(messages.title)}
      >
        <div className='public-page__panel public-page__panel--document'>
          <div className='public-page__content'>
            {loading ? (
              <div className='public-page__skeleton'>
                <Skeleton width='100%' />
                <Skeleton width='100%' />
                <Skeleton width='92%' />
                <Skeleton width='72%' />
              </div>
            ) : response ? (
              <div
                className='public-page__document-body prose'
                dangerouslySetInnerHTML={{ __html: response.content }}
              />
            ) : (
              <p className='public-page__empty'>
                <FormattedMessage
                  id='privacy_policy.unavailable'
                  defaultMessage='This privacy policy is currently unavailable.'
                />
              </p>
            )}
          </div>
        </div>
      </PublicPageLayout>

      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name='robots' content='all' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default PrivacyPolicy;
