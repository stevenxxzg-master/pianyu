import { defineMessages, useIntl } from 'react-intl';

import { Link } from 'react-router-dom';

import { IconLogo } from 'mastodon/components/logo';
import {
  domain,
  localLiveFeedAccess,
  profile_directory as canProfileDirectory,
  source_url,
  statusPageUrl,
  termsOfServiceEnabled,
  version,
} from 'mastodon/initial_state';

const messages = defineMessages({
  brandMark: { id: 'footer.brand_mark', defaultMessage: 'Public home' },
  tagline: {
    id: 'footer.brand_tagline',
    defaultMessage: 'A quieter community on the open social web, designed to feel calm before you ever log in.',
  },
  explore: { id: 'footer.group.explore', defaultMessage: 'Explore' },
  trust: { id: 'footer.group.trust', defaultMessage: 'Trust' },
  platform: { id: 'footer.group.platform', defaultMessage: 'Platform' },
  aboutServer: { id: 'footer.about_this_server', defaultMessage: 'About this server' },
  trending: { id: 'footer.trending', defaultMessage: 'Trending posts' },
  localPulse: { id: 'footer.local_pulse', defaultMessage: 'Local pulse' },
  directory: { id: 'footer.directory', defaultMessage: 'Profiles directory' },
  status: { id: 'footer.status', defaultMessage: 'Status' },
  privacy: { id: 'footer.privacy_policy', defaultMessage: 'Privacy policy' },
  terms: { id: 'footer.terms_of_service', defaultMessage: 'Terms of service' },
  apps: { id: 'footer.get_app', defaultMessage: 'Get the app' },
  shortcuts: {
    id: 'footer.keyboard_shortcuts',
    defaultMessage: 'Keyboard shortcuts',
  },
  source: { id: 'footer.source_code', defaultMessage: 'View source code' },
  version: { id: 'footer.version', defaultMessage: 'Version {version}' },
});

export const LinkFooter: React.FC<{
  multiColumn: boolean;
}> = ({ multiColumn }) => {
  const intl = useIntl();
  const linkTarget = multiColumn ? '_blank' : undefined;
  const showLocalPulse = localLiveFeedAccess === 'public';

  return (
    <div className='link-footer'>
      <div className='link-footer__brand'>
        <div className='link-footer__brand-mark'>
          <IconLogo className='link-footer__brand-icon' />
          <span>{intl.formatMessage(messages.brandMark)}</span>
        </div>
        <p>{intl.formatMessage(messages.tagline)}</p>
      </div>

      <div className='link-footer__grid'>
        <div className='link-footer__group'>
          <span>{intl.formatMessage(messages.explore)}</span>
          <Link to='/about' target={linkTarget}>
            {intl.formatMessage(messages.aboutServer)}
          </Link>
          <Link to='/explore' target={linkTarget}>
            {intl.formatMessage(messages.trending)}
          </Link>
          {showLocalPulse && (
            <Link to='/public/local' target={linkTarget}>
              {intl.formatMessage(messages.localPulse)}
            </Link>
          )}
          {canProfileDirectory && (
            <Link to='/directory' target={linkTarget}>
              {intl.formatMessage(messages.directory)}
            </Link>
          )}
        </div>

        <div className='link-footer__group'>
          <span>{intl.formatMessage(messages.trust)}</span>
          {statusPageUrl && (
            <a href={statusPageUrl} rel='noopener' target='_blank'>
              {intl.formatMessage(messages.status)}
            </a>
          )}
          <Link to='/privacy-policy' rel='privacy-policy' target={linkTarget}>
            {intl.formatMessage(messages.privacy)}
          </Link>
          {termsOfServiceEnabled && (
            <Link to='/terms-of-service' rel='terms-of-service' target={linkTarget}>
              {intl.formatMessage(messages.terms)}
            </Link>
          )}
        </div>

        <div className='link-footer__group'>
          <span>{intl.formatMessage(messages.platform)}</span>
          <a href='https://joinmastodon.org/apps' rel='noopener' target='_blank'>
            {intl.formatMessage(messages.apps)}
          </a>
          <Link to='/keyboard-shortcuts' target={linkTarget}>
            {intl.formatMessage(messages.shortcuts)}
          </Link>
          <a href={source_url} rel='noopener' target='_blank'>
            {intl.formatMessage(messages.source)}
          </a>
        </div>
      </div>

      <div className='link-footer__meta'>
        <span>{domain}</span>
        <span>{intl.formatMessage(messages.version, { version })}</span>
      </div>
    </div>
  );
};
