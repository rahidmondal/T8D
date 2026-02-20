import { StrictMode } from 'react';

import App from '@src/App';
import AuthProvider from '@src/components/AuthProvider';
import { RealtimeProvider } from '@src/components/RealtimeProvider';
import { SyncProvider } from '@src/components/SyncProvider';
import ThemeProvider from '@src/components/ThemeProvider';
import { createRoot } from 'react-dom/client';

import '@src/index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <SyncProvider>
            <RealtimeProvider>
              <App />
            </RealtimeProvider>
          </SyncProvider>
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}
