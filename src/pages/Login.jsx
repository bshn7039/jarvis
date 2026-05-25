import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AmbientBackground from '../components/landing/AmbientBackground';
import { bootstrapDatabase } from '../database/core/bootstrap';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login, init } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        const authUser = useAuthStore.getState().user;
        await bootstrapDatabase(authUser.userId);
        navigate('/home');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-jarvis-bg px-6">
      <AmbientBackground />
      
      <div className="relative z-10 w-full max-w-sm rounded-lg border border-jarvis-border bg-black/40 p-8 backdrop-blur-xl">
        <h2 className="mb-6 text-center text-2xl font-semibold tracking-widest text-jarvis-text">
          IDENTIFY
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-jarvis-muted mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/[0.03] border border-jarvis-border rounded px-4 py-2 text-jarvis-text focus:outline-none focus:border-jarvis-accent/50 transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-jarvis-muted mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.03] border border-jarvis-border rounded px-4 py-2 text-jarvis-text focus:outline-none focus:border-jarvis-accent/50 transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-[10px] text-center uppercase tracking-widest">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded border border-jarvis-border text-jarvis-text hover:bg-white/[0.05] transition-all duration-300 tracking-[0.2em] text-sm"
          >
            {loading ? 'PROCESSING...' : 'ENTER'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/register" className="text-[10px] text-jarvis-muted hover:text-jarvis-accent uppercase tracking-widest transition-colors">
            New System? Initialize Identity
          </Link>
        </div>
      </div>
    </div>
  );
}
