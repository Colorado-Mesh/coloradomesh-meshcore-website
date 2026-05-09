import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getPostSlugs, getRelatedPosts } from '@/lib/blog';
import { generateBlogPostSchema } from '@/lib/schemas/blog';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { BASE_URL, COMMUNITY_NAME, DISCORD_INVITE_URL } from '@/lib/constants';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SectionEyebrow } from '@/components/brand';
import TopoBackground from '@/components/brand/TopoBackground';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    alternates: {
      canonical: `${BASE_URL}/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.dateModified || post.date,
      authors: [post.author],
      url: `${BASE_URL}/blog/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  const { content } = await compileMDX({
    source: post.content,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
  });

  const blogPostSchema = generateBlogPostSchema({
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    dateModified: post.dateModified,
    author: post.author,
    slug: post.slug,
  });

  const relatedPosts = getRelatedPosts(post.slug, post.tags, 3);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Blog', url: `${BASE_URL}/blog` },
    { name: post.title, url: `${BASE_URL}/blog/${post.slug}` },
  ]);

  return (
    <>
      <JsonLd data={blogPostSchema} />
      <JsonLd data={breadcrumbSchema} />

      <article className="min-h-screen">
        <TopoBackground variant="topo-grid" showMountains={false}>
          <header className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="panel px-5 sm:px-6 py-4 backdrop-blur-md bg-card/85 mb-8">
              <Breadcrumbs
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Blog', href: '/blog' },
                  { label: post.title },
                ]}
              />
            </div>

            <SectionEyebrow tone="sky" className="mb-5">
              {COMMUNITY_NAME} · Blog
            </SectionEyebrow>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight leading-[1.05]">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
              <span className="font-medium text-foreground">{post.author}</span>
              <span aria-hidden>·</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden>·</span>
              <span className="mono uppercase tracking-[0.12em] text-xs text-foreground-dim">
                {post.readingTime}
              </span>
            </div>

            {post.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${encodeURIComponent(tag.toLowerCase())}`}
                    className="tag-mono hover:border-mesh/50 hover:text-mesh transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </header>
        </TopoBackground>

        {/* Content */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
          <div className="prose prose-lg max-w-none">{content}</div>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-background-secondary py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <SectionEyebrow tone="mesh" className="mb-3">
                Related posts
              </SectionEyebrow>
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-8">
                Keep reading.
              </h2>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group panel p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-ring"
                  >
                    <div className="text-xs mono uppercase tracking-[0.18em] text-foreground-dim mb-2">
                      {related.readingTime}
                    </div>
                    <h3 className="font-semibold text-foreground tracking-tight group-hover:text-mesh transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="mt-2 text-sm text-foreground-muted line-clamp-2">
                      {related.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer CTA */}
        <section className="bg-background py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="panel-elevated p-6 sm:p-8">
              <SectionEyebrow tone="mesh" className="justify-center">
                Have questions?
              </SectionEyebrow>
              <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                Discuss this with the community.
              </h2>
              <p className="mt-3 text-foreground-muted max-w-md mx-auto">
                Operators are happy to chat about anything in this post — or anything else
                {' '}{COMMUNITY_NAME}-adjacent.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Discuss on Discord
                </a>
                <Link href="/blog" className="btn-secondary">
                  All blog posts
                </Link>
              </div>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
