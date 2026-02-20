import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Main Entry Point', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the app when root element exists', async () => {
    document.body.innerHTML = '<div id="root"></div>';

    const mockRender = vi.fn();
    const mockCreateRoot = vi.fn(() => ({
      render: mockRender,
    }));

    vi.doMock('react-dom/client', () => ({
      createRoot: mockCreateRoot,
    }));

    await import('@src/main');

    expect(mockCreateRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(mockRender).toHaveBeenCalled();
  });

  it('should not render when root element does not exist', async () => {
    vi.resetModules();
    document.body.innerHTML = '';

    const mockRender = vi.fn();
    const mockCreateRoot = vi.fn(() => ({
      render: mockRender,
    }));

    vi.doMock('react-dom/client', () => ({
      createRoot: mockCreateRoot,
    }));

    await import('@src/main');

    expect(mockCreateRoot).not.toHaveBeenCalled();
    expect(mockRender).not.toHaveBeenCalled();
  });
});
