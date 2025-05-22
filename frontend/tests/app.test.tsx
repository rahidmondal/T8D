import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import App from '../src/App';

describe('App', () => {
  test('renders sidebar and main layout', () => {
    render(<App />);
    // Sidebar (aside)
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    // Main content
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
