import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Canvas from './pages/Canvas';
import Command from './pages/Command';
import AppErrorBoundary from './components/app/AppErrorBoundary';

function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/canvas" element={<Canvas />} />
          <Route path="/command" element={<Command />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

export default App;
