'use client';

import { useState } from 'react';
import { useProductStore } from '@/lib/product-store';
import { ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';

type MascotOutfit = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  description: string;
};

export default function WebShopPage() {
  const { profile, equippedMascot, purchasedMascots, buyMascot, equipMascot } = useProductStore((state) => ({
    profile: state.profile,
    equippedMascot: state.equippedMascot,
    purchasedMascots: state.purchasedMascots,
    buyMascot: state.buyMascot,
    equipMascot: state.equipMascot,
  }));
  const coins = profile.coins;

  const outfits: MascotOutfit[] = [
    {
      id: 'outfit-default',
      name: 'YAPRO Renard Classique',
      price: 0,
      emoji: '🦊',
      description: 'La mascotte d’origine YAPRO, curieuse et intelligente.',
    },
    {
      id: 'outfit-scholar',
      name: 'Mascotte Érudit',
      price: 100,
      emoji: '🦊🎓',
      description: 'Ajoute une toque et des lunettes de savant.',
    },
    {
      id: 'outfit-dragon',
      name: 'Dragon Polyglotte',
      price: 250,
      emoji: '🐲',
      description: 'L’avatar légendaire des maîtres des langues.',
    },
    {
      id: 'outfit-crown',
      name: 'Renard Couronné',
      price: 500,
      emoji: '🦊👑',
      description: 'Réservé aux champions avec plus de 1000 mots lues.',
    },
  ];

  const buyOrEquip = (item: MascotOutfit) => {
    if (purchasedMascots.includes(item.id)) {
      equipMascot(item.id);
      return;
    }
    if (coins >= item.price) {
      buyMascot(item.id, item.price);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
              Boutique & Mascotte YAPRO
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Personnalisez votre avatar évolutif grâce à vos pièces accumulées !
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
            <span>🪙 {coins} YAPRO Coins</span>
          </div>
        </header>

        <section className="rounded-3xl bg-teal-900 p-8 text-center text-white shadow-xl">
          <div className="text-7xl">{outfits.find((o) => o.id === equippedMascot)?.emoji || '🦊'}</div>
          <h2 className="mt-4 font-display text-2xl font-bold">
            {outfits.find((o) => o.id === equippedMascot)?.name || 'Mascotte YAPRO'}
          </h2>
          <p className="mt-2 text-sm text-teal-200">
            Votre mascotte évolue au fil de vos lectures quotidiennes.
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          {outfits.map((item) => {
            const isOwned = purchasedMascots.includes(item.id);
            const isEquipped = equippedMascot === item.id;
            const canAfford = coins >= item.price;

            return (
              <article
                key={item.id}
                className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="text-5xl">{item.emoji}</div>
                <h3 className="mt-4 font-bold text-slate-900">{item.name}</h3>
                <p className="mt-1 text-center text-xs text-slate-500">{item.description}</p>
                <button
                  type="button"
                  onClick={() => buyOrEquip(item)}
                  disabled={!isOwned && !canAfford}
                  className={`mt-6 w-full rounded-xl py-3 text-sm font-bold transition ${
                    isEquipped
                      ? 'bg-emerald-100 text-emerald-800'
                      : isOwned
                      ? 'bg-teal-700 text-white hover:bg-teal-800'
                      : canAfford
                      ? 'bg-teal-900 text-white hover:bg-teal-950'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isEquipped ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Équipé
                    </span>
                  ) : isOwned ? (
                    'Équiper'
                  ) : (
                    `Obtenir (${item.price} 🪙)`
                  )}
                </button>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
