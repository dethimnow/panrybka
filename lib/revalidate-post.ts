import { revalidatePath } from "next/cache";
import type { PostCategory } from "@prisma/client";
import { categoryToPath } from "@/lib/categories";

export function revalidatePostPaths(category: PostCategory, slug: string) {
  const path = categoryToPath(category);
  revalidatePath("/");
  revalidatePath(`/${path}`);
  revalidatePath(`/${path}/${slug}`);
}

export function revalidateProductPaths() {
  revalidatePath("/admin/products");
}
