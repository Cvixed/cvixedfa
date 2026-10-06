'use client';

import Link from 'next/link';
import { Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur border-b border-border md:hidden">
      <div className="flex h-full items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-primary">CvixedFA</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            <User className="w-5 h-5 text-secondary-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
