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

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <article className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
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
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};
