export interface ApplicationEnvironment {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  FRONTEND_URL: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_SECRET_KEY?: string;
}

function readString(values: Record<string, unknown>, key: string, fallback?: string): string {
  const value = values[key];
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing required environment variable: ${key}`);
}

function readOptionalString(values: Record<string, unknown>, key: string): string | undefined {
  const value = values[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readPort(values: Record<string, unknown>): number {
  const rawPort = readString(values, 'PORT', '3001');
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
}

function assertHttpUrl(value: string, key: string): void {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${key} must be a valid URL`);
  }

  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !(isLocal && url.protocol === 'http:')) {
    throw new Error(`${key} must use HTTPS outside local development`);
  }
}

/**
 * Validates the Nest runtime without changing the existing Prisma/SQLite data
 * path. Supabase credentials are optional until the hosted project exists, but
 * partial or unsafe-looking configurations fail fast instead of silently
 * launching against the wrong backend.
 */
export function validateEnvironment(
  values: Record<string, unknown>
): Record<string, unknown> & ApplicationEnvironment {
  const nodeEnv = readString(values, 'NODE_ENV', 'development');
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production');
  }

  const frontendUrl = readString(values, 'FRONTEND_URL', 'http://localhost:3000');
  assertHttpUrl(frontendUrl, 'FRONTEND_URL');

  const jwtSecret = readString(values, 'JWT_SECRET');
  if (
    nodeEnv === 'production' &&
    (jwtSecret.length < 32 || jwtSecret.includes('change-in-production'))
  ) {
    throw new Error(
      'JWT_SECRET must be a non-placeholder value of at least 32 characters in production'
    );
  }

  const supabaseUrl = readOptionalString(values, 'SUPABASE_URL');
  const supabasePublishableKey = readOptionalString(values, 'SUPABASE_PUBLISHABLE_KEY');
  const supabaseSecretKey = readOptionalString(values, 'SUPABASE_SECRET_KEY');
  const hasAnySupabaseValue = Boolean(supabaseUrl || supabasePublishableKey || supabaseSecretKey);

  if (hasAnySupabaseValue && (!supabaseUrl || !supabasePublishableKey)) {
    throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be configured together');
  }

  if (supabaseUrl) {
    assertHttpUrl(supabaseUrl, 'SUPABASE_URL');
  }

  if (supabaseSecretKey?.startsWith('sb_publishable_')) {
    throw new Error('SUPABASE_SECRET_KEY cannot contain a publishable client key');
  }

  return {
    ...values,
    NODE_ENV: nodeEnv as ApplicationEnvironment['NODE_ENV'],
    PORT: readPort(values),
    FRONTEND_URL: frontendUrl,
    DATABASE_URL: readString(values, 'DATABASE_URL', 'file:./dev.db'),
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: readString(values, 'JWT_EXPIRES_IN', '7d'),
    ...(supabaseUrl ? { SUPABASE_URL: supabaseUrl } : {}),
    ...(supabasePublishableKey ? { SUPABASE_PUBLISHABLE_KEY: supabasePublishableKey } : {}),
    ...(supabaseSecretKey ? { SUPABASE_SECRET_KEY: supabaseSecretKey } : {}),
  };
}
