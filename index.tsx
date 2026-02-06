
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Глубокий фикс для Gun.js и других Node-зависимостей в браузере
if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).process = { 
    env: { NODE_ENV: 'development' },
    nextTick: (cb: Function) => setTimeout(cb, 0),
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
} else {
  console.error("Не удалось найти элемент #root");
}
