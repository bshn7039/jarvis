import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App.jsx';

if (window.location.hostname === '127.0.0.1' || window.location.hostname === '[::1]') {
  const target = window.location.href.replace('127.0.0.1', 'localhost').replace('[::1]', 'localhost');
  window.location.replace(target);
} else {
  createRoot(document.getElementById('root')).render(<App />);
}
