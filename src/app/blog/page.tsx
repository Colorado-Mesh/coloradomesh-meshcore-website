import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'News, tutorials, and updates from the Colorado MeshCore community. Learn about mesh networking, MeshCore technology, and community events.',
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
  openGraph: {
    title: 'Blog | Colorado MeshCore',
    description:
      'News, tutorials, and updates from the Colorado MeshCore community.',
    url: `${BASE_URL}/blog`,
    type: 'website',
  },
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Unknown date';
  }
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-mesh/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Blog
            </h1>
            <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
              News, tutorials, and updates from the Colorado MeshCore community.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mesh/10 mb-6">
                <svg
                  className="w-8 h-8 text-mesh"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Coming Soon
              </h2>
              <p className="text-foreground-muted max-w-md mx-auto">
                We&apos;re working on some great content. Check back soon for
                news, tutorials, and updates from the Colorado MeshCore community.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="group bg-card border border-border rounded-xl p-6 hover:border-mesh/50 transition-colors"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-foreground group-hover:text-mesh transition-colors mb-2">
                          {post.title}
                        </h2>
                        <p className="text-foreground-muted mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted">
                          <span>{formatDate(post.date)}</span>
                          <span>{post.readingTime}</span>
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <span className="inline-flex items-center text-mesh group-hover:translate-x-1 transition-transform">
                          Read more
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/blog/tag/${encodeURIComponent(tag.toLowerCase())}`}
                          className="px-2 py-0.5 bg-mesh/10 text-mesh rounded-full text-xs hover:bg-mesh/20 transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
