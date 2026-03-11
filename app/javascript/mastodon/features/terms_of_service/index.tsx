import { useState, useEffect } from 'react';

import {
  FormattedDate,
  FormattedMessage,
  useIntl,
  defineMessages,
} from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';

import { apiGetTermsOfService } from 'mastodon/api/instance';
import type { ApiTermsOfServiceJSON } from 'mastodon/api_types/instance';
import { Column } from 'mastodon/components/column';
import { Skeleton } from 'mastodon/components/skeleton';
import {
  domain as siteDomain,
  statusPageUrl,
  title as siteTitle,
} from 'mastodon/initial_state';
import { LinkFooter } from 'mastodon/features/ui/components/link_footer';
import { PublicPageLayout } from 'mastodon/features/ui/components/public_page_layout';

const messages = defineMessages({
  title: { id: 'terms_of_service.title', defaultMessage: 'Terms of Service' },
  eyebrow: {
    id: 'terms_of_service.eyebrow',
    defaultMessage: 'Participation rules',
  },
  lede: {
    id: 'terms_of_service.lede',
    defaultMessage:
      'Review the commitments, moderation expectations, and account access rules that shape participation on {server}.',
  },
  featureLabel: {
    id: 'terms_of_service.feature_label',
    defaultMessage: 'Policy timeline',
  },
  featureHint: {
    id: 'terms_of_service.feature_hint',
    defaultMessage:
      'Use the dated revision link to preview upcoming changes without losing access to the current policy.',
  },
  featureUnavailable: {
    id: 'terms_of_service.feature_unavailable',
    defaultMessage: 'Unavailable',
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
  unavailable: {
    id: 'terms_of_service.unavailable',
    defaultMessage: 'This terms of service page is currently unavailable.',
  },
  revisionUnavailable: {
    id: 'terms_of_service.revision_unavailable',
    defaultMessage: 'The requested terms revision is currently unavailable.',
  },
});

interface Params {
  date?: string;
}

const TermsOfService: React.FC<{
  multiColumn: boolean;
}> = ({ multiColumn }) => {
  const intl = useIntl();
  const { date } = useParams<Params>();
  const [response, setResponse] = useState<ApiTermsOfServiceJSON>();
  const [loading, setLoading] = useState(true);
  const serverName = siteTitle ?? siteDomain ?? 'this server';

  useEffect(() => {
    apiGetTermsOfService(date)
      .then((data) => {
        setResponse(data);
        setLoading(false);
        return '';
      })
      .catch(() => {
        setLoading(false);
      });
  }, [date]);

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
      label: intl.formatMessage({
        id: 'privacy_policy.title',
        defaultMessage: 'Privacy Policy',
      }),
      description: intl.formatMessage(messages.privacyDescription),
      rel: 'privacy-policy',
    },
    {
      to: '/terms-of-service',
      label: intl.formatMessage(messages.title),
      description: intl.formatMessage(messages.termsDescription),
      active: true,
      rel: 'terms-of-service',
    },
  ];

  return (
    <Column
      bindToDocument={!multiColumn}
      label={intl.formatMessage(messages.title)}
    >
      <PublicPageLayout
        asideDescription={intl.formatMessage(messages.navDescription)}
        asideFooter={
          statusPageUrl ? (
            <a href={statusPageUrl} rel='noopener' target='_blank'>
              {intl.formatMessage(messages.statusLink)}
            </a>
          ) : undefined
        }
        asideTitle={intl.formatMessage(messages.navTitle)}
        className='terms-of-service'
        eyebrow={intl.formatMessage(messages.eyebrow)}
        feature={
          <div className='public-page__summary'>
            <span className='public-page__summary__eyebrow'>
              {intl.formatMessage(messages.featureLabel)}
            </span>
            <strong>
              {loading ? (
                <Skeleton width='12ch' />
              ) : response?.effective ? (
                <FormattedMessage
                  id='privacy_policy.last_updated'
                  defaultMessage='Last updated {date}'
                  values={{
                    date: (
                      <FormattedDate
                        value={response.effective_date}
                        year='numeric'
                        month='short'
                        day='2-digit'
                      />
                    ),
                  }}
                />
              ) : !response ? (
                intl.formatMessage(messages.featureUnavailable)
              ) : (
                <FormattedMessage
                  id='terms_of_service.effective_as_of'
                  defaultMessage='Effective as of {date}'
                  values={{
                    date: (
                      <FormattedDate
                        value={response.effective_date}
                        year='numeric'
                        month='short'
                        day='2-digit'
                      />
                    ),
                  }}
                />
              )}
            </strong>
            <p>{intl.formatMessage(messages.featureHint)}</p>
            {response?.succeeded_by && (
              <Link
                className='public-page__summary__link'
                to={`/terms-of-service/${response.succeeded_by}`}
              >
                <FormattedMessage
                  id='terms_of_service.upcoming_changes_on'
                  defaultMessage='Upcoming changes on {date}'
                  values={{
                    date: (
                      <FormattedDate
                        value={response.succeeded_by}
                        year='numeric'
                        month='short'
                        day='2-digit'
                      />
                    ),
                  }}
                />
              </Link>
            )}
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
                <Skeleton width='88%' />
                <Skeleton width='70%' />
              </div>
            ) : response ? (
              <div
                className='public-page__document-body prose'
                dangerouslySetInnerHTML={{ __html: response.content }}
              />
            ) : (
              <p className='public-page__empty'>
                {intl.formatMessage(
                  date ? messages.revisionUnavailable : messages.unavailable,
                )}
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
export default TermsOfService;
