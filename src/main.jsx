import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import Auth_Provider from './context/Auth_Context.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Auth_Provider>
        <App />
      </Auth_Provider>
    </BrowserRouter>
  </StrictMode>,
);