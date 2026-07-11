import React, { useState } from 'react';
import { Link } from 'react-router';
import { Lock } from '@/shared/icons';
import { GradientButton, ErrorBox, getErrorMessage, getTokenFromHash } from '@/shared';
import { Input } from '@/app/components/ui/input';
import { Wordmark } from '@/shared/components/Wordmark';
import { api } from '@/api';
import { useT } from '@/i18n';

export function ResetPassword() {
  const [token] = useState(getTokenFromHash);
  const t = useT();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(t('auth.error.passwordTooShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.error.passwordsNotMatch'));
      return;
    }
    if (!token) {
      setError(t('auth.invalidToken'));
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="absolute top-[-180px] right-[-100px] w-[450px] h-[450px] bg-gradient-to-br from-gradient-start/10 to-gradient-end/5 dark:from-gradient-start/8 dark:to-gradient-end/4 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-primary/10 to-info/10 dark:from-primary/15 dark:to-info/15 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-border transition-colors animate-[fadeIn_0.5s_ease-out]">
          <div className="p-6 sm:p-8">
            <div className="flex justify-center mb-4">
              <Wordmark text={t('common.appName')} size="xl" />
            </div>

            <div className="text-center mb-10">
              <p className="text-body font-medium text-muted-foreground">
                {t('auth.loginTagline')}
              </p>
            </div>

            {error && (
              <div className="mb-4">
                <ErrorBox>{error}</ErrorBox>
              </div>
            )}

            {done ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-success dark:bg-success/10 border border-success dark:border-success/20 rounded-xl">
                  <p className="text-body-sm text-success dark:text-success">
                    {t('auth.passwordChanged')}
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 text-body-sm font-semibold text-primary-foreground bg-primary px-6 py-3 rounded-lg hover:bg-primary/90 shadow-lg transition-all"
                >
                  {t('auth.login')}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-body-sm font-medium text-foreground/80" htmlFor="password">
                    {t('auth.newPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Lock size={18} className="text-muted-foreground/70" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      maxLength={128}
                      className="pl-11"
                      placeholder={t('auth.passwordPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-body-sm font-medium text-foreground/80" htmlFor="confirm">
                    {t('auth.confirmPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Lock size={18} className="text-muted-foreground/70" />
                    </div>
                    <Input
                      id="confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      maxLength={128}
                      className="pl-11"
                      placeholder={t('auth.passwordPlaceholder')}
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
                  {t('auth.resetPassword')}
                </GradientButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
