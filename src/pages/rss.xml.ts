import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

function dateOf(d?: Date): number {
  return d?.getTime?.() ?? 0;
}

export async function GET(context: APIContext) {
  const posts = (await getCollection("docs"))
    .filter((p) => !!p.data.title && !p.id.includes("examples/") && !p.data.draft)
    .sort((a, b) => dateOf(b.data.created ?? b.data.date) - dateOf(a.data.created ?? a.data.date));

  return rss({
    title: "Raincoat 개발 블로그",
    description: "프론트엔드 개발자 블로그. 웹 개발 경험과 지식을 공유합니다.",
    site: context.site ?? new URL("https://raincoat98.github.io"),
    items: posts.map((post) => ({
      title: post.data.title!,
      description: post.data.description,
      link: `/${post.id}/`,
      pubDate: post.data.created ?? post.data.date ?? new Date(),
      categories: post.data.categories,
    })),
    customData: `<language>ko-KR</language>`,
  });
}