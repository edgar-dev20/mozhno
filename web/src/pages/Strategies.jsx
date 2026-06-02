import { Percent, Users, Settings, ArrowRight } from 'lucide-react';

export function Strategies() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Стратегии</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Управление раскаткой фич через сегменты и контекстные ограничения</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Percent size={24} />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Постепенная раскатка</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Настройте процент пользователей, которые увидят флаг. От 0% (никто) до 100% (все).
          </p>
          <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Настроить на странице флагов
            <ArrowRight size={16} className="ml-2" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Users size={24} />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Целевые сегменты</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Ограничьте аудиторию флага определёнными сегментами пользователей. Раскатка работает внутри выбранного сегмента.
          </p>
          <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Управлять сегментами
            <ArrowRight size={16} className="ml-2" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Settings size={24} />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Контекстные условия</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Добавьте кастомные ограничения по контексту: платформа, регион, версия приложения и другие параметры.
          </p>
          <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Настроить контексты
            <ArrowRight size={16} className="ml-2" />
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-6">
        <h4 className="text-indigo-900 dark:text-white font-medium mb-2">Как работает стратегия флага?</h4>
        <p className="text-sm text-indigo-700 dark:text-neutral-400 max-w-3xl">
          Каждый флаг в каждом окружении имеет одну стратегию, которая комбинирует:
          процент раскатки, целевой сегмент и дополнительные контекстные условия.
          Вы можете настроить, например, показ флага для 50% пользователей из сегмента "Premium"
          с дополнительным условием platform=ios. Настройка производится на странице флагов
          для каждого окружения отдельно.
        </p>
      </div>
    </div>
  );
}