import React, { useState } from 'react';
import { Link } from 'react-router';
import { Mail, ArrowLeft } from '@/shared/icons';
import { GradientButton, ErrorBox } from '@/shared';
import { Input } from '@/app/components/ui/input';
import { Wordmark } from '@/shared/components/Wordmark';
import { api } from '@/api';
import { useT } from '@/i18n';

export function ForgotPassword() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSent(false);
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError((err as Error).message || t('auth.error.sendFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-subtle-start to-gradient-subtle-end dark:from-neutral-950 dark:to-blue-950/20 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="absolute top-[-180px] right-[-100px] w-[450px] h-[450px] bg-gradient-to-br from-gradient-start/10 to-gradient-end/5 dark:from-gradient-start/8 dark:to-gradient-end/4 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-violet-300/20 to-blue-300/20 dark:from-violet-600/10 dark:to-blue-600/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 dark:border-neutral-800/50 transition-colors animate-[fadeIn_0.5s_ease-out]">
          <div className="p-8">
            <div className="flex justify-center mb-4">
              <Wordmark text={t('common.appName')} size="xl" />
            </div>

            <div className="text-center mb-10">
              <p className="text-base font-medium text-muted-foreground">
                {t('auth.loginTagline')}
              </p>
            </div>

            {error && (
              <div className="mb-4">
                <ErrorBox>{error}</ErrorBox>
              </div>
            )}

            {sent ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {t('auth.forgotPasswordSent')}
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={16} />
                  {t('auth.backToLogin')}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80" htmlFor="email">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Mail size={18} className="text-muted-foreground/70" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={254}
                      className="pl-11"
                      placeholder={t('auth.emailPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <GradientButton
                  type="submit"
                  loading={loading}
                  size="lg"
                  className="w-full mt-6 py-3 hover:scale-[1.02] hover:shadow-xl"
                >
                  {t('auth.sendResetLink')}
                </GradientButton>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t('auth.backToLogin')}
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
