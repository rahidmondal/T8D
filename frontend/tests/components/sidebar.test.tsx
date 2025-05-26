import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { SideBar } from '../../src/components/sidebar';

describe('SideBar', () => {
  test('renders sidebar navigation', () => {
    render(<SideBar />);
    // Check for navigation landmark
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    // Optionally check for some sidebar text or links
    // Example: expect(screen.getByText(/tasks/i)).toBeInTheDocument();
  });
});
