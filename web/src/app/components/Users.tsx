import { useState, useEffect, useMemo } from 'react';
import { Plus, Mail, Shield, Clock, Trash2, Edit2, Fingerprint, ChevronDown, ChevronUp, Activity, User, Check } from "@/shared/icons";
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { SidePanel } from "@/app/components/SidePanel";
import { TipCard } from "@/app/components/TipCard";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { api, UserDto } from "@/api";
import { SectionHeader, GradientButton, EmptyState, LoadingState, SearchInput, ErrorBox } from "@/shared";
import { useT } from '@/i18n';
import { loadLocale, toIntlLocale } from '@/i18n/locale';
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";

export function Users() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(10);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'viewer', status: 'active' });
  const [initialFormData, setInitialFormData] = useState<typeof formData | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  const loadUsers = async () => {
    try {
      const data = await api.users.list();
      setUsers(data);
    } catch (e) {
      if (import.meta.env.DEV) console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);
  useEffect(() => { setDisplayLimit(10); }, [filter, roleFilter, statusFilter]);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setError('');
    setFormData({ name: '', email: '', password: '', role: 'viewer', status: 'active' });
    setInitialFormData(null);
    setIsPanelOpen(true);
  };

  const handleOpenEdit = (user: UserDto) => {
    setEditingUser(user);
    setError('');
    const initial = {
      name: user.name ?? '',
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
    };
    setFormData(initial);
    setInitialFormData(initial);
    setIsPanelOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.users.delete(deleteId);
      setUsers(users.filter(u => u.id !== deleteId));
      setExpandedIds(prev => { const next = new Set(prev); next.delete(deleteId); return next; });
      setDeleteId(null);
      setIsPanelOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('users.errors.delete'));
    } finally { setDeleting(false); }
  };

  const isDirty = useMemo(() => {
    if (!editingUser || !initialFormData) return false;
    return formData.name !== initialFormData.name
      || formData.email !== initialFormData.email
      || formData.role !== initialFormData.role
      || (editingUser && formData.status !== initialFormData.status)
      || (formData.password && formData.password !== '');
  }, [formData, editingUser, initialFormData]);

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      if (editingUser) {
        const payload: Record<string, unknown> = { name: formData.name, email: formData.email, role: formData.role, status: formData.status };
        if (formData.password) (payload as Record<string, string>).password = formData.password;
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('users.errors.save'));
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'from-red-600 to-red-500';
      case 'developer': return 'from-blue-600 to-violet-500';
      default: return 'from-neutral-600 to-neutral-500';
    }
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
      case 'developer': return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
      default: return 'text-foreground/80 bg-secondary dark:bg-neutral-500/10 border-border dark:border-neutral-500/20';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return t('users.role.admin');
      case 'developer': return t('users.role.developer');
      case 'editor': return t('users.role.editor');
      case 'viewer': return t('users.role.viewer');
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
      case 'active': return t('users.status.active');
      case 'invited': return t('users.status.invited');
      case 'suspended': return t('users.status.suspended');
      default: return status;
    }
  };

  const renderRoleFilterBtn = (role: string, label: string) => {
    const active = roleFilter === role;
    const icon = <Shield size={12} />;
    const style = role === 'admin'
      ? { on: 'bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-700 dark:text-red-300 border-red-500/20', off: 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent', icon: 'text-red-500' }
      : role === 'developer'
      ? { on: 'bg-gradient-to-r from-gradient-start/10 to-gradient-end/10 text-blue-700 dark:text-blue-300 border-blue-500/20', off: 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent', icon: 'text-blue-500' }
      : { on: 'bg-gradient-to-r from-neutral-500/10 to-neutral-500/10 text-foreground/80 border-neutral-500/20', off: 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent', icon: 'text-muted-foreground' };
    return (
      <button
        onClick={() => setRoleFilter(active ? null : role)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${active ? style.on : style.off}`}
      >
        {icon}
        {label}
      </button>
    );
  };

  const renderStatusFilterBtn = (status: string, label: string) => {
    const active = statusFilter === status;
    const style = status === 'active'
      ? { on: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20', off: 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent', dot: 'bg-emerald-500' }
      : { on: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20', off: 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent', dot: 'bg-red-500' };
    return (
      <button
        onClick={() => setStatusFilter(active ? null : status)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${active ? style.on : style.off}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {label}
      </button>
    );
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(toIntlLocale(loadLocale()), { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (d: string) => {
    if (!d) return t('users.time.never');
    return new Date(d).toLocaleString(toIntlLocale(loadLocale()), { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const timeAgo = (d: string) => {
    if (!d) return t('users.time.never');
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('users.time.justNow');
    if (mins < 60) return t('users.time.minutesAgo', { n: String(mins) });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('users.time.hoursAgo', { n: String(hours) });
    const days = Math.floor(hours / 24);
    if (days < 30) return t('users.time.daysAgo', { n: String(days) });
    return formatDate(d);
  };

  let filtered = users;
  if (roleFilter) filtered = filtered.filter(u => u.role === roleFilter);
  if (statusFilter) filtered = filtered.filter(u => u.status === statusFilter);
  if (filter.trim()) {
    const q = filter.toLowerCase();
    filtered = filtered.filter(u => u.email.toLowerCase().includes(q) || (u.name ?? '').toLowerCase().includes(q));
  }
  const visibleUsers = filtered.slice(0, displayLimit);
  const hasMoreUsers = displayLimit < filtered.length;
  const showMoreUsers = () => setDisplayLimit(prev => Math.min(prev + 10, filtered.length));
  const showAllUsers = () => setDisplayLimit(filtered.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title={t('users.title')}
          description={t('users.description')}
        />
        <GradientButton onClick={handleOpenCreate} icon={<Plus size={18} />}>{t('users.createInvite')}</GradientButton>
      </div>

      <TipCard
        text={t('users.tipText')}
        label="Zero Trust"
        icon={<Fingerprint />}
        storageKey="users"
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput value={filter} onChange={setFilter} />
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setRoleFilter(null)}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
              !roleFilter
                ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20'
                : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
            }`}
          >
            {t('users.filterAllRoles')}
          </button>
          {renderRoleFilterBtn('admin', t('users.role.admin'))}
          {renderRoleFilterBtn('developer', t('users.role.developer'))}
          {renderRoleFilterBtn('viewer', t('users.role.viewer'))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter(null)}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
              !statusFilter
                ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20'
                : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
            }`}
          >
            {t('users.filterAllStatuses')}
          </button>
          {renderStatusFilterBtn('active', t('users.status.active'))}
          {renderStatusFilterBtn('suspended', t('users.status.suspended'))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <LoadingState text={t('users.loading')} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Shield size={24} className="text-violet-500 dark:text-violet-400" />}
            title={t('users.emptyTitle')}
            description={filter || roleFilter || statusFilter ? t('users.emptyFiltered') : t('users.emptyDescription')}
            buttonLabel={!filter && !roleFilter && !statusFilter ? t('users.emptyButton') : undefined}
            onAction={!filter && !roleFilter && !statusFilter ? handleOpenCreate : undefined}
          />
        ) : (
          <>
          <AnimatePresence mode="popLayout">
            {visibleUsers.map((user, idx) => {
              const expanded = expandedIds.has(user.id);
              const initials = (user.name ?? user.email).substring(0, 2).toUpperCase();
              const hasAvatar = !!(user.avatar);
              const avatarUrl = api.users.getAvatarUrl(user.id);
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="group bg-card rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  id={`user-card-${user.id}`}
                >
                  <div
                    className="flex gap-4 px-4 py-3 cursor-pointer"
                    onClick={() => toggleExpand(user.id)}
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <Avatar className="w-8 h-8 shadow-md shrink-0">
                          <AvatarImage src={hasAvatar ? avatarUrl : undefined} alt={user.name ?? ''} />
                          <AvatarFallback className="bg-gradient-to-br from-gradient-start to-gradient-end text-xs font-bold text-white">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className="font-semibold text-sm text-foreground truncate group-hover:bg-gradient-to-r group-hover:from-gradient-start group-hover:to-gradient-end group-hover:bg-clip-text group-hover:text-transparent transition-all">
                            {user.name ?? user.email}
                          </span>
                          {user.name && (
                            <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              <Mail size={10} />{user.email}
                            </div>
                          )}
                        </div>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-1 rounded text-xs font-semibold border shrink-0 leading-none ${getRoleStyle(user.role)}`}>
                          <span className={`bg-gradient-to-r ${getRoleColor(user.role)} bg-clip-text text-transparent`}>{getRoleLabel(user.role)}</span>
                        </span>
                        <span className={`inline-flex items-center px-1.5 py-1 rounded text-xs font-semibold border shrink-0 leading-none ${getStatusBadge(user.status)}`}>
                          {getStatusLabel(user.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {!expanded && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <Clock size={10} />
                          {timeAgo(user.lastActiveAt)}
                        </span>
                      )}
                      {expanded ? (
                        <ChevronUp size={16} className="text-muted-foreground group-hover:text-violet-500 transition-colors" />
                      ) : (
                        <ChevronDown size={16} className="text-muted-foreground group-hover:text-violet-500 transition-colors" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-border">
                            <div className="px-3 py-2.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">Email</span>
                              <span className="text-xs text-foreground/80 flex items-center gap-1.5 truncate">
                                <Mail size={11} className="text-muted-foreground shrink-0" />
                                {user.email}
                              </span>
                            </div>
                            <div className="px-3 py-2.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('users.card.role')}</span>
                              <span className="text-xs font-medium flex items-center gap-1.5">
                                <Shield size={11} className="text-muted-foreground shrink-0" />
                                <span className={`bg-gradient-to-r ${getRoleColor(user.role)} bg-clip-text text-transparent truncate`}>{getRoleLabel(user.role)}</span>
                              </span>
                            </div>
                            <div className="px-3 py-2.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('users.card.status')}</span>
                              <span className={`inline-flex items-center px-1.5 py-1 rounded text-xs font-semibold border leading-none ${getStatusBadge(user.status)}`}>
                                {getStatusLabel(user.status)}
                              </span>
                            </div>
                            <div className="px-3 py-2.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('users.card.created')}</span>
                              <span className="text-xs text-foreground/80 flex items-center gap-1.5">
                                <Clock size={11} className="text-muted-foreground shrink-0" />
                                {formatDate(user.createdAt)}
                              </span>
                            </div>
                            <div className="px-3 py-2.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('users.card.lastActive')}</span>
                              <span className="text-xs text-foreground/80">
                                {formatDateTime(user.lastActiveAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 border-t border-border">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenEdit(user); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary border border-border rounded-xl hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                            >
                              <Edit2 size={12} />
                              {t('users.card.edit')}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteId(user.id); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary border border-border rounded-xl hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 size={12} />
                              {t('users.card.delete')}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {hasMoreUsers && (
            <div className="flex items-center justify-center gap-3 pt-3 pb-1">
              <GradientButton variant="secondary" onClick={showMoreUsers}>{t('users.list.showMore', { n: String(filtered.length - visibleUsers.length) })}</GradientButton>
              <GradientButton variant="secondary" onClick={showAllUsers} className="bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20">{t('users.list.showAll', { n: String(filtered.length) })}</GradientButton>
            </div>
          )}
          </>
        )}
      </div>

      <SidePanel open={isPanelOpen} onOpenChange={setIsPanelOpen} title={editingUser ? t('users.panel.editTitle') : t('users.panel.createTitle')} description={editingUser ? t('users.panel.editDescription') : t('users.panel.createDescription')}
        footer={<>
          <button onClick={() => setIsPanelOpen(false)} className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent rounded-lg transition-colors">{t('common.cancel')}</button>
          <GradientButton onClick={handleSave} disabled={saving || !formData.email || (!editingUser && !formData.password) || (editingUser && !isDirty)} loading={saving}>{editingUser ? t('common.saveChanges') : t('users.panel.invite')}</GradientButton>
        </>}>
        <div className="space-y-5">
          {error && <ErrorBox>{error}</ErrorBox>}

          {!editingUser && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                {t('users.panel.createTip')}
              </p>
            </div>
          )}

          {editingUser && (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gradient-subtle-start to-gradient-subtle-end dark:from-blue-500/5 dark:to-violet-500/5 border border-blue-100 dark:border-violet-500/10 rounded-xl">
              <Avatar className="w-10 h-10 shadow-md shrink-0">
                <AvatarImage src={editingUser.avatar ? api.users.getAvatarUrl(editingUser.id) : undefined} alt={editingUser.name ?? ''} />
                <AvatarFallback className="bg-gradient-to-br from-gradient-start to-gradient-end text-sm font-bold text-white">
                  {(editingUser.name ?? editingUser.email).substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{editingUser.name ?? editingUser.email}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                  <Mail size={11} />{editingUser.email}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">{t('users.form.nameLabel')}</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} maxLength={120} placeholder={t('users.form.namePlaceholder')} className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:font-normal placeholder:text-muted-foreground" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} maxLength={254} placeholder="email@company.com" className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:font-normal placeholder:text-muted-foreground" />
          </div>

          {!editingUser && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">{t('users.form.passwordLabel')}</label>
              <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} maxLength={128} placeholder="••••••••" className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:font-normal placeholder:text-muted-foreground" />
            </div>
          )}

          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-indigo-600 dark:text-indigo-400" />
              <label className="text-sm font-medium text-foreground/80">{t('users.form.roleLabel')}</label>
              <span className="inline-flex items-center text-xs px-1.5 py-1 rounded bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium leading-none">{t('users.form.roleSelect')}</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {([
                { value: 'admin', color: 'from-red-600 to-red-500', borderColor: 'border-red-500', bgHover: 'group-hover:bg-red-50 dark:group-hover:bg-red-500/10', bgSelected: 'bg-red-50 dark:bg-red-500/10', textSelected: 'text-red-700 dark:text-red-300', description: t('users.roleDescriptions.admin') },
                { value: 'developer', color: 'from-blue-600 to-violet-500', borderColor: 'border-blue-500', bgHover: 'group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10', bgSelected: 'bg-blue-50 dark:bg-blue-500/10', textSelected: 'text-blue-700 dark:text-blue-300', description: t('users.roleDescriptions.developer') },
                { value: 'viewer', color: 'from-neutral-600 to-neutral-500', borderColor: 'border-neutral-400', bgHover: 'group-hover:bg-secondary dark:group-hover:bg-neutral-500/10', bgSelected: 'bg-secondary dark:bg-neutral-500/10', textSelected: 'text-foreground/80', description: t('users.roleDescriptions.viewer') },
              ] as const).map(({ value, color, borderColor, bgSelected, textSelected, description }) => {
                const selected = formData.role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({...formData, role: value})}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      selected
                        ? `${borderColor} ${bgSelected} ${textSelected} shadow-sm`
                        : 'border-border text-muted-foreground hover:border-border'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                      <Shield size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${selected ? textSelected : 'text-foreground/80'}`}>{getRoleLabel(value)}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
                    </div>
                    {selected && (
                      <div className={`w-5 h-5 rounded-md bg-gradient-to-r ${color} flex items-center justify-center shrink-0`}>
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {editingUser && (
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-indigo-600 dark:text-indigo-400" />
                <label className="text-sm font-medium text-foreground/80">{t('users.form.statusLabel')}</label>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {([
                  { value: 'active', label: t('users.status.active'), dotClass: 'bg-emerald-500', description: t('users.statusDescriptions.active') },
                  { value: 'suspended', label: t('users.status.suspended'), dotClass: 'bg-red-500', description: t('users.statusDescriptions.suspended') },
                ] as const).map(({ value, label, dotClass, description }) => {
                  const selected = formData.status === value;
                  const isActive = value === 'active';
                  const borderColor = selected ? (isActive ? 'border-emerald-500' : 'border-red-500') : 'border-border';
                  const bgSelected = selected ? (isActive ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10') : '';
                  const textSelected = selected ? (isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300') : '';
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({...formData, status: value})}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                        selected
                          ? `${borderColor} ${bgSelected} ${textSelected} shadow-sm`
                          : 'border-border text-muted-foreground hover:border-border'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full ${dotClass} shrink-0 ring-4 ${selected ? 'ring-white/50 dark:ring-black/20' : 'ring-transparent'} transition-all`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold ${selected ? textSelected : 'text-foreground/80'}`}>{label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
                      </div>
                      {selected && (
                        <div className={`w-5 h-5 rounded-md ${isActive ? 'bg-emerald-500' : 'bg-red-500'} flex items-center justify-center shrink-0`}>
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {editingUser && (
            <div className="pt-4 border-t border-border space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User size={12} className="text-muted-foreground" />
                <span>{t('users.panel.created')} <span className="font-medium text-foreground/80">{formatDate(editingUser.createdAt)}</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={12} className="text-muted-foreground" />
                <span>{t('users.panel.lastActive')} <span className="font-medium text-foreground/80">{formatDateTime(editingUser.lastActiveAt)}</span></span>
              </div>
            </div>
          )}

          <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                <div className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
                  <Shield size={12} className="text-white" />
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1">{t('users.help.title')}</h5>
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  {t('users.help.admin')}
                  <br />
                  {t('users.help.developer')}
                  <br />
                  {t('users.help.viewer')}
                </p>
              </div>
            </div>
          </div>

          {editingUser && (
            <div className="pt-6 border-t border-border space-y-3">
              <button
                type="button"
                onClick={() => { setDeleteId(editingUser.id); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20 transition-all"
              >
                <Trash2 size={16} />
                {t('users.panel.deleteUser')}
              </button>
            </div>
          )}
        </div>
      </SidePanel>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title={t('users.delete.confirmTitle')}
        description={t('users.delete.confirmDescription', { name: users.find(u => u.id === deleteId)?.name ?? users.find(u => u.id === deleteId)?.email ?? '' })}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}