import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Building2,
  Globe,
  Save,
  Plus,
  Upload,
  Image,
  Hash,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  Settings as SettingsIcon,
  AlertTriangle,
} from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { api, Environment } from '@/api';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { PluginSlot } from '@/app/components/PluginSlot';
import { SectionHeader, EmptyState, GradientButton, LoadingState, getErrorMessage } from '@/shared';
import { useProjectQuery, useEnvironmentsQuery } from '@/app/hooks/queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useLocale, useT } from '@/i18n';
import { resetOnboardingComplete } from '@/shared/onboardingUtils';
import { toIntlLocale } from '@/i18n/locale';

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatFullDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function Settings() {
  const queryClient = useQueryClient();
  const { locale } = useLocale();
  const t = useT();
  const intlLocale = toIntlLocale(locale);

  const { data: project, isLoading: projectLoading } = useProjectQuery();
  const projectId = project?.id ?? null;

  const { data: environments = [] } = useEnvironmentsQuery();

  useQuery({
    queryKey: queryKeys.settings.byProject(projectId),
    queryFn: () => api.settings.get(),
    enabled: !!projectId,
    staleTime: 5 * 60_000,
  });

  const { data: envLimitData } = useQuery({
    queryKey: queryKeys.environments.limit(projectId),
    queryFn: () => api.environments.getLimit(),
    enabled: !!projectId,
    staleTime: 5 * 60_000,
    retry: 0,
  });

  const loading = projectLoading;

  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [initialProject, setInitialProject] = useState<{ name: string; desc: string } | null>(null);
  const [savingProject, setSavingProject] = useState(false);

  const [expandedEnvIds, setExpandedEnvIds] = useState<Set<number>>(new Set());
  const [editingEnvId, setEditingEnvId] = useState<number | null>(null);
  const [editEnvName, setEditEnvName] = useState('');
  const [initialEditEnvName, setInitialEditEnvName] = useState('');
  const [savingEnvEdit, setSavingEnvEdit] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [savingEnv, setSavingEnv] = useState(false);
  const [deleteEnvId, setDeleteEnvId] = useState<number | null>(null);
  const [deletingEnv, setDeletingEnv] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingLogoPreviewUrl, setPendingLogoPreviewUrl] = useState<string | null>(null);

  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  const maxEnvironments = envLimitData?.maxEnvironments;
  const [logoKey, setLogoKey] = useState(0);

  useEffect(() => {
    if (project) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProjectName(project.name);
      setProjectDesc(project.description ?? '');
      setInitialProject((prev) => prev ?? { name: project.name, desc: project.description ?? '' });
    }
  }, [project]);

  useEffect(() => {
    return () => {
      if (pendingLogoPreviewUrl) URL.revokeObjectURL(pendingLogoPreviewUrl);
    };
  }, [pendingLogoPreviewUrl]);

  const toggleExpandEnv = (id: number) => {
    setExpandedEnvIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startEditEnv = (env: Environment) => {
    setEditingEnvId(env.id);
    setEditEnvName(env.name);
    setInitialEditEnvName(env.name);
  };

  const cancelEditEnv = () => {
    setEditingEnvId(null);
    setEditEnvName('');
    setInitialEditEnvName('');
  };

  const saveEditEnvMutation = useMutation({
    mutationFn: () => api.environments.update(editingEnvId!, editEnvName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
      queryClient.invalidateQueries({ queryKey: queryKeys.environments.all });
      setEditingEnvId(null);
      setEditEnvName('');
      setInitialEditEnvName('');
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e));
    },
    onSettled: () => setSavingEnvEdit(false),
  });

  const saveEditEnv = () => {
    if (!projectId || !editingEnvId || !editEnvName.trim()) return;
    setSavingEnvEdit(true);
    saveEditEnvMutation.mutate();
  };

  const saveProjectMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error('No project');
      if (pendingLogoFile) {
        setUploadingLogo(true);
        await api.projects.uploadLogo(projectId, pendingLogoFile);
        setLogoKey((k) => k + 1);
        if (pendingLogoPreviewUrl) URL.revokeObjectURL(pendingLogoPreviewUrl);
        setPendingLogoFile(null);
        setPendingLogoPreviewUrl(null);
        setUploadingLogo(false);
      }
      return api.projects.update(projectId, { name: projectName, description: projectDesc });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.environments.all });
      setInitialProject({ name: projectName, desc: projectDesc });
      window.dispatchEvent(new Event('project-updated'));
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e));
    },
    onSettled: () => setSavingProject(false),
  });

  const isProjectDirty = useMemo(() => {
    if (!initialProject || !project) return false;
    return projectName !== initialProject.name || projectDesc !== initialProject.desc || !!pendingLogoFile;
  }, [projectName, projectDesc, pendingLogoFile, project, initialProject]);

  const saveProject = () => {
    if (!projectId) return;
    setSavingProject(true);
    saveProjectMutation.mutate();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pendingLogoPreviewUrl) URL.revokeObjectURL(pendingLogoPreviewUrl);
    setPendingLogoFile(file);
    setPendingLogoPreviewUrl(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addEnvMutation = useMutation({
    mutationFn: () => api.environments.create(newEnvName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
      queryClient.invalidateQueries({ queryKey: queryKeys.environments.all });
      setNewEnvName('');
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e));
    },
    onSettled: () => setSavingEnv(false),
  });

  const addEnv = () => {
    if (!projectId || !newEnvName.trim()) return;
    if (maxEnvironments != null && environments.length >= maxEnvironments) {
      toast.error(t('settings.errorMaxEnv', { max: String(maxEnvironments) }));
      return;
    }
    setSavingEnv(true);
    addEnvMutation.mutate();
  };

  const removeEnvMutation = useMutation({
    mutationFn: () => api.environments.delete(deleteEnvId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
      queryClient.invalidateQueries({ queryKey: queryKeys.environments.all });
      setExpandedEnvIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteEnvId!);
        return next;
      });
      if (editingEnvId === deleteEnvId) {
        setEditingEnvId(null);
        setEditEnvName('');
      }
      setDeleteEnvId(null);
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e));
    },
    onSettled: () => setDeletingEnv(false),
  });

  const removeEnv = () => {
    if (!projectId || !deleteEnvId) return;
    setDeletingEnv(true);
    removeEnvMutation.mutate();
  };

  const deleteProject = async () => {
    if (!projectId) return;
    setDeletingProject(true);
    try {
      await api.projects.delete(projectId);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
      setDeletingProject(false);
      return;
    }
    localStorage.removeItem('mozhno_token');
    localStorage.removeItem('mozhno_refresh_token');
    resetOnboardingComplete();
    window.location.replace('/login');
  };

  if (loading) return <LoadingState text={t('settings.loading')} />;

  return (
    <div className="space-y-6">
      <SectionHeader title={t('settings.title')} description={t('settings.description')} />

      <div className="space-y-6">
        {/* Project Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-muted border border-border">
                <Building2 size={20} className="text-info" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t('settings.project')}</h2>
                <p className="text-sm text-muted-foreground">{t('settings.projectDescription')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-border bg-secondary rounded-xl mb-5">
              <div className="px-4 py-2.5">
                <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-0.5">
                  ID
                </span>
                <span className="text-xs text-foreground/80 flex items-center gap-1.5">
                  <Hash size={11} className="text-muted-foreground shrink-0" />
                  {project?.id}
                </span>
              </div>
              {project?.createdAt && (
                <div className="px-4 py-2.5">
                  <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-0.5">
                    {t('apiKeys.created')}
                  </span>
                  <span className="text-xs text-foreground/80 flex items-center gap-1.5">
                    <Clock size={11} className="text-muted-foreground shrink-0" />
                    {formatDate(project.createdAt, intlLocale)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 flex items-center justify-between">
                  <span>{t('settings.projectName')}</span>
                  <span className="text-xs font-normal text-muted-foreground/50 tabular-nums">
                    {projectName.length}/120
                  </span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  maxLength={120}
                  placeholder={t('settings.projectNamePlaceholder')}
                  className="w-full bg-input-background border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 flex items-center justify-between">
                  <span>{t('settings.descriptionField')}</span>
                  <span className="text-xs font-normal text-muted-foreground/50 tabular-nums">
                    {projectDesc.length}/160
                  </span>
                </label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  maxLength={160}
                  rows={2}
                  placeholder={t('settings.descriptionPlaceholder')}
                  className="w-full bg-input-background border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">
                  {t('settings.logo')}
                </label>
                <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl border border-border">
                  {pendingLogoPreviewUrl || project?.logo ? (
                    <img
                      key={logoKey}
                      src={
                        pendingLogoPreviewUrl ||
                        `${api.projects.getLogoUrl(project!.id)}?v=${logoKey}`
                      }
                      alt={t('settings.logoAlt')}
                      className="w-16 h-16 rounded-xl object-cover border border-border shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
                      <Image size={24} className="text-warning" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/80 bg-card border border-border rounded-xl hover:bg-secondary hover:border-border transition-all disabled:opacity-50 active:scale-95"
                    >
                      <Upload size={14} />
                      {pendingLogoFile
                        ? t('settings.logoSelected')
                        : project?.logo
                          ? t('settings.logoReplace')
                          : t('settings.logoUpload')}
                    </button>
                    <p className="text-xs text-muted-foreground/80 mt-1.5">
                      {t('settings.logoHint')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <GradientButton
                  onClick={saveProject}
                  disabled={savingProject || !isProjectDirty}
                  loading={savingProject}
                  icon={<Save size={16} />}
                >
                  {t('common.saveChanges')}
                </GradientButton>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Environments Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-card border border-border rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-muted border border-border">
                <Globe size={20} className="text-brand" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {t('settings.environments')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('settings.environmentsDescription')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {maxEnvironments != null && environments.length >= maxEnvironments ? (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl text-sm text-warning">
                  {t('settings.envLimitReached', {
                    count: String(maxEnvironments),
                    max: String(maxEnvironments),
                  })}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80 flex items-center justify-between">
                    <span>{t('settings.addEnvPlaceholder')}</span>
                    <span className="text-xs font-normal text-muted-foreground/50 tabular-nums">
                      {newEnvName.length}/120
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newEnvName}
                      onChange={(e) => setNewEnvName(e.target.value)}
                      maxLength={120}
                      onKeyDown={(e) => e.key === 'Enter' && addEnv()}
                      placeholder={t('settings.addEnvPlaceholder')}
                      className="flex-1 bg-input-background border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
                    />
                    <GradientButton
                      onClick={addEnv}
                      disabled={savingEnv || !newEnvName.trim()}
                      loading={savingEnv}
                      icon={<Plus size={16} strokeWidth={2.5} />}
                      className="shrink-0"
                    >
                      {t('common.add')}
                    </GradientButton>
                  </div>
                </div>
              )}

              {maxEnvironments != null && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('settings.envCount', {
                      count: String(environments.length),
                      max: String(maxEnvironments),
                    })}
                  </span>
                  <div className="h-3 w-px bg-border" />
                  <span className="text-xs text-muted-foreground">{t('settings.envHint')}</span>
                </div>
              )}

              {environments.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {environments.map((env, idx) => {
                      const isExpanded = expandedEnvIds.has(env.id);
                      const isEditing = editingEnvId === env.id;
                      return (
                        <motion.div
                          key={env.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          className="group bg-secondary/40 ring-1 ring-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                        >
                          <div
                            className="flex items-center justify-between px-4 py-3 cursor-pointer"
                            onClick={() => toggleExpandEnv(env.id)}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 rounded-lg bg-muted border border-border shrink-0">
                                <Globe size={16} className="text-brand" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-foreground truncate">
                                  {env.name}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                {formatDate(env.createdAt, intlLocale)}
                              </span>
                              {isExpanded ? (
                                <ChevronUp
                                  size={16}
                                  className="text-muted-foreground group-hover:text-brand transition-colors"
                                />
                              ) : (
                                <ChevronDown
                                  size={16}
                                  className="text-muted-foreground group-hover:text-brand transition-colors"
                                />
                              )}
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-3 space-y-3">
                                  <div className="grid grid-cols-2 divide-x divide-border border-t border-border pt-3">
                                    <div className="px-4 py-2">
                                      <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                        ID
                                      </div>
                                      <div className="text-xs text-foreground/80 mt-0.5">
                                        {env.id}
                                      </div>
                                    </div>
                                    <div className="px-4 py-2">
                                      <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                        {t('settings.envCreated')}
                                      </div>
                                      <div className="text-xs text-foreground/80 mt-0.5">
                                        {formatFullDate(env.createdAt, intlLocale)}
                                      </div>
                                    </div>
                                  </div>

                                  {isEditing ? (
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                                        <span>{t('settings.editEnvName')}</span>
                                        <span className="text-[10px] font-normal text-muted-foreground/50 tabular-nums">
                                          {editEnvName.length}/120
                                        </span>
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={editEnvName}
                                          onChange={(e) => setEditEnvName(e.target.value)}
                                          maxLength={120}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEditEnv();
                                            if (e.key === 'Escape') cancelEditEnv();
                                          }}
                                          autoFocus
                                          className="flex-1 bg-input-background border border-border text-foreground rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all"
                                        />
                                        <GradientButton
                                          onClick={saveEditEnv}
                                          disabled={
                                            savingEnvEdit ||
                                            !editEnvName.trim() ||
                                            editEnvName.trim() === initialEditEnvName
                                          }
                                          loading={savingEnvEdit}
                                          size="sm"
                                        >
                                          {t('common.saveChanges')}
                                        </GradientButton>
                                        <button
                                          onClick={cancelEditEnv}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary border border-border rounded-xl hover:bg-accent transition-colors"
                                        >
                                          {t('common.cancel')}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 border-t border-border pt-3">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startEditEnv(env);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary border border-border rounded-xl hover:text-brand dark:hover:text-brand hover:border-brand dark:hover:border-brand/30 hover:bg-brand dark:hover:bg-brand/10 transition-all"
                                      >
                                        <SettingsIcon size={12} />
                                        {t('common.edit')}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteEnvId(env.id);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary border border-border rounded-xl hover:text-destructive hover:border-destructive/20 hover:bg-destructive/10 transition-colors"
                                      >
                                        <Trash2 size={12} />
                                        {t('common.delete')}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <EmptyState
                  icon={<Globe size={28} className="text-brand" />}
                  title={t('settings.noEnvs')}
                  description={t('settings.noEnvsDescription')}
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.3 }}
          className="bg-card border border-destructive/20 rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/10 border border-destructive/20">
                <AlertTriangle size={20} className="text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {t('settings.dangerZone')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('settings.dangerZoneDescription')}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-foreground text-sm">
                    {t('settings.deleteProject')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-lg">
                    {t('settings.deleteProjectWarning')}
                  </p>
                </div>
                <GradientButton
                  variant="danger"
                  onClick={() => setDeleteProjectOpen(true)}
                  icon={<Trash2 size={16} />}
                  className="shrink-0"
                >
                  {t('settings.deleteProjectBtn')}
                </GradientButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <PluginSlot slotId="settings.premium" />

      <ConfirmDialog
        open={!!deleteEnvId}
        onOpenChange={(open) => {
          if (!open) setDeleteEnvId(null);
        }}
        title={t('settings.deleteEnvConfirm')}
        description={t('settings.deleteEnvDescription', {
          name: environments.find((e) => e.id === deleteEnvId)?.name ?? '',
        })}
        confirmLabel={t('common.delete')}
        onConfirm={removeEnv}
        loading={deletingEnv}
      />

      <ConfirmDialog
        open={deleteProjectOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteProjectOpen(false);
        }}
        title={t('settings.deleteProjectConfirm')}
        description={t('settings.deleteProjectDescription', { name: project?.name ?? '' })}
        confirmLabel={t('settings.deleteProjectBtn')}
        onConfirm={deleteProject}
        loading={deletingProject}
      />
    </div>
  );
}
