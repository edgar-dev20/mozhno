import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Auth() {
  const navigate = useNavigate();
  const { login, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/flags', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/flags', { replace: true });
    } catch (err) {
      setError(err.message || 'Ошибка входа');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-50 dark:from-neutral-950 dark:to-blue-950/20 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors">
      {/* Gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/30 to-violet-300/30 dark:from-blue-600/20 dark:to-violet-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-violet-300/30 to-blue-300/30 dark:from-violet-600/20 dark:to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/60 dark:border-neutral-800/50 transition-colors">
          <div className="p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-600 rounded-2xl blur-xl opacity-60"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-violet-600 px-7 py-4 rounded-2xl">
                  <div className="text-4xl font-semibold tracking-[0.25em] text-white" style={{ fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace' }}>
                    mozhno.
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent uppercase tracking-wider">Feature Flags Platform</p>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl text-neutral-800 dark:text-white font-bold">Добро пожаловать</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Войдите для управления флагами</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail size={18} className="text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/60 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder-neutral-400 dark:placeholder-neutral-600"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300" htmlFor="password">
                  Пароль
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={18} className="text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/60 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder-neutral-400 dark:placeholder-neutral-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Вход...' : 'Войти в систему'}
              </button>
            </form>
          </div>

          <div className="px-8 py-4 bg-gradient-to-r from-blue-50/80 to-violet-50/80 dark:from-neutral-950/50 dark:to-neutral-950/50 border-t border-neutral-200/50 dark:border-neutral-800/50 text-center text-sm text-neutral-600 dark:text-neutral-400 transition-colors">
            Нет аккаунта? <a href="#" className="font-semibold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-violet-700 transition-all">Свяжитесь с администратором</a>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-500">
          © 2026 mozhno. · Feature Flags Platform
        </div>
      </div>
    </div>
  );
}