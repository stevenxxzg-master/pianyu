import { useCallback, useState, useRef } from 'react';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

export const ColumnSearchHeader: React.FC<{
  onBack: () => void;
  onSubmit: (value: string) => void;
  onActivate: () => void;
  placeholder: string;
  active: boolean;
  className?: string;
  inputClassName?: string;
  cancelButtonClassName?: string;
}> = ({
  onBack,
  onActivate,
  onSubmit,
  placeholder,
  active,
  className,
  inputClassName,
  cancelButtonClassName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  // Reset the component when it turns from active to inactive.
  // [More on this pattern](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  const [previousActive, setPreviousActive] = useState(active);
  if (active !== previousActive) {
    setPreviousActive(active);
    if (!active) {
      setValue('');
    }
  }

  const handleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      setValue(value);
      onSubmit(value);
    },
    [setValue, onSubmit],
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
        inputRef.current?.blur();
      }
    },
    [onBack],
  );

  const handleFocus = useCallback(() => {
    onActivate();
  }, [onActivate]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit(value);
    },
    [onSubmit, value],
  );

  return (
    <form
      className={classNames('column-search-header', className)}
      onSubmit={handleSubmit}
    >
      <input
        className={inputClassName}
        ref={inputRef}
        type='search'
        value={value}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        placeholder={placeholder}
        onFocus={handleFocus}
      />

      {active && (
        <button
          type='button'
          className={classNames('link-button', cancelButtonClassName)}
          onClick={onBack}
        >
          <FormattedMessage id='column_search.cancel' defaultMessage='Cancel' />
        </button>
      )}
    </form>
  );
};
