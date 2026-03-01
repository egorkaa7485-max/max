import { Link, useLocation } from 'wouter';
import { Store, Home, CalendarDays, MessageCircleQuestion } from 'lucide-react';
import { useEffect } from 'react';
import { initTelegramApp } from '@/lib/telegram';

const navItems = [
  { href: '/', icon: Store, label: 'Биржа' },
  { href: '/home', icon: Home, label: 'Главная' },
  { href: '/calendar', icon: CalendarDays, label: 'Календарь' },
  { href: '/support', icon: MessageCircleQuestion, label: 'Поддержка' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    initTelegramApp();
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <main className="flex-1 max-w-lg mx-auto w-full p-4 relative">
        {children}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 max-w-lg mx-auto w-full">
        <nav className="glass-panel rounded-3xl px-4 py-4 flex justify-between items-center">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href} className="relative group flex flex-col items-center gap-1">
                <div
                  className={`p-2 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
