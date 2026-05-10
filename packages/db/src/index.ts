import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// This safely defaults to a fallback to allow builds/tests to pass if env isn't set
const connectionString = process.env.DATABASE_URL || 'postgres://user:pass@ep-local.neon.tech/neondb';

export const sql = neon(connectionString);
export const db = drizzle(sql as any, { schema });

export * from './schema';
