import { StrictMode } from 'react';

import { ThemeProvider } from '@components/ThemeContext';
import App from '@src/App';
import { createRoot } from 'react-dom/client';

import '@src/index.css';

import { registerSW } from 'virtual:pwa-register';

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

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh.');
  },
  onOfflineReady() {
    console.log('App is ready to work offline.');
  }
});
