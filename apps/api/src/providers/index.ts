/** Provider lifecycle — single boot/teardown point for the app. */
import { closeDatabase } from './database.ts';

type Teardown = () => Promise<void> | void;

const teardowns: Teardown[] = [];
let booted = false;

/** Registers provider teardowns (idempotently). Call before serving (or in test setup). */
export function bootProviders(): void {
  if (booted) return;
  booted = true;
  teardowns.push(closeDatabase);
}

/**
 * Runs registered teardowns (LIFO) and drains the registry, then re-arms boot.
 * A throwing teardown doesn't stop the rest; the first error propagates after
 * all have run.
 */
export async function teardownProviders(): Promise<void> {
  const pending = teardowns.splice(0).reverse();
  booted = false;
  let firstError: unknown;
  for (const teardown of pending) {
    try {
      await teardown();
    } catch (error) {
      firstError ??= error;
    }
  }
  if (firstError !== undefined) throw firstError;
}
