import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import { ArticleContent, ArticleHero, ArticleTileGrid } from '@src/components/features/article';
import { Container } from '@src/components/shared/container';
import initTranslations from '@src/i18n';
import { defaultLocale, locales } from '@src/i18n/config';
import { client, previewClient } from '@src/lib/client';

export const dynamic = 'force-dynamic';

interface BlogPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata(props: BlogPageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const { isEnabled: preview } = await draftMode();
  const gqlClient = preview ? previewClient : client;

  const { pageBlogPostCollection } = await gqlClient.pageBlogPost({ locale, slug, preview });
  const blogPost = pageBlogPostCollection?.items[0];

  const languages = Object.fromEntries(
    locales.map(locale => [locale, locale === defaultLocale ? `/${slug}` : `/${locale}/${slug}`]),
  );
  const metadata: Metadata = {
    alternates: {
      canonical: slug,
      languages,
    },
  };

  if (blogPost?.seoFields) {
    metadata.title = blogPost.seoFields.pageTitle;
    metadata.description = blogPost.seoFields.pageDescription;
    metadata.robots = {
      follow: !blogPost.seoFields.nofollow,
      index: !blogPost.seoFields.noindex,
    };
  }

  return metadata;
}

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}): Promise<{ locale: string; slug: string }[]> {
  const gqlClient = previewClient || client;
  
  try {
    const { pageBlogPostCollection } = await gqlClient.pageBlogPostCollection({ locale: params.locale, limit: 100 });

    if (!pageBlogPostCollection?.items) {
      return [];
    }

    return pageBlogPostCollection.items
      .filter((blogPost): blogPost is NonNullable<typeof blogPost> => Boolean(blogPost?.slug))
      .map(blogPost => {
        return {
          locale: params.locale,
          slug: blogPost.slug!,
        };
      });
  } catch (e) {
    console.error("Static params generation fallback handled:", e);
    return [];
  }
}

export default async function Page(props: BlogPageProps) {
  const { locale, slug } = await props.params;
  const { isEnabled: preview } = await draftMode();
  const gqlClient = preview ? previewClient : client;
  const { t } = await initTranslations({ locale });
  const { pageBlogPostCollection } = await gqlClient.pageBlogPost({ locale, slug, preview });
  const { pageLandingCollection } = await gqlClient.pageLanding({ locale, preview });
  const landingPage = pageLandingCollection?.items[0];
  const blogPost = pageBlogPostCollection?.items[0];
  const relatedPosts = blogPost?.relatedBlogPostsCollection?.items;
  const isFeatured = Boolean(
    blogPost?.slug && landingPage?.featuredBlogPost?.slug === blogPost.slug,
  );

  if (!blogPost) {
    notFound();
  }

  return (
    <>
      <Container>
        <ArticleHero article={blogPost} isFeatured={isFeatured} isReversedLayout={true} />
      </Container>
      <Container className="mt-8 mb-16 max-w-4xl">
        <ArticleContent article={blogPost} />
      </Container>
      {relatedPosts && relatedPosts.length > 0 && (
        <Container className="mt-8 max-w-5xl">
          <h2 className="mb-4 md:mb-6">{t('article.relatedArticles')}</h2>
          <ArticleTileGrid className="md:grid-cols-2" articles={relatedPosts} />
        </Container>
      )}
    </>
  );
}
