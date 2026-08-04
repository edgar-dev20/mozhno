import { useState, useRef, useCallback, useEffect } from 'react';
import { api } from '@/api';
import { useT } from '@/i18n';
import { getErrorMessage } from '@/shared/errorHandler';
import { toast } from 'sonner';

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
  const [projectName, setProjectName] = useState(existingProjectName ?? '');
  const [projectDesc, setProjectDesc] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingLogoPreviewUrl, setPendingLogoPreviewUrl] = useState<string | null>(null);
  const logoPreviewUrlRef = useRef<string | null>(null);
  const uploadSeqRef = useRef(0);

  useEffect(() => {
    return () => {
      if (logoPreviewUrlRef.current) {
        URL.revokeObjectURL(logoPreviewUrlRef.current);
      }
    };
  }, []);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.warning(t('errors.upload.fileTooLarge', { max: '2' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.warning(t('onboarding.logoInvalidFormat'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const seq = ++uploadSeqRef.current;
    const dimensionsValid = await new Promise<boolean>((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img.naturalWidth * img.naturalHeight <= 1024 * 1024);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      img.src = url;
    });
    if (seq !== uploadSeqRef.current) return;
    if (!dimensionsValid) {
      toast.warning(t('onboarding.logoDimensionsTooLarge'));
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
            await api.projects.update({
              name: projectName.trim(),
              description: projectDesc.trim() || undefined,
            });
          }
          if (pendingLogoFile) {
            try {
              await api.projects.uploadLogo(pendingLogoFile);
            } catch {
              toast.warning(t('onboarding.logoUploadError'));
            }
          }
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
    [projectName, projectDesc, pendingLogoFile, existingProjectId, existingProjectName, t],
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
