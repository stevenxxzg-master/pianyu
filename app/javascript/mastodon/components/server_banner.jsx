import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import { Link } from 'react-router-dom';

import { connect } from 'react-redux';

import { fetchServer } from 'mastodon/actions/server';
import { Account } from 'mastodon/components/account';
import { IconLogo } from 'mastodon/components/logo';
import { ServerHeroImage } from 'mastodon/components/server_hero_image';
import { ShortNumber } from 'mastodon/components/short_number';
import { Skeleton } from 'mastodon/components/skeleton';
import { domain, localLiveFeedAccess } from 'mastodon/initial_state';

const messages = defineMessages({
  aboutActiveUsers: {
    id: 'server_banner.about_active_users',
    defaultMessage:
      'People using this server during the last 30 days (Monthly Active Users)',
  },
  label: {
    id: 'server_banner.preview_label',
    defaultMessage: 'Public preview',
  },
  title: {
    id: 'server_banner.preview_title',
    defaultMessage: 'Preview the room before you step into it.',
  },
  fallback: {
    id: 'server_banner.preview_fallback',
    defaultMessage:
      'Public writing, local context, and clear community notes now sit inside one calmer public entry.',
  },
  aboutLink: {
    id: 'server_banner.about_link',
    defaultMessage: 'About this server',
  },
  exploreLink: {
    id: 'server_banner.explore_link',
    defaultMessage: 'Trending posts',
  },
  localLink: {
    id: 'server_banner.local_link',
    defaultMessage: 'Local pulse',
  },
});

const mapStateToProps = (state) => ({
  server: state.getIn(['server', 'server']),
});

class ServerBanner extends PureComponent {
  static propTypes = {
    server: PropTypes.object,
    dispatch: PropTypes.func,
    intl: PropTypes.object,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchServer());
  }

  render() {
    const { server, intl } = this.props;
    const isLoading = server.get('isLoading');
    const contactAccountId = server.getIn(['contact', 'account', 'id']);
    const description = !isLoading && server.get('description')
      ? server.get('description')
      : intl.formatMessage(messages.fallback);

    return (
      <div className='server-banner'>
        <div className='server-banner__brand'>
          <IconLogo />
          <span>{intl.formatMessage(messages.label)}</span>
        </div>

        <h3>{intl.formatMessage(messages.title)}</h3>
        <p className='server-banner__description'>{description}</p>

        <Link to='/about'>
          <ServerHeroImage
            blurhash={server.getIn(['thumbnail', 'blurhash'])}
            src={server.getIn(['thumbnail', 'url'])}
            className='server-banner__hero'
          />
        </Link>

        <div className='server-banner__meta'>
          <div className='server-banner__meta__column'>
            <h4>
              <FormattedMessage
                id='server_banner.administered_by'
                defaultMessage='Administered by:'
              />
            </h4>

            {contactAccountId ? (
              <Account id={contactAccountId} size={36} minimal />
            ) : (
              <p className='server-banner__meta__empty'>
                <FormattedMessage
                  id='about.not_available'
                  defaultMessage='This information has not been made available on this server.'
                />
              </p>
            )}
          </div>

          <div className='server-banner__meta__column'>
            <h4>
              <FormattedMessage
                id='server_banner.server_stats'
                defaultMessage='Server stats:'
              />
            </h4>

            {isLoading ? (
              <>
                <strong className='server-banner__number'>
                  <Skeleton width='10ch' />
                </strong>
                <span className='server-banner__number-label'>
                  <Skeleton width='5ch' />
                </span>
              </>
            ) : (
              <>
                <strong className='server-banner__number'>
                  <ShortNumber value={server.getIn(['usage', 'users', 'active_month'])} />
                </strong>
                <span
                  className='server-banner__number-label'
                  title={intl.formatMessage(messages.aboutActiveUsers)}
                >
                  <FormattedMessage
                    id='server_banner.active_users'
                    defaultMessage='active users'
                  />
                </span>
              </>
            )}
          </div>
        </div>

        <div className='server-banner__links'>
          <Link to='/about'>{intl.formatMessage(messages.aboutLink)}</Link>
          <Link to='/explore'>{intl.formatMessage(messages.exploreLink)}</Link>
          {localLiveFeedAccess === 'public' && (
            <Link to='/public/local'>{intl.formatMessage(messages.localLink)}</Link>
          )}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(injectIntl(ServerBanner));
