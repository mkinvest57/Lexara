const fallbackCover = require('@/assets/images/yapro-hero.png');

const covers: Record<string, number> = {
  'mike-cook-1': require('@/assets/images/lesson-mike-kitchen.jpg'),
  'mike-cook-2': require('@/assets/images/lesson-mike-market.jpg'),
  'who-is-she': require('@/assets/images/lesson-anna-station.jpg'),
  'stella-new-country': require('@/assets/images/lesson-stella-city.jpg'),
  'ftse-news': require('@/assets/images/lesson-market-news.jpg'),
  'daily-english-100': require('@/assets/images/lesson-daily-podcast.jpg'),
};

export function getLessonCover(lessonId: string) {
  return covers[lessonId] ?? fallbackCover;
}
