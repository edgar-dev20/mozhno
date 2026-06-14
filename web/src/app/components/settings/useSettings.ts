import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api, Project, Environment, ProjectSettings } from "@/api";

const MAX_ENVIRONMENTS_DEFAULT = 6;

interface LogoUpload {
  file: File;
  previewUrl: string;
}

export function useSettings() {
  const [project, setProject] = useState<Project | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<number | null>(null);

  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  const [expandedEnvIds, setExpandedEnvIds] = useState<Set<number>>(new Set());
  const [editingEnvId, setEditingEnvId] = useState<number | null>(null);
  const [editEnvName, setEditEnvName] = useState('');
  const [savingEnvEdit, setSavingEnvEdit] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [savingEnv, setSavingEnv] = useState(false);
  const [deleteEnvId, setDeleteEnvId] = useState<number | null>(null);
  const [deletingEnv, setDeletingEnv] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [pendingLogo, setPendingLogo] = useState<LogoUpload | null>(null);

  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  const [maxEnvironments, setMaxEnvironments] = useState(MAX_ENVIRONMENTS_DEFAULT);
  const [logoKey, setLogoKey] = useState(0);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('mozhno_settings_expanded');
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('mozhno_settings_expanded', JSON.stringify([...expandedSections]));
  }, [expandedSections]);

  useEffect(() => {
    return () => {
      if (pendingLogo?.previewUrl) URL.revokeObjectURL(pendingLogo.previewUrl);
    };
  }, [pendingLogo?.previewUrl]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let projects = await api.projects.list();
        if (projects.length === 0) {
          projects = [await api.projects.create({ name: 'Default', description: '' })];
        }
        const pid = projects[0].id;
        if (cancelled) return;
        setProjectId(pid);
        const [p, envs, s] = await Promise.all([
          api.projects.get(pid),
          api.environments.list(),
          api.settings.get(),
        ]);
        if (cancelled) return;
        setProject(p);
        setProjectName(p.name);
        setProjectDesc(p.description ?? '');
        setEnvironments(envs);
        setSettings(s);
        try {
          const limit = await api.environments.getLimit();
          setMaxEnvironments(limit.maxEnvironments);
        } catch {}
      } catch (e) { if (import.meta.env.DEV) console.error(e); } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleExpandEnv = (id: number) => {
    setExpandedEnvIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const startEditEnv = (env: Environment) => {
    setEditingEnvId(env.id);
    setEditEnvName(env.name);
  };

  const cancelEditEnv = () => {
    setEditingEnvId(null);
    setEditEnvName('');
  };

  const saveEditEnv = async () => {
    if (!projectId || !editingEnvId || !editEnvName.trim()) return;
    setSavingEnvEdit(true);
    try {
      const updated = await api.environments.update(editingEnvId, editEnvName.trim());
      setEnvironments(prev => prev.map(e => e.id === updated.id ? updated : e));
      setEditingEnvId(null);
      setEditEnvName('');
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed to save environment'); } finally { setSavingEnvEdit(false); }
  };

  const saveProject = async () => {
    if (!projectId) return;
    setSavingProject(true);
    try {
      if (pendingLogo) {
        setUploadingLogo(true);
        const updatedWithLogo = await api.projects.uploadLogo(projectId, pendingLogo.file);
        setProject(updatedWithLogo);
        setLogoKey(k => k + 1);
        if (pendingLogo.previewUrl) URL.revokeObjectURL(pendingLogo.previewUrl);
        setPendingLogo(null);
        setUploadingLogo(false);
      }
      const updated = await api.projects.update(projectId, { name: projectName, description: projectDesc });
      setProject(updated);
      window.dispatchEvent(new Event('project-updated'));
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed to save project'); } finally { setSavingProject(false); }
  };

  const handleLogoSelect = (file: File) => {
    if (pendingLogo?.previewUrl) URL.revokeObjectURL(pendingLogo.previewUrl);
    setPendingLogo({ file, previewUrl: URL.createObjectURL(file) });
  };

  const addEnv = async () => {
    if (!projectId || !newEnvName.trim()) return;
    if (environments.length >= maxEnvironments) {
      toast.error(`Максимальное количество окружений: ${maxEnvironments}`);
      return;
    }
    setSavingEnv(true);
    try {
      const created = await api.environments.create(newEnvName.trim());
      setEnvironments([...environments, created]);
      setNewEnvName('');
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Ошибка при добавлении окружения'); } finally { setSavingEnv(false); }
  };

  const removeEnv = async () => {
    if (!projectId || !deleteEnvId) return;
    setDeletingEnv(true);
    try {
      await api.environments.delete(deleteEnvId);
      setEnvironments(environments.filter(e => e.id !== deleteEnvId));
      setExpandedEnvIds(prev => { const next = new Set(prev); next.delete(deleteEnvId); return next; });
      if (editingEnvId === deleteEnvId) { setEditingEnvId(null); setEditEnvName(''); }
      setDeleteEnvId(null);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Ошибка при удалении окружения'); } finally { setDeletingEnv(false); }
  };

  const deleteProject = async () => {
    if (!projectId) return;
    setDeletingProject(true);
    try {
      await api.projects.delete(projectId);
      localStorage.removeItem('mozhno_token');
      localStorage.removeItem('mozhno_refresh_token');
      window.location.replace('/login');
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Ошибка при удалении проекта'); setDeletingProject(false); }
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return {
    project, environments, settings, loading, projectId,
    projectName, setProjectName, projectDesc, setProjectDesc,
    savingProject,
    expandedEnvIds, editingEnvId, editEnvName, setEditEnvName,
    savingEnvEdit, newEnvName, setNewEnvName, savingEnv, deleteEnvId, setDeleteEnvId, deletingEnv,
    uploadingLogo, pendingLogo, setPendingLogo,
    deleteProjectOpen, setDeleteProjectOpen, deletingProject,
    maxEnvironments, logoKey, setLogoKey,
    expandedSections,
    toggleExpandEnv, startEditEnv, cancelEditEnv, saveEditEnv,
    saveProject, handleLogoSelect, addEnv, removeEnv, deleteProject,
    toggleSection,
  };
}

export type SettingsHook = ReturnType<typeof useSettings>;
