export default async function Page(props: BlogPageProps) {
  const { locale, slug } = await props.params;
  
  // 1. Read tokens directly from the page URL query strings
  const { isEnabled: standardPreview } = await draftMode();
  
  // 2. Fallback: If Contentful bypassed the API route, check the query parameters manually
  const searchParams = (props as any).searchParams || {};
  const querySecret = searchParams['x-contentful-preview-secret'];
  const hasValidDirectToken = querySecret === 'preview123'; // Matches your token secret

  const preview = standardPreview || hasValidDirectToken;
  const gqlClient = preview ? previewClient : client;
  
  const { t } = await initTranslations({ locale });
  
  // 3. Fetch data using the client determined by the page tokens
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
