import React, { useState } from 'react'
import { Key, Copy, Eye, EyeOff, Shield, Server, Smartphone, Plus } from 'lucide-react'
import { useProject } from '../context/ProjectContext'
import { createApiKey, deleteApiKey } from '../api'

export function ApiKeys() {
  const { currentProject, projectData, refreshProjectData } = useProject()
  const [showKey, setShowKey] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { apiKeys, environments } = projectData

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">API ключи</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Управляйте ключами доступа для подключения SDK</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Создать ключ
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50">
                <th className="px-6 py-4 font-medium">Название & Среда</th>
                <th className="px-6 py-4 font-medium">Тип</th>
                <th className="px-6 py-4 font-medium">Секретный ключ</th>
                <th className="px-6 py-4 font-medium">Создан</th>
                <th className="px-6 py-4 font-medium text-right">Последнее использование</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {apiKeys.length > 0 ? apiKeys.map((k) => (
                <tr key={k.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-900 dark:text-neutral-200">{k.name}</span>
                      <span className="text-xs font-medium mt-1 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${k.environmentId ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {k.environmentId ? environments.find(e => e.id === k.environmentId)?.name || 'env' : 'All'}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-300">
                      <Server size={14} className="text-indigo-500" />
                      Server
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 max-w-[240px]">
                      <div className="flex-1 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm font-mono text-neutral-700 dark:text-neutral-300 truncate">
                        {showKey === k.id ? k.apiKey : '••••••••••••••••••••••••••••'}
                      </div>
                      <button
                        onClick={() => setShowKey(showKey === k.id ? null : k.id)}
                        className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors p-1.5"
                      >
                        {showKey === k.id ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleCopy(k.apiKey)}
                        className="text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1.5"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400 text-right">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    {currentProject ? 'Нет API ключей в проекте' : 'Выберите проект'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-6 flex items-start gap-4">
        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
          <Shield size={20} />
        </div>
        <div>
          <h4 className="text-indigo-900 dark:text-white font-medium mb-1">Безопасность ключей</h4>
          <p className="text-sm text-indigo-700 dark:text-neutral-400 max-w-3xl">
            Client SDK ключи безопасны для использования на фронтенде (в браузере, мобильных приложениях).
            Server SDK ключи обладают полным доступом к данным и <strong>никогда не должны попадать на сторону клиента</strong>.
          </p>
        </div>
      </div>

      {showCreateModal && (
        <CreateApiKeyModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            refreshProjectData()
          }}
        />
      )}
    </div>
  )
}

function CreateApiKeyModal({ onClose, onCreated }) {
  const { currentProject, projectData } = useProject()
  const [name, setName] = useState('')
  const [environmentId, setEnvironmentId] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { environments } = projectData

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name) return

    try {
      setSubmitting(true)
      await createApiKey(currentProject.id, {
        name,
        environmentId: environmentId || null,
        description
      })
      onCreated()
    } catch (e) {
      alert(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Создать API ключ</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 block mb-1">Название</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Production Server SDK"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 block mb-1">Окружение</label>
            <select
              value={environmentId}
              onChange={(e) => setEnvironmentId(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Все окружения</option>
              {environments.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 block mb-1">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] resize-y"
              placeholder="Описание ключа..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {submitting ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}