import { PostCategory } from "@prisma/client";

export const CATEGORY_PATH: Record<PostCategory, string> = {
  SPRZET: "sprzet-wedkarski",
  PORADNIK: "poradniki",
  MIEJSCA: "miejsca",
};

export const CATEGORY_LABEL: Record<PostCategory, string> = {
  SPRZET: "Sprzęt Wędkarski",
  PORADNIK: "Poradniki",
  MIEJSCA: "Miejsca",
};

export function categoryToPath(category: PostCategory): string {
  return CATEGORY_PATH[category];
}

export function pathToCategory(path: string): PostCategory | null {
  const entry = Object.entries(CATEGORY_PATH).find(([, p]) => p === path);
  return entry ? (entry[0] as PostCategory) : null;
}

export function postPublicPath(category: PostCategory, slug: string): string {
  return `/${categoryToPath(category)}/${slug}`;
}
