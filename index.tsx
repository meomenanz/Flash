
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Безопасный фикс для Gun.js без использования TypeScript-приведения 'as any', 
// которое путает браузерный Babel
if (typeof window !== 'undefined') {
  window['global'] = window;
  window['process'] = { 
    env: { NODE_ENV: 'development' },
    nextTick: (cb) => setTimeout(cb, 0),
    browser: true
  };
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
