'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
  BarChart3,
  ChevronDown,
  CircleUserRound,
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/brand/BrandMark';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProductStore } from '@/lib/product-store';

export function AppHeader() {
  const { data: session } = useSession();
  const profile = useProductStore((state) => state.profile);
  const syncStatus = useProductStore((state) => state.syncStatus);

  const syncLabel =
    syncStatus === 'synced'
      ? 'Synchronisé'
      : syncStatus === 'syncing'
        ? 'Synchronisation…'
        : syncStatus === 'offline'
          ? 'Hors ligne'
          : 'Mode local';

  return (
    <header className="sticky top-0 z-50 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Link href="/library" aria-label="Ouvrir la bibliothèque YAPRO">
          <BrandMark />
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className="hidden min-h-10 items-center gap-2 rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-600 lg:flex"
          title={
            syncStatus === 'local' ? 'Vos données sont conservées sur cet appareil.' : undefined
          }
        >
          {syncStatus === 'offline' ? (
            <CloudOff className="h-4 w-4" />
          ) : (
            <Cloud className="h-4 w-4" />
          )}
          {syncLabel}
        </div>
        <Link
          href="/profile"
          className="hidden min-h-10 items-center gap-2 rounded-full bg-[#eef1f2] px-3 text-sm font-semibold text-[#0b1c2d] transition hover:bg-slate-200 sm:inline-flex"
          aria-label={`${profile.coins} points aujourd'hui`}
        >
          <span className="grid h-7 w-7 place-items-center rounded-full border-[3px] border-lime-400 bg-white text-[11px] font-bold text-emerald-800">
            {profile.coins}
          </span>
          <span>
            {profile.coins}/{profile.dailyGoal} points
          </span>
        </Link>
        <Link
          href="/library"
          className="hidden min-h-10 items-center gap-2 rounded-full bg-amber-500 px-4 text-sm font-bold text-white transition hover:bg-amber-600 xl:inline-flex"
        >
          <Sparkles className="h-4 w-4" /> Continuer à apprendre
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-11 gap-2 rounded-full bg-[#eef1f2] px-1.5 pr-3 hover:bg-slate-200"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#dff3dc] text-sm font-bold text-emerald-900">
                  {profile.initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-28 truncate text-sm font-semibold md:inline">
                {profile.name}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 shadow-xl">
            <DropdownMenuLabel className="px-3 py-2">
              <span className="block text-sm">{profile.name}</span>
              <span className="mt-0.5 block text-xs font-normal text-slate-500">
                {profile.targetLanguageLabel} · {profile.levelLabel}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="min-h-10 rounded-xl px-3">
              <Link href="/profile">
                <CircleUserRound className="mr-3 h-4 w-4" />
                Mon profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="min-h-10 rounded-xl px-3">
              <Link href="/stats">
                <BarChart3 className="mr-3 h-4 w-4" />
                Statistiques
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="min-h-10 rounded-xl px-3">
              <Link href="/settings">
                <Settings className="mr-3 h-4 w-4" />
                Configuration
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {session ? (
              <DropdownMenuItem
                className="min-h-10 rounded-xl px-3"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild className="min-h-10 rounded-xl px-3">
                <Link href="/login">
                  <LogIn className="mr-3 h-4 w-4" />
                  Connecter un compte
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
