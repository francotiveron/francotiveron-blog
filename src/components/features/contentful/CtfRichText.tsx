import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS, Document } from '@contentful/rich-text-types';
import hljs from 'highlight.js/lib/core';
import fsharp from 'highlight.js/lib/languages/fsharp';
import csharp from 'highlight.js/lib/languages/csharp';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import 'highlight.js/styles/github.css';

import { ArticleImage } from '@src/components/features/article';
import { LatexRenderer } from '@src/components/features/contentful/LatexRenderer';
import { ComponentRichImage } from '@src/lib/__generated/sdk';

hljs.registerLanguage('fsharp', fsharp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);

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
  renderMark: {
    [MARKS.CODE]: (text) => {
      const code = String(text);
      // First line may contain language hint e.g. "lang:fsharp"
      const lines = code.split('\n');
      const langMatch = lines[0]?.match(/^lang:(\w+)/);
      const language = langMatch ? langMatch[1] : '';
      const actualCode = langMatch ? lines.slice(1).join('\n').trim() : code.trim();

      let highlighted = actualCode;
      try {
        if (language) {
          highlighted = hljs.highlight(actualCode, { language }).value;
        } else {
          highlighted = hljs.highlightAuto(actualCode).value;
        }
      } catch (_e) {}

      return (
        <div className="my-4 rounded-lg overflow-hidden border border-gray-200 text-sm not-prose">
          {language && (
            <div className="bg-gray-100 px-4 py-1.5 text-xs text-gray-500 font-mono border-b border-gray-200">
              {language === 'fsharp' ? 'F#' : language === 'csharp' ? 'C#' : language}
            </div>
          )}
          <pre className="p-4 overflow-x-auto leading-relaxed bg-white m-0">
            <code
              className={`hljs${language ? ` language-${language}` : ''}`}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        </div>
      );
    },
  },
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
