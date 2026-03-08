import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { FormattedMessage } from 'react-intl';

import { Link, withRouter } from 'react-router-dom';

import { connect } from 'react-redux';

import { fetchSuggestions } from 'mastodon/actions/suggestions';
import { LoadingIndicator } from 'mastodon/components/loading_indicator';
import { WithRouterPropTypes } from 'mastodon/utils/react_router';

import { Card } from './components/card';

const mapStateToProps = state => ({
  suggestions: state.suggestions.items,
  isLoading: state.suggestions.isLoading,
});

const SuggestionsIntro = () => (
  <div className='people-discovery-panel'>
    <div className='people-discovery-panel__eyebrow'>
      <FormattedMessage
        id='people_discovery.secondary_path'
        defaultMessage='Secondary path'
      />
    </div>

    <div className='people-discovery-panel__body'>
      <div className='people-discovery-panel__content'>
        <h3>
          <FormattedMessage
            id='explore.find_people'
            defaultMessage='Find people'
          />
        </h3>

        <p>
          <FormattedMessage
            id='people_discovery.suggestions.description'
            defaultMessage='Use this list when you want a few more people to browse. If you already know who you are looking for, search is faster.'
          />
        </p>
      </div>

      <Link to='/directory' className='people-discovery-panel__link'>
        <FormattedMessage
          id='footer.directory'
          defaultMessage='Profiles directory'
        />
      </Link>
    </div>
  </div>
);

class Suggestions extends PureComponent {

  static propTypes = {
    isLoading: PropTypes.bool,
    suggestions: PropTypes.array,
    dispatch: PropTypes.func.isRequired,
    ...WithRouterPropTypes,
  };

  componentDidMount () {
    const { dispatch, suggestions, history } = this.props;

    // If we're navigating back to the screen, do not trigger a reload
    if (history.action === 'POP' && suggestions.length > 0) {
      return;
    }

    dispatch(fetchSuggestions());
  }

  render () {
    const { isLoading, suggestions } = this.props;

    if (!isLoading && suggestions.length === 0) {
      return (
        <div
          className='explore__suggestions scrollable scrollable--flex'
          data-nosnippet
        >
          <SuggestionsIntro />

          <div className='empty-column-indicator'>
            <FormattedMessage
              id='people_discovery.empty_suggestions'
              defaultMessage='No account suggestions are available right now.'
            />
          </div>
        </div>
      );
    }

    return (
      <div className='explore__suggestions scrollable' data-nosnippet>
        <SuggestionsIntro />

        {isLoading ? <LoadingIndicator /> : suggestions.map(suggestion => (
          <Card
            key={suggestion.account_id}
            id={suggestion.account_id}
            source={suggestion.sources[0]}
          />
        ))}
      </div>
    );
  }

}

export default connect(mapStateToProps)(withRouter(Suggestions));
