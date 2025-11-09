import { StrictMode } from 'react';

import App from '@src/App';
import AuthProvider from '@src/components/AuthProvider';
import { RealtimeProvider } from '@src/components/RealtimeProvider.tsx';
import ThemeProvider from '@src/components/ThemeProvider';
import { createRoot } from 'react-dom/client';

import '@src/index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <RealtimeProvider>
            <App />
          </RealtimeProvider>
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}
