import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import { ArticleList, ArticleTileGrid } from '@src/components/features/article';
import { Container } from '@src/components/shared/container';
import TranslationsProvider from '@src/components/shared/i18n/TranslationProvider';
import initTranslations from '@src/i18n';
import { defaultLocale, locales } from '@src/i18n/config';
import { PageBlogPostOrder } from '@src/lib/__generated/sdk';
import { client, previewClient } from '@src/lib/client';

interface LandingPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const { isEnabled: preview } = draftMode();
  const gqlClient = preview ? previewClient : client;
  const landingPageData = await gqlClient.pageLanding({ locale: params.locale, preview });
  const page = landingPageData.pageLandingCollection?.items[0];

  const languages = Object.fromEntries(
    locales.map(locale => [locale, locale === defaultLocale ? '/' : `/${locale}`]),
  );
  const metadata: Metadata = {
    alternates: {
      canonical: '/',
      languages: languages,
    },
  };
  if (page?.seoFields) {
    metadata.title = page.seoFields.pageTitle;
    metadata.description = page.seoFields.pageDescription;
    metadata.robots = {
      follow: !page.seoFields.nofollow,
      index: !page.seoFields.noindex,
    };
  }

  return metadata;
}

export default async function Page({ params: { locale } }: LandingPageProps) {
  const { isEnabled: preview } = draftMode();
  const { resources } = await initTranslations({ locale });
  const gqlClient = preview ? previewClient : client;

  const landingPageData = await gqlClient.pageLanding({ locale, preview });
  const page = landingPageData.pageLandingCollection?.items[0];

  if (!page) {
    notFound();
  }

  const blogPostsData = await gqlClient.pageBlogPostCollection({
    limit: 100,
    locale,
    order: PageBlogPostOrder.PublishedDateDesc,
    preview,
  });
  const posts = blogPostsData.pageBlogPostCollection?.items;

  if (!posts) {
    return;
  }

  return (
    <TranslationsProvider locale={locale} resources={resources}>
      <Container className="my-8 text-center">
        <h1 className="mb-2 text-4xl font-bold" style={{ color: '#dc2626' }}>
          Franco Tiveron
        </h1>
        <p className="text-gray-600 mb-4">
          Everything Should Be Made as Simple as Possible, But Not Simpler (A.Einstein)
        </p>
      </Container>

      <Container className="my-8 md:mb-10 lg:mb-16">
        <h2 className="mb-6 text-2xl font-semibold">Articles</h2>
        <ArticleList articles={posts} />
      </Container>
    </TranslationsProvider>
  );
}

