import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

let dbInstance: ReturnType<typeof drizzle> | null = null;

if (connectionString) {
  try {
    const client = postgres(connectionString, { max: 1 });
    dbInstance = drizzle(client, { schema });
  } catch (err) {
    console.warn('[Database] Failed to connect using DATABASE_URL, fallback enabled:', err);
  }
}

export const db = dbInstance;
export { schema };

