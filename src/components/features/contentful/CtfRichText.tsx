import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import { BLOCKS, Document } from '@contentful/rich-text-types';

import { ArticleImage } from '@src/components/features/article';
import { HighlightedCode } from '@src/components/features/contentful/HighlightedCode';
import { LatexRenderer } from '@src/components/features/contentful/LatexRenderer';
import { WordPressCodeBlock } from '@src/components/features/contentful/WordPressCodeBlock';
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

const nodeToText = (node: any): string => {
  if (node.nodeType === 'text') return node.value;
  if (node.content) return node.content.map(nodeToText).join('');
  return '';
};

const hasLatex = (text: string) => text.includes('$latex');

// Merge paragraphs that span across [code]...[/code] boundaries
// Returns an array of "segments": either a plain paragraph text or a full code block string
const mergeCodeBlocks = (nodes: any[]): { type: 'paragraph' | 'code'; text: string; node?: any }[] => {
  const result: { type: 'paragraph' | 'code'; text: string; node?: any }[] = [];
  let insideCode = false;
  let codeBuffer = '';

  for (const node of nodes) {
    if (node.nodeType !== 'paragraph') {
      if (insideCode) {
        // flush incomplete code as plain paragraph
        result.push({ type: 'paragraph', text: codeBuffer, node });
        codeBuffer = '';
        insideCode = false;
      }
      result.push({ type: 'paragraph', text: '', node });
      continue;
    }

    const text = nodeToText(node);

    if (!insideCode) {
      const openIdx = text.indexOf('[code');
      if (openIdx === -1) {
        // No code block at all
        result.push({ type: 'paragraph', text, node });
        continue;
      }

      const closeIdx = text.indexOf('[/code]');
      if (closeIdx !== -1) {
        // Opens and closes in same paragraph
        result.push({ type: 'code', text });
        // If there's text before/after, also handle that
        continue;
      }

      // Opens but doesn't close — start buffering
      insideCode = true;
      codeBuffer = text;
    } else {
      // We're inside a code block
      codeBuffer += '\n' + text;
      const closeIdx = codeBuffer.indexOf('[/code]');
      if (closeIdx !== -1) {
        // Found the closing tag
        result.push({ type: 'code', text: codeBuffer });
        codeBuffer = '';
        insideCode = false;
      }
      // else keep buffering
    }
  }

  if (insideCode && codeBuffer) {
    result.push({ type: 'paragraph', text: codeBuffer });
  }

  return result;
};

export const CtfRichText = ({ json, links }: ContentfulRichTextInterface) => {
  const topNodes = json.content;
  const segments = mergeCodeBlocks(topNodes);

  // Build a modified document for non-code segments, render code segments directly
  return (
    <article className="prose prose-sm max-w-none">
      {segments.map((segment, i) => {
        if (segment.type === 'code') {
          return <WordPressCodeBlock key={i} text={segment.text} />;
        }

        if (!segment.node) {
          return null;
        }

        const text = segment.text;

        if (hasLatex(text)) {
          return <p key={i}><LatexRenderer text={text} /></p>;
        }

        // Render normally via documentToReactComponents for this single node
        const singleNodeDoc: Document = { ...json, content: [segment.node] };
        const options: Options = {
          renderNode: {
            [BLOCKS.EMBEDDED_ENTRY]: (node: any) => {
              const entry = links?.entries?.block?.find(
                (item: EmbeddedEntryType) => item?.sys?.id === node.data.target.sys.id,
              );
              if (!entry) return null;
              return <EmbeddedEntry {...entry} />;
            },
            [BLOCKS.CODE]: (node: any) => {
              const code = nodeToText(node);
              const language = node.data?.language ?? '';
              return <HighlightedCode code={code} language={language} />;
            },
          },
        };

        return <span key={i}>{documentToReactComponents(singleNodeDoc, options)}</span>;
      })}
    </article>
  );
};

export const contentfulBaseRichTextOptions = ({ links }: ContentfulRichTextInterface): Options => ({
  renderNode: {
    [BLOCKS.EMBEDDED_ENTRY]: node => {
      const entry = links?.entries?.block?.find(
        (item: EmbeddedEntryType) => item?.sys?.id === node.data.target.sys.id,
      );
      if (!entry) return null;
      return <EmbeddedEntry {...entry} />;
    },
    [BLOCKS.CODE]: (node) => {
      const code = nodeToText(node);
      const language = node.data?.language ?? '';
      return <HighlightedCode code={code} language={language} />;
    },
  },
});
