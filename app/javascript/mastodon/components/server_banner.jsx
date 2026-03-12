import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import { Link } from 'react-router-dom';

import { connect } from 'react-redux';

import { fetchServer } from 'mastodon/actions/server';
import { Account } from 'mastodon/components/account';
import { ServerHeroImage } from 'mastodon/components/server_hero_image';
import { ShortNumber } from 'mastodon/components/short_number';
import { Skeleton } from 'mastodon/components/skeleton';
import { domain } from 'mastodon/initial_state';

const messages = defineMessages({
  aboutActiveUsers: { id: 'server_banner.about_active_users', defaultMessage: 'People using this server during the last 30 days (Monthly Active Users)' },
  aboutLink: { id: 'server_banner.about_link', defaultMessage: 'About this server' },
});

const mapStateToProps = state => {
  const contactAccountId = state.getIn(['server', 'server', 'contact', 'account', 'id']);

  return {
    server: state.getIn(['server', 'server']),
    contactAccountLoaded: !!(contactAccountId && state.getIn(['accounts', contactAccountId])),
  };
};

const hasVisibleText = value => typeof value === 'string' && value.trim().length > 0;

export class ServerBannerContent extends PureComponent {

  static propTypes = {
    server: PropTypes.object,
    contactAccountLoaded: PropTypes.bool,
    dispatch: PropTypes.func,
    intl: PropTypes.object,
  };

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(fetchServer());
  }

  render () {
    const { server, intl, contactAccountLoaded } = this.props;
    const isLoading = server.get('isLoading');
    const contactAccountId = server.getIn(['contact', 'account', 'id']);
    const hasContactAccount = hasVisibleText(contactAccountId);

    return (
      <div className='server-banner'>
        <div className='server-banner__introduction'>
          <FormattedMessage id='server_banner.is_one_of_many' defaultMessage='{domain} is one of the many independent Mastodon servers you can use to participate in the fediverse.' values={{ domain: <strong>{domain}</strong>, mastodon: <a href='https://joinmastodon.org' target='_blank' rel='noopener'>Mastodon</a> }} />
        </div>

        <Link to='/about' aria-label={intl.formatMessage(messages.aboutLink)}>
          <ServerHeroImage blurhash={server.getIn(['thumbnail', 'blurhash'])} src={server.getIn(['thumbnail', 'url'])} className='server-banner__hero' />
        </Link>

        <div className='server-banner__description'>
          {isLoading ? (
            <>
              <Skeleton width='100%' />
              <br />
              <Skeleton width='100%' />
              <br />
              <Skeleton width='70%' />
            </>
          ) : server.get('description')}
        </div>

        <div className='server-banner__meta'>
          <div className='server-banner__meta__column'>
            <h4><FormattedMessage id='server_banner.administered_by' defaultMessage='Administered by:' /></h4>

            {isLoading || (hasContactAccount && !contactAccountLoaded) ? (
              <Skeleton width='10ch' />
            ) : hasContactAccount ? (
              <Account id={contactAccountId} size={36} minimal />
            ) : (
              <span><FormattedMessage id='about.not_available' defaultMessage='This information has not been made available on this server.' /></span>
            )}
          </div>

          <div className='server-banner__meta__column'>
            <h4><FormattedMessage id='server_banner.server_stats' defaultMessage='Server stats:' /></h4>

            {isLoading ? (
              <>
                <strong className='server-banner__number'><Skeleton width='10ch' /></strong>
                <br />
                <span className='server-banner__number-label'><Skeleton width='5ch' /></span>
              </>
            ) : (
              <>
                <strong className='server-banner__number'><ShortNumber value={server.getIn(['usage', 'users', 'active_month'])} /></strong>
                <br />
                <span className='server-banner__number-label' title={intl.formatMessage(messages.aboutActiveUsers)}><FormattedMessage id='server_banner.active_users' defaultMessage='active users' /></span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps)(injectIntl(ServerBannerContent));
