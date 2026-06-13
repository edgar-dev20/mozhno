import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, AlertCircle } from "@/shared/icons";
import { GradientButton } from "@/shared";
import { useAuth } from "@/app/auth/useAuth";
import { useT } from '@/i18n';

export function Auth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate('/flags');
    } catch (err) {
      setError((err as Error).message || t('auth.error.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-subtle-start to-gradient-subtle-end dark:from-neutral-950 dark:to-blue-950/20 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-blue-300/20 to-violet-300/20 dark:from-blue-600/10 dark:to-violet-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-violet-300/20 to-blue-300/20 dark:from-violet-600/10 dark:to-blue-600/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 dark:border-neutral-800/50 transition-colors animate-[fadeIn_0.5s_ease-out]">
          <div className="p-8">
            <div className="flex justify-center mb-4">
              <div className="text-4xl font-semibold tracking-[0.2em]" style={{ fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace' }}>
                <span className="bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent">{t('common.appName')}</span>
                <span className="bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent text-[0.55em] -ml-[0.35em]">.</span>
              </div>
            </div>

            <div className="text-center mb-10">
              <p className="text-base font-medium text-muted-foreground">{t('auth.loginTagline')}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80" htmlFor="email">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail size={18} className="text-muted-foreground/70" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={254}
                    className="w-full bg-card border border-border text-foreground rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
                    placeholder={t('auth.emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80" htmlFor="password">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={18} className="text-muted-foreground/70" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={128}
                    className="w-full bg-card border border-border text-foreground rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border dark:text-muted-foreground/70 bg-white dark:bg-neutral-800 accent-gradient-start"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-muted-foreground">{t('auth.rememberMe')}</label>
                </div>
                <div className="text-sm">
                  <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground transition-colors">{t('auth.forgotPassword')}</Link>
                </div>
              </div>

              <GradientButton
                type="submit"
                loading={loading}
                size="lg"
                className="w-full mt-6 py-3 hover:scale-[1.02] hover:shadow-xl"
              >
                {t('auth.login')}
              </GradientButton>
            </form>


          </div>
        </div>
      </div>
    </div>
  );
}