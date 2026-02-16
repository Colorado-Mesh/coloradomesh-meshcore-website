import { BASE_URL } from '@/lib/constants';

interface WebApplicationSchemaInput {
  name: string;
  description: string;
  url: string;
}

export function generateWebApplicationSchema(app: WebApplicationSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: app.name,
    description: app.description,
    url: app.url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: 'Denver MeshCore',
      url: BASE_URL,
    },
  };
}
