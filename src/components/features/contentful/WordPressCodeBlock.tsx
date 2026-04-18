'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface WordPressCodeBlockProps {
  text: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  fsharp: 'fsharp',
  csharp: 'csharp',
  'c#': 'csharp',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  python: 'python',
  bash: 'bash',
  sql: 'sql',
  xml: 'xml',
  json: 'json',
  html: 'markup',
  css: 'css',
};

// Renders a string that may contain WordPress [code language="..."]...[/code] blocks
export const WordPressCodeBlock = ({ text }: WordPressCodeBlockProps) => {
  const parts = text.split(/(\[code[^\]]*\][\s\S]*?\[\/code\])/g);

  if (parts.length === 1) return <>{text}</>;

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[code(?:\s+language="([^"]*)")?\]([\s\S]*?)\[\/code\]$/);
        if (match) {
          const lang = LANGUAGE_MAP[match[1]?.toLowerCase() ?? ''] ?? 'text';
          const code = match[2].trim();
          return (
            <SyntaxHighlighter
              key={i}
              language={lang}
              style={oneLight}
              customStyle={{
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                margin: '1rem 0',
              }}
            >
              {code}
            </SyntaxHighlighter>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};
