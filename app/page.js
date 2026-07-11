import JsonLd from '@/components/shared/JsonLd';
import LandingPage from '@/components/landing/LandingPage';

const title = 'প্রশ্নপত্র তৈরি করুন ১ ক্লিকে | প্রশ্নপিডিয়া';
const description =
  '৩য়–১২শ শ্রেণির প্রশ্ন ব্যাংক থেকে ১ ক্লিকে প্রশ্নপত্র তৈরি, PDF ডাউনলোড, OMR মূল্যায়ন ও অনলাইন পরীক্ষা নিন—বাংলাদেশের শিক্ষকদের জন্য প্রশ্নপিডিয়া।';

export const metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: '/',
    languages: {
      'bn-BD': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: '/',
    siteName: 'প্রশ্নপিডিয়া',
    title,
    description,
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
};

const landingPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://proshnopedia.com/#webpage',
  url: 'https://proshnopedia.com/',
  name: title,
  description,
  inLanguage: 'bn-BD',
  isPartOf: {
    '@type': 'WebSite',
    name: 'ProshnoPedia',
    url: 'https://proshnopedia.com/',
  },
  about: {
    '@type': 'SoftwareApplication',
    name: 'প্রশ্নপিডিয়া',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
  },
  mainEntity: {
    '@type': 'ItemList',
    name: 'প্রশ্নপিডিয়ার প্রধান সুবিধা',
    itemListElement: [
      '১ ক্লিকে প্রশ্নপত্র তৈরি',
      'প্রশ্ন ব্যাংক',
      'OMR মূল্যায়ন',
      'অনলাইন পরীক্ষা',
      'PDF ডাউনলোড ও প্রিন্ট',
    ].map((name, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
    })),
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={landingPageSchema} />
      <LandingPage />
    </>
  );
}
