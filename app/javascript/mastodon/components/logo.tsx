import classNames from 'classnames';

import {
  BRAND_NAME,
  ICON_SYMBOL_ID,
  ICON_VIEWBOX,
  WORDMARK_SYMBOL_ID,
  WORDMARK_VIEWBOX,
} from '@/brand';
import logo from '@/brand/pianyu/logo.svg';

export const WordmarkLogo: React.FC = () => (
  <svg viewBox={WORDMARK_VIEWBOX} className='logo logo--wordmark' role='img'>
    <title>{BRAND_NAME}</title>
    <use xlinkHref={`#${WORDMARK_SYMBOL_ID}`} />
  </svg>
);

export const IconLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox={ICON_VIEWBOX}
    className={classNames('logo logo--icon', className)}
    role='img'
  >
    <title>{BRAND_NAME}</title>
    <use xlinkHref={`#${ICON_SYMBOL_ID}`} />
  </svg>
);

export const SymbolLogo: React.FC = () => (
  <img src={logo} alt={BRAND_NAME} className='logo logo--icon' />
);
