import SearchIcon from '@/material-icons/400-24px/search.svg?react';
import { fireEvent, render, screen } from '@/testing/rendering';

import { TextInput, TextInputField } from '../text_input_field';

describe('<TextInputField />', () => {
  it('wires the label, hint, icon, and input value together', () => {
    const { container } = render(
      <TextInputField
        label='Search'
        hint='Find accounts and posts'
        icon={SearchIcon}
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Search' });

    fireEvent.change(input, { target: { value: 'alice' } });

    expect(screen.getByText('Find accounts and posts')).toBeTruthy();
    if (!(input instanceof HTMLInputElement))
      throw new TypeError('Expected text input');
    expect(input.value).toBe('alice');
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders disabled plain inputs', () => {
    render(<TextInput disabled defaultValue="This value can't be changed" />);

    const input = screen.getByRole('textbox');

    if (!(input instanceof HTMLInputElement))
      throw new TypeError('Expected text input');
    expect(input.disabled).toBe(true);
    expect(input.value).toBe("This value can't be changed");
  });
});
