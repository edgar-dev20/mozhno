import { useState, useEffect } from 'react';
import { Plus, Tag as TagIcon, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SidePanel } from '../components/SidePanel';
import { getProjects, getTags, createTag, updateTag, deleteTag } from '../api';

const PRESET_COLORS = [
  { value: '#ef4444', label: 'Красный' },
  { value: '#f97316', label: 'Оранжевый' },
  { value: '#f59e0b', label: 'Янтарный' },
  { value: '#eab308', label: 'Желтый' },
  { value: '#84cc16', label: 'Лаймовый' },
  { value: '#22c55e', label: 'Зеленый' },
  { value: '#10b981', label: 'Изумрудный' },
  { value: '#14b8a6', label: 'Бирюзовый' },
  { value: '#06b6d4', label: 'Циановый' },
  { value: '#0ea5e9', label: 'Голубой' },
  { value: '#3b82f6', label: 'Синий' },
  { value: '#6366f1', label: 'Индиго' },
  { value: '#8b5cf6', label: 'Фиолетовый' },
  { value: '#a855f7', label: 'Пурпурный' },
  { value: '#d946ef', label: 'Фуксия' },
  { value: '#ec4899', label: 'Розовый' },
];

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function Tags() {
  const [tags, setTags] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0].value
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const projects = await getProjects();
      if (projects && projects.length > 0) {
        const pid = projects[0].id;
        setProjectId(pid);
        const data = await getTags(pid);
        setTags(data || []);
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
    setEditingTag(null);
    setFormData({ name: '', description: '', color: PRESET_COLORS[0].value });
    setIsPanelOpen(true);
  };

  const handleOpenEdit = (tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, description: tag.description || '', color: tag.color || PRESET_COLORS[0].value });
    setIsPanelOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот тег? Он будет удален из всех флагов.')) return;
    try {
      await deleteTag(projectId, id);
      setTags(tags.filter(t => t.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSave = async () => {
    try {
      if (editingTag) {
        const updated = await updateTag(projectId, editingTag.id, {
          name: formData.name,
          description: formData.description,
          color: formData.color
        });
        setTags(tags.map(t => t.id === editingTag.id ? updated : t));
      } else {
        const created = await createTag(projectId, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          projectId
        });
        setTags([created, ...tags]);
      }
      setIsPanelOpen(false);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="text-center py-12 text-neutral-500">Загрузка...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Ошибка: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Теги</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Организуйте флаги с помощью цветных меток</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          Создать тег
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map(tag => (
          <div
            key={tag.id}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm relative group"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white font-medium text-sm bg-gradient-to-r shadow-sm"
                style={{
                  backgroundImage: `linear-gradient(to right, ${tag.color || '#3b82f6'}, ${adjustColor(tag.color || '#3b82f6', 20)})`
                }}
              >
                <TagIcon size={14} />
                {tag.name}
              </div>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 outline-none p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={18} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="min-w-[160px] bg-white dark:bg-neutral-900 rounded-lg p-1 shadow-lg border border-neutral-200 dark:border-neutral-800 z-50">
                    <DropdownMenu.Item
                      onClick={() => handleOpenEdit(tag)}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                    >
                      <Edit2 size={14} /> Редактировать
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                    <DropdownMenu.Item
                      onClick={() => handleDelete(tag.id)}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400"
                    >
                      <Trash2 size={14} /> Удалить
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {tag.description}
            </p>
          </div>
        ))}
        {tags.length === 0 && (
          <div className="col-span-full text-center py-12 text-neutral-500">Нет тегов</div>
        )}
      </div>

      <SidePanel
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        title={editingTag ? "Редактировать тег" : "Новый тег"}
        description={editingTag ? "Измените параметры тега" : "Создайте новый тег для организации флагов"}
        footer={
          <>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              {editingTag ? "Сохранить изменения" : "Создать тег"}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название тега</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Например: Backend"
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Зачем используется этот тег?"
              rows={2}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Цвет</label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({...formData, color: color.value})}
                  className={`w-10 h-10 rounded-lg transition-all bg-gradient-to-r shadow-sm ${
                    formData.color === color.value
                      ? 'ring-2 ring-offset-2 ring-violet-500 dark:ring-offset-neutral-950 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(to right, ${color.value}, ${adjustColor(color.value, 20)})`
                  }}
                  title={color.label}
                />
              ))}
            </div>
            {formData.color && (
              <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Предпросмотр:</span>
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white font-medium text-sm bg-gradient-to-r shadow-sm"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${formData.color}, ${adjustColor(formData.color, 20)})`
                    }}
                  >
                    <TagIcon size={14} />
                    {formData.name || 'Название тега'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidePanel>
    </div>
  );
}