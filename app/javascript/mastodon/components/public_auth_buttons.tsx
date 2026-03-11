import { useCallback, useEffect } from 'react';

import classNames from 'classnames';
import { defineMessages, useIntl } from 'react-intl';

import { openModal } from 'mastodon/actions/modal';
import { fetchServer } from 'mastodon/actions/server';
import { registrationsOpen, sso_redirect } from 'mastodon/initial_state';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

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
  const hasServerConfig = useAppSelector((state) =>
    Boolean(
      state.server.getIn(['server', 'uri']) ||
        state.server.getIn(['server', 'title']) ||
        state.server.getIn(['server', 'registrations', 'url']),
    ),
  );
  const serverLoading = useAppSelector((state) =>
    state.server.getIn(['server', 'isLoading'], false) as boolean,
  );

  const signupUrl = useAppSelector(
    (state) =>
      (state.server.getIn(['server', 'registrations', 'url'], null) as
        | string
        | null) ?? '/auth/sign_up',
  );

  useEffect(() => {
    if (!hasServerConfig && !serverLoading) {
      dispatch(fetchServer());
    }
  }, [dispatch, hasServerConfig, serverLoading]);

  const handleClosedRegistrations = useCallback(() => {
    dispatch(openModal({ modalType: 'CLOSED_REGISTRATIONS', modalProps: {} }));
  }, [dispatch]);

  const buttonClassName = classNames('button', {
    'button--block': block,
  });

  const secondaryButtonClassName = classNames(
    'button',
    'button-secondary',
    {
      'button--block': block,
    },
  );

  let signupButton: React.ReactNode;

  if (sso_redirect) {
    return (
      <div className={classNames('public-auth-buttons', className)}>
        <a href={sso_redirect} data-method='post' className={secondaryButtonClassName}>
          {intl.formatMessage(messages.loginOrRegister)}
        </a>
      </div>
    );
  }

  if (registrationsOpen) {
    signupButton = (
      <a href={signupUrl} className={buttonClassName}>
        {intl.formatMessage(messages.createAccount)}
      </a>
    );
  } else {
    signupButton = (
      <button className={buttonClassName} onClick={handleClosedRegistrations} type='button'>
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
