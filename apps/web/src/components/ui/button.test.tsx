import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './button.tsx';

describe('Button', () => {
  it('defaults to type="button" so it never implicitly submits a form', () => {
    render(<Button>Plain</Button>);

    expect(screen.getByRole('button', { name: 'Plain' })).toHaveAttribute('type', 'button');
  });

  it('keeps an explicit type', () => {
    render(<Button type="submit">Send</Button>);

    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'submit');
  });
});
