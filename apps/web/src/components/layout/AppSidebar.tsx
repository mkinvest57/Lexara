'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, BookMarked, BookOpen, Brain, FilePlus2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Bibliothèque', shortName: 'Bibliothèque', href: '/library', icon: BookOpen },
  { name: 'Importer une leçon', shortName: 'Importer', href: '/import', icon: FilePlus2 },
  { name: 'Vocabulaire', shortName: 'Vocabulaire', href: '/vocab', icon: BookMarked },
  { name: 'Réviser', shortName: 'Réviser', href: '/review', icon: Brain },
  { name: 'Statistiques', shortName: 'Stats', href: '/stats', icon: BarChart3 },
  { name: 'Configuration', shortName: 'Réglages', href: '/settings', icon: Settings },
];

export function AppSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav
        className="fixed inset-x-0 bottom-0 z-50 grid h-[68px] grid-cols-5 border-t border-slate-200 bg-white/95 px-2 backdrop-blur-xl md:hidden"
        aria-label="Navigation mobile"
      >
        {navigation.slice(0, 5).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold',
                active ? 'text-[#246fcd]' : 'text-slate-500'
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className="truncate">{item.shortName}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-20 shrink-0 border-r border-slate-200 bg-white md:block">
      <nav
        className="flex h-full flex-col items-center gap-1 px-2 py-4"
        aria-label="Navigation principale"
      >
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-[62px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl px-1 text-center text-[10px] font-semibold leading-tight transition',
                active ? 'bg-[#e7f5ff] text-[#246fcd]' : 'text-[#172333] hover:bg-slate-100'
              )}
              aria-current={active ? 'page' : undefined}
              title={item.name}
            >
              <item.icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 2} />
              <span className="w-full truncate">{item.shortName}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
