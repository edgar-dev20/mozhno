import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Lock, UserRound } from "@/shared/icons";
import { GradientButton, ErrorBox } from "@/shared";
import { Input } from "@/app/components/ui/input";
import { Wordmark } from '@/shared/components/Wordmark';
import { api } from "@/api";
import { useT } from '@/i18n';

export function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const t = useT();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(t('auth.error.nameRequired'));
      return;
    }
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
      await api.auth.acceptInvite(token, name.trim(), password);
      setDone(true);
    } catch (err) {
      setError((err as Error).message || t('auth.error.activationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-subtle-start to-gradient-subtle-end dark:from-neutral-950 dark:to-blue-950/20 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-blue-300/20 to-violet-300/20 dark:from-blue-600/10 dark:to-violet-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-violet-300/20 to-blue-300/20 dark:from-violet-600/10 dark:to-blue-600/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 dark:border-neutral-800/50 transition-colors animate-[fadeIn_0.5s_ease-out]">
          <div className="p-8">
            <div className="flex justify-center mb-4">
              <Wordmark text={t('common.appName')} size="xl" />
            </div>

            <div className="text-center mb-10">
              <p className="text-base font-medium text-muted-foreground">{t('auth.loginTagline')}</p>
            </div>

            {error && (
              <div className="mb-4">
                <ErrorBox>{error}</ErrorBox>
              </div>
            )}

            {done ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {t('auth.activationSuccess')}
                  </p>
                </div>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-gradient-start to-gradient-end px-6 py-3 rounded-xl hover:shadow-xl transition-shadow">
                  {t('auth.login')}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80" htmlFor="name">
                    {t('auth.name')}
                  </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <UserRound size={18} className="text-muted-foreground/70" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={120}
                    className="pl-11"
                    placeholder={t('auth.namePlaceholder')}
                    required
                  />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80" htmlFor="password">
                    {t('auth.password')}
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
                  <label className="text-sm font-medium text-foreground/80" htmlFor="confirm">
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
                  {t('auth.acceptInvite')}
                </GradientButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}