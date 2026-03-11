import { FormattedMessage } from 'react-intl';

export const SearchSection: React.FC<{
  title: React.ReactNode;
  onClickMore?: () => void;
  children: React.ReactNode;
}> = ({ title, onClickMore, children }) => (
  <section className='search-results__section'>
    <div className='search-results__section__header'>
      <h3>{title}</h3>
      {onClickMore && (
        <button onClick={onClickMore} type='button'>
          <FormattedMessage
            id='search_results.see_all'
            defaultMessage='See all'
          />
        </button>
      )}
    </div>

    <div className='search-results__section__body'>{children}</div>
  </section>
);
