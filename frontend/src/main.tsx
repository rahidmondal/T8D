import { StrictMode } from 'react';

import App from '@src/App';
import AuthProvider from '@src/components/AuthProvider';
import ThemeProvider from '@src/components/ThemeProvider';
import { createRoot } from 'react-dom/client';

import '@src/index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}
