import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router';
import { useTheme } from 'next-themes';
import { useAuth } from '../context/AuthContext';
import {
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

const ROLE_LABELS = {
  admin: 'Администратор',
  editor: 'Редактор',
  viewer: 'Наблюдатель'
};

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { path: '/flags', label: 'Флаги', icon: Flag },
    { path: '/segments', label: 'Сегменты', icon: Users },
    { path: '/constraints', label: 'Контексты', icon: Box },
    { path: '/strategies', label: 'Стратегии', icon: GitBranch },
    { path: '/tags', label: 'Теги', icon: Tag },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans transition-colors">

      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl flex flex-col shadow-sm transition-colors relative z-10">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
          <div className="flex items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-600 rounded-xl blur-lg opacity-60"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-2 rounded-xl">
                <div className="text-lg font-semibold tracking-[0.25em] text-white" style={{ fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace' }}>
                  mozhno.
                </div>
              </div>
            </div>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-500/10 dark:to-violet-500/10 shadow-sm font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-neutral-400 dark:text-neutral-500'} />
                <span className={isActive ? 'bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent' : ''}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          <div className="mt-8 px-3 mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-500 uppercase tracking-wider">
            Разработка
          </div>
          <NavLink
            to="/apikeys"
            className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium w-full text-left ${
              isActive
                ? 'bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-500/10 dark:to-violet-500/10 shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            <Key size={18} className={location.pathname.startsWith('/apikeys') ? 'text-violet-600 dark:text-violet-400' : 'text-neutral-400 dark:text-neutral-500'} />
            <span className={location.pathname.startsWith('/apikeys') ? 'bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent' : ''}>
              API Ключи
            </span>
          </NavLink>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-sm font-medium w-full text-left">
            <Settings size={18} className="text-neutral-400 dark:text-neutral-500" />
            Настройки
          </button>
        </div>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 transition-colors">
          {user && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/50">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{user.email}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{ROLE_LABELS[user.role] || user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-sm font-medium w-full text-left cursor-pointer"
          >
            <LogOut size={18} className="text-neutral-400 dark:text-neutral-500" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 shadow-sm transition-colors">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
              <input
                type="text"
                placeholder="Поиск..."
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-64 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="relative text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full border-2 border-white dark:border-neutral-900"></span>
            </button>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-md cursor-pointer">
              {user ? user.email.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-6 transition-colors">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}