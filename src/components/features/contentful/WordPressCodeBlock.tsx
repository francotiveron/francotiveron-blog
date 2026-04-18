'use client';

import { HighlightedCode, LANGUAGE_MAP } from './HighlightedCode';

interface WordPressCodeBlockProps {
  text: string;
}

export const WordPressCodeBlock = ({ text }: WordPressCodeBlockProps) => {
  const parts = text.split(/(\[code[^\]]*\][\s\S]*?\[\/code\])/g);

  if (parts.length === 1) return <>{text}</>;

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[code(?:\s+language="([^"]*)")?\]([\s\S]*?)\[\/code\]$/);
        if (match) {
          const language = match[1] ?? '';
          const code = match[2].trim();
          return <HighlightedCode key={i} code={code} language={language} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};
