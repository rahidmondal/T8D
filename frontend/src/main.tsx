import { StrictMode } from 'react';

import { ThemeProvider } from '@components/ThemeProvider';
import App from '@src/App';
import { createRoot } from 'react-dom/client';

import '@src/index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  );
}
