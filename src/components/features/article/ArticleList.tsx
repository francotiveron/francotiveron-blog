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

  // Collect all unique categories from tags
  const allCategories = Array.from(
    new Set(
      validArticles.flatMap(a => a.contentfulMetadata?.tags?.map(t => t?.name).filter(Boolean) ?? []),
    ),
  ).sort() as string[];

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered =
    activeCategory === null
      ? validArticles
      : validArticles.filter(a =>
          a.contentfulMetadata?.tags?.some(t => t?.name === activeCategory),
        );

  return (
    <div>
      {/* Category filter tabs */}
      {allCategories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === null
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Article list */}
      <ul className="divide-y divide-gray-200">
        {filtered.map(article => {
          const tags = article.contentfulMetadata?.tags?.filter(Boolean) ?? [];
          return (
            <li key={article.sys.id} className="py-4">
              <Link
                href={`/${article.slug}`}
                className="group flex items-baseline justify-between gap-4 hover:text-red-600 transition-colors"
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
        <p className="py-8 text-center text-gray-400">No articles in this category yet.</p>
      )}
    </div>
  );
};
