import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Canvas from './pages/Canvas';
import Command from './pages/Command';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Goals from './pages/Goals';
import Journal from './pages/Journal';
import Finance from './pages/Finance';
import Fitness from './pages/Fitness';
import CRM from './pages/CRM';
import Academics from './pages/Academics';
import AppErrorBoundary from './components/app/AppErrorBoundary';
import { useStoreHydration } from './hooks/useStoreHydration';

function App() {
  useStoreHydration();

  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/canvas" element={<Canvas />} />
          <Route path="/command" element={<Command />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/fitness" element={<Fitness />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

export default App;
