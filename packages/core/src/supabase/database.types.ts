/**
 * Database types.
 *
 * Hand-authored: generating these requires a running local Supabase instance
 * (`supabase gen types typescript --local`), which needs Docker. Regenerate and
 * replace this file once Docker is available — the shape below mirrors
 * `supabase/migrations` and should be treated as a stand-in, not the source of
 * truth.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ProficiencyLevelRow =
  | 'beginner'
  | 'beginner_2'
  | 'intermediate'
  | 'intermediate_2'
  | 'advanced'
  | 'advanced_2';

export type LessonKindRow =
  | 'story'
  | 'article'
  | 'podcast'
  | 'video'
  | 'book'
  | 'mini_story'
  | 'grammar'
  | 'news'
  | 'song';

export type ReviewActivityRow =
  | 'flashcard'
  | 'reverse_flashcard'
  | 'cloze'
  | 'dictation'
  | 'multiple_choice'
  | 'matching';

export type WordStatusRow = 'new' | '1' | '2' | '3' | '4' | '4a' | '4b' | '4c' | 'known' | 'ignored';

/** Helper describing a table whose insert/update shapes derive from its row. */
interface TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface LanguageRow {
  code: string;
  english_name: string;
  native_name: string;
  flag_emoji: string;
  is_enabled: boolean;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  native_language_code: string;
  ui_language_code: string;
  timezone: string;
  onboarding_completed: boolean;
  preferences: Json;
  coins: number;
  equipped_mascot: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserLanguageRow {
  id: string;
  user_id: string;
  language_code: string;
  level: ProficiencyLevelRow;
  is_active: boolean;
  daily_goal_words: number;
  daily_goal_minutes: number;
  daily_goal_reviews: number;
  interests: string[];
  learning_since: string;
  created_at: string;
  updated_at: string;
}

export interface LessonRow {
  id: string;
  owner_id: string | null;
  language_code: string;
  course_id: string | null;
  title: string;
  description: string | null;
  kind: LessonKindRow;
  source_url: string | null;
  cover_image_url: string | null;
  audio_url: string | null;
  level: ProficiencyLevelRow;
  content: string;
  translation: string | null;
  word_count: number;
  duration_seconds: number | null;
  collection: string | null;
  course_position: number;
  is_published: boolean;
  published_at: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface SentenceRow {
  id: string;
  lesson_id: string;
  position: number;
  text: string;
  translation: string | null;
  note: string | null;
  audio_start_seconds: number | null;
  audio_end_seconds: number | null;
  created_at: string;
}

export interface CourseRow {
  id: string;
  language_code: string;
  owner_id: string | null;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  level: ProficiencyLevelRow;
  position: number;
  is_published: boolean;
  created_at: string;
}

export interface VocabularyEntryRow {
  id: string;
  user_id: string;
  user_language_id: string;
  language_code: string | null;
  /** Lookup key: lowercased word, or space-joined lemmas for a phrase. */
  lemma: string | null;
  term: string;
  /** Legacy column from the bootstrap migration; `lemma` supersedes it. */
  normalized_term: string;
  translation: string;
  pronunciation: string | null;
  notes: string | null;
  first_context: string | null;
  tags: string[];
  /** Legacy smallint ladder retained for compatibility. */
  status: number;
  /** The enum ladder the reader renders. */
  word_status: WordStatusRow;
  times_seen: number;
  lesson_id: string | null;
  fsrs_card: Json | null;
  next_review_at: string | null;
  last_reviewed_at: string | null;
  review_count: number;
  correct_streak: number;
  known_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WordStatusEntryRow {
  id: string;
  user_id: string;
  language_code: string;
  lemma: string;
  status: WordStatusRow;
  created_at: string;
  updated_at: string;
}

export interface LessonProgressRow {
  id: string;
  user_id: string;
  lesson_id: string;
  last_page: number;
  last_sentence: number;
  words_read: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaylistRow {
  id: string;
  user_id: string;
  name: string;
  language_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaylistItemRow {
  id: string;
  playlist_id: string;
  lesson_id: string;
  position: number;
  created_at: string;
}

export interface DailyStatsRow {
  id: string;
  user_id: string;
  language_code: string;
  stat_date: string;
  words_read: number;
  listening_seconds: number;
  lingqs_created: number;
  reviews_completed: number;
  known_words: number;
  coins: number;
  created_at: string;
  updated_at: string;
}

export interface CoinTransactionRow {
  id: string;
  user_id: string;
  amount: number;
  action: string;
  created_at: string;
}

export interface ChallengeRow {
  id: string;
  title: string;
  description: string | null;
  language_code: string | null;
  goal_metric: string;
  goal_value: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface ChallengeParticipantRow {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: number;
  completed_at: string | null;
  joined_at: string;
}

export interface UserReviewConfigRow {
  user_id: string;
  enabled_activities: ReviewActivityRow[];
  multiple_choice_options: number;
  daily_limit: number;
  auto_play_tts: boolean;
  flashcard_front: string[];
  flashcard_back: string[];
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      languages: TableDef<LanguageRow>;
      profiles: TableDef<ProfileRow>;
      user_languages: TableDef<UserLanguageRow>;
      lessons: TableDef<LessonRow>;
      sentences: TableDef<SentenceRow>;
      courses: TableDef<CourseRow>;
      vocabulary_entries: TableDef<VocabularyEntryRow>;
      word_statuses: TableDef<WordStatusEntryRow>;
      lesson_progress: TableDef<LessonProgressRow>;
      playlists: TableDef<PlaylistRow>;
      playlist_items: TableDef<PlaylistItemRow>;
      daily_stats: TableDef<DailyStatsRow>;
      coin_transactions: TableDef<CoinTransactionRow>;
      challenges: TableDef<ChallengeRow>;
      challenge_participants: TableDef<ChallengeParticipantRow>;
      user_review_config: TableDef<UserReviewConfigRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      proficiency_level: ProficiencyLevelRow;
      lesson_kind: LessonKindRow;
      review_activity: ReviewActivityRow;
      word_status: WordStatusRow;
    };
    CompositeTypes: Record<string, never>;
  };
}
