import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

export const createPool = () => {
  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000, // Close idle clients quickly to avoid stale/unexpected connection drops
    max: 10,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });

// Automatically retry operations on transient connection issues (e.g. idle connection terminated by proxy/server)
export async function runWithRetry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const errorMessage = String(error?.message || '');
      const causeMessage = String(error?.cause?.message || '');
      const isTransient = 
        errorMessage.includes('Connection terminated unexpectedly') ||
        causeMessage.includes('Connection terminated unexpectedly') ||
        errorMessage.includes('socket') ||
        causeMessage.includes('socket') ||
        errorMessage.includes('ECONNRESET') ||
        causeMessage.includes('ECONNRESET') ||
        errorMessage.includes('ETIMEDOUT') ||
        causeMessage.includes('ETIMEDOUT') ||
        error?.code === '08000' ||
        error?.code === '08003' ||
        error?.code === '08006' ||
        error?.code === '57P01';

      if (isTransient && i < retries - 1) {
        console.warn(`[DB] Query failed due to transient connection error. Retrying in ${delay}ms... (Attempt ${i + 1} of ${retries}). Error: ${errorMessage}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export { pool };
