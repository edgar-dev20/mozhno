import { useState, useRef, useCallback, useEffect } from 'react';
import { api, setToken, setRefreshToken } from '@/api';
import { useT } from '@/i18n';
import { getErrorMessage } from '@/shared/errorHandler';
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

interface UseCreateProjectOptions {
  existingProjectId: number | null;
  existingProjectName: string | null;
}

export function useCreateProject(options: UseCreateProjectOptions = { existingProjectId: null, existingProjectName: null }): UseCreateProjectReturn {
  const { existingProjectId, existingProjectName } = options;
  const t = useT();
  const queryClient = useQueryClient();
  const [projectName, setProjectName] = useState(existingProjectName ?? '');
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
    if (file.size > 2 * 1024 * 1024) {
      toast.warning(t('errors.upload.fileTooLarge', { max: '2' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (logoPreviewUrlRef.current) {
      URL.revokeObjectURL(logoPreviewUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    logoPreviewUrlRef.current = url;
    setPendingLogoFile(file);
    setPendingLogoPreviewUrl(url);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [t]);

  const handleCreateProject = useCallback(
    async (onProjectCreated: () => void, onComplete: () => void) => {
      if (!projectName.trim()) {
        setProjectError(t('onboarding.projectValidationError'));
        return;
      }
      setCreatingProject(true);
      setProjectError('');
      try {
        if (existingProjectId != null) {
          if (projectName.trim() !== (existingProjectName ?? '')) {
            await api.projects.update(existingProjectId, {
              name: projectName.trim(),
              description: projectDesc.trim() || undefined,
            });
          }
          if (pendingLogoFile) {
            try {
              await api.projects.uploadLogo(existingProjectId, pendingLogoFile);
            } catch {
              toast.warning(t('onboarding.logoUploadError'));
            }
          }
        } else {
          const project = await api.projects.create({
            name: projectName.trim(),
            description: projectDesc.trim() || undefined,
          });
          if (pendingLogoFile) {
            try {
              await api.projects.uploadLogo(project.id, pendingLogoFile);
            } catch {
              toast.warning(t('onboarding.logoUploadError'));
            }
          }
          const res = await api.auth.selectProject(project.id);
          setToken(res.token);
          setRefreshToken(res.refreshToken);
          queryClient.invalidateQueries({ queryKey: queryKeys.environments.all });
          queryClient.invalidateQueries({ queryKey: queryKeys.contexts.all });
        }
        if (logoPreviewUrlRef.current) {
          URL.revokeObjectURL(logoPreviewUrlRef.current);
          logoPreviewUrlRef.current = null;
        }
        setPendingLogoFile(null);
        setPendingLogoPreviewUrl(null);
        onProjectCreated();
        onComplete();
      } catch (e) {
        setProjectError(getErrorMessage(e));
      } finally {
        setCreatingProject(false);
      }
    },
    [projectName, projectDesc, pendingLogoFile, existingProjectId, existingProjectName, t, queryClient],
  );

    const resetProject = useCallback(() => {
        if (logoPreviewUrlRef.current) {
            URL.revokeObjectURL(logoPreviewUrlRef.current);
            logoPreviewUrlRef.current = null;
        }
        setProjectName(existingProjectName ?? '');
        setProjectDesc('');
        setCreatingProject(false);
        setProjectError('');
        setPendingLogoFile(null);
        setPendingLogoPreviewUrl(null);
    }, [existingProjectName]);

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
