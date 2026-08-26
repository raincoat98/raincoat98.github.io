import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"docs">;

export const POSTS_PER_PAGE = 12;

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("docs");

  return posts
    .filter((post) => !!post.data.title && !post.id.includes("examples/") && !post.data.draft)
    .sort((a, b) => {
      const aDate = a.data.created ?? a.data.date;
      const bDate = b.data.created ?? b.data.date;
      return (bDate?.getTime?.() ?? 0) - (aDate?.getTime?.() ?? 0);
    });
}

export function getPostCategories(posts: Post[]): string[] {
  return [...new Set(posts.flatMap((post) => post.data.categories.map((category) => category.split("|")[0].trim())))].sort();
}
