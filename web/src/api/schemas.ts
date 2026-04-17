import { z } from 'zod';

export const userDtoSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  role: z.string(),
  status: z.string(),
  avatar: z.string().nullable(),
  createdAt: z.string(),
  lastActiveAt: z.string(),
});

export const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  logo: z.string().nullable(),
  createdAt: z.string(),
});

export const environmentSchema = z.object({
  id: z.number(),
  projectId: z.number(),
  name: z.string(),
  createdAt: z.string(),
});

export const flagResponseSchema = z.object({
  id: z.number(),
  projectId: z.number(),
  name: z.string(),
  key: z.string(),
  description: z.string(),
  flagType: z.string(),
  createdAt: z.string(),
  createdBy: z.string().nullable(),
  lastUsedAt: z.string().nullable(),
  archivedBy: z.string().nullable(),
  archivedAt: z.string().nullable(),
  tags: z.array(z.object({
    tagId: z.number(),
    tagName: z.string(),
    tagColor: z.string(),
    value: z.string(),
  })),
  enabled: z.boolean(),
  strategyId: z.number(),
  percentage: z.number(),
  contextDefinitionId: z.number(),
  contextValuesJson: z.string(),
  segmentIds: z.array(z.number()),
  archived: z.boolean(),
});

export const segmentResponseSchema = z.object({
  id: z.number(),
  projectId: z.number(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  createdAt: z.string(),
  context: z.array(z.object({
    contextDefinitionId: z.number(),
    operator: z.string(),
    contextValues: z.string(),
  })),
});

export const tagSchema = z.object({
  id: z.number(),
  projectId: z.number(),
  name: z.string(),
  description: z.string(),
  color: z.string(),
  createdAt: z.string(),
});

export const contextDefinitionSchema = z.object({
  id: z.number(),
  projectId: z.number(),
  name: z.string(),
  key: z.string(),
  type: z.string(),
  createdBy: z.string().nullable(),
  description: z.string(),
  createdAt: z.string(),
});
