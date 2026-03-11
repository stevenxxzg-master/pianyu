import { useCallback, useEffect, useRef } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import FindInPageIcon from '@/material-icons/400-24px/find_in_page.svg?react';
import PeopleIcon from '@/material-icons/400-24px/group.svg?react';
import SearchIcon from '@/material-icons/400-24px/search.svg?react';
import TagIcon from '@/material-icons/400-24px/tag.svg?react';
import { submitSearch, expandSearch } from 'mastodon/actions/search';
import type { ApiSearchType } from 'mastodon/api_types/search';
import { Account } from 'mastodon/components/account';
import { Column } from 'mastodon/components/column';
import type { ColumnRef } from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { CompatibilityHashtag as Hashtag } from 'mastodon/components/hashtag';
import { Icon } from 'mastodon/components/icon';
import ScrollableList from 'mastodon/components/scrollable_list';
import { StatusQuoteManager } from 'mastodon/components/status_quoted';
import { Search } from 'mastodon/features/compose/components/search';
import { useSearchParam } from 'mastodon/hooks/useSearchParam';
import { useIdentity } from 'mastodon/identity_context';
import type { Hashtag as HashtagType } from 'mastodon/models/tags';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

import { SearchSection } from './components/search_section';

const INITIAL_PAGE_LIMIT = 10;
const INITIAL_DISPLAY = 4;

const hidePeek = <T,>(list: T[]) => {
  if (
    list.length > INITIAL_PAGE_LIMIT &&
    list.length % INITIAL_PAGE_LIMIT === 1
  ) {
    return list.slice(0, -2);
  } else {
    return list;
  }
};

const renderAccounts = (accountIds: string[]) =>
  hidePeek<string>(accountIds).map((id) => <Account key={id} id={id} />);

const renderHashtags = (hashtags: HashtagType[]) =>
  hidePeek<HashtagType>(hashtags).map((hashtag) => (
    <Hashtag key={hashtag.name} hashtag={hashtag} />
  ));

const renderStatuses = (statusIds: string[]) =>
  hidePeek<string>(statusIds).map((id) => (
    <StatusQuoteManager contextType='search' key={id} id={id} />
  ));

type SearchType = 'all' | ApiSearchType;

const messages = defineMessages({
  title: { id: 'search.page_title', defaultMessage: 'Search' },
  pageTitleWithQuery: {
    id: 'search_results.title',
    defaultMessage: 'Search for "{q}"',
  },
  heroEyebrowDefault: {
    id: 'search.hero.eyebrow.default',
    defaultMessage: 'Light search',
  },
  heroEyebrowResults: {
    id: 'search.hero.eyebrow.results',
    defaultMessage: 'Best matches',
  },
  heroTitleDefault: {
    id: 'search.hero.title.default',
    defaultMessage: 'Start with a name, topic, or URL',
  },
  heroTitleResults: {
    id: 'search.hero.title.results',
    defaultMessage: 'Results for "{q}"',
  },
  heroDescriptionDefault: {
    id: 'search.hero.description.default',
    defaultMessage:
      'Profiles, hashtags, and posts stay in one place, while Explore gives you a gentler way to browse.',
  },
  heroDescriptionResults: {
    id: 'search.hero.description.results',
    defaultMessage:
      'Switch between people, hashtags, and posts without leaving the page or losing your search context.',
  },
  noResultsTitle: {
    id: 'search.empty.no_results.title',
    defaultMessage: 'No matches yet',
  },
  noResultsDescription: {
    id: 'search.empty.no_results.description',
    defaultMessage:
      'Try a shorter query, change the filter, or browse Explore for people and topics first.',
  },
  noSearchTitle: {
    id: 'search.empty.no_search.title',
    defaultMessage: 'Search is quieter when you start with people or topics.',
  },
  noSearchDescription: {
    id: 'search.empty.no_search.description',
    defaultMessage:
      'Use the field above to search directly, or open Explore when you want suggestions instead of a popularity feed.',
  },
  ctaOpenExplore: {
    id: 'search.empty.open_explore',
    defaultMessage: 'Open Explore',
  },
  ctaBrowseTopics: {
    id: 'search.empty.browse_topics',
    defaultMessage: 'Browse topics',
  },
  ctaFindPeople: {
    id: 'search.empty.find_people',
    defaultMessage: 'Find people',
  },
});

const typeFromParam = (param?: string): SearchType => {
  if (param && ['all', 'accounts', 'statuses', 'hashtags'].includes(param)) {
    return param as SearchType;
  } else {
    return 'all';
  }
};

export const SearchResults: React.FC<{ multiColumn: boolean }> = ({
  multiColumn,
}) => {
  const intl = useIntl();
  const columnRef = useRef<ColumnRef>(null);
  const { signedIn } = useIdentity();
  const [q] = useSearchParam('q');
  const [type, setType] = useSearchParam('type');
  const isLoading = useAppSelector((state) => state.search.loading);
  const results = useAppSelector((state) => state.search.results);
  const dispatch = useAppDispatch();
  const mappedType = typeFromParam(type);
  const trimmedValue = q?.trim() ?? '';
  const hasQuery = trimmedValue.length > 0;
  const pageTitle = hasQuery
    ? intl.formatMessage(messages.pageTitleWithQuery, { q: trimmedValue })
    : intl.formatMessage(messages.title);

  useEffect(() => {
    if (hasQuery) {
      void dispatch(
        submitSearch({
          q: trimmedValue,
          type: mappedType === 'all' ? undefined : mappedType,
        }),
      );
    }
  }, [dispatch, hasQuery, trimmedValue, mappedType]);

  const handleHeaderClick = useCallback(() => {
    columnRef.current?.scrollTop();
  }, []);

  const handleSelectAll = useCallback(() => {
    setType(null);
  }, [setType]);

  const handleSelectAccounts = useCallback(() => {
    setType('accounts');
  }, [setType]);

  const handleSelectHashtags = useCallback(() => {
    setType('hashtags');
  }, [setType]);

  const handleSelectStatuses = useCallback(() => {
    setType('statuses');
  }, [setType]);

  const handleLoadMore = useCallback(() => {
    if (mappedType !== 'all') {
      void dispatch(expandSearch({ type: mappedType }));
    }
  }, [dispatch, mappedType]);

  const hasMore =
    hasQuery && mappedType !== 'all' && results
      ? results[mappedType].length > INITIAL_PAGE_LIMIT &&
        results[mappedType].length % INITIAL_PAGE_LIMIT === 1
      : false;

  const emptyState = hasQuery ? (
    <div className='search-results__empty-state'>
      <div className='search-results__empty-state__icon'>
        <Icon id='search' icon={SearchIcon} />
      </div>
      <h3>{intl.formatMessage(messages.noResultsTitle)}</h3>
      <p>{intl.formatMessage(messages.noResultsDescription)}</p>
      <div className='search-results__empty-state__actions'>
        <Link className='search-results__empty-state__action' to='/explore'>
          {intl.formatMessage(messages.ctaOpenExplore)}
        </Link>
        <Link
          className='search-results__empty-state__action'
          to='/explore/tags'
        >
          {intl.formatMessage(messages.ctaBrowseTopics)}
        </Link>
      </div>
    </div>
  ) : (
    <div className='search-results__empty-state'>
      <div className='search-results__empty-state__icon'>
        <Icon id='search' icon={SearchIcon} />
      </div>
      <h3>{intl.formatMessage(messages.noSearchTitle)}</h3>
      <p>{intl.formatMessage(messages.noSearchDescription)}</p>
      <div className='search-results__empty-state__actions'>
        {signedIn && (
          <Link
            className='search-results__empty-state__action'
            to='/explore/suggestions'
          >
            {intl.formatMessage(messages.ctaFindPeople)}
          </Link>
        )}
        <Link
          className='search-results__empty-state__action'
          to='/explore/tags'
        >
          {intl.formatMessage(messages.ctaBrowseTopics)}
        </Link>
        <Link className='search-results__empty-state__action' to='/explore'>
          {intl.formatMessage(messages.ctaOpenExplore)}
        </Link>
      </div>
    </div>
  );

  let filteredResults;

  if (results && hasQuery) {
    switch (mappedType) {
      case 'all':
        filteredResults =
          results.accounts.length +
            results.hashtags.length +
            results.statuses.length >
          0 ? (
            <>
              {results.accounts.length > 0 && (
                <SearchSection
                  key='accounts'
                  title={
                    <>
                      <Icon id='users' icon={PeopleIcon} />
                      <FormattedMessage
                        id='search_results.accounts'
                        defaultMessage='Profiles'
                      />
                    </>
                  }
                  onClickMore={handleSelectAccounts}
                >
                  {results.accounts.slice(0, INITIAL_DISPLAY).map((id) => (
                    <Account key={id} id={id} />
                  ))}
                </SearchSection>
              )}

              {results.hashtags.length > 0 && (
                <SearchSection
                  key='hashtags'
                  title={
                    <>
                      <Icon id='hashtag' icon={TagIcon} />
                      <FormattedMessage
                        id='search_results.hashtags'
                        defaultMessage='Hashtags'
                      />
                    </>
                  }
                  onClickMore={handleSelectHashtags}
                >
                  {results.hashtags.slice(0, INITIAL_DISPLAY).map((hashtag) => (
                    <Hashtag key={hashtag.name} hashtag={hashtag} />
                  ))}
                </SearchSection>
              )}

              {results.statuses.length > 0 && (
                <SearchSection
                  key='statuses'
                  title={
                    <>
                      <Icon id='quote-right' icon={FindInPageIcon} />
                      <FormattedMessage
                        id='search_results.statuses'
                        defaultMessage='Posts'
                      />
                    </>
                  }
                  onClickMore={handleSelectStatuses}
                >
                  {results.statuses.slice(0, INITIAL_DISPLAY).map((id) => (
                    <StatusQuoteManager contextType='search' key={id} id={id} />
                  ))}
                </SearchSection>
              )}
            </>
          ) : (
            []
          );
        break;
      case 'accounts':
        filteredResults = renderAccounts(results.accounts);
        break;
      case 'hashtags':
        filteredResults = renderHashtags(results.hashtags);
        break;
      case 'statuses':
        filteredResults = renderStatuses(results.statuses);
        break;
    }
  }

  return (
    <Column bindToDocument={!multiColumn} ref={columnRef} label={pageTitle}>
      <ColumnHeader
        icon={'search'}
        iconComponent={SearchIcon}
        title={pageTitle}
        onClick={handleHeaderClick}
        multiColumn={multiColumn}
      />

      <div className='explore__search-header search-page__hero'>
        <div className='search-page__hero__content'>
          <div className='search-page__hero__copy'>
            <span className='search-page__eyebrow'>
              {intl.formatMessage(
                hasQuery
                  ? messages.heroEyebrowResults
                  : messages.heroEyebrowDefault,
              )}
            </span>
            <h2>
              {intl.formatMessage(
                hasQuery
                  ? messages.heroTitleResults
                  : messages.heroTitleDefault,
                hasQuery ? { q: trimmedValue } : undefined,
              )}
            </h2>
            <p>
              {intl.formatMessage(
                hasQuery
                  ? messages.heroDescriptionResults
                  : messages.heroDescriptionDefault,
              )}
            </p>
          </div>

          <div className='search-page__hero__search'>
            <Search
              singleColumn
              initialValue={trimmedValue}
              key={trimmedValue}
              modernized
            />
          </div>

          <div className='search-page__hero__meta'>
            <span>
              <FormattedMessage
                id='search_results.accounts'
                defaultMessage='Profiles'
              />
            </span>
            <span>
              <FormattedMessage
                id='search_results.hashtags'
                defaultMessage='Hashtags'
              />
            </span>
            <span>
              <FormattedMessage
                id='search_results.statuses'
                defaultMessage='Posts'
              />
            </span>
          </div>
        </div>
      </div>

      <div className='account__section-headline search-page__tabs'>
        <button
          onClick={handleSelectAll}
          className={mappedType === 'all' ? 'active' : undefined}
          type='button'
        >
          <FormattedMessage id='search_results.all' defaultMessage='All' />
        </button>
        <button
          onClick={handleSelectAccounts}
          className={mappedType === 'accounts' ? 'active' : undefined}
          type='button'
        >
          <FormattedMessage
            id='search_results.accounts'
            defaultMessage='Profiles'
          />
        </button>
        <button
          onClick={handleSelectHashtags}
          className={mappedType === 'hashtags' ? 'active' : undefined}
          type='button'
        >
          <FormattedMessage
            id='search_results.hashtags'
            defaultMessage='Hashtags'
          />
        </button>
        <button
          onClick={handleSelectStatuses}
          className={mappedType === 'statuses' ? 'active' : undefined}
          type='button'
        >
          <FormattedMessage
            id='search_results.statuses'
            defaultMessage='Posts'
          />
        </button>
      </div>

      <div className='search-page__results' data-nosnippet>
        <ScrollableList
          scrollKey='search-results'
          isLoading={isLoading}
          showLoading={isLoading && !results}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          emptyMessage={emptyState}
          bindToDocument
        >
          {filteredResults}
        </ScrollableList>
      </div>

      <Helmet>
        <title>{pageTitle}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default SearchResults;
