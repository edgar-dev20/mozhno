import React, { useState, useEffect } from 'react';
import { Plus, Mail, Shield, Clock, MoreHorizontal, Trash2, Edit2, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SidePanel } from './SidePanel';
import { api, UserDto } from '../../api';

export function Users() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'viewer', status: 'active' });

  const loadUsers = async () => {
    try {
      const data = await api.users.list();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setError('');
    setFormData({ name: '', email: '', password: '', role: 'viewer', status: 'active' });
    setIsPanelOpen(true);
  };

  const handleOpenEdit = (user: UserDto) => {
    setEditingUser(user);
    setError('');
    setFormData({
      name: user.name ?? '',
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
    });
    setIsPanelOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этого пользователя?')) return;
    try {
      await api.users.delete(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      if (editingUser) {
        const payload: any = { name: formData.name, email: formData.email, role: formData.role, status: formData.status };
        if (formData.password) payload.password = formData.password;
        const updated = await api.users.update(editingUser.id, payload);
        setUsers(users.map(u => u.id === updated.id ? updated : u));
      } else {
        const created = await api.users.create({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
        });
        setUsers([created, ...users]);
      }
      setIsPanelOpen(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent';
      case 'developer': return 'bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent';
      default: return 'bg-gradient-to-r from-neutral-600 to-neutral-500 bg-clip-text text-transparent';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'developer': return 'Разработчик';
      case 'editor': return 'Редактор';
      case 'viewer': return 'Наблюдатель';
      default: return role;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'invited': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
      case 'suspended': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'invited': return 'Приглашен';
      case 'suspended': return 'Заблокирован';
      default: return status;
    }
  };

  const formatDate = (d: string) => {
    if (!d) return 'Никогда';
    return new Date(d).toLocaleString('ru-RU');
  };

  const filtered = filter ? users.filter(u => u.email.toLowerCase().includes(filter.toLowerCase()) || (u.name ?? '').toLowerCase().includes(filter.toLowerCase())) : users;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Пользователи</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Управление доступом и ролями пользователей</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
          <Plus size={18} /> Пригласить пользователя
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input type="text" placeholder="Поиск..." value={filter} onChange={e => setFilter(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Пользователь</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Роль</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Активность</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500">Загрузка...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500">Нет пользователей</td></tr>
            ) : filtered.map(user => (
              <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                      {(user.name ?? user.email).substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-200">{user.name ?? user.email}</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1"><Mail size={12} />{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2"><Shield size={14} className="text-neutral-400" /><span className={`font-medium ${getRoleBadge(user.role)}`}>{getRoleLabel(user.role)}</span></div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusBadge(user.status)}`}>{getStatusLabel(user.status)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400"><Clock size={14} />{formatDate(user.lastActiveAt)}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 outline-none p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"><MoreHorizontal size={18} /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => handleOpenEdit(user)}><Edit2 size={14} /> Редактировать</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => handleDelete(user.id)}><Trash2 size={14} /> Удалить</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SidePanel open={isPanelOpen} onOpenChange={setIsPanelOpen} title={editingUser ? "Редактировать" : "Пригласить"} description={editingUser ? "Измените роль и параметры" : "Пригласите нового пользователя"}
        footer={<>
          <button onClick={() => setIsPanelOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">Отмена</button>
          <button onClick={handleSave} disabled={saving || !formData.email || (!editingUser && !formData.password)} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 rounded-lg">{saving ? 'Сохранение...' : editingUser ? 'Сохранить' : 'Отправить'}</button>
        </>}>
        <div className="space-y-5">
          {error && <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-700 dark:text-red-400">{error}</div>}
          <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Имя</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Имя Фамилия" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@company.com" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
          {!editingUser && <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Пароль</label><input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>}
          <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Роль</label>
            <div className="space-y-2">{(['admin', 'developer', 'viewer'] as const).map(role => (
              <label key={role} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.role === role ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'border-neutral-200 dark:border-neutral-800'}`}>
                <input type="radio" name="role" checked={formData.role === role} onChange={() => setFormData({...formData, role})} className="mt-0.5" />
                <div><div className={`font-medium ${getRoleBadge(role)}`}>{getRoleLabel(role)}</div><div className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">{role === 'admin' ? 'Полный доступ' : role === 'developer' ? 'Управление флагами' : 'Только чтение'}</div></div>
              </label>
            ))}</div>
          </div>
          {editingUser && <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Статус</label>
            <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
              <SelectTrigger className="w-full rounded-lg [&>span]:text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активен</SelectItem>
                <SelectItem value="invited">Приглашен</SelectItem>
                <SelectItem value="suspended">Заблокирован</SelectItem>
              </SelectContent>
            </Select></div>
          }
        </div>
      </SidePanel>
    </div>
  );
}