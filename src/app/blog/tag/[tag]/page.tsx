import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostsByTag, getAllTags } from '@/lib/blog';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { BASE_URL, COMMUNITY_NAME, SITE_NAME } from '@/lib/constants';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { HeroPanel } from '@/components/brand';

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

  const displayTag =
    posts[0].tags.find((t) => t.toLowerCase() === decodedTag.toLowerCase()) || decodedTag;

  return {
    title: `Posts tagged "${displayTag}"`,
    description: `Browse ${posts.length} blog post${posts.length === 1 ? '' : 's'} about ${displayTag} from the ${SITE_NAME} community.`,
    alternates: {
      canonical: `${BASE_URL}/blog/tag/${encodeURIComponent(decodedTag.toLowerCase())}`,
    },
    openGraph: {
      title: `Posts tagged "${displayTag}" | ${SITE_NAME}`,
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
    {
      name: displayTag,
      url: `${BASE_URL}/blog/tag/${encodeURIComponent(decodedTag.toLowerCase())}`,
    },
  ]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: displayTag },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <div className="min-h-screen">
        <HeroPanel
          background="topo-grid"
          showMountains={false}
          eyebrow={`${COMMUNITY_NAME} · Tag`}
          eyebrowTone="sky"
          title={
            <>
              Posts tagged
              <span className="block text-mesh">&ldquo;{displayTag}&rdquo;</span>
            </>
          }
          description={`${posts.length} post${posts.length === 1 ? '' : 's'} from the ${SITE_NAME} community filed under ${displayTag}.`}
          actions={
            <>
              <Link href="/blog" className="btn-primary">
                All blog posts
              </Link>
              <Link href="/start" className="btn-secondary">
                Get Started
              </Link>
            </>
          }
          meta={
            <div className="panel px-5 sm:px-6 py-4 backdrop-blur-md bg-card/85">
              <Breadcrumbs items={breadcrumbItems} />
            </div>
          }
        />

        <section className="px-4 sm:px-6 lg:px-8 pb-24 -mt-10">
          <div className="mx-auto max-w-4xl">
            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="group panel p-6 sm:p-7 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Link href={`/blog/${post.slug}`} className="block focus-ring rounded-md">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs mono uppercase tracking-[0.18em] text-foreground-dim">
                          <time dateTime={post.date}>{formatDate(post.date)}</time>
                          <span aria-hidden>·</span>
                          <span>{post.readingTime}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight group-hover:text-mesh transition-colors">
                          {post.title}
                        </h2>
                        <p className="mt-2 text-foreground-muted leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="hidden sm:block shrink-0">
                        <span className="inline-flex items-center gap-1 text-sm text-mesh group-hover:text-mesh-light">
                          Read
                          <span
                            aria-hidden
                            className="transition-transform group-hover:translate-x-0.5"
                          >
                            →
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-mesh hover:text-mesh-light transition-colors"
              >
                <span aria-hidden>←</span>
                All blog posts
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
