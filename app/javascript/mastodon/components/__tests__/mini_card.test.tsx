import LinkIcon from '@/material-icons/400-24px/link_2.svg?react';
import { render, screen } from '@/testing/rendering';

import { MiniCardList } from '../mini_card/list';

describe('<MiniCardList />', () => {
  it('renders redesigned mini cards with icons and links', () => {
    const { container } = render(
      <MiniCardList
        cards={[
          {
            label: 'Website',
            value: <a href='https://example.com'>example.com</a>,
            icon: LinkIcon,
          },
          {
            label: 'Location',
            value: 'Purris, France',
          },
        ]}
      />,
    );

    expect(screen.getByText('Website')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'example.com' }).getAttribute('href'),
    ).toBe('https://example.com');
    expect(screen.getByText('Location')).toBeTruthy();
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('does not render an empty list', () => {
    const { container } = render(<MiniCardList cards={[]} />);

    expect(container.firstChild).toBeNull();
  });
});
