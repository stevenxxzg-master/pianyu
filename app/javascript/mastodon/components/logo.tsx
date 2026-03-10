import classNames from 'classnames';

import logo from '@/images/logo.svg';

const brandLabel = '片语 PianYu';

export const WordmarkLogo: React.FC = () => (
  <svg viewBox='0 0 300 72' className='logo logo--wordmark' role='img'>
    <title>{brandLabel}</title>
    <use xlinkHref='#logo-symbol-wordmark' />
  </svg>
);

export const IconLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox='0 0 72 72'
    className={classNames('logo logo--icon', className)}
    role='img'
  >
    <title>{brandLabel}</title>
    <use xlinkHref='#logo-symbol-icon' />
  </svg>
);

export const SymbolLogo: React.FC = () => (
  <img src={logo} alt={brandLabel} className='logo logo--icon' />
);
