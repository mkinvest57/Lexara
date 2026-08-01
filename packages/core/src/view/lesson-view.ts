/**
 * Presentation helpers for lessons.
 *
 * The domain `Lesson` mirrors the database. The UI needs formatted labels and a
 * guaranteed cover image, so those are derived here rather than stored.
 */

import type { Lesson, ProficiencyLevel } from '../types';

export const LEVEL_LABELS: Record<ProficiencyLevel, string> = {
  beginner: 'Débutant 1',
  beginner_2: 'Débutant 2',
  intermediate: 'Intermédiaire 1',
  intermediate_2: 'Intermédiaire 2',
  advanced: 'Avancé 1',
  advanced_2: 'Avancé 2',
};

export const KIND_LABELS: Record<string, string> = {
  story: 'Histoire',
  article: 'Article',
  podcast: 'Podcast',
  video: 'Vidéo',
  book: 'Livre',
  mini_story: 'Mini-histoire',
  grammar: 'Grammaire',
  news: 'Actualité',
  song: 'Chanson',
  conversation: 'Conversation',
};

const FALLBACK_COVER = '/brand/immerli-hero.png';

export function levelLabel(level: ProficiencyLevel): string {
  return LEVEL_LABELS[level] ?? 'Débutant 1';
}

export function kindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? 'Article';
}

/** Formats seconds as mm:ss, the form used on lesson cards. */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '--:--';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function coverImage(lesson: Pick<Lesson, 'coverImageUrl'>): string {
  return lesson.coverImageUrl ?? FALLBACK_COVER;
}

export function isImported(lesson: Pick<Lesson, 'sourceUrl' | 'isPublished'>): boolean {
  return !lesson.isPublished || Boolean(lesson.sourceUrl);
}

export interface LessonView {
  levelLabel: string;
  typeLabel: string;
  duration: string;
  image: string;
  imported: boolean;
  collection: string;
}

export function lessonView(lesson: Lesson): LessonView {
  return {
    levelLabel: levelLabel(lesson.level),
    typeLabel: kindLabel(lesson.kind),
    duration: formatDuration(lesson.durationSeconds),
    image: coverImage(lesson),
    imported: isImported(lesson),
    collection: lesson.collection ?? 'Ma bibliothèque',
  };
}
