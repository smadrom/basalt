import { afterEach, describe, expect, it } from 'vitest';
import { closeDatabase, db } from './database.ts';

afterEach(async () => {
  await closeDatabase();
});

describe('database provider', () => {
  it('returns the same instance until closed', async () => {
    const first = db();
    expect(db()).toBe(first);

    await closeDatabase();

    const second = db();
    expect(second).not.toBe(first);
  });
});
