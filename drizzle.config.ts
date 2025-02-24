import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';

const DATABASE_URL = process.env.DATABASE_URL ?? '';

const drizzleConfig = defineConfig({
  dialect: 'postgresql',
  schema: './lib/schema.ts',
  out: './migrations',
  dbCredentials: { url: DATABASE_URL }
} satisfies Config);

export default defineConfig(drizzleConfig);
