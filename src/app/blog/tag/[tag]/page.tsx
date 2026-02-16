import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostsByTag, getAllTags } from '@/lib/blog';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { BASE_URL } from '@/lib/constants';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({ tag: tag.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);

  if (posts.length === 0) {
    return { title: 'Tag Not Found' };
  }

  // Find the display-cased version of the tag from the first post
  const displayTag =
    posts[0].tags.find((t) => t.toLowerCase() === decodedTag.toLowerCase()) || decodedTag;

  return {
    title: `Posts tagged "${displayTag}"`,
    description: `Browse ${posts.length} blog post${posts.length === 1 ? '' : 's'} about ${displayTag} from the Denver MeshCore community.`,
    alternates: {
      canonical: `${BASE_URL}/blog/tag/${encodeURIComponent(decodedTag.toLowerCase())}`,
    },
    openGraph: {
      title: `Posts tagged "${displayTag}" | Denver MeshCore`,
      description: `Browse ${posts.length} blog post${posts.length === 1 ? '' : 's'} about ${displayTag}.`,
      url: `${BASE_URL}/blog/tag/${encodeURIComponent(decodedTag.toLowerCase())}`,
      type: 'website',
    },
  };
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Unknown date';
  }
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);

  if (posts.length === 0) {
    notFound();
  }

  const displayTag =
    posts[0].tags.find((t) => t.toLowerCase() === decodedTag.toLowerCase()) || decodedTag;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Blog', url: `${BASE_URL}/blog` },
    { name: displayTag, url: `${BASE_URL}/blog/tag/${encodeURIComponent(decodedTag.toLowerCase())}` },
  ]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: displayTag },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-mesh/5 to-transparent" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-1.5 bg-mesh/10 text-mesh rounded-full text-sm font-medium mb-6">
                {displayTag}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Posts tagged &ldquo;{displayTag}&rdquo;
              </h1>
              <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
                {posts.length} post{posts.length === 1 ? '' : 's'} from the Denver MeshCore community
              </p>
            </div>
          </div>
        </section>

        {/* Posts */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
                </article>
              ))}
            </div>

            {/* Back to blog */}
            <div className="mt-12 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center text-mesh hover:text-mesh/80 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                All Blog Posts
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
