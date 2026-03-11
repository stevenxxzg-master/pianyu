import { useCallback } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import classNames from 'classnames';

import { openModal } from 'mastodon/actions/modal';
import { registrationsOpen, sso_redirect } from 'mastodon/initial_state';
import { useAppDispatch } from 'mastodon/store';

const messages = defineMessages({
  createAccount: {
    id: 'public_actions.create_account',
    defaultMessage: 'Create account',
  },
  login: { id: 'public_actions.login', defaultMessage: 'Login' },
  loginOrRegister: {
    id: 'public_actions.login_or_register',
    defaultMessage: 'Login or join',
  },
});

export const PublicAuthButtons: React.FC<{
  block?: boolean;
  className?: string;
}> = ({ block = false, className }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const hasSeamlessExternalLogin = Boolean(sso_redirect);
  const signUpHref = '/auth/sign_up/redirect';

  const handleClosedRegistrations = useCallback(() => {
    dispatch(openModal({ modalType: 'CLOSED_REGISTRATIONS', modalProps: {} }));
  }, [dispatch]);

  const buttonClassName = classNames('button', {
    'button--block': block,
  });

  const secondaryButtonClassName = classNames('button', 'button-secondary', {
    'button--block': block,
  });

  let signupButton: React.ReactNode;

  if (hasSeamlessExternalLogin) {
    return (
      <div className={classNames('public-auth-buttons', className)}>
        <a href='/auth/sign_in' className={secondaryButtonClassName}>
          {intl.formatMessage(messages.loginOrRegister)}
        </a>
      </div>
    );
  }

  if (registrationsOpen) {
    signupButton = (
      <a href={signUpHref} className={buttonClassName}>
        {intl.formatMessage(messages.createAccount)}
      </a>
    );
  } else {
    signupButton = (
      <button
        className={buttonClassName}
        onClick={handleClosedRegistrations}
        type='button'
      >
        {intl.formatMessage(messages.createAccount)}
      </button>
    );
  }

  return (
    <div className={classNames('public-auth-buttons', className)}>
      {signupButton}
      <a href='/auth/sign_in' className={secondaryButtonClassName}>
        {intl.formatMessage(messages.login)}
      </a>
    </div>
  );
};
