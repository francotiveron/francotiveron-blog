'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from '@contentful/live-preview/react';

import { CtfRichText } from '@src/components/features/contentful';
import { MarkdownRenderer } from '@src/components/features/contentful/MarkdownRenderer';
import { PageBlogPostFieldsFragment } from '@src/lib/__generated/sdk';

interface ArticleContentProps {
  article: PageBlogPostFieldsFragment;
}
export const ArticleContent = ({ article }: ArticleContentProps) => {
  const updated = useContentfulLiveUpdates(article);
  const inspectorProps = useContentfulInspectorMode({ entryId: article.sys.id });

  if (updated.markdownBody) {
    return (
      <div {...inspectorProps({ fieldId: 'markdownBody' })}>
        <MarkdownRenderer content={updated.markdownBody} />
      </div>
    );
  }

  return (
    <div {...inspectorProps({ fieldId: 'content' })}>
      <CtfRichText json={updated.content?.json} links={updated.content?.links} />
    </div>
  );
};
