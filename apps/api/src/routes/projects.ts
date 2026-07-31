/**
 * Sample owner-scoped CRUD resource. Every route requires a Better Auth session
 * (`auth: true`) and is scoped to the authenticated user's id. Use it as the
 * template for your own resources, then delete it.
 */
import { and, desc, eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { betterAuthPlugin } from '../auth/plugin.ts';
import { projects } from '../db/schema.ts';
import { db } from '../providers/database.ts';

const ProjectModel = t.Object({
  id: t.String(),
  ownerId: t.String(),
  name: t.String(),
  createdAt: t.String(),
});

function serialize(row: typeof projects.$inferSelect) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

function newId() {
  return `p_${crypto.randomUUID()}`;
}

export const projectsRoutes = new Elysia({ prefix: '/api/projects', tags: ['projects'] })
  .use(betterAuthPlugin)
  .get(
    '/',
    async ({ user }) => {
      const rows = await db()
        .select()
        .from(projects)
        .where(eq(projects.ownerId, user.id))
        .orderBy(desc(projects.createdAt));
      return { data: rows.map(serialize) };
    },
    {
      auth: true,
      response: t.Object({ data: t.Array(ProjectModel) }),
      detail: { summary: 'List the current user’s projects' },
    },
  )
  .post(
    '/',
    async ({ user, body, status }) => {
      const name = body.name.trim();
      if (!name) return status(422, { error: 'invalid_name' });
      const [row] = await db()
        .insert(projects)
        .values({ id: newId(), ownerId: user.id, name })
        .returning();
      return status(201, serialize(row));
    },
    {
      auth: true,
      body: t.Object({ name: t.String({ minLength: 1, maxLength: 120 }) }),
      response: {
        201: ProjectModel,
        422: t.Object({ error: t.String() }),
      },
      detail: { summary: 'Create a project' },
    },
  )
  .delete(
    '/:id',
    async ({ user, params, status }) => {
      const [row] = await db()
        .delete(projects)
        .where(and(eq(projects.id, params.id), eq(projects.ownerId, user.id)))
        .returning();
      if (!row) return status(404, { error: 'not_found' });
      return { deleted: true };
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: t.Object({ deleted: t.Boolean() }),
        404: t.Object({ error: t.String() }),
      },
      detail: { summary: 'Delete a project owned by the user' },
    },
  );
