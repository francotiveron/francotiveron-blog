'use client';

interface WordPressCodeBlockProps {
  text: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  fsharp: 'F#',
  csharp: 'C#',
  'c#': 'C#',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  bash: 'Bash',
  sql: 'SQL',
  xml: 'XML',
  json: 'JSON',
};

export const WordPressCodeBlock = ({ text }: WordPressCodeBlockProps) => {
  const parts = text.split(/(\[code[^\]]*\][\s\S]*?\[\/code\])/g);

  if (parts.length === 1) return <>{text}</>;

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[code(?:\s+language="([^"]*)")?\]([\s\S]*?)\[\/code\]$/);
        if (match) {
          const langKey = match[1]?.toLowerCase() ?? '';
          const langLabel = LANGUAGE_MAP[langKey] ?? match[1] ?? '';
          const code = match[2].trim();
          return (
            <div key={i} className="my-4 rounded-lg overflow-hidden border border-gray-200">
              {langLabel && (
                <div className="bg-gray-100 px-4 py-1 text-xs text-gray-500 font-mono border-b border-gray-200">
                  {langLabel}
                </div>
              )}
              <pre className="bg-gray-50 p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};
