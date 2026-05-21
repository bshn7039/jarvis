import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App.jsx';
import { bootstrapDatabase } from './database/core/bootstrap';

async function init() {
  try {
    await bootstrapDatabase();
  } catch (err) {
    console.error('Failed to bootstrap database:', err);
  }
  
  createRoot(document.getElementById('root')).render(<App />);
}

init();
