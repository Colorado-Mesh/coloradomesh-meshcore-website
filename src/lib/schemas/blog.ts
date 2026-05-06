import { BASE_URL } from '@/lib/constants';

export interface BlogPostSchemaInput {
  title: string;
  excerpt: string;
  date: string;
  dateModified?: string;
  author: string;
  slug: string;
}

/**
 * Generate BlogPosting JSON-LD schema for a blog post
 */
export function generateBlogPostSchema(post: BlogPostSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.dateModified || post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Colorado MeshCore',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo-512.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
    url: `${BASE_URL}/blog/${post.slug}`,
  };
}
