import PropTypes from 'prop-types';
import { createRef } from 'react';

import { defineMessages, injectIntl } from 'react-intl';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { length } from 'stringz';

import { browserHistory } from 'mastodon/components/router';
import { missingAltTextModal } from 'mastodon/initial_state';

import AutosuggestInput from 'mastodon/components/autosuggest_input';
import AutosuggestTextarea from 'mastodon/components/autosuggest_textarea';
import { Button } from 'mastodon/components/button';
import EmojiPickerDropdown from '../containers/emoji_picker_dropdown_container';
import PollButtonContainer from '../containers/poll_button_container';
import SpoilerButtonContainer from '../containers/spoiler_button_container';
import UploadButtonContainer from '../containers/upload_button_container';
import { countableText } from '../util/counter';

import { CharacterCounter } from './character_counter';
import { EditIndicator } from './edit_indicator';
import { LanguageDropdown } from './language_dropdown';
import { NavigationBar } from './navigation_bar';
import { PollForm } from './poll_form';
import { ReplyIndicator } from './reply_indicator';
import { UploadForm } from './upload_form';
import { Warning } from './warning';
import { ComposeQuotedStatus } from './quoted_post';
import { VisibilityButton } from './visibility_button';

const allowedAroundShortCode = '><\u0085\u0020\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\u0009\u000a\u000b\u000c\u000d';
const successVisibilityWindow = 5 * 60 * 1000;

const messages = defineMessages({
  placeholder: {
    id: 'compose_form.placeholder',
    defaultMessage: 'What is on your mind?',
  },
  spoiler_placeholder: {
    id: 'compose_form.spoiler_placeholder',
    defaultMessage: 'Content warning (optional)',
  },
  publish: { id: 'compose_form.publish', defaultMessage: 'Post' },
  saveChanges: {
    id: 'compose_form.save_changes',
    defaultMessage: 'Update',
  },
  reply: { id: 'compose_form.reply', defaultMessage: 'Reply' },
  pageEyebrow: {
    id: 'compose_form.page.eyebrow',
    defaultMessage: 'Quiet draft',
  },
  pageTitle: {
    id: 'compose_form.page.title',
    defaultMessage: 'Lead with the thought.',
  },
  pageBody: {
    id: 'compose_form.page.body',
    defaultMessage:
      'Secondary controls stay close by without crowding the writing space.',
  },
  sidebarEyebrow: {
    id: 'compose_form.sidebar.eyebrow',
    defaultMessage: 'Quick draft',
  },
  sidebarTitle: {
    id: 'compose_form.sidebar.title',
    defaultMessage: 'One line is enough to begin.',
  },
  sidebarBody: {
    id: 'compose_form.sidebar.body',
    defaultMessage:
      'The sidebar keeps the draft light and in sync with the full publish page.',
  },
  shareEyebrow: {
    id: 'compose_form.share.eyebrow',
    defaultMessage: 'Share',
  },
  shareTitle: {
    id: 'compose_form.share.title',
    defaultMessage: 'Write the thought, then step into the full post.',
  },
  shareBody: {
    id: 'compose_form.share.body',
    defaultMessage:
      'Publishing here sends you straight to the finished post instead of stopping on a separate confirmation screen.',
  },
  toolbarLabel: {
    id: 'compose_form.toolbar_label',
    defaultMessage: 'Add context when it helps',
  },
  keyboardHint: {
    id: 'compose_form.keyboard_hint',
    defaultMessage: 'Cmd/Ctrl + Enter to publish',
  },
  draftHint: {
    id: 'compose_form.draft_hint',
    defaultMessage: 'Draft follows you between the sidebar and publish page.',
  },
  shareDraftHint: {
    id: 'compose_form.share_draft_hint',
    defaultMessage: 'Keep editing here until you are ready to post.',
  },
  successPublishedTitle: {
    id: 'compose_form.success.published.title',
    defaultMessage: 'Your post is live.',
  },
  successPublishedBody: {
    id: 'compose_form.success.published.body',
    defaultMessage:
      'Open it, head back, or stay here and keep writing.',
  },
  successPublishedSidebarBody: {
    id: 'compose_form.success.published.sidebar.body',
    defaultMessage: 'Open it, or keep writing without leaving the timeline.',
  },
  successSavedTitle: {
    id: 'compose_form.success.saved.title',
    defaultMessage: 'Changes saved.',
  },
  successSavedBody: {
    id: 'compose_form.success.saved.body',
    defaultMessage:
      'The update is in place. Reopen the post if you want to check it in context.',
  },
  openPost: {
    id: 'compose_form.success.open_post',
    defaultMessage: 'Open post',
  },
  continueWriting: {
    id: 'compose_form.success.continue',
    defaultMessage: 'Write another',
  },
  returnHome: {
    id: 'compose_form.success.return_home',
    defaultMessage: 'Back to feed',
  },
  returnPrevious: {
    id: 'compose_form.success.return_previous',
    defaultMessage: 'Back to where you were',
  },
});

class ComposeForm extends ImmutablePureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    text: PropTypes.string.isRequired,
    suggestions: ImmutablePropTypes.list,
    spoiler: PropTypes.bool,
    privacy: PropTypes.string,
    spoilerText: PropTypes.string,
    focusDate: PropTypes.instanceOf(Date),
    caretPosition: PropTypes.number,
    preselectDate: PropTypes.instanceOf(Date),
    isSubmitting: PropTypes.bool,
    isChangingUpload: PropTypes.bool,
    isEditing: PropTypes.bool,
    isUploading: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDismissSuccess: PropTypes.func.isRequired,
    onClearSuggestions: PropTypes.func.isRequired,
    onFetchSuggestions: PropTypes.func.isRequired,
    onSuggestionSelected: PropTypes.func.isRequired,
    onChangeSpoilerText: PropTypes.func.isRequired,
    onPaste: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
    onPickEmoji: PropTypes.func.isRequired,
    autoFocus: PropTypes.bool,
    withoutNavigation: PropTypes.bool,
    anyMedia: PropTypes.bool,
    missingAltText: PropTypes.bool,
    isInReply: PropTypes.bool,
    singleColumn: PropTypes.bool,
    lang: PropTypes.string,
    maxChars: PropTypes.number,
    redirectOnSuccess: PropTypes.bool,
    quoteToPrivate: PropTypes.bool,
    surface: PropTypes.string,
    hasPoll: PropTypes.bool,
    hasQuote: PropTypes.bool,
    lastSubmittedStatus: ImmutablePropTypes.map,
    lastSubmissionSurface: PropTypes.string,
    lastSubmissionMode: PropTypes.string,
    lastSubmittedAt: PropTypes.number,
  };

  static defaultProps = {
    autoFocus: false,
    surface: 'page',
  };

  state = {
    highlighted: false,
  };

  constructor(props) {
    super(props);
    this.textareaRef = createRef(null);
  }

  handleChange = (e) => {
    this.props.onChange(e.target.value);
  };

  blurOnEscape = (e) => {
    if (['esc', 'escape'].includes(e.key.toLowerCase())) {
      e.target.blur();
    }
  }

  handleKeyDownPost = (e) => {
    if (e.key.toLowerCase() === 'enter' && (e.ctrlKey || e.metaKey)) {
      this.handleSubmit();
      e.preventDefault();
    }
    this.blurOnEscape(e);
  };

  handleKeyDownSpoiler = (e) => {
    if (e.key.toLowerCase() === 'enter') {
      if (e.ctrlKey || e.metaKey) {
        this.handleSubmit();
      } else {
        e.preventDefault();
        this.textareaRef.current?.focus();
      }
    }
    this.blurOnEscape(e);
  };

  getFulltextForCharacterCounting = () => {
    return [this.props.spoiler ? this.props.spoilerText : '', countableText(this.props.text)].join('');
  };

  canSubmit = () => {
    const { isSubmitting, isChangingUpload, isUploading, maxChars } = this.props;
    const fulltext = this.getFulltextForCharacterCounting();

    return !(isSubmitting || isUploading || isChangingUpload || length(fulltext) > maxChars);
  };

  hasDraft = () => {
    const { text, anyMedia, hasPoll, hasQuote, spoiler, spoilerText } = this.props;
    return text.trim().length > 0 || anyMedia || hasPoll || hasQuote || (spoiler && spoilerText.trim().length > 0);
  };

  shouldShowSuccess = () => {
    const {
      surface,
      lastSubmittedStatus,
      lastSubmissionSurface,
      lastSubmittedAt,
    } = this.props;

    if (surface === 'share' || !lastSubmittedStatus) {
      return false;
    }

    if (lastSubmissionSurface !== surface) {
      return false;
    }

    if (typeof lastSubmittedAt === 'number' && (Date.now() - lastSubmittedAt) > successVisibilityWindow) {
      return false;
    }

    return !this.hasDraft();
  };

  getIntroCopy = () => {
    switch (this.props.surface) {
    case 'sidebar':
      return {
        eyebrow: messages.sidebarEyebrow,
        title: messages.sidebarTitle,
        body: messages.sidebarBody,
      };
    case 'share':
      return {
        eyebrow: messages.shareEyebrow,
        title: messages.shareTitle,
        body: messages.shareBody,
      };
    default:
      return {
        eyebrow: messages.pageEyebrow,
        title: messages.pageTitle,
        body: messages.pageBody,
      };
    }
  };

  getSuccessCopy = () => {
    const { lastSubmissionMode, surface } = this.props;
    const isSaved = lastSubmissionMode === 'save';

    if (isSaved) {
      return {
        title: messages.successSavedTitle,
        body: messages.successSavedBody,
      };
    }

    return {
      title: messages.successPublishedTitle,
      body:
        surface === 'sidebar'
          ? messages.successPublishedSidebarBody
          : messages.successPublishedBody,
    };
  };

  getComposePagePath = () => browserHistory.location.pathname.replace(/^\/deck/, '');

  hasReturnTarget = () => (
    ['/publish', '/statuses/new'].includes(this.getComposePagePath()) &&
    browserHistory.location.state?.fromMastodon
  );

  getReturnMessage = () => {
    return this.hasReturnTarget() ? messages.returnPrevious : messages.returnHome;
  };

  handleDismissSuccess = () => {
    this.props.onDismissSuccess();
    this.textareaRef.current?.focus();
  };

  handleReturn = () => {
    this.props.onDismissSuccess();

    if (this.hasReturnTarget()) {
      browserHistory.goBack();
      return;
    }

    browserHistory.push('/home');
  };

  handleOpenSubmittedStatus = () => {
    const statusId = this.props.lastSubmittedStatus?.get('id');
    const username = this.props.lastSubmittedStatus?.getIn(['account', 'username']);

    if (!statusId || !username) {
      return;
    }

    browserHistory.push(`/@${username}/${statusId}`);
  };

  handleSubmit = (e) => {
    if (this.props.text !== this.textareaRef.current.value) {
      this.props.onChange(this.textareaRef.current.value);
    }

    if (!this.canSubmit()) {
      return;
    }

    this.props.onSubmit({
      missingAltText: missingAltTextModal && this.props.missingAltText && this.props.privacy !== 'direct',
      quoteToPrivate: this.props.quoteToPrivate,
    });

    if (e) {
      e.preventDefault();
    }
  };

  onSuggestionsClearRequested = () => {
    this.props.onClearSuggestions();
  };

  onSuggestionsFetchRequested = (token) => {
    this.props.onFetchSuggestions(token);
  };

  onSuggestionSelected = (tokenStart, token, value) => {
    this.props.onSuggestionSelected(tokenStart, token, value, ['text']);
  };

  onSpoilerSuggestionSelected = (tokenStart, token, value) => {
    this.props.onSuggestionSelected(tokenStart, token, value, ['spoiler_text']);
  };

  handleChangeSpoilerText = (e) => {
    this.props.onChangeSpoilerText(e.target.value);
  };

  handleFocus = () => {
    if (this.composeForm && !this.props.singleColumn) {
      const { left, right } = this.composeForm.getBoundingClientRect();
      if (left < 0 || right > (window.innerWidth || document.documentElement.clientWidth)) {
        this.composeForm.scrollIntoView();
      }
    }
  };

  componentDidMount () {
    this._updateFocusAndSelection({});
  }

  componentWillUnmount () {
    if (this.timeout) clearTimeout(this.timeout);
  }

  componentDidUpdate (prevProps) {
    this._updateFocusAndSelection(prevProps);
  }

  _updateFocusAndSelection = (prevProps) => {
    if (this.props.focusDate && this.props.focusDate !== prevProps.focusDate) {
      let selectionEnd, selectionStart;

      if (this.props.preselectDate !== prevProps.preselectDate && this.props.isInReply) {
        selectionEnd = this.props.text.length;
        selectionStart = this.props.text.search(/\s/) + 1;
      } else if (typeof this.props.caretPosition === 'number') {
        selectionStart = this.props.caretPosition;
        selectionEnd = this.props.caretPosition;
      } else {
        selectionEnd = this.props.text.length;
        selectionStart = selectionEnd;
      }

      Promise.resolve().then(() => {
        this.textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
        this.textareaRef.current.focus();
        this.setState({ highlighted: true });
        this.timeout = setTimeout(() => this.setState({ highlighted: false }), 700);
      }).catch(console.error);
    } else if (prevProps.isSubmitting && !this.props.isSubmitting) {
      this.textareaRef.current.focus();
    } else if (this.props.spoiler !== prevProps.spoiler) {
      if (this.props.spoiler) {
        this.spoilerText.input.focus();
      } else if (prevProps.spoiler) {
        this.textareaRef.current.focus();
      }
    }
  };

  setSpoilerText = (c) => {
    this.spoilerText = c;
  };

  setRef = c => {
    this.composeForm = c;
  };

  handleEmojiPick = (data) => {
    const { text } = this.props;
    const position = this.textareaRef.current.selectionStart;
    const needsSpace = data.custom && position > 0 && !allowedAroundShortCode.includes(text[position - 1]);

    this.props.onPickEmoji(position, data, needsSpace);
  };

  render () {
    const {
      intl,
      onPaste,
      onDrop,
      autoFocus,
      withoutNavigation,
      maxChars,
      isSubmitting,
      singleColumn,
      surface,
    } = this.props;
    const { highlighted } = this.state;
    const success = this.getSuccessCopy();
    const showSuccess = this.shouldShowSuccess();
    const hasDraft = this.hasDraft();
    const showLead = surface === 'share';
    const intro = showLead ? this.getIntroCopy() : null;
    const showReturn = surface === 'page';
    const showKeyboardHint = surface !== 'share' && !singleColumn;

    return (
      <form
        className={classNames('compose-form', `compose-form--${surface}`)}
        onSubmit={this.handleSubmit}
      >
        {!withoutNavigation && <NavigationBar />}

        {showLead && (
          <div className='compose-form__lead'>
            <p className='compose-form__eyebrow'>
              {intl.formatMessage(intro.eyebrow)}
            </p>
            <h2 className='compose-form__title'>
              {intl.formatMessage(intro.title)}
            </h2>
            <p className='compose-form__lede'>
              {intl.formatMessage(intro.body)}
            </p>
          </div>
        )}

        <ReplyIndicator />
        <Warning />

        {showSuccess && (
          <div className='compose-form__success' role='status'>
            <div className='compose-form__success-copy'>
              <h3>{intl.formatMessage(success.title)}</h3>
              <p>{intl.formatMessage(success.body)}</p>
            </div>

            <div className='compose-form__success-actions'>
              <Button secondary onClick={this.handleOpenSubmittedStatus} type='button'>
                {intl.formatMessage(messages.openPost)}
              </Button>

              {showReturn && (
                <button
                  type='button'
                  className='link-button'
                  onClick={this.handleReturn}
                >
                  {intl.formatMessage(this.getReturnMessage())}
                </button>
              )}

              <button
                type='button'
                className='link-button'
                onClick={this.handleDismissSuccess}
              >
                {intl.formatMessage(messages.continueWriting)}
              </button>
            </div>
          </div>
        )}

        <div
          className={classNames('compose-form__highlightable', { active: highlighted })}
          ref={this.setRef}
        >
          <EditIndicator />

          <div className='compose-form__meta'>
            <div className='compose-form__dropdowns'>
              <VisibilityButton disabled={this.props.isEditing} />
              <LanguageDropdown />
            </div>

            {showKeyboardHint && (
              <p className='compose-form__keyboard-hint'>
                {intl.formatMessage(messages.keyboardHint)}
              </p>
            )}
          </div>

          {this.props.spoiler && (
            <div className='spoiler-input'>
              <div className='spoiler-input__border' />

              <AutosuggestInput
                placeholder={intl.formatMessage(messages.spoiler_placeholder)}
                value={this.props.spoilerText}
                disabled={isSubmitting}
                onChange={this.handleChangeSpoilerText}
                onKeyDown={this.handleKeyDownSpoiler}
                ref={this.setSpoilerText}
                suggestions={this.props.suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                onSuggestionSelected={this.onSpoilerSuggestionSelected}
                searchTokens={[':']}
                id='cw-spoiler-input'
                className='spoiler-input__input'
                lang={this.props.lang}
                spellCheck
              />

              <div className='spoiler-input__border' />
            </div>
          )}

          <AutosuggestTextarea
            ref={this.textareaRef}
            placeholder={intl.formatMessage(messages.placeholder)}
            disabled={isSubmitting}
            value={this.props.text}
            onChange={this.handleChange}
            suggestions={this.props.suggestions}
            onFocus={this.handleFocus}
            onKeyDown={this.handleKeyDownPost}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            onSuggestionSelected={this.onSuggestionSelected}
            onPaste={onPaste}
            onDrop={onDrop}
            autoFocus={autoFocus}
            lang={this.props.lang}
            className='compose-form__input'
          />

          <UploadForm />
          <PollForm />
          <ComposeQuotedStatus />

          <div className='compose-form__footer'>
            <div className='compose-form__footer-meta'>
              <p className='compose-form__toolbar-label'>
                {intl.formatMessage(messages.toolbarLabel)}
              </p>

              <div className='compose-form__status-line'>
                {hasDraft && (
                  <span className='compose-form__draft-hint'>
                    {intl.formatMessage(
                      surface === 'share'
                        ? messages.shareDraftHint
                        : messages.draftHint,
                    )}
                  </span>
                )}

                <CharacterCounter
                  max={maxChars}
                  text={this.getFulltextForCharacterCounting()}
                />
              </div>
            </div>

            <div className='compose-form__actions'>
              <div className='compose-form__buttons'>
                <UploadButtonContainer />
                <PollButtonContainer />
                <SpoilerButtonContainer />
                <EmojiPickerDropdown onPickEmoji={this.handleEmojiPick} />
              </div>

              <div className='compose-form__submit'>
                <Button
                  type='submit'
                  disabled={!this.canSubmit()}
                  loading={isSubmitting}
                >
                  {intl.formatMessage(
                    this.props.isEditing
                      ? messages.saveChanges
                      : (this.props.isInReply ? messages.reply : messages.publish),
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

export default injectIntl(ComposeForm);
