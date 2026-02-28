import { useState, useMemo } from 'react';
import type { FaqEntry, FaqCategory } from '../../data/faqs';
import { FAQ_CATEGORY_LABELS, FAQ_CATEGORY_ORDER } from '../../data/faqs';

interface Props {
  faqs: FaqEntry[];
}

export default function FaqSection({ faqs }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FaqCategory | 'all'>('all');
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = faqs;
    if (activeCategory !== 'all') {
      list = list.filter(f => f.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(f =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
      );
    }
    return list;
  }, [faqs, activeCategory, search]);

  const grouped = useMemo(() => {
    const map = new Map<FaqCategory, { faq: FaqEntry; globalIdx: number }[]>();
    filtered.forEach((faq, i) => {
      const list = map.get(faq.category) ?? [];
      list.push({ faq, globalIdx: i });
      map.set(faq.category, list);
    });
    return map;
  }, [filtered]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of faqs) {
      counts[f.category] = (counts[f.category] ?? 0) + 1;
    }
    return counts;
  }, [faqs]);

  function handleCategoryChange(cat: FaqCategory | 'all') {
    setActiveCategory(cat);
    setOpenIdx(null);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
      {/* Category sidebar */}
      <aside className="lg:w-52 shrink-0">
        {/* Mobile: horizontal pills */}
        <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-secondary border border-border text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {FAQ_CATEGORY_ORDER.map(cat => {
            if (!categoryCounts[cat]) return null;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-secondary border border-border text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {FAQ_CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>

        {/* Desktop: vertical nav */}
        <nav className="hidden lg:block sticky top-20">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">Topics</p>
          <div className="space-y-0.5">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-secondary border border-border text-foreground font-semibold'
                  : 'text-foreground hover:bg-secondary/60'
              }`}
            >
              All Questions
            </button>
            {FAQ_CATEGORY_ORDER.map(cat => {
              if (!categoryCounts[cat]) return null;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-secondary border border-border text-foreground font-semibold'
                      : 'text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <span>{FAQ_CATEGORY_LABELS[cat]}</span>
                  <span className="text-[11px] text-muted-foreground">{categoryCounts[cat]}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Search bar */}
        <div className="relative mb-6">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setOpenIdx(null); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-14 text-center">
            <svg className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-foreground">No matching questions</p>
            <p className="text-xs text-muted-foreground mt-0.5">Try different keywords or browse all topics</p>
          </div>
        ) : (
          <div className="space-y-8">
            {FAQ_CATEGORY_ORDER.map(cat => {
              const items = grouped.get(cat);
              if (!items || items.length === 0) return null;
              return (
                <section key={cat}>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {FAQ_CATEGORY_LABELS[cat]}
                  </h2>
                  <div className="space-y-1.5">
                    {items.map(({ faq, globalIdx }) => {
                      const isOpen = openIdx === globalIdx;
                      return (
                        <div
                          key={globalIdx}
                          className={`rounded-lg border transition-all duration-150 ${
                            isOpen ? 'border-border bg-card shadow-sm' : 'border-transparent hover:bg-secondary/40'
                          }`}
                        >
                          <button
                            onClick={() => setOpenIdx(isOpen ? null : globalIdx)}
                            className="w-full text-left px-4 py-3 flex items-start gap-3"
                          >
                            <svg
                              className={`w-4 h-4 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className={`text-[13px] font-medium leading-snug ${isOpen ? 'text-foreground' : 'text-foreground/90'}`}>
                              {faq.question}
                            </span>
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 pl-11">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
