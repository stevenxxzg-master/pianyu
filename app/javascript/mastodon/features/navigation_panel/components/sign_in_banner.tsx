import { FormattedMessage } from 'react-intl';

import { Link } from 'react-router-dom';

import { IconLogo } from 'mastodon/components/logo';
import { PublicAuthButtons } from 'mastodon/components/public_auth_buttons';

export const SignInBanner: React.FC = () => {
  return (
    <div className='sign-in-banner'>
      <div className='sign-in-banner__brand'>
        <IconLogo />
        <span>
          <FormattedMessage
            id='sign_in_banner.brand'
            defaultMessage='Public home'
          />
        </span>
      </div>

      <h2>
        <FormattedMessage
          id='sign_in_banner.title'
          defaultMessage='Read first, join when the room feels right.'
        />
      </h2>

      <p>
        <FormattedMessage
          id='sign_in_banner.description'
          defaultMessage='Discovery stays chronological, local, and calm so first-time visitors can understand the community before opening an account.'
        />
      </p>

      <PublicAuthButtons block className='sign-in-banner__actions' />

      <div className='sign-in-banner__links'>
        <Link to='/about'>
          <FormattedMessage id='footer.about_this_server' defaultMessage='About' />
        </Link>
        <Link to='/explore'>
          <FormattedMessage id='explore.title' defaultMessage='Trending' />
        </Link>
      </div>
    </div>
  );
};
