import { describe, expect, it } from 'vitest';
import { createProjectInput, projectSchema } from './project.ts';

describe('project contract', () => {
  it('accepts a valid create input', () => {
    const parsed = createProjectInput.parse({ name: 'My project' });
    expect(parsed.name).toBe('My project');
  });

  it('rejects an empty name', () => {
    const result = createProjectInput.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('validates a full project record', () => {
    const project = projectSchema.parse({
      id: 'p_1',
      ownerId: 'u_1',
      name: 'Demo',
      createdAt: new Date().toISOString(),
    });
    expect(project.id).toBe('p_1');
  });
});
