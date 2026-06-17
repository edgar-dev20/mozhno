import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, SegmentResponse } from '@/api';
import { queryKeys } from '@/api/queryKeys';
import { useProjectQuery } from '@/app/hooks/queries/useProjectQuery';

export function useSegments() {
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: project } = useProjectQuery();
  const projectId = project?.id ?? null;

  const { data: segments = [], isLoading: segmentsLoading } = useQuery({
    queryKey: queryKeys.segments.byProject(projectId),
    queryFn: () => api.segments.list(),
    enabled: !!projectId,
    staleTime: 30_000,
  });

  const { data: contexts = [], isLoading: contextsLoading } = useQuery({
    queryKey: queryKeys.contexts.byProject(projectId),
    queryFn: () => api.contexts.list(),
    enabled: !!projectId,
    staleTime: 30_000,
  });

  const loading = segmentsLoading || contextsLoading;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.segments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
      queryClient.invalidateQueries({ queryKey: queryKeys.segments.byProject(projectId) });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      editing,
      data,
    }: {
      editing: SegmentResponse | null;
      data: {
        name: string;
        description: string;
        icon: string;
        color: string;
        context: { contextDefinitionId: number; operator: string; contextValues: string }[];
      };
    }) => {
      if (!projectId) throw new Error('No project');
      const { name, description, icon, color, context } = data;
      if (editing) {
        return api.segments.update(editing.id, {
          projectId: 0,
          name,
          description,
          icon,
          color,
          context,
        });
      } else {
        return api.segments.create({ projectId: 0, name, description, icon, color, context });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
      queryClient.invalidateQueries({ queryKey: queryKeys.segments.byProject(projectId) });
    },
  });

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const handleSave = useCallback(
    async (
      editing: SegmentResponse | null,
      data: {
        name: string;
        description: string;
        icon: string;
        color: string;
        context: { contextDefinitionId: number; operator: string; contextValues: string }[];
      },
    ) => {
      setError('');
      return saveMutation.mutateAsync({ editing, data });
    },
    [saveMutation],
  );

  return {
    segments,
    contexts,
    projectId,
    loading,
    error,
    setError,
    handleDelete,
    handleSave,
  };
}
