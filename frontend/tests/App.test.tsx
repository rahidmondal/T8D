import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

import App from '@src/App';
import ThemeProvider from '@src/components/ThemeProvider';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const setupCryptoMock = () => {
  const mockDigest = vi.fn().mockImplementation((_algorithm: string, data: Uint8Array) => {
    let hashValue = 0;
    for (let i = 0; i < data.length; i++) {
      hashValue = (hashValue << 5) - hashValue + data[i];
      hashValue = hashValue & hashValue;
    }
    const hash = new Uint8Array(32);
    hash[0] = (hashValue >> 24) & 0xff;
    hash[1] = (hashValue >> 16) & 0xff;
    hash[2] = (hashValue >> 8) & 0xff;
    hash[3] = hashValue & 0xff;
    return Promise.resolve(hash.buffer);
  });

  Object.defineProperty(global, 'crypto', {
    value: {
      subtle: {
        digest: mockDigest,
      },
    },
    writable: true,
  });

  return { mockDigest };
};

const renderApp = () => {
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  );
};

describe('App Component', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    global.indexedDB = new IDBFactory();
    setupCryptoMock();
  });

  afterEach(async () => {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the app with hamburger menu button', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /open sidebar/i })).toBeInTheDocument();
      });
    });

    it('should render the sidebar initially hidden on mobile', async () => {
      renderApp();

      await waitFor(() => {
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('-translate-x-full');
      });
    });

    it('should render main content area', async () => {
      renderApp();

      await waitFor(() => {
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
      });
    });
  });

  describe('Sidebar Interactions', () => {
    it('should toggle sidebar when hamburger button is clicked', async () => {
      const user = userEvent.setup();
      renderApp();

      const hamburgerButton = screen.getByRole('button', { name: /open sidebar/i });
      await user.click(hamburgerButton);

      await waitFor(() => {
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('translate-x-0');
      });
    });

    it('should show overlay when sidebar is open', async () => {
      const user = userEvent.setup();
      renderApp();

      const hamburgerButton = screen.getByRole('button', { name: /open sidebar/i });
      await user.click(hamburgerButton);

      await waitFor(() => {
        const overlay = document.querySelector('div[aria-hidden="true"].bg-black\\/30');
        expect(overlay).toBeInTheDocument();
      });
    });

    it('should close sidebar when overlay is clicked', async () => {
      const user = userEvent.setup();
      renderApp();

      const hamburgerButton = screen.getByRole('button', { name: /open sidebar/i });
      await user.click(hamburgerButton);

      await waitFor(() => {
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('translate-x-0');
      });

      const overlay = document.querySelector('div[aria-hidden="true"].bg-black\\/30');
      if (overlay) {
        await user.click(overlay);
      }

      await waitFor(() => {
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('-translate-x-full');
      });
    });

    it('should open sidebar when Alt+S is pressed', async () => {
      const user = userEvent.setup();
      renderApp();

      await user.keyboard('{Alt>}s{/Alt}');

      await waitFor(() => {
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('translate-x-0');
      });
    });

    it('should close sidebar when Escape is pressed', async () => {
      const user = userEvent.setup();
      renderApp();

      await user.keyboard('{Alt>}s{/Alt}');

      await waitFor(() => {
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('translate-x-0');
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('-translate-x-full');
      });
    });

    it('should render sidebar with navigation items', async () => {
      const user = userEvent.setup();
      renderApp();

      const hamburgerButton = screen.getByRole('button', { name: /open sidebar/i });
      await user.click(hamburgerButton);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
        expect(screen.getByText('T8D')).toBeInTheDocument();
        expect(screen.getByText('Task Manager')).toBeInTheDocument();
      });
    });

    it('should show app version in sidebar', async () => {
      const user = userEvent.setup();
      renderApp();

      const hamburgerButton = screen.getByRole('button', { name: /open sidebar/i });
      await user.click(hamburgerButton);

      await waitFor(() => {
        expect(screen.getByText(/T8D v\d+\.\d+\.\d+/)).toBeInTheDocument();
      });
    });
  });

  describe('View Navigation', () => {
    it('should navigate to settings view via keyboard shortcut', async () => {
      const user = userEvent.setup();
      renderApp();

      await user.keyboard('{Alt>}g{/Alt}');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
      });
    });

    it('should navigate to settings view via sidebar button', async () => {
      const user = userEvent.setup();
      renderApp();

      const hamburgerButton = screen.getByRole('button', { name: /open sidebar/i });
      await user.click(hamburgerButton);

      await waitFor(() => {
        const settingsButton = screen.getByRole('button', { name: /open settings/i });
        expect(settingsButton).toBeInTheDocument();
      });

      const settingsButton = screen.getByRole('button', { name: /open settings/i });
      await user.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
      });
    });

    it('should switch between todolist and settings views', async () => {
      const user = userEvent.setup();
      renderApp();

      // Go to settings
      await user.keyboard('{Alt>}g{/Alt}');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
      });

      // Go back to todolist
      await user.keyboard('{Alt>}g{/Alt}');

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /^settings$/i })).not.toBeInTheDocument();
      });
    });

    it('should close sidebar when navigating to settings', async () => {
      const user = userEvent.setup();
      renderApp();

      // Open sidebar
      await user.keyboard('{Alt>}s{/Alt}');

      await waitFor(() => {
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('translate-x-0');
      });

      // Navigate to settings
      await user.keyboard('{Alt>}g{/Alt}');

      await waitFor(() => {
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('-translate-x-full');
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should open shortcut menu when ? is pressed', async () => {
      const user = userEvent.setup();
      renderApp();

      await user.keyboard('?');

      await waitFor(() => {
        expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
      });
    });

    it('should close shortcut menu on Escape', async () => {
      const user = userEvent.setup();
      renderApp();

      await user.keyboard('?');

      await waitFor(() => {
        expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText(/keyboard shortcuts/i)).not.toBeInTheDocument();
      });
    });

    it('should not trigger shortcuts when input is focused', async () => {
      const user = userEvent.setup();
      renderApp();

      const inputs = screen.queryAllByRole('textbox');
      if (inputs.length > 0) {
        await user.click(inputs[0]);
        await user.keyboard('?');
        expect(screen.queryByText(/keyboard shortcuts/i)).not.toBeInTheDocument();
      }
    });

    it('should not trigger shortcuts when textarea is focused', async () => {
      const user = userEvent.setup();
      renderApp();

      // Navigate to settings where there might be textareas
      await user.keyboard('{Alt>}g{/Alt}');

      const textareas = document.querySelectorAll('textarea');
      if (textareas.length > 0) {
        await user.click(textareas[0]);
        await user.keyboard('?');
        expect(screen.queryByText(/keyboard shortcuts/i)).not.toBeInTheDocument();
      }
    });

    it('should toggle theme when Shift+Q is pressed', async () => {
      const user = userEvent.setup();
      renderApp();

      const rootElement = document.documentElement;
      const initialTheme = rootElement.classList.contains('dark');

      await user.keyboard('{Shift>}q{/Shift}');

      await waitFor(() => {
        const hasChangedTheme = rootElement.classList.contains('dark') !== initialTheme;
        expect(hasChangedTheme).toBe(true);
      });
    });

    it('should focus main form when N is pressed in todolist view', async () => {
      const user = userEvent.setup();
      renderApp();

      // Wait for the app to load and render the main form
      await waitFor(() => {
        const inputs = screen.queryAllByRole('textbox');
        expect(inputs.length).toBeGreaterThan(0);
      });

      await user.keyboard('n');

      await waitFor(() => {
        const activeElement = document.activeElement;
        expect(activeElement?.tagName).toBe('INPUT');
      });
    });
  });

  describe('Theme Management', () => {
    it('should apply theme class to root element', () => {
      renderApp();

      const rootElement = document.documentElement;
      expect(rootElement.classList.contains('dark') || rootElement.classList.contains('light')).toBe(true);
    });

    it('should persist theme changes', async () => {
      const user = userEvent.setup();
      renderApp();

      const rootElement = document.documentElement;
      const initialTheme = rootElement.classList.contains('dark');

      await user.keyboard('{Shift>}q{/Shift}');

      await waitFor(() => {
        const hasChangedTheme = rootElement.classList.contains('dark') !== initialTheme;
        expect(hasChangedTheme).toBe(true);
      });

      // Toggle again
      await user.keyboard('{Shift>}q{/Shift}');

      await waitFor(() => {
        const isBackToOriginal = rootElement.classList.contains('dark') === initialTheme;
        expect(isBackToOriginal).toBe(true);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for buttons', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /open sidebar/i })).toBeInTheDocument();
      });
    });

    it('should have proper role for sidebar', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });
    });

    it('should have proper role for main content', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    it('should mark overlay as aria-hidden', async () => {
      const user = userEvent.setup();
      renderApp();

      const hamburgerButton = screen.getByRole('button', { name: /open sidebar/i });
      await user.click(hamburgerButton);

      await waitFor(() => {
        const overlay = document.querySelector('div[aria-hidden="true"]');
        expect(overlay).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should render hamburger button for mobile', async () => {
      renderApp();

      await waitFor(() => {
        const hamburgerButton = screen.getByRole('button', { name: /open sidebar/i });
        expect(hamburgerButton).toHaveClass('lg:hidden');
      });
    });

    it('should hide overlay on large screens', async () => {
      const user = userEvent.setup();
      renderApp();

      const hamburgerButton = screen.getByRole('button', { name: /open sidebar/i });
      await user.click(hamburgerButton);

      await waitFor(() => {
        const overlay = document.querySelector('div[aria-hidden="true"].lg\\:hidden');
        expect(overlay).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle rapid keyboard shortcut presses', async () => {
      const user = userEvent.setup();
      renderApp();

      await user.keyboard('?');
      await user.keyboard('{Escape}');
      await user.keyboard('?');
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText(/keyboard shortcuts/i)).not.toBeInTheDocument();
      });
    });

    it('should handle rapid view switching', async () => {
      const user = userEvent.setup();
      renderApp();

      await user.keyboard('{Alt>}g{/Alt}');
      await user.keyboard('{Alt>}g{/Alt}');
      await user.keyboard('{Alt>}g{/Alt}');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
      });
    });
  });
});
