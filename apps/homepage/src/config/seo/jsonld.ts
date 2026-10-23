import { SEO_CONSTANTS } from './constants'
import { FAQ_ITEMS } from './faq-data'
import { SEO_KEYWORDS } from './keywords'

export const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${SEO_CONSTANTS.siteUrl}/#software`,
      name: SEO_CONSTANTS.siteName,
      alternateName: [
        'react-mosaic alternative',
        'react layout engine',
        'react tiling window manager',
        'react workspace layout manager',
      ],
      description:
        'A flexible, headless, and completely unopinionated workspace layout engine for React 18 & 19. Split, dock, and pop out panes recursively without grid constraints. A modern successor to react-mosaic and golden-layout.',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'All',
      softwareVersion: SEO_CONSTANTS.currentVersion,
      license: SEO_CONSTANTS.licenseUrl,
      url: SEO_CONSTANTS.siteUrl,
      codeRepository: SEO_CONSTANTS.githubRepoUrl,
      downloadUrl: SEO_CONSTANTS.npmPkgUrl,
      author: {
        '@type': 'Person',
        name: SEO_CONSTANTS.authorName,
        url: SEO_CONSTANTS.authorUrl,
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      keywords: SEO_KEYWORDS.join(', '),
      featureList: [
        'Recursive binary tree space partitioning (react-mosaic model)',
        '100% headless, zero-CSS runtime design',
        'Multi-tab pane docking and cross-pane transfers',
        'Decoupled reactivity with useSyncExternalStore (0 layout reflows)',
        'Native multi-window popout browser windows with synced theme & state',
        'Deterministic immutable JSON serialization and cycle-safe state hydration',
        'Full React 18 and React 19 concurrent mode support',
        'Built on robust @dnd-kit pointer and accessibility primitives',
      ],
      sameAs: [SEO_CONSTANTS.githubRepoUrl, SEO_CONSTANTS.npmPkgUrl],
    },
    {
      '@type': 'WebSite',
      '@id': `${SEO_CONSTANTS.siteUrl}/#website`,
      name: SEO_CONSTANTS.siteName,
      url: SEO_CONSTANTS.siteUrl,
      description:
        'Official website and documentation for react-zeugma, the recursive workspace layout engine for React.',
      inLanguage: 'en-US',
      publisher: {
        '@type': 'Person',
        name: SEO_CONSTANTS.authorName,
        url: SEO_CONSTANTS.authorUrl,
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SEO_CONSTANTS.siteUrl}/#faq`,
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ],
}

export const demoJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'react-zeugma Interactive Layout Engine Demo',
  description:
    'Live interactive demo showcasing the react-zeugma tiling workspace layout engine with real-time simulated observability panels, charts, logs, and resizers.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  url: `${SEO_CONSTANTS.siteUrl}/demo`,
  author: {
    '@type': 'Person',
    name: SEO_CONSTANTS.authorName,
  },
}

export const changelogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'react-zeugma Changelog & Release Notes',
  description:
    'Chronological release notes, architectural updates, and changelog for react-zeugma.',
  url: `${SEO_CONSTANTS.siteUrl}/changelog`,
  publisher: {
    '@type': 'Person',
    name: SEO_CONSTANTS.authorName,
  },
}
