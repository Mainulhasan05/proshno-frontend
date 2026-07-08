import "./globals.css";
import Providers from "@/components/Providers";
import JsonLd from "@/components/shared/JsonLd";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#4F46E5',
};

export const metadata = {
  metadataBase: new URL('https://proshnopedia.com'),

  title: {
    default: 'প্রশ্নপিডিয়া — ১ ক্লিকে প্রশ্নপত্র তৈরি | ProshnoPedia',
    template: '%s | প্রশ্নপিডিয়া — ProshnoPedia',
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'প্রশ্নপিডিয়া',
  },

  formatDetection: {
    telephone: false,
  },

  description:
    'শিক্ষকদের জন্য ১ ক্লিকে প্রশ্নপত্র তৈরির প্ল্যাটফর্ম। ৩য়–১২শ শ্রেণির সকল বিষয়ের প্রশ্ন ব্যাংক, OMR মূল্যায়ন ও অনলাইন পরীক্ষা — সবকিছু এক জায়গায়। ProshnoPedia.com',

  keywords: [
    'প্রশ্নপত্র তৈরি',
    'প্রশ্ন ব্যাংক',
    'question bank bangladesh',
    'question paper generator',
    'OMR sheet',
    'অনলাইন পরীক্ষা',
    'শিক্ষক',
    'প্রশ্নপিডিয়া',
    'ProshnoPedia',
    'edtech bangladesh',
    'বাংলাদেশ শিক্ষা',
    'প্রশ্নপত্র',
    'পরীক্ষার প্রশ্ন',
    'MCQ প্রশ্ন',
  ],

  authors: [{ name: 'ProshnoPedia', url: 'https://proshnopedia.com' }],
  creator: 'ProshnoPedia',
  publisher: 'ProshnoPedia',

  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: 'https://proshnopedia.com',
    siteName: 'প্রশ্নপিডিয়া — ProshnoPedia',
    title: 'প্রশ্নপিডিয়া — ১ ক্লিকে প্রশ্নপত্র তৈরি | ProshnoPedia',
    description:
      'শিক্ষকদের জন্য ১ ক্লিকে প্রশ্নপত্র তৈরির প্ল্যাটফর্ম। ৩য়–১২শ শ্রেণির সকল বিষয়ের প্রশ্ন ব্যাংক, OMR মূল্যায়ন ও অনলাইন পরীক্ষা।',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'প্রশ্নপিডিয়া — ১ ক্লিকে প্রশ্নপত্র তৈরি | ProshnoPedia',
    description:
      'শিক্ষকদের জন্য ১ ক্লিকে প্রশ্নপত্র তৈরির প্ল্যাটফর্ম। প্রশ্ন ব্যাংক, OMR মূল্যায়ন ও অনলাইন পরীক্ষা — সবকিছু এক জায়গায়।',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: 'https://proshnopedia.com',
  },

  manifest: '/manifest.json',

  category: 'education',
};

// JSON-LD structured data for the entire site
const organizationSchema = {
  '@type': 'Organization',
  name: 'ProshnoPedia',
  alternateName: 'প্রশ্নপিডিয়া',
  url: 'https://proshnopedia.com',
  logo: 'https://proshnopedia.com/favicon.ico',
  description:
    'শিক্ষকদের জন্য ১ ক্লিকে প্রশ্নপত্র তৈরির প্ল্যাটফর্ম — ProshnoPedia.com',
  foundingDate: '2026',
  areaServed: {
    '@type': 'Country',
    name: 'Bangladesh',
  },
  knowsLanguage: ['bn', 'en'],
};

const websiteSchema = {
  '@type': 'WebSite',
  name: 'ProshnoPedia',
  alternateName: 'প্রশ্নপিডিয়া',
  url: 'https://proshnopedia.com',
  inLanguage: 'bn',
  publisher: {
    '@type': 'Organization',
    name: 'ProshnoPedia',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://proshnopedia.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const softwareSchema = {
  '@type': 'SoftwareApplication',
  name: 'ProshnoPedia',
  alternateName: 'প্রশ্নপিডিয়া',
  url: 'https://proshnopedia.com',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BDT',
    description: 'ফ্রি প্ল্যান উপলব্ধ',
  },
  description:
    '১ ক্লিকে প্রশ্নপত্র তৈরি করুন। ৩য়–১২শ শ্রেণির সকল বিষয়ের প্রশ্ন ব্যাংক, OMR মূল্যায়ন ও অনলাইন পরীক্ষা।',
  featureList: [
    'প্রশ্নপত্র তৈরি',
    'প্রশ্ন ব্যাংক',
    'OMR মূল্যায়ন',
    'অনলাইন পরীক্ষা',
    'PDF ডাউনলোড',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <JsonLd data={[organizationSchema, websiteSchema, softwareSchema]} />
      </head>
      <body className="min-h-full bg-neutral-50 text-neutral-800 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
