/** Provider lifecycle — single boot/teardown point for the app. */
import { closeDatabase } from './database.ts';

type Teardown = () => Promise<void> | void;

const teardowns: Teardown[] = [];

/** Registers provider teardowns. Call once before serving (or in test setup). */
export function bootProviders(): void {
  teardowns.push(closeDatabase);
}

/** Runs registered teardowns (LIFO) and drains the registry. */
export async function teardownProviders(): Promise<void> {
  for (const teardown of teardowns.splice(0).reverse()) {
    await teardown();
  }
}
