import { useState, useMemo } from 'react';
import type { CelebrityEntry, CelebrityCategory } from '../../data/celebrities';
import { CATEGORY_LABELS } from '../../data/celebrities';

interface Props {
  celebrities: CelebrityEntry[];
}

const CATEGORY_ORDER: CelebrityCategory[] = ['bollywood', 'cricket', 'politics', 'business', 'music', 'sports'];

const CATEGORY_ICONS: Record<CelebrityCategory, string> = {
  bollywood: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  cricket: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  politics: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  business: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  music: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z',
  sports: 'M13 10V3L4 14h7v7l9-11h-7z',
};

const PAGE_SIZE = 24;

export default function CelebrityDirectory({ celebrities }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CelebrityCategory | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: celebrities.length };
    for (const c of celebrities) {
      counts[c.category] = (counts[c.category] ?? 0) + 1;
    }
    return counts;
  }, [celebrities]);

  const filtered = useMemo(() => {
    let list = celebrities;
    if (activeCategory !== 'all') {
      list = list.filter(c => c.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q)
      );
    }
    return list;
  }, [celebrities, activeCategory, search]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const activeBtn = 'bg-secondary border border-border text-foreground font-semibold';
  const inactiveBtn = 'text-muted-foreground hover:text-foreground hover:bg-secondary/60';

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Sidebar */}
      <aside className="lg:w-52 shrink-0">
        {/* Mobile: horizontal scroll */}
        <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => { setActiveCategory('all'); setVisibleCount(PAGE_SIZE); }}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
              activeCategory === 'all' ? activeBtn : inactiveBtn
            }`}
          >
            All ({categoryCounts.all})
          </button>
          {CATEGORY_ORDER.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setVisibleCount(PAGE_SIZE); }}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat ? activeBtn : inactiveBtn
              }`}
            >
              {CATEGORY_LABELS[cat]} ({categoryCounts[cat] ?? 0})
            </button>
          ))}
        </div>

        {/* Desktop: vertical list */}
        <nav className="hidden lg:block sticky top-20">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">Categories</p>
          <div className="space-y-0.5">
            <button
              onClick={() => { setActiveCategory('all'); setVisibleCount(PAGE_SIZE); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                activeCategory === 'all' ? activeBtn : 'text-foreground ' + inactiveBtn
              }`}
            >
              <span>All Charts</span>
              <span className="text-[11px] text-muted-foreground">
                {categoryCounts.all}
              </span>
            </button>
            {CATEGORY_ORDER.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setVisibleCount(PAGE_SIZE); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  activeCategory === cat ? activeBtn : 'text-foreground ' + inactiveBtn
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={CATEGORY_ICONS[cat]} />
                  </svg>
                  {CATEGORY_LABELS[cat]}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {categoryCounts[cat] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-border">
            <a
              href="/kundli"
              className="flex items-center justify-center gap-1.5 w-full text-muted-foreground hover:text-foreground font-medium text-xs px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Your Kundli
            </a>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Search bar */}
        <div className="relative mb-5">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search celebrities..."
            value={search}
            onChange={e => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
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

        {/* Results count */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length === celebrities.length
              ? `${filtered.length} charts`
              : `${filtered.length} of ${celebrities.length}`
            }
          </p>
          {activeCategory !== 'all' && (
            <button
              onClick={() => setActiveCategory('all')}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-14 text-center">
            <svg className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm font-medium text-foreground">No charts found</p>
            <p className="text-xs text-muted-foreground mt-0.5">Try a different search or category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {visible.map(c => (
                <a
                  key={c.slug}
                  href={`/kundli/celebrity/${c.slug}`}
                  className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <span className="text-muted-foreground font-semibold text-xs">
                        {c.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-[13px] group-hover:text-primary transition-colors truncate">
                        {c.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {c.city}
                        <span className="mx-1.5 opacity-30">·</span>
                        {CATEGORY_LABELS[c.category]}
                      </p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">{c.bio}</p>
                </a>
              ))}
            </div>

            {hasMore && (
              <div className="mt-5 text-center">
                <button
                  onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                  className="text-muted-foreground hover:text-foreground font-medium text-xs px-5 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  Show more ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
