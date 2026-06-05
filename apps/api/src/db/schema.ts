/**
 * App domain schema — the sample `projects` table.
 *
 * This is the resource the boilerplate uses to demonstrate an authenticated,
 * owner-scoped CRUD slice end-to-end. Replace it with your real domain tables.
 */
import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './auth-schema.ts';

export const projects = pgTable(
  'projects',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('projects_owner_id_idx').on(table.ownerId)],
);

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
