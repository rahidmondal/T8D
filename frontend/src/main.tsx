import { StrictMode } from 'react';

import { ThemeProvider } from '@components/ThemeContext';
import App from '@src/App';
import { createRoot } from 'react-dom/client';

import '@src/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      registration => {
        console.log('Service Worker registered: ', registration);
      },
      error => {
        console.log('Service Worker registration failed: ', error);
      },
    );
  });
}
