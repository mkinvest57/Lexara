'use client';

import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { LynxChat } from '@/components/lynx-chat';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isReader = pathname.startsWith('/lesson/');
  const isReviewSession = pathname.startsWith('/review/session');

  return (
    <div className="min-h-screen bg-[#f1f3f4] text-[#0b1c2d] dark:bg-slate-900 dark:text-slate-100">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-xl bg-[#0b1c2d] px-4 py-2 text-sm font-bold text-white transition-transform focus:translate-y-0"
      >
        Aller au contenu
      </a>
      {!isReviewSession && <AppHeader />}
      <div className="flex min-h-[calc(100vh-72px)]">
        {!isReader && !isReviewSession && <AppSidebar />}
        <main
          id="main-content"
          className={`min-w-0 flex-1 ${!isReader && !isReviewSession ? 'pb-[68px] md:pb-0' : ''}`}
        >
          {children}
        </main>
      </div>
      {!isReader && !isReviewSession && <AppSidebar mobile />}
      {!isReader && !isReviewSession && <LynxChat />}
    </div>
  );
}
