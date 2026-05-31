import React, { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router'
import {
  ToggleRight,
  Flag,
  Users,
  GitBranch,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  Key,
  Box,
  ChevronRight
} from 'lucide-react'
import { useProject } from '../context/ProjectContext'

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentProject, projects, selectProject, loadProjects } = useProject()
  const [environment, setEnvironment] = useState('Production')
  const [darkMode, setDarkMode] = useState(false)
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [envDropdownOpen, setEnvDropdownOpen] = useState(false)

  React.useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark', !darkMode)
  }

  const navItems = [
    { path: '/flags', label: 'Флаги', icon: Flag },
    { path: '/segments', label: 'Сегменты', icon: Users },
    { path: '/constraints', label: 'Контексты', icon: Box },
    { path: '/strategies', label: 'Стратегии', icon: GitBranch },
  ]

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''} bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors`}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 flex flex-col transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
            <ToggleRight size={28} strokeWidth={2.5} />
            <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">mozhno</span>
          </div>
        </div>

        {/* Project Selector */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <button
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-md text-sm transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {currentProject?.name?.[0]?.toUpperCase() || 'P'}
                </div>
                <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
                  {currentProject?.name || 'Select Project'}
                </span>
              </div>
              <ChevronRight size={14} className={`text-neutral-500 transition-transform ${projectDropdownOpen ? 'rotate-90' : ''}`} />
            </button>

            {projectDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-50">
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      selectProject(p.id)
                      setProjectDropdownOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {p.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto">
          <div className="px-3 mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-500 uppercase tracking-wider mt-2">
            Управление
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.path)
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
            )
          })}

          <div className="mt-8 px-3 mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-500 uppercase tracking-wider">
            Разработка
          </div>
          <NavLink
            to="/apikeys"
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium w-full text-left ${
              isActive
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Key size={18} className={location.pathname.startsWith('/apikeys') ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-500'} />
            API Ключи
          </NavLink>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors text-sm font-medium w-full text-left">
            <Settings size={18} className="text-neutral-500" />
            Настройки
          </button>
        </div>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 transition-colors">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors text-sm font-medium w-full text-left"
          >
            <LogOut size={18} className="text-neutral-500" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
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
            {/* Environment Switcher */}
            <div className="relative">
              <button
                onClick={() => setEnvDropdownOpen(!envDropdownOpen)}
                className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors rounded-full pl-3 pr-2 py-1 text-sm outline-none"
              >
                <span className={`w-2 h-2 rounded-full ${environment === 'Production' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                <span className="text-neutral-700 dark:text-neutral-300 font-medium">{environment}</span>
                <ChevronDown size={14} className="text-neutral-500 ml-1" />
              </button>

              {envDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 min-w-[160px] bg-white dark:bg-neutral-900 rounded-lg p-1 shadow-lg border border-neutral-200 dark:border-neutral-800 z-50">
                  <button
                    onClick={() => { setEnvironment('Production'); setEnvDropdownOpen(false) }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Production
                  </button>
                  <button
                    onClick={() => { setEnvironment('Development'); setEnvDropdownOpen(false) }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Development
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
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

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-950 p-6 transition-colors">
          <div className="max-w-6xl mx-auto">
            <Outlet context={{ environment }} />
          </div>
        </main>
      </div>
    </div>
  )
}