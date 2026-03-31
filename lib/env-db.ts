/** Czy wygląda na skonfigurowany connection string do Postgres (Vercel / lokalnie). */
export function isDatabaseUrlConfigured(): boolean {
  const u = process.env.DATABASE_URL?.trim();
  return Boolean(u && u.startsWith("postgresql"));
}
