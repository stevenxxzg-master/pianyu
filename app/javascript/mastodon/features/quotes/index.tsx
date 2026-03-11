import { useCallback, useEffect } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { Helmet } from 'react-helmet';

import { List as ImmutableList } from 'immutable';
import type { OrderedSet as ImmutableOrderedSet } from 'immutable';

import FormatQuoteIcon from '@/material-icons/400-24px/format_quote.svg?react';
import RefreshIcon from '@/material-icons/400-24px/refresh.svg?react';
import { fetchQuotes } from 'mastodon/actions/interactions_typed';
import { Callout } from 'mastodon/components/callout';
import { Column } from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { Icon } from 'mastodon/components/icon';
import { LoadingIndicator } from 'mastodon/components/loading_indicator';
import {
  SecondaryPageChip,
  SecondaryPageEmptyState,
  SecondaryPageHero,
  SecondaryPageSection,
} from 'mastodon/components/secondary_page';
import StatusList from 'mastodon/components/status_list';
import { useIdentity } from 'mastodon/identity_context';
import { domain } from 'mastodon/initial_state';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

const messages = defineMessages({
  heading: { id: 'quotes.detail.heading', defaultMessage: 'Quotes' },
  refresh: { id: 'refresh', defaultMessage: 'Refresh' },
  eyebrow: { id: 'quotes.detail.eyebrow', defaultMessage: 'Post activity' },
  description: {
    id: 'quotes.detail.description',
    defaultMessage:
      'Track who has quoted this post with the same elevated containers, helper notes, and empty states as the other M5 secondary views.',
  },
  count: {
    id: 'quotes.detail.count',
    defaultMessage:
      '{count, plural, =0 {No quotes yet} one {# quote} other {# quotes}}',
  },
  emptyTitle: {
    id: 'quotes.detail.empty_title',
    defaultMessage: 'No quotes on this post yet',
  },
  disclaimerTitle: {
    id: 'quotes.detail.disclaimer_title',
    defaultMessage: 'Quote visibility note',
  },
});

const emptyList = ImmutableList();

export const Quotes: React.FC<{
  multiColumn?: boolean;
  params?: { statusId: string };
}> = ({ multiColumn, params }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const statusId = params?.statusId;

  const { accountId: me } = useIdentity();

  const isCorrectStatusId: boolean = useAppSelector(
    (state) => state.status_lists.getIn(['quotes', 'statusId']) === statusId,
  );
  const quotedAccountId = useAppSelector(
    (state) =>
      state.statuses.getIn([statusId, 'account']) as string | undefined,
  );
  const quotedAccount = useAppSelector((state) =>
    quotedAccountId ? state.accounts.get(quotedAccountId) : undefined,
  );
  const rawStatusIds = useAppSelector(
    (state) =>
      state.status_lists.getIn(['quotes', 'items'], emptyList) as
        | ImmutableList<string>
        | ImmutableOrderedSet<string>,
  );
  const statusIds = rawStatusIds.toList();
  const nextUrl = useAppSelector(
    (state) =>
      state.status_lists.getIn(['quotes', 'next']) as string | undefined,
  );
  const isLoading = useAppSelector((state) =>
    state.status_lists.getIn(['quotes', 'isLoading'], true),
  );
  const hasMore = !!nextUrl;
  const quoteCount = statusIds.size;

  useEffect(() => {
    if (statusId) void dispatch(fetchQuotes({ statusId }));
  }, [dispatch, statusId]);

  const handleLoadMore = useCallback(() => {
    if (statusId && isCorrectStatusId && nextUrl)
      void dispatch(fetchQuotes({ statusId, next: nextUrl }));
  }, [dispatch, statusId, isCorrectStatusId, nextUrl]);

  const handleRefresh = useCallback(() => {
    if (statusId) void dispatch(fetchQuotes({ statusId }));
  }, [dispatch, statusId]);

  if (!isCorrectStatusId) {
    return (
      <Column>
        <div className='scrollable'>
          <SecondaryPageSection>
            <LoadingIndicator />
          </SecondaryPageSection>
        </div>
      </Column>
    );
  }

  let disclaimer: React.ReactNode = null;

  if (me !== quotedAccountId) {
    if (quotedAccount?.username === quotedAccount?.acct) {
      disclaimer = (
        <FormattedMessage
          id='status.quotes.local_other_disclaimer'
          defaultMessage='Quotes rejected by the author will not be shown.'
        />
      );
    } else {
      disclaimer = (
        <FormattedMessage
          id='status.quotes.remote_other_disclaimer'
          defaultMessage='Only quotes from {domain} are guaranteed to be shown here. Quotes rejected by the author will not be shown.'
          values={{ domain: <strong>{domain}</strong> }}
        />
      );
    }
  }

  const prepend = (
    <>
      <SecondaryPageHero
        eyebrow={intl.formatMessage(messages.eyebrow)}
        title={intl.formatMessage(messages.heading)}
        description={intl.formatMessage(messages.description)}
        actions={
          <button
            type='button'
            className='button button-secondary'
            onClick={handleRefresh}
          >
            <Icon id='refresh' icon={RefreshIcon} />
            {intl.formatMessage(messages.refresh)}
          </button>
        }
        meta={
          <SecondaryPageChip>
            {intl.formatMessage(messages.count, { count: quoteCount })}
          </SecondaryPageChip>
        }
      />

      {disclaimer && (
        <SecondaryPageSection>
          <Callout title={intl.formatMessage(messages.disclaimerTitle)}>
            {disclaimer}
          </Callout>
        </SecondaryPageSection>
      )}
    </>
  );

  return (
    <Column
      bindToDocument={!multiColumn}
      label={intl.formatMessage(messages.heading)}
    >
      <ColumnHeader
        showBackButton
        title={intl.formatMessage(messages.heading)}
        icon='quote'
        iconComponent={FormatQuoteIcon}
        multiColumn={multiColumn}
      />

      <StatusList
        scrollKey='quotes_timeline'
        statusIds={statusIds}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        emptyMessage={
          <SecondaryPageEmptyState
            iconId='quote'
            icon={FormatQuoteIcon}
            title={intl.formatMessage(messages.emptyTitle)}
            message={
              <FormattedMessage
                id='status.quotes.empty'
                defaultMessage='No one has quoted this post yet. When someone does, it will show up here.'
              />
            }
            actions={
              <button
                type='button'
                className='button button-secondary'
                onClick={handleRefresh}
              >
                {intl.formatMessage(messages.refresh)}
              </button>
            }
          />
        }
        bindToDocument={!multiColumn}
        prepend={prepend}
        alwaysPrepend
      />

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default Quotes;
