import { z } from 'zod';

export const createFlagSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(120, 'Максимум 120 символов'),
  key: z.string().min(1, 'Ключ обязателен').max(100, 'Максимум 100 символов')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Только латиница, цифры, дефис и подчёркивание'),
  description: z.string().max(160, 'Максимум 160 символов').optional().default(''),
  flagType: z.enum(['RELEASE', 'KILLSWITCH']),
});

export const editFlagSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(120, 'Максимум 120 символов'),
  description: z.string().max(160, 'Максимум 160 символов').optional().default(''),
  flagType: z.enum(['RELEASE', 'KILLSWITCH']),
});

export type CreateFlagFormValues = z.infer<typeof createFlagSchema>;
export type EditFlagFormValues = z.infer<typeof editFlagSchema>;
