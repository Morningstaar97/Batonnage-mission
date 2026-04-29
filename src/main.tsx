import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('Sinisync: Initiating application boot...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Sinisync: Failed to find root element');
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log('Sinisync: Rendered successfully');
  } catch (error) {
    console.error('Sinisync: Fatal render error:', error);
    rootElement.innerHTML = `<div style="padding: 20px; color: white;">Erreur de chargement. Veuillez vérifier la console.</div>`;
  }
}
