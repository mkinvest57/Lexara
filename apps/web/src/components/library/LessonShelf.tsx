'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Lesson } from '@yapro/core';
import { LessonCard } from '@/components/library/LessonCard';

interface LessonShelfProps {
  title: string;
  lessons: Lesson[];
  viewAllHref?: string;
  /** First shelf should load images with priority for LCP. */
  priority?: boolean;
}

export function LessonShelf({ title, lessons, viewAllHref, priority = false }: LessonShelfProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (lessons.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = 278 + 16; // card + gap
    el.scrollBy({ left: dir === 'right' ? cardWidth * 3 : -cardWidth * 3, behavior: 'smooth' });
  };

  return (
    <section className="relative">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-[#0b1c2d]">{title}</h2>
        <div className="flex items-center gap-1">
          {lessons.length > 4 && (
            <>
              <button
                type="button"
                onClick={() => scroll('left')}
                className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                aria-label={`Défiler ${title} vers la gauche`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                aria-label={`Défiler ${title} vers la droite`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="ml-2 text-sm font-semibold text-blue-600 hover:underline"
            >
              Tout voir
            </Link>
          )}
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {lessons.map((lesson, idx) => (
          <div key={lesson.id} style={{ scrollSnapAlign: 'start' }}>
            <LessonCard lesson={lesson} priority={priority && idx < 4} />
          </div>
        ))}
      </div>
    </section>
  );
}
