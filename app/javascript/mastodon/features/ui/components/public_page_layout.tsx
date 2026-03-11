import type { FC, ReactNode } from 'react';

import classNames from 'classnames';
import { Link } from 'react-router-dom';

export interface PublicPageNavItem {
  active?: boolean;
  description?: ReactNode;
  href?: string;
  label: ReactNode;
  rel?: string;
  target?: string;
  to?: string;
}

interface PublicPageLayoutProps {
  asideDescription?: ReactNode;
  asideFooter?: ReactNode;
  asideTitle?: ReactNode;
  children: ReactNode;
  className?: string;
  eyebrow: ReactNode;
  feature?: ReactNode;
  footer?: ReactNode;
  lede: ReactNode;
  mainClassName?: string;
  media?: ReactNode;
  navItems?: PublicPageNavItem[];
  title: ReactNode;
}

const PublicPageNavLink: FC<{ item: PublicPageNavItem }> = ({ item }) => {
  const className = classNames('public-page__nav-link', {
    'is-active': item.active,
  });
  const content = (
    <>
      <span className='public-page__nav-link__label'>{item.label}</span>
      {item.description && (
        <span className='public-page__nav-link__description'>
          {item.description}
        </span>
      )}
    </>
  );

  if (item.href) {
    return (
      <a
        aria-current={item.active ? 'page' : undefined}
        className={className}
        href={item.href}
        rel={item.rel}
        target={item.target}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      aria-current={item.active ? 'page' : undefined}
      className={className}
      rel={item.rel}
      target={item.target}
      to={item.to ?? '/'}
    >
      {content}
    </Link>
  );
};

export const PublicPageLayout: FC<PublicPageLayoutProps> = ({
  asideDescription,
  asideFooter,
  asideTitle,
  children,
  className,
  eyebrow,
  feature,
  footer,
  lede,
  mainClassName,
  media,
  navItems = [],
  title,
}) => {
  const showAside =
    navItems.length > 0 || !!asideTitle || !!asideDescription || !!asideFooter;

  return (
    <div className={classNames('scrollable public-page', className)}>
      <section className='public-page__hero'>
        <div className='public-page__eyebrow'>{eyebrow}</div>

        <div
          className={classNames('public-page__hero__grid', {
            'public-page__hero__grid--solo': !feature,
          })}
        >
          <div className='public-page__hero__copy'>
            <h1>{title}</h1>
            <p>{lede}</p>
          </div>

          {feature && <div className='public-page__feature'>{feature}</div>}
        </div>

        {media && <div className='public-page__media'>{media}</div>}
      </section>

      <div
        className={classNames('public-page__body', {
          'public-page__body--single': !showAside,
        })}
      >
        <div className={classNames('public-page__main', mainClassName)}>
          {children}
        </div>

        {showAside && (
          <aside className='public-page__aside'>
            <div className='public-page__aside-card'>
              {asideTitle && (
                <p className='public-page__aside-card__eyebrow'>{asideTitle}</p>
              )}
              {asideDescription && (
                <p className='public-page__aside-card__description'>
                  {asideDescription}
                </p>
              )}

              {navItems.length > 0 && (
                <nav className='public-page__nav' aria-label='Public pages'>
                  {navItems.map((item) => (
                    <PublicPageNavLink
                      item={item}
                      key={
                        typeof item.label === 'string'
                          ? item.label
                          : (item.to ?? item.href ?? 'item')
                      }
                    />
                  ))}
                </nav>
              )}

              {asideFooter && (
                <div className='public-page__aside-card__footer'>
                  {asideFooter}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {footer}
    </div>
  );
};
