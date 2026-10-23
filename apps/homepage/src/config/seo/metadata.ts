import { Metadata } from 'next'
import { SEO_CONSTANTS } from './constants'
import { SEO_KEYWORDS } from './keywords'

export const globalMetadata: Metadata = {
  metadataBase: new URL(SEO_CONSTANTS.siteUrl),
  title: {
    default: SEO_CONSTANTS.titleDefault,
    template: SEO_CONSTANTS.titleTemplate,
  },
  description: SEO_CONSTANTS.descriptionDefault,
  keywords: SEO_KEYWORDS,
  authors: [{ name: SEO_CONSTANTS.authorName, url: SEO_CONSTANTS.authorUrl }],
  creator: SEO_CONSTANTS.authorName,
  publisher: SEO_CONSTANTS.publisher,
  category: 'technology',
  classification: 'React UI Libraries, Layout Engines & Window Managers',

  verification: {
    google: SEO_CONSTANTS.googleVerification,
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: SEO_CONSTANTS.logoImage,
    apple: SEO_CONSTANTS.logoImage,
  },

  openGraph: {
    type: 'website',
    locale: SEO_CONSTANTS.locale,
    url: SEO_CONSTANTS.siteUrl,
    siteName: SEO_CONSTANTS.siteName,
    title: 'react-zeugma — Recursive Layout Engine for React | Modern react-mosaic Alternative',
    description:
      'A flexible, headless, recursive drag-and-drop workspace layout engine for React 18 & 19. Split, dock, and pop out panes recursively without grid constraints.',
    images: [
      {
        url: SEO_CONSTANTS.ogImage,
        width: 1024,
        height: 1024,
        alt: 'react-zeugma — Workspace Layout Engine for React',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'react-zeugma — Recursive Layout Engine for React | react-mosaic Alternative',
    description:
      'Headless, recursive drag-and-drop workspace layout manager for React. Modern successor to react-mosaic & golden-layout.',
    images: [SEO_CONSTANTS.ogImage],
    creator: '@yusufarsln98',
  },

  alternates: {
    canonical: '/',
  },
}

export const homeMetadata: Metadata = {
  title: 'react-zeugma — Recursive Layout Engine for React | Modern react-mosaic Alternative',
  description:
    'A flexible, headless, and unopinionated workspace layout engine for React 18 & 19. Modern alternative to react-mosaic and golden-layout with arbitrary recursive splits, multi-tab docking, and native popouts.',
  keywords: [
    ...SEO_KEYWORDS,
    'react-mosaic alternative',
    'layout engine react',
    'react tiling window manager',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'react-zeugma — Recursive Layout Engine for React | react-mosaic Alternative',
    description:
      'Headless, recursive drag-and-drop workspace layout manager for React. Split panes, dock tabs, and detach windows with zero CSS runtime bloat.',
    url: SEO_CONSTANTS.siteUrl,
    images: [
      {
        url: SEO_CONSTANTS.ogImage,
        width: 1024,
        height: 1024,
        alt: 'react-zeugma — Layout Engine for React',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'react-zeugma — Recursive Layout Engine for React | react-mosaic Alternative',
    description:
      'Headless, recursive drag-and-drop workspace layout manager for React. Build bento cockpits and IDE layouts in minutes.',
    images: [SEO_CONSTANTS.ogImage],
  },
}

export const demoMetadata: Metadata = {
  title: 'Live Interactive Demo — Observability Cockpit & Layout Engine',
  description:
    'Interactive Grafana-style monitoring dashboard and tiling window manager powered by react-zeugma. Drag, resize, and split live panels with real-time streaming telemetry.',
  keywords: [
    ...SEO_KEYWORDS,
    'react layout engine demo',
    'tiling window manager demo react',
    'react-mosaic interactive demo',
  ],
  openGraph: {
    title: 'Live Interactive Demo — react-zeugma Dashboard',
    description:
      'Test the react-zeugma tiling layout engine live. Split, drag, and resize live panels with zero layout reflows and real-time streaming telemetry.',
    url: `${SEO_CONSTANTS.siteUrl}/demo`,
    images: [
      {
        url: SEO_CONSTANTS.ogImage,
        width: 1024,
        height: 1024,
        alt: 'react-zeugma Interactive Demo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Interactive Demo — react-zeugma Dashboard',
    description:
      'Interactive Grafana-style monitoring dashboard and tiling window manager powered by react-zeugma.',
    images: [SEO_CONSTANTS.ogImage],
  },
  alternates: {
    canonical: '/demo',
  },
}

export const changelogMetadata: Metadata = {
  title: 'Changelog & Release Notes',
  description:
    'See the latest release notes, architectural updates, bug fixes, and new layout engine features for react-zeugma.',
  keywords: [
    ...SEO_KEYWORDS,
    'react-zeugma changelog',
    'react-zeugma release notes',
    'react layout engine updates',
  ],
  openGraph: {
    title: 'Changelog & Release Notes — react-zeugma',
    description:
      'See the latest release notes, architectural updates, bug fixes, and new layout engine features for react-zeugma.',
    url: `${SEO_CONSTANTS.siteUrl}/changelog`,
    images: [
      {
        url: SEO_CONSTANTS.ogImage,
        width: 1024,
        height: 1024,
        alt: 'react-zeugma Changelog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Changelog & Release Notes — react-zeugma',
    description:
      'See the latest release notes, architectural updates, and new layout engine features for react-zeugma.',
    images: [SEO_CONSTANTS.ogImage],
  },
  alternates: {
    canonical: '/changelog',
  },
}
