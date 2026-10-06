'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, PlusCircle, Target, Bot, Wallet, PieChart, Car, FileText, Settings, User } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const iconMap = {
  Home,
  Receipt,
  PlusCircle,
  Target,
  Bot,
};

const EXTRA_LINKS = [
  { href: '/wallets', label: 'Dompet', icon: Wallet },
  { href: '/budgets', label: 'Anggaran', icon: PieChart },
  { href: '/vehicles', label: 'Kendaraan', icon: Car },
  { href: '/reports', label: 'Laporan', icon: FileText },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 border-r border-border bg-card z-40">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">CvixedFA</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {NAV_ITEMS.filter(item => !item.isAction).map((item) => {
            const Icon = iconMap[item.iconName];
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <div className="my-4 border-t border-border" />
          
          {EXTRA_LINKS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <Link href="/transactions/new" className="flex items-center justify-center w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors mb-4">
          <PlusCircle className="w-5 h-5 mr-2" />
          Tambah Transaksi
        </Link>
        
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            <User className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-muted-foreground">My Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
