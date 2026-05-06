import {
  BASE_URL,
  COMMUNITY_NAME,
  DISCORD_INVITE_URL,
  SITE_DESCRIPTION,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_TITLE,
} from '@/lib/constants';

interface JsonLdProps {
  data: Record<string, unknown>;
}

function sanitizeJsonLd(json: string): string {
  return json
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}

export default function JsonLd({ data }: JsonLdProps) {
  const jsonString = JSON.stringify(data);
  const sanitizedJson = sanitizeJsonLd(jsonString);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizedJson }}
    />
  );
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: `${COMMUNITY_NAME} Community`,
  alternateName: SITE_NAME,
  url: BASE_URL,
  logo: `${BASE_URL}${SITE_LOGO_PATH}`,
  description: SITE_DESCRIPTION,
  foundingLocation: {
    '@type': 'Place',
    name: 'Colorado',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'CO',
      addressCountry: 'US',
    },
  },
  areaServed: {
    '@type': 'State',
    name: 'Colorado',
  },
  sameAs: [DISCORD_INVITE_URL],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'community support',
    url: DISCORD_INVITE_URL,
  },
  knowsAbout: [
    'Mesh Networking',
    'LoRa Technology',
    'Decentralized Communication',
    'Off-grid Communication',
    'Emergency Preparedness',
    'MeshCore Protocol',
  ],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: SITE_TITLE,
  alternateName: SITE_NAME,
  url: BASE_URL,
  description: SITE_DESCRIPTION,
  publisher: {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
  },
  inLanguage: 'en-US',
};

export const communityOrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'CommunityOrganization',
  '@id': `${BASE_URL}/#community`,
  name: `${COMMUNITY_NAME} Community`,
  alternateName: SITE_NAME,
  url: BASE_URL,
  logo: `${BASE_URL}${SITE_LOGO_PATH}`,
  image: `${BASE_URL}${SITE_LOGO_PATH}`,
  description: SITE_DESCRIPTION,
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'Colorado',
    addressCountry: 'US',
  },
  areaServed: {
    '@type': 'State',
    name: 'Colorado',
    '@id': 'https://www.wikidata.org/wiki/Q1261',
  },
  priceRange: 'Free',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    opens: '00:00',
    closes: '23:59',
  },
};
