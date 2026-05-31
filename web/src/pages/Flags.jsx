import React, { useState } from 'react'
import * as Switch from '@radix-ui/react-switch'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreHorizontal, Plus, Tag, Edit2, Trash2 } from 'lucide-react'
import { SidePanel } from '../components/SidePanel'
import { useProject } from '../context/ProjectContext'
import { createFlag, updateFlag, deleteFlag, createStrategy, updateStrategy } from '../api'

export function Flags() {
  const { currentProject, projectData, refreshProjectData } = useProject()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingFlag, setEditingFlag] = useState(null)

  const { flags } = projectData

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    flagType: 'RELEASE',
    enabled: false
  })

  const handleOpenCreate = () => {
    setEditingFlag(null)
    setFormData({ name: '', key: '', description: '', flagType: 'RELEASE', enabled: false })
    setIsPanelOpen(true)
  }

  const handleOpenEdit = (flag) => {
    setEditingFlag(flag)
    setFormData({
      name: flag.name || '',
      key: flag.key || '',
      description: flag.description || '',
      flagType: flag.flagType || 'RELEASE',
      enabled: flag.enabled || false
    })
    setIsPanelOpen(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Вы уверены, что хотите удалить этот флаг?')) {
      try {
        await deleteFlag(currentProject.id, id)
        await refreshProjectData()
      } catch (e) {
        alert(e.message)
      }
    }
  }

  const handleSave = async () => {
    try {
      if (editingFlag) {
        await updateFlag(currentProject.id, editingFlag.id, formData)
      } else {
        await createFlag(currentProject.id, { ...formData, tags: [] })
      }
      setIsPanelOpen(false)
      await refreshProjectData()
    } catch (e) {
      alert(e.message)
    }
  }

  const toggleFlag = async (flag, newEnabled) => {
    try {
      await updateFlag(currentProject.id, flag.id, { ...flag, enabled: newEnabled })
      await refreshProjectData()
    } catch (e) {
      console.error('Failed to toggle flag:', e)
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'RELEASE': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
      case 'KILLSWITCH': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-gray-500/20'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'RELEASE': return 'Релиз'
      case 'KILLSWITCH': return 'Рубильник'
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Feature Flags</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Управляйте доступностью функций</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Создать флаг
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50">
                <th className="px-6 py-4 font-medium">Статус</th>
                <th className="px-6 py-4 font-medium">Название & Ключ</th>
                <th className="px-6 py-4 font-medium">Тип</th>
                <th className="px-6 py-4 font-medium">Описание</th>
                <th className="px-6 py-4 text-right font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {flags.length > 0 ? flags.map((flag) => (
                <tr 
                  key={flag.id}
                  onClick={() => handleOpenEdit(flag)}
                  className="group hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors duration-150 cursor-pointer active:bg-indigo-100/50 dark:active:bg-indigo-500/10"
                >
                  <td className="px-6 py-4 w-24" onClick={(e) => e.stopPropagation()}>
                    <Switch.Root
                      checked={flag.enabled}
                      onCheckedChange={(checked) => toggleFlag(flag, checked)}
                      className={`SwitchRoot w-[42px] h-[24px] rounded-full relative outline-none cursor-pointer transition-colors duration-200 ${
                        flag.enabled ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    >
                      <Switch.Thumb
                        className={`block w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          flag.enabled ? 'translate-x-[21px]' : 'translate-x-[3px]'
                        }`}
                      />
                    </Switch.Root>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-900 dark:text-neutral-200">
                        {flag.name}
                      </span>
                      <span className="text-xs font-mono text-neutral-500 mt-0.5">{flag.key}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getTypeColor(flag.flagType)}`}>
                      <Tag size={12} />
                      {getTypeLabel(flag.flagType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    {flag.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 outline-none">
                          <MoreHorizontal size={18} />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content className="min-w-[160px] bg-white dark:bg-neutral-900 rounded-lg p-1 shadow-lg border border-neutral-200 dark:border-neutral-800 z-50">
                          <DropdownMenu.Item
                            onClick={() => handleOpenEdit(flag)}
                            className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                          >
                            <Edit2 size={14} /> Редактировать
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                          <DropdownMenu.Item
                            onClick={() => handleDelete(flag.id)}
                            className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400"
                          >
                            <Trash2 size={14} /> Удалить
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    {currentProject ? 'Нет флагов в проекте' : 'Выберите проект'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SidePanel
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        title={editingFlag ? "Редактировать флаг" : "Новый флаг"}
        description={editingFlag ? "Измените настройки существующего флага" : "Создайте новый фиче-Флаг для управления функционалом"}
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
              disabled={!formData.name || !formData.key}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {editingFlag ? "Сохранить изменения" : "Создать флаг"}
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Новый чекаут"
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Ключ (Key)</label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              disabled={!!editingFlag}
              placeholder="new-checkout-flow"
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-mono text-sm transition-all"
            />
            <p className="text-xs text-neutral-500">Используется в коде. Нельзя изменить после создания.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Краткое описание флага..."
              rows={3}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Тип флага</label>
            <select
              value={formData.flagType}
              onChange={(e) => setFormData({ ...formData, flagType: e.target.value })}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none transition-all"
            >
              <option value="RELEASE">Релиз (Release)</option>
              <option value="KILLSWITCH">Рубильник (Kill-switch)</option>
            </select>
          </div>

          {!editingFlag && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Включить сразу</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Сделать флаг активным по умолчанию</p>
              </div>
              <Switch.Root
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                className={`SwitchRoot w-[42px] h-[24px] rounded-full relative outline-none cursor-pointer transition-colors duration-200 ${
                  formData.enabled ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600'
                }`}
              >
                <Switch.Thumb
                  className={`block w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    formData.enabled ? 'translate-x-[21px]' : 'translate-x-[3px]'
                  }`}
                />
              </Switch.Root>
            </div>
          )}
        </div>
      </SidePanel>
    </div>
  )
}
