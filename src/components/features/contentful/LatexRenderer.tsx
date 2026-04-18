'use client';

import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LatexRendererProps {
  text: string;
}

// Renders a string that may contain WordPress-style $latex ...$ expressions
// Also handles display (block) math with $latex[display] ...$ or \[...\]
export const LatexRenderer = ({ text }: LatexRendererProps) => {
  // Split on $latex ...$ patterns (WordPress style)
  const parts = text.split(/(\$latex(?:\[display\])?\s.*?\$)/g);

  if (parts.length === 1) return <>{text}</>;

  return (
    <>
      {parts.map((part, i) => {
        const displayMatch = part.match(/^\$latex\[display\]\s(.*)\$$/);
        const inlineMatch = part.match(/^\$latex\s(.*)\$$/);

        if (displayMatch) {
          return <BlockMath key={i} math={displayMatch[1]} />;
        }
        if (inlineMatch) {
          return <InlineMath key={i} math={inlineMatch[1]} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};
