import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { ToggleRight, Mail, Key } from 'lucide-react'

export function Auth() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    navigate('/flags')
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden transition-colors">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 dark:bg-indigo-500/20 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                <ToggleRight size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">mozhno</h1>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-lg text-neutral-800 dark:text-neutral-300 font-medium">С возвращением!</h2>
            <p className="text-sm text-neutral-500 mt-1">Управляйте доступом к функциям безопасно и быстро</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400" htmlFor="email">
                Рабочий Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-neutral-400 dark:text-neutral-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-neutral-400 dark:placeholder-neutral-600"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400" htmlFor="password">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={18} className="text-neutral-400 dark:text-neutral-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-neutral-400 dark:placeholder-neutral-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-neutral-600 dark:text-neutral-400">
                  Запомнить меня
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                  Забыли пароль?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-medium py-2.5 rounded-md transition-colors flex justify-center items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900"
            >
              Войти в систему
            </button>
          </form>
        </div>

        <div className="px-8 py-4 bg-neutral-50 dark:bg-neutral-950/50 border-t border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500">
          Нет аккаунта? <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium">Свяжитесь с администратором</a>
        </div>
      </div>
    </div>
  )
}