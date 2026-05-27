import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AmbientBackground from '../components/landing/AmbientBackground';
import { useAuthStore } from '../store/authStore';
import { bootstrapDatabase } from '../database/core/bootstrap';

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, register, init } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const user = await register(username.trim(), email.trim(), password);
      if (user?.userId) {
        await bootstrapDatabase(user.userId);
        navigate('/home');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-jarvis-bg px-6">
      <AmbientBackground />

      <div className="relative z-10 w-full max-w-sm rounded-lg border border-jarvis-border bg-black/40 p-8 backdrop-blur-xl">
        <h2 className="mb-6 text-center text-2xl font-semibold tracking-widest text-jarvis-text">
          INITIALIZE IDENTITY
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-jarvis-muted mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/[0.03] border border-jarvis-border rounded px-4 py-2 text-jarvis-text focus:outline-none focus:border-jarvis-accent/50 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-jarvis-muted mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.03] border border-jarvis-border rounded px-4 py-2 text-jarvis-text focus:outline-none focus:border-jarvis-accent/50 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-jarvis-muted mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.03] border border-jarvis-border rounded px-4 py-2 text-jarvis-text focus:outline-none focus:border-jarvis-accent/50 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-jarvis-muted mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/[0.03] border border-jarvis-border rounded px-4 py-2 text-jarvis-text focus:outline-none focus:border-jarvis-accent/50 transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-[10px] text-center uppercase tracking-widest">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded border border-jarvis-border text-jarvis-text hover:bg-white/[0.05] transition-all duration-300 tracking-[0.2em] text-sm"
          >
            {loading ? 'INITIALIZING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-[10px] text-jarvis-muted hover:text-jarvis-accent uppercase tracking-widest transition-colors"
          >
            Already have identity? Authenticate
          </Link>
        </div>
      </div>
    </div>
  );
}

