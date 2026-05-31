import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router';
import { useTheme } from 'next-themes';
import {
  ToggleRight,
  Flag,
  Users,
  GitBranch,
  Settings,
  LogOut,
  Search,
  Bell,
  Sun,
  Moon,
  Key,
  Box,
  Tag
} from 'lucide-react';

export function DashboardLayout() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { path: '/flags', label: 'Флаги', icon: Flag },
    { path: '/segments', label: 'Сегменты', icon: Users },
    { path: '/constraints', label: 'Контексты', icon: Box },
    { path: '/strategies', label: 'Стратегии', icon: GitBranch },
    { path: '/tags', label: 'Теги', icon: Tag },
  ];

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors">
      <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 flex flex-col transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
            <ToggleRight size={28} strokeWidth={2.5} />
            <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">mozhno</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto">
          <div className="px-3 mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-500 uppercase tracking-wider mt-2">
            Управление
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-500'} />
                {item.label}
              </NavLink>
            );
          })}

          <div className="mt-8 px-3 mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-500 uppercase tracking-wider">
            Разработка
          </div>
          <NavLink
            to="/apikeys"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium w-full text-left ${
              location.pathname.startsWith('/apikeys')
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Key size={18} className={location.pathname.startsWith('/apikeys') ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-500'} />
            API Ключи
          </NavLink>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors text-sm font-medium w-full text-left">
            <Settings size={18} className="text-neutral-500" />
            Настройки
          </button>
        </div>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 transition-colors">
          <NavLink
            to="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors text-sm font-medium w-full text-left"
          >
            <LogOut size={18} className="text-neutral-500" />
            Выйти
          </NavLink>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 transition-colors z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
              <input
                type="text"
                placeholder="Поиск..."
                className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-64 text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="relative text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-neutral-950"></span>
            </button>

            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-neutral-200 dark:ring-neutral-800 cursor-pointer">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-950 p-6 transition-colors">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}