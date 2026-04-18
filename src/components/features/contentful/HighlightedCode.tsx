'use client';

import hljs from 'highlight.js/lib/core';
import fsharp from 'highlight.js/lib/languages/fsharp';
import csharp from 'highlight.js/lib/languages/csharp';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/github.css';

hljs.registerLanguage('fsharp', fsharp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);

export const LANGUAGE_MAP: Record<string, string> = {
  fsharp: 'fsharp',
  csharp: 'csharp',
  'c#': 'csharp',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  python: 'python',
  bash: 'bash',
  sql: 'sql',
  xml: 'xml',
  json: 'json',
};

export const LANGUAGE_LABEL: Record<string, string> = {
  fsharp: 'F#',
  csharp: 'C#',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  bash: 'Bash',
  sql: 'SQL',
  xml: 'XML',
  json: 'JSON',
};

interface HighlightedCodeProps {
  code: string;
  language?: string;
}

export const HighlightedCode = ({ code, language }: HighlightedCodeProps) => {
  const langKey = LANGUAGE_MAP[language?.toLowerCase() ?? ''] ?? '';
  const langLabel = LANGUAGE_LABEL[langKey] ?? language ?? '';

  let highlighted = code;
  try {
    if (langKey) {
      highlighted = hljs.highlight(code, { language: langKey }).value;
    } else {
      highlighted = hljs.highlightAuto(code).value;
    }
  } catch (e) {
    // fallback to plain text
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-200 text-sm">
      {langLabel && (
        <div className="bg-gray-100 px-4 py-1.5 text-xs text-gray-500 font-mono border-b border-gray-200">
          {langLabel}
        </div>
      )}
      <pre className="p-4 overflow-x-auto leading-relaxed bg-white m-0">
        <code
          className={`hljs${langKey ? ` language-${langKey}` : ''}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
};
