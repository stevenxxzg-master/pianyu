import PropTypes from 'prop-types';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import { debounce } from 'lodash';

import RefreshIcon from '@/material-icons/400-24px/refresh.svg?react';
import RepeatIcon from '@/material-icons/400-24px/repeat.svg?react';
import { expandReblogs, fetchReblogs } from 'mastodon/actions/interactions';
import { Account } from 'mastodon/components/account';
import Column from 'mastodon/components/column';
import ColumnHeader from 'mastodon/components/column_header';
import { Icon } from 'mastodon/components/icon';
import { LoadingIndicator } from 'mastodon/components/loading_indicator';
import {
  SecondaryPageChip,
  SecondaryPageEmptyState,
  SecondaryPageHero,
  secondaryPageClasses,
} from 'mastodon/components/secondary_page';
import ScrollableList from 'mastodon/components/scrollable_list';

const messages = defineMessages({
  heading: { id: 'reblogs.detail.heading', defaultMessage: 'Boosts' },
  refresh: { id: 'refresh', defaultMessage: 'Refresh' },
  eyebrow: { id: 'reblogs.detail.eyebrow', defaultMessage: 'Post activity' },
  description: {
    id: 'reblogs.detail.description',
    defaultMessage:
      'See who has boosted this post in the same card language used by the refreshed secondary views.',
  },
  count: {
    id: 'reblogs.detail.count',
    defaultMessage: '{count, plural, =0 {No boosts yet} one {# person here} other {# people here}}',
  },
  emptyTitle: {
    id: 'reblogs.detail.empty_title',
    defaultMessage: 'No boosts on this post yet',
  },
});

const mapStateToProps = (state, props) => ({
  accountIds: state.getIn([
    'user_lists',
    'reblogged_by',
    props.params.statusId,
    'items',
  ]),
  hasMore: !!state.getIn([
    'user_lists',
    'reblogged_by',
    props.params.statusId,
    'next',
  ]),
  isLoading: state.getIn(
    ['user_lists', 'reblogged_by', props.params.statusId, 'isLoading'],
    true,
  ),
});

class Reblogs extends ImmutablePureComponent {
  static propTypes = {
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    accountIds: ImmutablePropTypes.list,
    hasMore: PropTypes.bool,
    isLoading: PropTypes.bool,
    multiColumn: PropTypes.bool,
    intl: PropTypes.object.isRequired,
  };

  componentDidMount() {
    if (!this.props.accountIds) {
      this.props.dispatch(fetchReblogs(this.props.params.statusId));
    }
  }

  handleRefresh = () => {
    this.props.dispatch(fetchReblogs(this.props.params.statusId));
  };

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandReblogs(this.props.params.statusId));
  }, 300, { leading: true });

  render() {
    const { intl, accountIds, hasMore, isLoading, multiColumn } = this.props;

    if (!accountIds) {
      return (
        <Column>
          <div className='scrollable'>
            <LoadingIndicator />
          </div>
        </Column>
      );
    }

    const headerCard = (
      <SecondaryPageHero
        eyebrow={intl.formatMessage(messages.eyebrow)}
        title={intl.formatMessage(messages.heading)}
        description={intl.formatMessage(messages.description)}
        actions={
          <button
            type='button'
            className='button button-secondary'
            onClick={this.handleRefresh}
          >
            <Icon id='refresh' icon={RefreshIcon} />
            {intl.formatMessage(messages.refresh)}
          </button>
        }
        meta={
          <SecondaryPageChip>
            {intl.formatMessage(messages.count, { count: accountIds.size })}
          </SecondaryPageChip>
        }
      />
    );

    const emptyMessage = (
      <SecondaryPageEmptyState
        iconId='repeat'
        icon={RepeatIcon}
        title={intl.formatMessage(messages.emptyTitle)}
        message={
          <FormattedMessage
            id='status.reblogs.empty'
            defaultMessage='No one has boosted this post yet. When someone does, they will show up here.'
          />
        }
        actions={
          <button
            type='button'
            className='button button-secondary'
            onClick={this.handleRefresh}
          >
            {intl.formatMessage(messages.refresh)}
          </button>
        }
      />
    );

    return (
      <Column
        bindToDocument={!multiColumn}
        label={intl.formatMessage(messages.heading)}
      >
        <ColumnHeader
          showBackButton
          title={intl.formatMessage(messages.heading)}
          multiColumn={multiColumn}
        />

        <ScrollableList
          scrollKey='reblogs'
          onLoadMore={this.handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
          prepend={headerCard}
          alwaysPrepend
          emptyMessage={emptyMessage}
          bindToDocument={!multiColumn}
        >
          {accountIds.map((id) => (
            <Account
              key={id}
              id={id}
              className={secondaryPageClasses.accountCard}
              withBorder={false}
            />
          ))}
        </ScrollableList>

        <Helmet>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }
}

export default connect(mapStateToProps)(injectIntl(Reblogs));
