import React, { useState } from 'react'
import { Plus, Users, Filter, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { SidePanel } from '../components/SidePanel'
import { useProject } from '../context/ProjectContext'
import { createSegment, updateSegment, deleteSegment } from '../api'

export function Segments() {
  const { currentProject, projectData, refreshProjectData } = useProject()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingSegment, setEditingSegment] = useState(null)

  const { segments } = projectData

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: ''
  })

  const handleOpenCreate = () => {
    setEditingSegment(null)
    setFormData({ name: '', description: '', rules: '' })
    setIsPanelOpen(true)
  }

  const handleOpenEdit = (segment) => {
    setEditingSegment(segment)
    setFormData({
      name: segment.name || '',
      description: segment.description || '',
      rules: segment.rules || ''
    })
    setIsPanelOpen(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Удалить этот сегмент?')) {
      try {
        await deleteSegment(currentProject.id, id)
        await refreshProjectData()
      } catch (e) {
        alert(e.message)
      }
    }
  }

  const handleSave = async () => {
    try {
      if (editingSegment) {
        await updateSegment(currentProject.id, editingSegment.id, formData)
      } else {
        await createSegment(currentProject.id, { ...formData, context: [] })
      }
      setIsPanelOpen(false)
      await refreshProjectData()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Сегменты</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Создавайте аудитории для таргетирования фиче-флагов</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Создать сегмент
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.length > 0 ? segments.map((segment) => (
          <div key={segment.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm relative group">
            <div className="flex justify-between items-start mb-4">
              <div
                className="bg-indigo-50 dark:bg-indigo-500/10 p-2.5 rounded-lg text-indigo-600 dark:text-indigo-400 cursor-pointer"
                onClick={() => handleOpenEdit(segment)}
              >
                <Users size={24} />
              </div>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 outline-none p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <MoreHorizontal size={20} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="min-w-[160px] bg-white dark:bg-neutral-900 rounded-lg p-1 shadow-lg border border-neutral-200 dark:border-neutral-800 z-50">
                    <DropdownMenu.Item
                      onClick={() => handleOpenEdit(segment)}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                    >
                      <Edit2 size={14} /> Редактировать
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                    <DropdownMenu.Item
                      onClick={() => handleDelete(segment.id)}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400"
                    >
                      <Trash2 size={14} /> Удалить
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>

            <h3
              className="text-lg font-medium text-neutral-900 dark:text-white mb-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
              onClick={() => handleOpenEdit(segment)}
            >
              {segment.name}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 line-clamp-2 h-10">{segment.description || '-'}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-neutral-400 dark:text-neutral-500" />
                <span className="text-neutral-600 dark:text-neutral-300">~{segment.usersCount || 0} пользователей</span>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-950 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <Filter size={12} />
                  Правила
                </div>
                <code className="text-xs font-mono text-emerald-600 dark:text-emerald-400 break-all line-clamp-2">
                  {segment.rules || 'Нет правил'}
                </code>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-12 text-neutral-500">
            {currentProject ? 'Нет сегментов в проекте' : 'Выберите проект'}
          </div>
        )}
      </div>

      <SidePanel
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        title={editingSegment ? "Редактировать сегмент" : "Новый сегмент"}
        description={editingSegment ? "Измените настройки аудитории" : "Создайте новую аудиторию пользователей"}
        footer={
          <>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {editingSegment ? "Сохранить изменения" : "Создать сегмент"}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название сегмента</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Beta Тестеры"
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Кто входит в этот сегмент?"
              rows={2}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Правила таргетинга</label>
            </div>
            <textarea
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              placeholder={`email.endsWith("@company.com")\n&&\nplan === "premium"`}
              rows={6}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-emerald-600 dark:text-emerald-400 font-mono text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <p className="text-xs text-neutral-500">Используйте ключи из Контекста для написания правил.</p>
          </div>
        </div>
      </SidePanel>
    </div>
  )
}