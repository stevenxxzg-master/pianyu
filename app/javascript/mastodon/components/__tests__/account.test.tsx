import { fireEvent, render, screen } from '@/testing/rendering';
import { accountFactoryState, relationshipsFactory } from '@/testing/factories';

import { Account } from '../account';

describe('<Account />', () => {
  it('renders redesigned account card details and actions', async () => {
    const { container } = render(<Account id='1' withBio defaultAction='mute' />, {
      state: {
        accounts: {
          '1': accountFactoryState({
            followers_count: 42,
            note: 'This is a test user account.',
          }),
        },
        relationships: {
          '1': relationshipsFactory(),
        },
      },
    });

    expect(screen.getByText('This is a test user account.')).toBeTruthy();
    expect(container.querySelector('a.account__display-name')?.getAttribute('href')).toBe('/@testuser');
    expect(screen.getByRole('button', { name: 'Mute' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'More' }));

    expect(await screen.findByRole('button', { name: 'Mute notifications' })).toBeTruthy();
  });

  it('renders the relationship state for muted accounts', () => {
    render(<Account id='1' defaultAction='mute' />, {
      state: {
        accounts: {
          '1': accountFactoryState(),
        },
        relationships: {
          '1': relationshipsFactory({ muting: true }),
        },
      },
    });

    expect(screen.getByRole('button', { name: 'Unmute' })).toBeTruthy();
  });
});
