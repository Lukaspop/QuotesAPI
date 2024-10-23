import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QuoteProvider } from './QuotesContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QuoteProvider>
      <App />
    </QuoteProvider>
  </React.StrictMode>,
);
