import { beforeEach, describe, expect, it, vi } from 'vitest';
import { closeDatabase } from './database.ts';
import { bootProviders, teardownProviders } from './index.ts';

vi.mock('./database.ts', () => ({ closeDatabase: vi.fn() }));

const closeDatabaseMock = vi.mocked(closeDatabase);

beforeEach(async () => {
  closeDatabaseMock.mockReset();
  // Drain any registry/boot state leaked by a previous test.
  await teardownProviders();
});

describe('provider lifecycle', () => {
  it('registers teardowns once across repeated boots', async () => {
    bootProviders();
    bootProviders();

    await teardownProviders();

    expect(closeDatabaseMock).toHaveBeenCalledTimes(1);
  });

  it('re-arms after teardown', async () => {
    bootProviders();
    await teardownProviders();
    bootProviders();
    await teardownProviders();

    expect(closeDatabaseMock).toHaveBeenCalledTimes(2);
  });

  it('propagates a teardown error and still drains the registry', async () => {
    closeDatabaseMock.mockRejectedValueOnce(new Error('boom'));
    bootProviders();

    await expect(teardownProviders()).rejects.toThrow('boom');
    expect(closeDatabaseMock).toHaveBeenCalledTimes(1);
    // Registry drained: a second teardown is a no-op.
    await teardownProviders();
    expect(closeDatabaseMock).toHaveBeenCalledTimes(1);
  });
});
