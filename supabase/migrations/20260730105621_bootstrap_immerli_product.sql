-- Immerli's production data model for Supabase Postgres.
--
-- Security model:
--   * auth.users is the identity source; public.profiles stores product data only.
--   * every public table has RLS enabled.
--   * grants opt tables into the 2026 Data API defaults explicitly.
--   * published lessons are readable without an account; user data is always private.
--   * service_role is intended for trusted server-side jobs only and must never ship to a client.

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
revoke all on schema public from public;

create type public.proficiency_level as enum (
  'beginner',
  'intermediate',
  'advanced'
);

create type public.lesson_kind as enum (
  'story',
  'article',
  'video',
  'podcast',
  'book',
  'conversation'
);

create type public.review_activity as enum (
  'flashcard',
  'reverse_flashcard',
  'cloze',
  'dictation',
  'multiple_choice',
  'matching'
);

create type public.review_rating as enum (
  'again',
  'hard',
  'good',
  'easy'
);

create type public.activity_kind as enum (
  'read',
  'listen',
  'review',
  'import'
);

create table public.languages (
  code text primary key,
  english_name text not null,
  native_name text not null,
  flag_emoji text not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  constraint languages_code_format_check
    check (code ~ '^[a-z]{2,3}(-[A-Z]{2})?$'),
  constraint languages_english_name_check
    check (length(btrim(english_name)) between 2 and 80),
  constraint languages_native_name_check
    check (length(btrim(native_name)) between 1 and 80)
);

insert into public.languages (code, english_name, native_name, flag_emoji)
values
  ('en', 'English', 'English', '🇬🇧'),
  ('es', 'Spanish', 'Español', '🇪🇸'),
  ('fr', 'French', 'Français', '🇫🇷'),
  ('de', 'German', 'Deutsch', '🇩🇪'),
  ('it', 'Italian', 'Italiano', '🇮🇹'),
  ('pt', 'Portuguese', 'Português', '🇵🇹'),
  ('ja', 'Japanese', '日本語', '🇯🇵'),
  ('ko', 'Korean', '한국어', '🇰🇷'),
  ('zh', 'Chinese', '中文', '🇨🇳');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  native_language_code text not null default 'en'
    references public.languages(code) on update cascade on delete restrict,
  ui_language_code text not null default 'fr'
    references public.languages(code) on update cascade on delete restrict,
  timezone text not null default 'UTC',
  onboarding_completed boolean not null default false,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_check
    check (display_name is null or length(btrim(display_name)) between 1 and 80),
  constraint profiles_preferences_object_check
    check (jsonb_typeof(preferences) = 'object')
);

create index profiles_native_language_idx
  on public.profiles (native_language_code);

create index profiles_ui_language_idx
  on public.profiles (ui_language_code);

create table public.user_languages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language_code text not null
    references public.languages(code) on update cascade on delete restrict,
  level public.proficiency_level not null default 'beginner',
  is_active boolean not null default false,
  daily_goal_words integer not null default 100,
  daily_goal_minutes integer not null default 15,
  daily_goal_reviews integer not null default 10,
  interests text[] not null default '{}'::text[],
  learning_since date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_languages_daily_goal_words_check
    check (daily_goal_words between 0 and 10000),
  constraint user_languages_daily_goal_minutes_check
    check (daily_goal_minutes between 0 and 1440),
  constraint user_languages_daily_goal_reviews_check
    check (daily_goal_reviews between 0 and 1000),
  constraint user_languages_user_language_key unique (user_id, language_code),
  constraint user_languages_id_user_key unique (id, user_id),
  constraint user_languages_id_user_language_key unique (id, user_id, language_code)
);

create unique index user_languages_one_active_idx
  on public.user_languages (user_id)
  where is_active;

create index user_languages_language_idx
  on public.user_languages (language_code);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  language_code text not null
    references public.languages(code) on update cascade on delete restrict,
  title text not null,
  description text,
  kind public.lesson_kind not null default 'story',
  source_url text,
  cover_image_url text,
  audio_url text,
  level public.proficiency_level not null default 'beginner',
  content text not null,
  word_count integer not null default 0,
  duration_seconds integer,
  is_published boolean not null default false,
  published_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lessons_title_check
    check (length(btrim(title)) between 1 and 180),
  constraint lessons_content_check
    check (length(btrim(content)) > 0),
  constraint lessons_word_count_check
    check (word_count >= 0),
  constraint lessons_duration_check
    check (duration_seconds is null or duration_seconds >= 0),
  constraint lessons_metadata_object_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint lessons_published_owner_check
    check (not is_published or owner_id is null),
  constraint lessons_published_at_check
    check (is_published = (published_at is not null)),
  constraint lessons_id_language_key unique (id, language_code)
);

create index lessons_owner_created_idx
  on public.lessons (owner_id, created_at desc)
  where owner_id is not null;

create index lessons_library_idx
  on public.lessons (language_code, level, created_at desc)
  where is_published;

create index lessons_language_idx
  on public.lessons (language_code);

create table public.sentences (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  position integer not null,
  text text not null,
  translation text,
  audio_start_seconds numeric(10, 3),
  audio_end_seconds numeric(10, 3),
  created_at timestamptz not null default now(),
  constraint sentences_position_check check (position >= 0),
  constraint sentences_text_check check (length(btrim(text)) > 0),
  constraint sentences_audio_range_check check (
    (audio_start_seconds is null and audio_end_seconds is null)
    or (
      audio_start_seconds >= 0
      and audio_end_seconds >= audio_start_seconds
    )
  ),
  constraint sentences_lesson_position_key unique (lesson_id, position),
  constraint sentences_id_lesson_key unique (id, lesson_id)
);

create table public.tokens (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null,
  sentence_id uuid not null,
  position integer not null,
  form text not null,
  normalized_form text not null,
  lemma text,
  is_word boolean not null default true,
  character_start integer,
  character_end integer,
  created_at timestamptz not null default now(),
  constraint tokens_sentence_lesson_fkey
    foreign key (sentence_id, lesson_id)
    references public.sentences(id, lesson_id)
    on delete cascade,
  constraint tokens_position_check check (position >= 0),
  constraint tokens_form_check check (length(form) > 0),
  constraint tokens_normalized_form_check check (length(btrim(normalized_form)) > 0),
  constraint tokens_character_range_check check (
    (character_start is null and character_end is null)
    or (
      character_start >= 0
      and character_end > character_start
    )
  ),
  constraint tokens_sentence_position_key unique (sentence_id, position),
  constraint tokens_id_lesson_key unique (id, lesson_id)
);

create index tokens_lesson_idx on public.tokens (lesson_id);
create index tokens_normalized_form_idx on public.tokens (normalized_form);

create table public.vocabulary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_language_id uuid not null,
  term text not null,
  normalized_term text not null,
  translation text not null,
  notes text,
  status smallint not null default 1,
  times_seen integer not null default 1,
  first_context text,
  known_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vocabulary_user_language_fkey
    foreign key (user_language_id, user_id)
    references public.user_languages(id, user_id)
    on delete cascade,
  constraint vocabulary_term_check check (length(btrim(term)) > 0),
  constraint vocabulary_normalized_term_check check (
    length(btrim(normalized_term)) > 0
    and normalized_term = lower(btrim(normalized_term))
  ),
  constraint vocabulary_translation_check check (length(btrim(translation)) > 0),
  constraint vocabulary_status_check check (status between 0 and 4),
  constraint vocabulary_times_seen_check check (times_seen >= 1),
  constraint vocabulary_user_language_term_key
    unique (user_language_id, normalized_term),
  constraint vocabulary_id_user_key unique (id, user_id),
  constraint vocabulary_id_user_language_key unique (id, user_id, user_language_id)
);

create index vocabulary_user_status_idx
  on public.vocabulary_entries (user_id, status, updated_at desc);

create index vocabulary_user_language_idx
  on public.vocabulary_entries (user_language_id, user_id);

create table public.vocabulary_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vocabulary_entry_id uuid not null,
  lesson_id uuid,
  token_id uuid,
  context text not null,
  encountered_at timestamptz not null default now(),
  constraint occurrences_vocabulary_user_fkey
    foreign key (vocabulary_entry_id, user_id)
    references public.vocabulary_entries(id, user_id)
    on delete cascade,
  constraint occurrences_token_lesson_fkey
    foreign key (token_id, lesson_id)
    references public.tokens(id, lesson_id)
    match full
    on delete set null,
  constraint occurrences_context_check check (length(btrim(context)) > 0),
  constraint occurrences_token_lesson_pair_check
    check ((token_id is null) = (lesson_id is null))
);

create index occurrences_vocabulary_date_idx
  on public.vocabulary_occurrences (vocabulary_entry_id, encountered_at desc);

create index occurrences_user_idx on public.vocabulary_occurrences (user_id);
create index occurrences_lesson_idx on public.vocabulary_occurrences (lesson_id);
create index occurrences_token_lesson_idx
  on public.vocabulary_occurrences (token_id, lesson_id);

create table public.srs_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vocabulary_entry_id uuid not null,
  next_review_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  interval_days numeric(8, 2) not null default 0,
  ease_factor numeric(4, 2) not null default 2.50,
  repetitions integer not null default 0,
  lapses integer not null default 0,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint srs_vocabulary_user_fkey
    foreign key (vocabulary_entry_id, user_id)
    references public.vocabulary_entries(id, user_id)
    on delete cascade,
  constraint srs_interval_check check (interval_days >= 0),
  constraint srs_ease_check check (ease_factor between 1.30 and 3.50),
  constraint srs_repetitions_check check (repetitions >= 0),
  constraint srs_lapses_check check (lapses >= 0),
  constraint srs_vocabulary_key unique (vocabulary_entry_id)
);

create index srs_due_idx
  on public.srs_items (user_id, next_review_at)
  where not suspended;

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_language_id uuid not null,
  language_code text not null,
  lesson_id uuid not null,
  progress_percent numeric(5, 2) not null default 0,
  reader_position integer not null default 0,
  words_read integer not null default 0,
  seconds_spent integer not null default 0,
  completed_at timestamptz,
  last_opened_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint progress_user_language_fkey
    foreign key (user_language_id, user_id, language_code)
    references public.user_languages(id, user_id, language_code)
    on delete cascade,
  constraint progress_lesson_language_fkey
    foreign key (lesson_id, language_code)
    references public.lessons(id, language_code)
    on delete cascade,
  constraint progress_percent_check check (progress_percent between 0 and 100),
  constraint progress_reader_position_check check (reader_position >= 0),
  constraint progress_words_read_check check (words_read >= 0),
  constraint progress_seconds_spent_check check (seconds_spent >= 0),
  constraint progress_user_lesson_key unique (user_id, lesson_id)
);

create index progress_user_recent_idx
  on public.lesson_progress (user_id, last_opened_at desc);

create index progress_user_language_idx
  on public.lesson_progress (user_language_id, user_id, language_code);

create index progress_lesson_language_idx
  on public.lesson_progress (lesson_id, language_code);

create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Ma liste',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint playlists_name_check
    check (length(btrim(name)) between 1 and 80),
  constraint playlists_user_name_key unique (user_id, name),
  constraint playlists_id_user_key unique (id, user_id)
);

create unique index playlists_one_default_idx
  on public.playlists (user_id)
  where is_default;

create table public.playlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  playlist_id uuid not null,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  position integer not null default 0,
  added_at timestamptz not null default now(),
  constraint playlist_items_playlist_user_fkey
    foreign key (playlist_id, user_id)
    references public.playlists(id, user_id)
    on delete cascade,
  constraint playlist_items_position_check check (position >= 0),
  constraint playlist_items_playlist_lesson_key unique (playlist_id, lesson_id)
);

create index playlist_items_user_added_idx
  on public.playlist_items (user_id, added_at desc);

create index playlist_items_lesson_idx on public.playlist_items (lesson_id);

create table public.review_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_language_id uuid not null,
  activity public.review_activity not null default 'flashcard',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  items_count integer not null default 0,
  correct_count integer not null default 0,
  constraint review_sessions_user_language_fkey
    foreign key (user_language_id, user_id)
    references public.user_languages(id, user_id)
    on delete cascade,
  constraint review_sessions_items_check check (items_count >= 0),
  constraint review_sessions_correct_check check (
    correct_count >= 0 and correct_count <= items_count
  ),
  constraint review_sessions_time_check check (
    ended_at is null or ended_at >= started_at
  ),
  constraint review_sessions_id_user_language_key
    unique (id, user_id, user_language_id)
);

create index review_sessions_user_started_idx
  on public.review_sessions (user_id, started_at desc);

create index review_sessions_user_language_idx
  on public.review_sessions (user_language_id, user_id);

create table public.review_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_language_id uuid not null,
  review_session_id uuid not null,
  vocabulary_entry_id uuid not null,
  rating public.review_rating not null,
  response_ms integer,
  previous_interval_days numeric(8, 2) not null default 0,
  next_interval_days numeric(8, 2) not null default 0,
  reviewed_at timestamptz not null default now(),
  constraint review_events_session_fkey
    foreign key (review_session_id, user_id, user_language_id)
    references public.review_sessions(id, user_id, user_language_id)
    on delete cascade,
  constraint review_events_vocabulary_fkey
    foreign key (vocabulary_entry_id, user_id, user_language_id)
    references public.vocabulary_entries(id, user_id, user_language_id)
    on delete cascade,
  constraint review_events_response_check
    check (response_ms is null or response_ms >= 0),
  constraint review_events_previous_interval_check
    check (previous_interval_days >= 0),
  constraint review_events_next_interval_check
    check (next_interval_days >= 0)
);

create index review_events_session_date_idx
  on public.review_events (review_session_id, reviewed_at);

create index review_events_vocabulary_date_idx
  on public.review_events (vocabulary_entry_id, reviewed_at desc);

create index review_events_user_date_idx
  on public.review_events (user_id, reviewed_at desc);

create index review_events_user_language_idx
  on public.review_events (user_language_id, user_id);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_language_id uuid not null,
  kind public.activity_kind not null,
  words_read integer not null default 0,
  seconds_listened integer not null default 0,
  cards_reviewed integer not null default 0,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint activity_user_language_fkey
    foreign key (user_language_id, user_id)
    references public.user_languages(id, user_id)
    on delete cascade,
  constraint activity_words_check check (words_read >= 0),
  constraint activity_seconds_check check (seconds_listened >= 0),
  constraint activity_cards_check check (cards_reviewed >= 0),
  constraint activity_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create index activity_user_date_idx
  on public.activity_events (user_id, occurred_at desc);

create index activity_user_language_idx
  on public.activity_events (user_language_id, user_id);

-- Keep mutable rows' timestamps authoritative in Postgres.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger user_languages_set_updated_at
before update on public.user_languages
for each row execute function private.set_updated_at();

create trigger lessons_set_updated_at
before update on public.lessons
for each row execute function private.set_updated_at();

create trigger vocabulary_entries_set_updated_at
before update on public.vocabulary_entries
for each row execute function private.set_updated_at();

create trigger srs_items_set_updated_at
before update on public.srs_items
for each row execute function private.set_updated_at();

create trigger lesson_progress_set_updated_at
before update on public.lesson_progress
for each row execute function private.set_updated_at();

create trigger playlists_set_updated_at
before update on public.playlists
for each row execute function private.set_updated_at();

-- Provision product-owned rows after Supabase Auth creates an identity.
-- raw_user_meta_data is used only for display values, never authorization.
create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'avatar_url'), '')
  )
  on conflict (id) do nothing;

  insert into public.playlists (user_id, name, is_default)
  values (new.id, 'Ma liste', true)
  on conflict (user_id, name) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user()
  from public, anon, authenticated, service_role;

create trigger immerli_on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

-- A saved word is always reviewable; the client cannot create an orphaned
-- vocabulary entry without an SRS schedule.
create or replace function private.create_srs_item_for_vocabulary()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.srs_items (user_id, vocabulary_entry_id)
  values (new.user_id, new.id)
  on conflict (vocabulary_entry_id) do nothing;

  return new;
end;
$$;

revoke all on function private.create_srs_item_for_vocabulary()
  from public, anon, authenticated, service_role;

create trigger vocabulary_create_srs_item
after insert on public.vocabulary_entries
for each row execute function private.create_srs_item_for_vocabulary();

-- Row-level security is mandatory for every table in the exposed public schema.
alter table public.languages enable row level security;
alter table public.profiles enable row level security;
alter table public.user_languages enable row level security;
alter table public.lessons enable row level security;
alter table public.sentences enable row level security;
alter table public.tokens enable row level security;
alter table public.vocabulary_entries enable row level security;
alter table public.vocabulary_occurrences enable row level security;
alter table public.srs_items enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_items enable row level security;
alter table public.review_sessions enable row level security;
alter table public.review_events enable row level security;
alter table public.activity_events enable row level security;

create policy languages_select_enabled
on public.languages for select
to anon, authenticated
using (is_enabled);

create policy profiles_select_own
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy user_languages_select_own
on public.user_languages for select
to authenticated
using ((select auth.uid()) = user_id);

create policy user_languages_insert_own
on public.user_languages for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy user_languages_update_own
on public.user_languages for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy user_languages_delete_own
on public.user_languages for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy lessons_select_published_anon
on public.lessons for select
to anon
using (is_published);

create policy lessons_select_visible_authenticated
on public.lessons for select
to authenticated
using (is_published or (select auth.uid()) = owner_id);

create policy lessons_insert_own_draft
on public.lessons for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and not is_published
  and published_at is null
);

create policy lessons_update_own_draft
on public.lessons for update
to authenticated
using ((select auth.uid()) = owner_id)
with check (
  (select auth.uid()) = owner_id
  and not is_published
  and published_at is null
);

create policy lessons_delete_own
on public.lessons for delete
to authenticated
using ((select auth.uid()) = owner_id);

create policy sentences_select_published_anon
on public.sentences for select
to anon
using (
  exists (
    select 1
    from public.lessons
    where lessons.id = sentences.lesson_id
      and lessons.is_published
  )
);

create policy sentences_select_visible_authenticated
on public.sentences for select
to authenticated
using (
  exists (
    select 1
    from public.lessons
    where lessons.id = sentences.lesson_id
      and (lessons.is_published or lessons.owner_id = (select auth.uid()))
  )
);

create policy sentences_insert_owned_lesson
on public.sentences for insert
to authenticated
with check (
  exists (
    select 1
    from public.lessons
    where lessons.id = sentences.lesson_id
      and lessons.owner_id = (select auth.uid())
      and not lessons.is_published
  )
);

create policy sentences_update_owned_lesson
on public.sentences for update
to authenticated
using (
  exists (
    select 1
    from public.lessons
    where lessons.id = sentences.lesson_id
      and lessons.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.lessons
    where lessons.id = sentences.lesson_id
      and lessons.owner_id = (select auth.uid())
      and not lessons.is_published
  )
);

create policy sentences_delete_owned_lesson
on public.sentences for delete
to authenticated
using (
  exists (
    select 1
    from public.lessons
    where lessons.id = sentences.lesson_id
      and lessons.owner_id = (select auth.uid())
  )
);

create policy tokens_select_published_anon
on public.tokens for select
to anon
using (
  exists (
    select 1
    from public.lessons
    where lessons.id = tokens.lesson_id
      and lessons.is_published
  )
);

create policy tokens_select_visible_authenticated
on public.tokens for select
to authenticated
using (
  exists (
    select 1
    from public.lessons
    where lessons.id = tokens.lesson_id
      and (lessons.is_published or lessons.owner_id = (select auth.uid()))
  )
);

create policy tokens_insert_owned_lesson
on public.tokens for insert
to authenticated
with check (
  exists (
    select 1
    from public.lessons
    where lessons.id = tokens.lesson_id
      and lessons.owner_id = (select auth.uid())
      and not lessons.is_published
  )
);

create policy tokens_update_owned_lesson
on public.tokens for update
to authenticated
using (
  exists (
    select 1
    from public.lessons
    where lessons.id = tokens.lesson_id
      and lessons.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.lessons
    where lessons.id = tokens.lesson_id
      and lessons.owner_id = (select auth.uid())
      and not lessons.is_published
  )
);

create policy tokens_delete_owned_lesson
on public.tokens for delete
to authenticated
using (
  exists (
    select 1
    from public.lessons
    where lessons.id = tokens.lesson_id
      and lessons.owner_id = (select auth.uid())
  )
);

create policy vocabulary_select_own
on public.vocabulary_entries for select
to authenticated
using ((select auth.uid()) = user_id);

create policy vocabulary_insert_own
on public.vocabulary_entries for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.user_languages
    where user_languages.id = vocabulary_entries.user_language_id
      and user_languages.user_id = (select auth.uid())
  )
);

create policy vocabulary_update_own
on public.vocabulary_entries for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.user_languages
    where user_languages.id = vocabulary_entries.user_language_id
      and user_languages.user_id = (select auth.uid())
  )
);

create policy vocabulary_delete_own
on public.vocabulary_entries for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy occurrences_select_own
on public.vocabulary_occurrences for select
to authenticated
using ((select auth.uid()) = user_id);

create policy occurrences_insert_own
on public.vocabulary_occurrences for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    lesson_id is null
    or exists (
      select 1
      from public.lessons
      where lessons.id = vocabulary_occurrences.lesson_id
        and (lessons.is_published or lessons.owner_id = (select auth.uid()))
    )
  )
);

create policy occurrences_delete_own
on public.vocabulary_occurrences for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy srs_select_own
on public.srs_items for select
to authenticated
using ((select auth.uid()) = user_id);

create policy srs_insert_own
on public.srs_items for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy srs_update_own
on public.srs_items for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy progress_select_own
on public.lesson_progress for select
to authenticated
using ((select auth.uid()) = user_id);

create policy progress_insert_own_visible_lesson
on public.lesson_progress for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.lessons
    where lessons.id = lesson_progress.lesson_id
      and (lessons.is_published or lessons.owner_id = (select auth.uid()))
  )
);

create policy progress_update_own_visible_lesson
on public.lesson_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.lessons
    where lessons.id = lesson_progress.lesson_id
      and (lessons.is_published or lessons.owner_id = (select auth.uid()))
  )
);

create policy progress_delete_own
on public.lesson_progress for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy playlists_select_own
on public.playlists for select
to authenticated
using ((select auth.uid()) = user_id);

create policy playlists_insert_own
on public.playlists for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy playlists_update_own
on public.playlists for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy playlists_delete_non_default_own
on public.playlists for delete
to authenticated
using ((select auth.uid()) = user_id and not is_default);

create policy playlist_items_select_own
on public.playlist_items for select
to authenticated
using ((select auth.uid()) = user_id);

create policy playlist_items_insert_own_visible_lesson
on public.playlist_items for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.lessons
    where lessons.id = playlist_items.lesson_id
      and (lessons.is_published or lessons.owner_id = (select auth.uid()))
  )
);

create policy playlist_items_update_own_visible_lesson
on public.playlist_items for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.lessons
    where lessons.id = playlist_items.lesson_id
      and (lessons.is_published or lessons.owner_id = (select auth.uid()))
  )
);

create policy playlist_items_delete_own
on public.playlist_items for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy review_sessions_select_own
on public.review_sessions for select
to authenticated
using ((select auth.uid()) = user_id);

create policy review_sessions_insert_own
on public.review_sessions for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy review_sessions_update_own
on public.review_sessions for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy review_events_select_own
on public.review_events for select
to authenticated
using ((select auth.uid()) = user_id);

create policy review_events_insert_own
on public.review_events for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy activity_events_select_own
on public.activity_events for select
to authenticated
using ((select auth.uid()) = user_id);

create policy activity_events_insert_own
on public.activity_events for insert
to authenticated
with check ((select auth.uid()) = user_id);

-- Supabase's 2026 Data API defaults require explicit grants. RLS still decides
-- which rows are visible after a role has object-level privileges.
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables
  from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences
  from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions
  from public, anon, authenticated, service_role;

revoke all on all tables in schema public
  from public, anon, authenticated, service_role;

revoke all on all sequences in schema public
  from public, anon, authenticated, service_role;

revoke all on all functions in schema public
  from public, anon, authenticated, service_role;

grant usage on schema public to anon, authenticated, service_role;

revoke all on type
  public.proficiency_level,
  public.lesson_kind,
  public.review_activity,
  public.review_rating,
  public.activity_kind
from public;

grant usage on type
  public.proficiency_level,
  public.lesson_kind,
  public.review_activity,
  public.review_rating,
  public.activity_kind
to anon, authenticated, service_role;

grant select on public.languages to anon, authenticated;
grant select on public.lessons, public.sentences, public.tokens to anon;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_languages to authenticated;
grant select, insert, update, delete on public.lessons to authenticated;
grant select, insert, update, delete on public.sentences to authenticated;
grant select, insert, update, delete on public.tokens to authenticated;
grant select, insert, update, delete on public.vocabulary_entries to authenticated;
grant select, insert, delete on public.vocabulary_occurrences to authenticated;
grant select, insert, update on public.srs_items to authenticated;
grant select, insert, update, delete on public.lesson_progress to authenticated;
grant select, insert, update, delete on public.playlists to authenticated;
grant select, insert, update, delete on public.playlist_items to authenticated;
grant select, insert, update on public.review_sessions to authenticated;
grant select, insert on public.review_events to authenticated;
grant select, insert on public.activity_events to authenticated;

grant select, insert, update, delete on
  public.languages,
  public.profiles,
  public.user_languages,
  public.lessons,
  public.sentences,
  public.tokens,
  public.vocabulary_entries,
  public.vocabulary_occurrences,
  public.srs_items,
  public.lesson_progress,
  public.playlists,
  public.playlist_items,
  public.review_sessions,
  public.review_events,
  public.activity_events
to service_role;
