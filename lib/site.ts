export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://panrybka.pl"
  );
}

export function defaultOgImageUrl(): string {
  return `${getSiteUrl()}/og-default.jpg`;
}
