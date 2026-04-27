'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
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
    if (lineType !== currentType) { flush(); currentType = lineType; }
    if (isQuote) {
      currentLines.push(line === '>' ? '' : line.replace(/^>+\s*/, ''));
    } else {
      currentLines.push(line);
    }
  }
  flush();
  return sections;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-xs text-gray-500 hover:text-gray-800 border border-gray-300 rounded px-2 py-0.5 transition-colors"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
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
    const codeString = String(children).replace(/\n$/, '');

    return (
      <div className="my-6 rounded-lg overflow-hidden text-sm not-prose border border-gray-200">
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
          <span className="text-xs font-semibold text-gray-600">{displayLang || 'Code'}</span>
          <CopyButton code={codeString} />
        </div>
        <SyntaxHighlighter
          style={oneLight}
          language={language}
          PreTag="div"
          customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.85rem', padding: '1rem', background: '#fff' }}
        >
          {codeString}
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
    <article className="prose prose-sm max-w-none text-justify">
      {sections.map((section, i) =>
        section.type === 'blockquote' ? (
          <div
            key={i}
            className="my-6 rounded-lg bg-gray-100 border-l-4 border-gray-400 px-6 py-4 text-gray-700 text-sm leading-relaxed not-prose [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800 text-justify"
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
