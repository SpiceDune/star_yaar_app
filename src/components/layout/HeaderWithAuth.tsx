import { useState, useEffect, useRef } from 'react';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../auth/AuthProvider';
import { Loader2, Menu, X, Home, LayoutGrid, PlusCircle, LogOut, User } from 'lucide-react';

const NAV_LINKS = [
  { href: '/kundli', label: 'Chart', highlight: true },
  { href: '/kundli/celebrity', label: 'Celebrities' },
  { href: '/#about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/80 transition-colors"
        aria-label="Account menu"
      >
        <User className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl border border-border bg-card shadow-lg py-1">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <a
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-muted-foreground" />
            Dashboard
          </a>
          <div className="border-t border-border my-1" />
          <button
            type="button"
            onClick={() => { setOpen(false); signOut(); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function HeaderWithAuth() {
  const { user, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-[53px]">
        {/* Logo — always visible on mobile; invisible on desktop when sidebar has it */}
        <a
          href={user ? '/dashboard' : '/'}
          className={`flex items-center gap-2.5 no-underline group shrink-0 ${user ? 'lg:invisible' : ''}`}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 group-hover:bg-primary/90 transition-colors">
            <span className="font-bold text-primary-foreground text-sm tracking-tight">SY</span>
          </div>
          <span className="font-semibold text-[15px] md:text-base text-foreground tracking-tight">
            StarYaar
          </span>
        </a>

        {/* Desktop nav — only for guests */}
        {!user && (
          <nav className="hidden sm:flex items-center gap-1" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={
                  link.highlight
                    ? 'text-foreground bg-accent px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors'
                    : 'text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg text-sm font-medium transition-colors'
                }
              >
                {link.label}
              </a>
            ))}
            <ThemeToggle />
            {loading && (
              <span className="flex items-center justify-center w-9 h-9 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
              </span>
            )}
            {!loading && (
              <a
                href="/auth"
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Sign In
              </a>
            )}
          </nav>
        )}

        {/* Desktop: logged-in — theme toggle + user menu */}
        {user && (
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        )}

        {/* Mobile: right-side controls */}
        <div className="flex sm:hidden items-center gap-1.5">
          <ThemeToggle />
          {!loading && user && <UserMenu />}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <nav
          className="sm:hidden border-t border-border px-4 py-3 space-y-1 bg-card"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              {link.label}
            </a>
          ))}

          {!loading && user && (
            <>
              <div className="border-t border-border my-2" />
              <a
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Home className="w-4 h-4 text-muted-foreground" />
                Home
              </a>
              <a
                href="/dashboard/charts"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                My Charts
              </a>
              <a
                href="/kundli"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-muted-foreground" />
                Generate New
              </a>
            </>
          )}

          {!loading && !user && (
            <a
              href="/auth"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-accent transition-colors"
            >
              Sign In
            </a>
          )}
        </nav>
      )}
    </header>
  );
}
