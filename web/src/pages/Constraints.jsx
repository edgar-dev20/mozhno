import { useState, useEffect } from 'react';
import { Plus, Box, Type, Hash, ToggleLeft, Globe, Monitor, Settings2, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SidePanel } from '../components/SidePanel';
import { getProjects, getEnvironments, getContexts, createContext, updateContext, deleteContext } from '../api';

function iconForType(type) {
  switch (type) {
    case 'String': return Type;
    case 'Boolean': return ToggleLeft;
    case 'SemVer': return Settings2;
    case 'Number': return Hash;
    default: return Type;
  }
}

function getTypeColor(type) {
  switch (type) {
    case 'String': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
    case 'Boolean': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20';
    case 'SemVer': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
    case 'Number': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20';
    default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-gray-500/20';
  }
}

export function Constraints() {
  const [contexts, setContexts] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingContext, setEditingContext] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    constraintType: 'String',
    description: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const projects = await getProjects();
      if (projects && projects.length > 0) {
        const pid = projects[0].id;
        setProjectId(pid);
        const ctx = await getContexts(pid);
        setContexts(ctx || []);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingContext(null);
    setFormData({ name: '', constraintType: 'String', description: '' });
    setIsPanelOpen(true);
  };

  const handleOpenEdit = (ctx) => {
    setEditingContext(ctx);
    setFormData({ name: ctx.name, constraintType: 'String', description: ctx.description || '' });
    setIsPanelOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот контекст? Это может сломать сегменты, которые его используют.')) return;
    try {
      await deleteContext(projectId, id);
      setContexts(contexts.filter(c => c.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSave = async () => {
    try {
      if (editingContext) {
        const updated = await updateContext(projectId, editingContext.id, {
          name: formData.name,
          description: formData.description,
          projectId
        });
        setContexts(contexts.map(c => c.id === editingContext.id ? updated : c));
      } else {
        const created = await createContext(projectId, {
          name: formData.name,
          description: formData.description,
          projectId
        });
        setContexts([...contexts, created]);
      }
      setIsPanelOpen(false);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="text-center py-12 text-neutral-500">Загрузка...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Ошибка: {error}</div>;

  const IconComponent = Type;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Контексты</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Определите параметры (constraints) для таргетинга в сегментах</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Добавить поле
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50">
                <th className="px-6 py-4 font-medium">Свойство</th>
                <th className="px-6 py-4 font-medium">Ключ (Key)</th>
                <th className="px-6 py-4 font-medium">Тип данных</th>
                <th className="px-6 py-4 font-medium">Описание</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {contexts.map((ctx) => {
                return (
                  <tr key={ctx.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-400">
                          <IconComponent size={16} />
                        </div>
                        <div>
                          <span
                            className="font-medium text-neutral-900 dark:text-neutral-200 block cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                            onClick={() => handleOpenEdit(ctx)}
                          >
                            {ctx.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded text-sm font-mono text-indigo-600 dark:text-indigo-400">
                        {ctx.name?.toLowerCase().replace(/\s+/g, '_')}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border">
                        String
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 max-w-xs">
                      {ctx.description}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 outline-none p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800">
                            <MoreHorizontal size={18} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content className="min-w-[160px] bg-white dark:bg-neutral-900 rounded-lg p-1 shadow-lg border border-neutral-200 dark:border-neutral-800 z-50">
                            <DropdownMenu.Item
                              onClick={() => handleOpenEdit(ctx)}
                              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                            >
                              <Edit2 size={14} /> Редактировать
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                            <DropdownMenu.Item
                              onClick={() => handleDelete(ctx.id)}
                              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400"
                            >
                              <Trash2 size={14} /> Удалить
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                );
              })}
              {contexts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">Нет контекстов</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SidePanel
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        title={editingContext ? "Редактировать контекст" : "Новый контекст"}
        description={editingContext ? "Измените параметры пользовательского свойства" : "Добавьте новое свойство для таргетинга (например, age, plan_type)"}
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
              {editingContext ? "Сохранить изменения" : "Создать контекст"}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Например: Возраст пользователя"
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Ключ (Key)</label>
            <input
              type="text"
              value={formData.name?.toLowerCase().replace(/\s+/g, '_')}
              disabled
              placeholder="user_age"
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-mono text-sm"
            />
            <p className="text-xs text-neutral-500">Ключ генерируется автоматически из названия.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Зачем используется этот контекст..."
              rows={3}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
      </SidePanel>
    </div>
  );
}