import fs from 'fs';
import path from 'path';
import { MetadataRoute } from 'next';
import { getPostBySlug, getPostSlugs, getAllTags } from '@/lib/blog';
import { BASE_URL } from '@/lib/constants';

// Fixed date for static pages — update when static content is meaningfully edited
const STATIC_LAST_EDITED = new Date('2026-02-16');

/**
 * Auto-discover use case slugs from the use-cases directory
 */
function getUseCaseSlugs(): string[] {
  const useCasesDir = path.join(process.cwd(), 'src/app/use-cases');

  try {
    if (!fs.existsSync(useCasesDir)) {
      return [];
    }

    return fs
      .readdirSync(useCasesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: STATIC_LAST_EDITED,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/start`,
      lastModified: STATIC_LAST_EDITED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: STATIC_LAST_EDITED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/why-meshcore`,
      lastModified: STATIC_LAST_EDITED,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/map`,
      lastModified: STATIC_LAST_EDITED,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/observer`,
      lastModified: STATIC_LAST_EDITED,
      changeFrequency: 'hourly',
      priority: 0.6,
    },
  ];

  // Use case pages (auto-discovered from file system)
  const useCaseSlugs = getUseCaseSlugs();
  const useCasePages: MetadataRoute.Sitemap = useCaseSlugs.map((slug) => ({
    url: `${BASE_URL}/use-cases/${slug}`,
    lastModified: STATIC_LAST_EDITED,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Blog index page
  const blogIndex: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog`,
      lastModified: STATIC_LAST_EDITED,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  // Dynamic blog post pages — use actual post dates
  const blogSlugs = getPostSlugs();
  const blogPages: MetadataRoute.Sitemap = blogSlugs
    .map((slug) => {
      const post = getPostBySlug(slug);
      if (!post || !post.published) return null;
      return {
        url: `${BASE_URL}/blog/${slug}`,
        lastModified: new Date(post.dateModified || post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  // Tag pages
  const tags = getAllTags();
  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${BASE_URL}/blog/tag/${encodeURIComponent(tag.toLowerCase())}`,
    lastModified: STATIC_LAST_EDITED,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...useCasePages,
    ...blogIndex,
    ...blogPages,
    ...tagPages,
  ];
}
