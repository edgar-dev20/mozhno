import { useState } from 'react';
import { Plus, Percent, Split, AlertTriangle, ArrowRight, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SidePanel } from '../components/SidePanel';

const ICON_MAP = {
  rollout: { icon: Percent, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  'ab-test': { icon: Split, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  'kill-switch': { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
  custom: { icon: Plus, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
};

const DEFAULT_STRATEGIES = [
  { id: '1', name: 'Постепенная раскатка', description: 'Увеличивайте процент аудитории постепенно', type: 'rollout' },
  { id: '2', name: 'A/B Тестирование', description: 'Разделите трафик между несколькими вариантами', type: 'ab-test' },
  { id: '3', name: 'Аварийный рубильник', description: 'Экстренное отключение фичи при сбоях', type: 'kill-switch' },
];

export function Strategies() {
  const [strategies, setStrategies] = useState(DEFAULT_STRATEGIES);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', type: 'rollout' });

  const handleOpenCreate = () => {
    setEditingStrategy(null);
    setFormData({ name: '', description: '', type: 'rollout' });
    setIsPanelOpen(true);
  };

  const handleOpenEdit = (strategy) => {
    setEditingStrategy(strategy);
    setFormData({ name: strategy.name, description: strategy.description, type: strategy.type });
    setIsPanelOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Удалить эту стратегию?')) {
      setStrategies(strategies.filter(s => s.id !== id));
    }
  };

  const handleSave = () => {
    const config = ICON_MAP[formData.type] || ICON_MAP.rollout;
    if (editingStrategy) {
      setStrategies(strategies.map(s => s.id === editingStrategy.id ? { ...s, name: formData.name, description: formData.description, type: formData.type, ...config } : s));
    } else {
      const newStrategy = {
        id: Math.random().toString(36).substring(7),
        name: formData.name,
        description: formData.description,
        type: formData.type,
        ...config
      };
      setStrategies([newStrategy, ...strategies]);
    }
    setIsPanelOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Стратегии</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Шаблоны развертывания для безопасного релиза фич</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Создать стратегию
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map(strategy => {
          const config = ICON_MAP[strategy.type] || ICON_MAP.rollout;
          const Icon = config.icon;
          return (
            <div key={strategy.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 group hover:border-indigo-500/50 transition-all shadow-sm relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 outline-none p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
                      <MoreHorizontal size={20} />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="min-w-[160px] bg-white dark:bg-neutral-900 rounded-lg p-1 shadow-lg border border-neutral-200 dark:border-neutral-800 z-50">
                      <DropdownMenu.Item
                        onClick={() => handleOpenEdit(strategy)}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                      >
                        <Edit2 size={14} /> Редактировать
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                      <DropdownMenu.Item
                        onClick={() => handleDelete(strategy.id)}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={14} /> Удалить
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>

              <div className="cursor-pointer" onClick={() => handleOpenEdit(strategy)}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${config.bg} ${config.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{strategy.name}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 min-h-[40px]">{strategy.description}</p>
                <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">
                  Настроить шаблон
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
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

      <SidePanel
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        title={editingStrategy ? "Редактировать стратегию" : "Новая стратегия"}
        description={editingStrategy ? "Измените параметры шаблона" : "Создайте новый шаблон развертывания фиче-флагов"}
        footer={
          <>
            <button onClick={() => setIsPanelOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {editingStrategy ? "Сохранить изменения" : "Создать стратегию"}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название стратегии</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Например: Канареечный релиз 5%"
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Базовый тип</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="rollout">Постепенная раскатка (Rollout)</option>
              <option value="ab-test">A/B Тестирование (A/B Test)</option>
              <option value="kill-switch">Рубильник (Kill-switch)</option>
              <option value="custom">Кастомная (Custom Rules)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Как работает эта стратегия?"
              rows={3}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">Настройки параметров</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              В данной версии настройка параметров (проценты, группы) недоступна. Вы можете задать общую структуру шаблона.
            </p>
          </div>
        </div>
      </SidePanel>
    </div>
  );
}