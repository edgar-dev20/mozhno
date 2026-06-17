import { useState, useRef, useCallback, useEffect } from 'react';
import { api, setToken, setRefreshToken } from '@/api';
import { useT } from '@/i18n';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';

interface UseCreateProjectReturn {
  projectName: string;
  setProjectName: (v: string) => void;
  projectDesc: string;
  setProjectDesc: (v: string) => void;
  creatingProject: boolean;
  projectError: string;
  pendingLogoFile: File | null;
  pendingLogoPreviewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreateProject: (onProjectCreated: () => void, onComplete: () => void) => Promise<void>;
  resetProject: () => void;
}

export function useCreateProject(): UseCreateProjectReturn {
  const t = useT();
  const queryClient = useQueryClient();
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingLogoPreviewUrl, setPendingLogoPreviewUrl] = useState<string | null>(null);
  const logoPreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (logoPreviewUrlRef.current) {
        URL.revokeObjectURL(logoPreviewUrlRef.current);
      }
    };
  }, []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logoPreviewUrlRef.current) {
      URL.revokeObjectURL(logoPreviewUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    logoPreviewUrlRef.current = url;
    setPendingLogoFile(file);
    setPendingLogoPreviewUrl(url);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleCreateProject = useCallback(
    async (onProjectCreated: () => void, onComplete: () => void) => {
      if (!projectName.trim()) {
        setProjectError(t('onboarding.projectValidationError'));
        return;
      }
      setCreatingProject(true);
      setProjectError('');
      try {
        const project = await api.projects.create({
          name: projectName.trim(),
          description: projectDesc.trim() || undefined,
        });
        if (pendingLogoFile) {
          try {
            await api.projects.uploadLogo(project.id, pendingLogoFile);
          } catch {
            toast.warning(t('onboarding.projectCreateError'));
          }
        }
        if (logoPreviewUrlRef.current) {
          URL.revokeObjectURL(logoPreviewUrlRef.current);
          logoPreviewUrlRef.current = null;
        }
        setPendingLogoFile(null);
        setPendingLogoPreviewUrl(null);
        const res = await api.auth.selectProject(project.id);
        setToken(res.token);
        setRefreshToken(res.refreshToken);
        onProjectCreated();
        queryClient.invalidateQueries({ queryKey: queryKeys.environments.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.contexts.all });
        onComplete();
      } catch (e) {
        setProjectError((e as Error).message || t('onboarding.projectCreateError'));
      } finally {
        setCreatingProject(false);
      }
    },
    [projectName, projectDesc, pendingLogoFile, t, queryClient],
  );

  const resetProject = useCallback(() => {
    if (logoPreviewUrlRef.current) {
      URL.revokeObjectURL(logoPreviewUrlRef.current);
      logoPreviewUrlRef.current = null;
    }
    setProjectName('');
    setProjectDesc('');
    setCreatingProject(false);
    setProjectError('');
    setPendingLogoFile(null);
    setPendingLogoPreviewUrl(null);
  }, []);

  return {
    projectName,
    setProjectName,
    projectDesc,
    setProjectDesc,
    creatingProject,
    projectError,
    pendingLogoFile,
    pendingLogoPreviewUrl,
    fileInputRef,
    handleLogoUpload,
    handleCreateProject,
    resetProject,
  };
}
