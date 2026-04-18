'use client';

import Link from 'next/link';
import { useState } from 'react';

import { FormatDate } from '@src/components/shared/format-date';
import { PageBlogPostFieldsFragment } from '@src/lib/__generated/sdk';

interface ArticleListProps {
  articles: Array<PageBlogPostFieldsFragment | null>;
}

export const ArticleList = ({ articles }: ArticleListProps) => {
  const validArticles = articles.filter(Boolean) as PageBlogPostFieldsFragment[];

  // Collect all unique categories with article counts
  const categoryCount: Record<string, number> = {};
  validArticles.forEach(a => {
    a.contentfulMetadata?.tags?.forEach(t => {
      if (t?.name) categoryCount[t.name] = (categoryCount[t.name] ?? 0) + 1;
    });
  });
  const allCategories = Object.keys(categoryCount).sort();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered =
    activeCategory === null
      ? validArticles
      : validArticles.filter(a =>
          a.contentfulMetadata?.tags?.some(t => t?.name === activeCategory),
        );

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="hidden md:block w-48 shrink-0">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Categories
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setActiveCategory(null)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                activeCategory === null
                  ? 'bg-red-50 text-red-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>All</span>
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                activeCategory === null ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {validArticles.length}
              </span>
            </button>
          </li>
          {allCategories.map(cat => (
            <li key={cat}>
              <button
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                  activeCategory === cat
                    ? 'bg-red-50 text-red-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  activeCategory === cat ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {categoryCount[cat]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile category pills */}
        {allCategories.length > 0 && (
          <div className="md:hidden mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === null
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({validArticles.length})
            </button>
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat} ({categoryCount[cat]})
              </button>
            ))}
          </div>
        )}

        {/* Active filter label */}
        {activeCategory && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Filtered by:</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">
              {activeCategory}
              <button
                onClick={() => setActiveCategory(null)}
                className="ml-1 hover:text-red-800"
                aria-label="Clear filter"
              >
                ×
              </button>
            </span>
          </div>
        )}

        {/* Article list */}
        <ul className="divide-y divide-gray-100">
          {filtered.map(article => {
            const tags = article.contentfulMetadata?.tags?.filter(Boolean) ?? [];
            return (
              <li key={article.sys.id} className="py-4">
                <Link
                  href={`/${article.slug}`}
                  className="group flex items-baseline justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                      {article.title}
                    </span>
                    {tags.length > 0 && (
                      <span className="ml-3 inline-flex gap-1.5">
                        {tags.map(tag => (
                          <span
                            key={tag!.id}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                          >
                            {tag!.name}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-sm text-gray-400">
                    <FormatDate date={article.publishedDate} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-gray-400">No articles in this category yet.</p>
        )}
      </div>
    </div>
  );
};
