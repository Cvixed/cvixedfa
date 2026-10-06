'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, PlusCircle, Target, Bot } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const iconMap = {
  Home,
  Receipt,
  PlusCircle,
  Target,
  Bot,
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.iconName];
          const isActive = pathname === item.href;
          
          if (item.isAction) {
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex flex-col items-center justify-center w-14 -mt-6"
              >
                <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg flex items-center justify-center transform transition-transform active:scale-95">
                  <Icon className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] mt-1 font-medium text-foreground">
                  {item.label}
                </span>
              </Link>
            );
          }
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
