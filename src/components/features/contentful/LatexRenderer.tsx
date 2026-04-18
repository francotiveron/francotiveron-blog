'use client';

import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LatexRendererProps {
  text: string;
}

// Clean WordPress-specific parameters from latex expressions
// e.g. removes &s=2, &bg=ffffff, &fg=000000 etc.
const cleanLatex = (latex: string): string => {
  return latex
    .replace(/\s*&[a-z]+=\S+/g, '') // remove &s=2, &bg=..., etc.
    .trim();
};

// Determines if a latex expression should be rendered as block or inline
// Block if it contains \\ (multiline) or \frac at top level or is long
const isBlock = (latex: string): boolean => {
  return latex.includes('\\\\') || latex.length > 80;
};

export const LatexRenderer = ({ text }: LatexRendererProps) => {
  // Match $latex ...$  (non-greedy, but $ inside latex expressions are not delimiters)
  // We use a greedy match to the last $ to handle multiline expressions
  const parts = text.split(/(\$latex\s[\s\S]*?\s*&s=\d+\s*\$|\$latex\s[^$]*\$)/g);

  if (parts.length === 1) return <>{text}</>;

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\$latex\s([\s\S]*)\$$/);
        if (match) {
          const latex = cleanLatex(match[1]);
          if (isBlock(latex)) {
            return <BlockMath key={i} math={latex} />;
          }
          return <InlineMath key={i} math={latex} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};
