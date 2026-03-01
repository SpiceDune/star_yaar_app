import ThemeToggle from '../ui/ThemeToggle';
import UserMenu from '../auth/UserMenu';

export default function HeaderWithAuth() {
  return (
    <header className="bg-card border-b border-border px-4 md:px-6 lg:px-8 py-3 md:py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 group-hover:bg-primary/90 transition-colors">
            <span className="font-bold text-primary-foreground text-sm tracking-tight">SY</span>
          </div>
          <span className="font-semibold text-[15px] md:text-base text-foreground tracking-tight">
            StarYaar
          </span>
        </a>
        <nav className="flex items-center gap-1" aria-label="Main">
          <a
            href="/kundli"
            className="text-foreground bg-accent px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Chart
          </a>
          <a
            href="/kundli/celebrity"
            className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hidden sm:inline-flex"
          >
            Celebrities
          </a>
          <a
            href="/#about"
            className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            About
          </a>
          <a
            href="/faq"
            className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            FAQ
          </a>
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
