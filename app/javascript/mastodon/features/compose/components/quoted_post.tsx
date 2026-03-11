import { useCallback, useMemo } from 'react';
import type { FC } from 'react';

import { Map } from 'immutable';

import { quoteComposeCancel } from '@/mastodon/actions/compose_typed';
import type { QuotedStatus as QuotedStatusComponent } from '@/mastodon/components/status_quoted';
import Bundle from '@/mastodon/features/ui/components/bundle';
import { useAppDispatch, useAppSelector } from '@/mastodon/store';

import { QuotePlaceholder } from './quote_placeholder';

const fetchQuotedStatus = () =>
  import('@/mastodon/components/status_quoted').then((module) => ({
    default: module.QuotedStatus,
  }));

export const ComposeQuotedStatus: FC = () => {
  const quotedStatusId = useAppSelector(
    (state) => state.compose.get('quoted_status_id') as string | null,
  );

  const isFetchingLink = useAppSelector(
    (state) => !!state.compose.get('fetching_link'),
  );

  const isEditing = useAppSelector((state) => !!state.compose.get('id'));

  const quote = useMemo(
    () =>
      quotedStatusId
        ? Map<'state' | 'quoted_status', string>([
            ['state', 'accepted'],
            ['quoted_status', quotedStatusId],
          ])
        : null,
    [quotedStatusId],
  );

  const dispatch = useAppDispatch();
  const handleQuoteCancel = useCallback(() => {
    dispatch(quoteComposeCancel());
  }, [dispatch]);

  if (isFetchingLink && !quote) {
    return <QuotePlaceholder />;
  } else if (!quote) {
    return null;
  }

  return (
    <Bundle fetchComponent={fetchQuotedStatus}>
      {(QuotedStatus: typeof QuotedStatusComponent) => (
        <QuotedStatus
          quote={quote}
          contextType='composer'
          onQuoteCancel={!isEditing ? handleQuoteCancel : undefined}
        />
      )}
    </Bundle>
  );
};
