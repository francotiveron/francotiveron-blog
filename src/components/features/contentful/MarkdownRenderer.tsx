'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
}

const LANG_DISPLAY: Record<string, string> = {
  fsharp: 'F#',
  csharp: 'C#',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  bash: 'Bash',
  nasm: 'ASM',
  c: 'C',
  cpp: 'C++',
};

type Section = { type: 'blockquote' | 'normal'; content: string };

function splitSections(md: string): Section[] {
  const lines = md.split('\n');
  const sections: Section[] = [];
  let currentLines: string[] = [];
  let currentType: 'blockquote' | 'normal' = 'normal';

  const flush = () => {
    if (currentLines.length > 0) {
      sections.push({ type: currentType, content: currentLines.join('\n') });
      currentLines = [];
    }
  };

  for (const line of lines) {
    const isQuote = line.startsWith('> ') || line === '>';
    const lineType: 'blockquote' | 'normal' = isQuote ? 'blockquote' : 'normal';

    if (lineType !== currentType) {
      flush();
      currentType = lineType;
    }

    if (isQuote) {
      currentLines.push(line === '>' ? '' : line.replace(/^>\s*/, ''));
    } else {
      currentLines.push(line);
    }
  }
  flush();
  return sections;
}

const mdComponents = {
  code({ className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const isInline = !match;

    if (isInline) {
      return (
        <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }

    const displayLang = LANG_DISPLAY[language] || language;

    return (
      <div className="my-6 rounded-lg overflow-hidden text-sm not-prose">
        {language && (
          <div className="bg-gray-700 px-3 py-1 text-xs text-gray-300 font-mono border-b border-gray-600">
            {displayLang}
          </div>
        )}
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.85rem', padding: '0.75rem 1rem' }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  },
};

const MD = ({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, remarkMath]}
    rehypePlugins={[rehypeKatex]}
    components={mdComponents}
  >
    {content}
  </ReactMarkdown>
);

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  const sections = splitSections(content);

  return (
    <article className="prose prose-sm max-w-none">
      {sections.map((section, i) =>
        section.type === 'blockquote' ? (
          <div
            key={i}
            className="my-6 rounded-lg bg-gray-100 border-l-4 border-gray-400 px-6 py-4 text-gray-700 text-sm leading-relaxed not-prose"
          >
            <MD content={section.content} />
          </div>
        ) : (
          <MD key={i} content={section.content} />
        )
      )}
    </article>
  );
};
