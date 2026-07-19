import { z } from 'zod';

/**
 * Shared contract for the sample `project` resource.
 *
 * Portable runtime schemas for clients and other non-Elysia consumers. The API
 * route defines an equivalent Elysia model to preserve Eden's route inference;
 * keep the two definitions aligned when the sample resource changes.
 */
export const projectSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string().min(1).max(120),
  createdAt: z.string(),
});

export const createProjectInput = z.object({
  name: z.string().min(1, 'Name is required').max(120),
});

export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectInput>;
