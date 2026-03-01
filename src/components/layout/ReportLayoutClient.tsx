import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../auth/AuthProvider';
import HeaderWithAuth from './HeaderWithAuth';
import AppSidebar from './AppSidebar';

interface Props {
  children: ReactNode;
  wide?: boolean;
  hideFooter?: boolean;
  hideFooterWhenLoggedIn?: boolean;
}

const FOOTER = (
  <footer className="border-t border-border mt-10">
    <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
        <div className="col-span-2 sm:col-span-1">
          <a href="/" className="flex items-center gap-2 no-underline mb-3">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground text-xs">SY</span>
            </div>
            <span className="font-semibold text-sm text-foreground">StarYaar</span>
          </a>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Free Vedic birth chart generator powered by Swiss Ephemeris with Lahiri Ayanamsa.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Tools</h3>
          <ul className="space-y-2 text-xs">
            <li><a href="/kundli" className="text-muted-foreground hover:text-foreground transition-colors">Generate Kundli</a></li>
            <li><a href="/kundli/celebrity" className="text-muted-foreground hover:text-foreground transition-colors">Celebrity Charts</a></li>
            <li><a href="/kundli/sample" className="text-muted-foreground hover:text-foreground transition-colors">Sample Report</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Learn</h3>
          <ul className="space-y-2 text-xs">
            <li><a href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
            <li><a href="/faq#birth-chart" className="text-muted-foreground hover:text-foreground transition-colors">About Birth Charts</a></li>
            <li><a href="/faq#yogas" className="text-muted-foreground hover:text-foreground transition-colors">Understanding Yogas</a></li>
            <li><a href="/faq#dasha" className="text-muted-foreground hover:text-foreground transition-colors">Dasha System</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Contact</h3>
          <ul className="space-y-2 text-xs">
            <li><a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact Us</a></li>
            <li><a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Data removal requests</a></li>
            <li><a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Celebrity suggestions</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()} StarYaar. Swiss Ephemeris (Moshier) &middot; Lahiri Ayanamsa.
        </p>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <a href="/faq#privacy" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="/sitemap.xml" className="hover:text-foreground transition-colors">Sitemap</a>
        </div>
      </div>
    </div>
  </footer>
);

function LayoutSwitch({ children, wide, hideFooter, hideFooterWhenLoggedIn }: {
  children: ReactNode; wide: boolean; hideFooter: boolean; hideFooterWhenLoggedIn: boolean;
}) {
  const { user } = useAuth();
  const shouldHideFooter = hideFooter || (hideFooterWhenLoggedIn && !!user);

  if (user) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <HeaderWithAuth />
          <main className={`flex-1 mx-auto w-full px-4 md:px-6 lg:px-8 py-5 md:py-8 ${wide ? 'max-w-6xl' : 'max-w-2xl'}`}>
            {children}
          </main>
          {!shouldHideFooter && FOOTER}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderWithAuth />
      <main className={`flex-1 mx-auto w-full px-4 md:px-6 lg:px-8 py-5 md:py-8 ${wide ? 'max-w-6xl' : 'max-w-2xl'}`}>
        {children}
      </main>
      {!shouldHideFooter && FOOTER}
    </div>
  );
}

export default function ReportLayoutClient({
  children, wide = false, hideFooter = false, hideFooterWhenLoggedIn = false,
}: Props) {
  return (
    <AuthProvider>
      <LayoutSwitch wide={wide} hideFooter={hideFooter} hideFooterWhenLoggedIn={hideFooterWhenLoggedIn}>
        {children}
      </LayoutSwitch>
    </AuthProvider>
  );
}
