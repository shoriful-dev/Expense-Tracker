import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext.jsx';

createRoot(document.getElementById('root')).render(
  <PreferencesProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </PreferencesProvider>,
);
