import React from 'react'
import { Plus, Percent, Split, AlertTriangle, ArrowRight } from 'lucide-react'

export function Strategies() {
  const strategies = [
    {
      id: '1',
      name: 'Постепенная раскатка',
      description: 'Увеличивайте процент аудитории постепенно',
      icon: Percent,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10'
    },
    {
      id: '2',
      name: 'A/B Тестирование',
      description: 'Разделите трафик между несколькими вариантами',
      icon: Split,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-500/10'
    },
    {
      id: '3',
      name: 'Аварийный рубильник',
      description: 'Экстренное отключение фичи при сбоях',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-500/10'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Стратегии</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Шаблоны развертывания для безопасного релиза фич</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} />
          Создать стратегию
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => {
          const Icon = strategy.icon
          return (
            <div key={strategy.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 group hover:border-indigo-500/50 transition-all cursor-pointer shadow-sm">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${strategy.bg} ${strategy.color}`}>
                <Icon size={24} />
              </div>

              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">{strategy.name}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 min-h-[40px]">{strategy.description}</p>

              <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">
                Настроить шаблон
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-6 flex items-start gap-4">
        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h4 className="text-indigo-900 dark:text-white font-medium mb-1">Как работают стратегии?</h4>
          <p className="text-sm text-indigo-700 dark:text-neutral-400 max-w-3xl">
            Стратегии позволяют комбинировать сегменты и правила для сложного таргетинга.
            Например, вы можете запустить фичу только для 10% пользователей из сегмента "Premium подписчики",
            или разделить аудиторию на контрольную и тестовую группы для проведения A/B экспериментов.
          </p>
        </div>
      </div>
    </div>
  )
}