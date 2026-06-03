import React from 'react';
import { Percent, Split, AlertTriangle } from 'lucide-react';

const BUILTIN = [
  { name: 'Постепенная раскатка', description: 'Увеличивайте процент аудитории постепенно', icon: Percent, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { name: 'A/B Тестирование', description: 'Разделите трафик между несколькими вариантами', icon: Split, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { name: 'Аварийный рубильник', description: 'Экстренное отключение фичи при сбоях', icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
];

export function Strategies() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Стратегии</h1><p className="text-neutral-500 dark:text-neutral-400 mt-1">Стратегии развертывания для флагов</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUILTIN.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}><Icon size={22} className={s.color} /></div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">{s.name}</h3>
              <p className="text-sm text-neutral-500 mt-1">{s.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}