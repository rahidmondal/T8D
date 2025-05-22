import { describe, expect, test, vi } from 'vitest';

// Mock createRoot from react-dom/client
vi.mock('react-dom/client', () => {
  return {
    createRoot: vi.fn(() => ({
      render: vi.fn(),
    })),
  };
});

describe('main entry', () => {
  test('calls createRoot and renders App', async () => {
    // Arrange
    const rootElem = document.createElement('div');
    rootElem.id = 'root';
    document.body.appendChild(rootElem);

    // Act
    await import('../src/main');

    // Assert
    const { createRoot } = await import('react-dom/client');
    expect(createRoot).toHaveBeenCalledWith(rootElem);
    // Clean up
    document.body.removeChild(rootElem);
  });
});
