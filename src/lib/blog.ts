import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  dateModified?: string;
  excerpt: string;
  author: string;
  tags: string[];
  published: boolean;
  content: string;
  readingTime: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  dateModified?: string;
  excerpt: string;
  author: string;
  tags: string[];
  readingTime: string;
}

/**
 * Calculate reading time for content
 */
function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Validate frontmatter data
 */
function validateFrontmatter(data: Record<string, unknown>, slug: string): boolean {
  if (!data.title || typeof data.title !== 'string') {
    console.warn(`Blog post "${slug}" missing valid title`);
    return false;
  }
  if (!data.date) {
    console.warn(`Blog post "${slug}" missing date`);
    return false;
  }
  if (!data.excerpt || typeof data.excerpt !== 'string') {
    console.warn(`Blog post "${slug}" missing valid excerpt`);
    return false;
  }

  // Validate date format
  const dateValue = new Date(data.date as string);
  if (isNaN(dateValue.getTime())) {
    console.warn(`Blog post "${slug}" has invalid date format`);
    return false;
  }

  // Validate tags if present
  if (data.tags && !Array.isArray(data.tags)) {
    console.warn(`Blog post "${slug}" has invalid tags format`);
    return false;
  }

  // Validate published if present
  if (data.published !== undefined && typeof data.published !== 'boolean') {
    console.warn(`Blog post "${slug}" has invalid published format`);
    return false;
  }

  return true;
}

/**
 * Get all post slugs for static generation
 */
export function getPostSlugs(): string[] {
  try {
    if (!fs.existsSync(postsDirectory)) {
      return [];
    }
    return fs
      .readdirSync(postsDirectory)
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.replace(/\.mdx$/, ''));
  } catch {
    return [];
  }
}

/**
 * Get a single post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    if (!validateFrontmatter(data, slug)) {
      return null;
    }

    const dateModified = data.dateModified
      ? (data.dateModified as string)
      : undefined;

    return {
      slug,
      title: data.title as string,
      date: data.date as string,
      ...(dateModified && { dateModified }),
      excerpt: data.excerpt as string,
      author: (data.author as string) || 'Denver MeshCore',
      tags: (data.tags as string[]) || [],
      published: data.published !== false,
      content,
      readingTime: calculateReadingTime(content),
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

/**
 * Get all published posts sorted by date
 */
export function getAllPosts(): BlogPostMeta[] {
  const slugs = getPostSlugs();

  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null && post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((post): BlogPostMeta => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      ...(post.dateModified && { dateModified: post.dateModified }),
      excerpt: post.excerpt,
      author: post.author,
      tags: post.tags,
      readingTime: post.readingTime,
    }));

  return posts;
}

/**
 * Get all unique tags from published posts
 */
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set<string>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}

/**
 * Get all published posts with a given tag
 */
export function getPostsByTag(tag: string): BlogPostMeta[] {
  const normalizedTag = tag.toLowerCase();
  return getAllPosts().filter((post) =>
    post.tags.some((t) => t.toLowerCase() === normalizedTag)
  );
}

/**
 * Get related posts based on shared tags, falling back to recency
 */
export function getRelatedPosts(
  currentSlug: string,
  tags: string[],
  limit: number = 3
): BlogPostMeta[] {
  const allPosts = getAllPosts().filter((p) => p.slug !== currentSlug);

  // Score posts by number of shared tags
  const scored = allPosts.map((post) => {
    const sharedTags = post.tags.filter((t) =>
      tags.some((ct) => ct.toLowerCase() === t.toLowerCase())
    ).length;
    return { post, sharedTags };
  });

  // Sort by shared tags (desc), then by date (desc)
  scored.sort((a, b) => {
    if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags;
    return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
  });

  return scored.slice(0, limit).map((s) => s.post);
}
