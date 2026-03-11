import classNames from 'classnames';

export const BRAND_NAME = 'Mastodon';

export const WordmarkLogo: React.FC = () => (
  <svg viewBox='0 0 261 66' className='logo logo--wordmark' role='img'>
    <title>{BRAND_NAME}</title>
    <use xlinkHref='#logo-symbol-wordmark' />
  </svg>
);

export const IconLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox='0 0 79 79'
    className={classNames('logo logo--icon', className)}
    role='img'
  >
    <title>{BRAND_NAME}</title>
    <use xlinkHref='#logo-symbol-icon' />
  </svg>
);

export const SymbolLogo = IconLogo;
