import { useAuth } from '../auth/AuthProvider';
import { cn } from '@/lib/utils';
import {
  Home,
  LayoutGrid,
  PlusCircle,
} from 'lucide-react';

export default function AppSidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home, matchExact: true },
    { href: '/dashboard/charts', label: 'My Charts', icon: LayoutGrid },
    { href: '/kundli', label: 'Generate New', icon: PlusCircle, matchExact: true },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-52 bg-card border-r border-border shrink-0 sticky top-0 h-screen">
      <div className="flex items-center h-[53px] px-4 border-b border-border shrink-0">
        <a href="/dashboard" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <span className="font-bold text-primary-foreground text-xs">SY</span>
          </div>
          <span className="font-semibold text-sm text-foreground">StarYaar</span>
        </a>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" aria-label="Dashboard">
        {navItems.map((item) => {
          const isActive = item.matchExact
            ? currentPath === item.href
            : currentPath.startsWith(item.href);
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
