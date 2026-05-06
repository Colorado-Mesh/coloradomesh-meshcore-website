import { BASE_URL, SITE_NAME } from '@/lib/constants';

interface IsBasedOnRef {
  name: string;
  url: string;
  license?: string;
}

interface WebApplicationSchemaInput {
  name: string;
  description: string;
  url: string;
  license?: string;
  isBasedOn?: IsBasedOnRef | IsBasedOnRef[];
}

export function generateWebApplicationSchema(app: WebApplicationSchemaInput) {
  const schema: Record<string, unknown> = {
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
      name: SITE_NAME,
      url: BASE_URL,
    },
  };

  if (app.license) {
    schema.license = app.license;
  }

  if (app.isBasedOn) {
    const items = Array.isArray(app.isBasedOn) ? app.isBasedOn : [app.isBasedOn];
    schema.isBasedOn = items.map((item) => {
      const ref: Record<string, unknown> = {
        '@type': 'SoftwareSourceCode',
        name: item.name,
        codeRepository: item.url,
        url: item.url,
      };
      if (item.license) ref.license = item.license;
      return ref;
    });
  }

  return schema;
}
