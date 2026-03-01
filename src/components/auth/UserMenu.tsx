import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react';

function getInitial(email: string | undefined): string {
  if (!email) return '?';
  const part = email.split('@')[0] ?? '';
  const match = part.match(/^([a-zA-Z])/);
  return match ? match[1].toUpperCase() : '?';
}

export default function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <span className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
      </span>
    );
  }

  if (!user) {
    return (
      <a
        href="/auth"
        className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
      >
        Sign In
      </a>
    );
  }

  const initial = getInitial(user.email);

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(
          'rounded-lg h-8 w-8 sm:h-9 sm:w-auto sm:px-2 sm:min-w-[2.25rem]',
          open && 'bg-accent'
        )}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="w-6 h-6 rounded-md bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
          {initial}
        </span>
        <ChevronDown className="w-4 h-4 hidden sm:block ml-1 shrink-0 opacity-70" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 py-1 min-w-[10rem] rounded-lg border border-border bg-card shadow-lg z-50">
          <a
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors rounded-t-lg"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            My Charts
          </a>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors rounded-b-lg"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
