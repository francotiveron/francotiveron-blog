import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import { BLOCKS, Document } from '@contentful/rich-text-types';

import { ArticleImage } from '@src/components/features/article';
import { LatexRenderer } from '@src/components/features/contentful/LatexRenderer';
import { ComponentRichImage } from '@src/lib/__generated/sdk';

export type EmbeddedEntryType = ComponentRichImage | null;

export interface ContentfulRichTextInterface {
  json: Document;
  links?:
    | {
        entries: {
          block: Array<EmbeddedEntryType>;
        };
      }
    | any;
}

export const EmbeddedEntry = (entry: EmbeddedEntryType) => {
  switch (entry?.__typename) {
    case 'ComponentRichImage':
      return <ArticleImage image={entry} />;
    default:
      return null;
  }
};

// Extract plain text from a rich text node's content
const nodeToText = (node: any): string => {
  if (node.nodeType === 'text') return node.value;
  if (node.content) return node.content.map(nodeToText).join('');
  return '';
};

const hasLatex = (text: string) => text.includes('$latex');

export const contentfulBaseRichTextOptions = ({ links }: ContentfulRichTextInterface): Options => ({
  renderNode: {
    [BLOCKS.EMBEDDED_ENTRY]: node => {
      const entry = links?.entries?.block?.find(
        (item: EmbeddedEntryType) => item?.sys?.id === node.data.target.sys.id,
      );

      if (!entry) return null;

      return <EmbeddedEntry {...entry} />;
    },
    [BLOCKS.PARAGRAPH]: (node, children) => {
      const text = nodeToText(node);
      if (hasLatex(text)) {
        return (
          <p>
            <LatexRenderer text={text} />
          </p>
        );
      }
      return <p>{children}</p>;
    },
  },
});

export const CtfRichText = ({ json, links }: ContentfulRichTextInterface) => {
  const baseOptions = contentfulBaseRichTextOptions({ links, json });

  return (
    <article className="prose prose-sm max-w-none">
      {documentToReactComponents(json, baseOptions)}
    </article>
  );
};
