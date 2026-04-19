'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <article className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          pre({ children }) {
            // Extract language from the child code element
            const codeEl = (children as any)?.props;
            const className = codeEl?.className || '';
            const match = /language-(\w+)/.exec(className);
            const language = match ? match[1] : '';
            const displayLang =
              language === 'fsharp' ? 'F#' :
              language === 'csharp' ? 'C#' :
              language;

            return (
              <div className="my-6 rounded-lg overflow-hidden text-sm not-prose">
                {language && (
                  <div className="bg-gray-700 px-4 py-1.5 text-xs text-gray-300 font-mono">
                    {displayLang}
                  </div>
                )}
                <pre className="p-4 overflow-x-auto leading-relaxed bg-gray-900 m-0">
                  {children}
                </pre>
              </div>
            );
          },
          code({ className, children, ...props }) {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};
