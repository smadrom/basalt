import { z } from 'zod';

/**
 * Shared contract for the sample `project` resource.
 *
 * One source of truth for the shape that crosses the api/web boundary:
 * the API validates inbound bodies against `createProjectInput`, and the web
 * app reuses the same schema for form validation. Replace this with your own
 * domain resource — it exists to demonstrate the end-to-end wiring.
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
