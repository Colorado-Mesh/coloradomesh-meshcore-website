import { ImageResponse } from 'next/og';
import { getPostBySlug, getPostSlugs } from '@/lib/blog';

export const alt = 'Denver MeshCore Blog Post';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title || 'Denver MeshCore Blog';
  const readingTime = post?.readingTime || '';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '60px',
          background: 'linear-gradient(135deg, #0a0f1a 0%, #111827 50%, #0a1628 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top: branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'white',
              }}
            />
          </div>
          <span style={{ color: '#9ca3af', fontSize: '24px', fontWeight: 500 }}>
            Denver MeshCore
          </span>
        </div>

        {/* Center: title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1
            style={{
              fontSize: title.length > 60 ? '48px' : '56px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
              margin: 0,
              maxWidth: '1000px',
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom: metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ color: '#22c55e', fontSize: '20px', fontWeight: 600 }}>
            denvermc.com/blog
          </span>
          {readingTime && (
            <span style={{ color: '#6b7280', fontSize: '20px' }}>
              {readingTime}
            </span>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
