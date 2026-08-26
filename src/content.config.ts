import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

// 메타 색상(예: "React|blue") 제거 → "React"
const tagsSchema = z
  .union([z.string(), z.array(z.string())])
  .transform((v) => {
    const arr = Array.isArray(v) ? v : v.split(",").map((s) => s.trim());
    return arr.map((t) => t.split("|")[0].trim()).filter(Boolean);
  });

const docs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      // 기존 created/date 통합 → pubDate
      created: z.coerce.date().optional(),
      date: z.coerce.date().optional(),
      updated: z.coerce.date().optional(),
      categories: z.array(z.string()).default([]).transform((a) => a.map((s) => s.split("|")[0].trim())),
      tags: tagsSchema.default([]),
      platform: z.string().optional(),
      readingTime: z.number().optional(),
      image: image().optional(),
      layout: z.string().optional(),
      order: z.number().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { docs };