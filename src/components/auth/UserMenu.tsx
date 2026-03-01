import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

export default function UserMenu() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <span className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
      </span>
    );
  }

  if (user) return null;

  return (
    <a
      href="/auth"
      className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
    >
      Sign In
    </a>
  );
}
