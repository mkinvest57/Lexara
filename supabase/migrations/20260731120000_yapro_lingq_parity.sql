-- YAPRO — LingQ parity schema extension
--
-- Builds on 20260730105621_bootstrap_immerli_product.sql. Adds the full word
-- status ladder, cross-lesson status tracking, courses, pagination, tags,
-- aggregated stats, coins, challenges and review configuration.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- The visible LingQ ladder. Distinct from srs_items scheduling: this is what
-- the learner sees as a colour in the reader.
create type public.word_status as enum (
  'new',
  '1',
  '2',
  '3',
  '4',
  '4a',
  '4b',
  '4c',
  'known',
  'ignored'
);

-- proficiency_level and lesson_kind are extended in 20260731115000, which must
-- run first: Postgres cannot use a newly added enum value in the same
-- transaction that adds it.

-- ---------------------------------------------------------------------------
-- Courses
-- ---------------------------------------------------------------------------

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  language_code text not null references public.languages(code) on update cascade,
  title text not null,
  description text,
  cover_image_url text,
  level public.proficiency_level not null default 'beginner',
  position integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_title_check check (length(btrim(title)) > 0),
  -- Composite key so lessons can reference (course, language) and stay consistent.
  constraint courses_id_language_key unique (id, language_code)
);

create index courses_language_idx
  on public.courses (language_code, position)
  where is_published;

create index courses_owner_idx
  on public.courses (owner_id)
  where owner_id is not null;

-- ---------------------------------------------------------------------------
-- Lesson extensions
-- ---------------------------------------------------------------------------

-- `collection` names the library shelf a lesson appears on; `course_position`
-- orders lessons inside a course.
alter table public.lessons
  add column if not exists course_id uuid,
  add column if not exists translation text,
  add column if not exists collection text,
  add column if not exists course_position integer not null default 0;

alter table public.lessons
  add constraint lessons_course_language_fkey
  foreign key (course_id, language_code)
  references public.courses(id, language_code)
  on delete set null;

create index lessons_course_idx
  on public.lessons (course_id, course_position)
  where course_id is not null;

create index lessons_collection_idx
  on public.lessons (language_code, collection)
  where is_published and collection is not null;

-- Sentence-level editing support for imported lessons.
alter table public.sentences
  add column if not exists note text;

-- ---------------------------------------------------------------------------
-- Tags
-- ---------------------------------------------------------------------------

create table public.lesson_tags (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  tag text not null,
  primary key (lesson_id, tag),
  constraint lesson_tags_tag_check check (
    length(btrim(tag)) > 0 and tag = lower(btrim(tag))
  )
);

create index lesson_tags_tag_idx on public.lesson_tags (tag);

-- ---------------------------------------------------------------------------
-- Word statuses — cross-lesson vocabulary continuity
-- ---------------------------------------------------------------------------
--
-- One row per (user, language, lemma). This is the table the reader reads on
-- every render to colour tokens, and it is what makes a word learned in one
-- lesson appear learned in every other. Covers words marked known or ignored
-- with no vocabulary entry attached.

create table public.word_statuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language_code text not null references public.languages(code) on update cascade,
  lemma text not null,
  status public.word_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint word_statuses_lemma_check check (length(btrim(lemma)) > 0),
  constraint word_statuses_user_language_lemma_key unique (user_id, language_code, lemma)
);

-- The reader loads every status for one language in a single query.
create index word_statuses_lookup_idx
  on public.word_statuses (user_id, language_code, lemma);

create index word_statuses_known_idx
  on public.word_statuses (user_id, language_code)
  where status in ('known', '4c');

-- ---------------------------------------------------------------------------
-- Vocabulary extensions
-- ---------------------------------------------------------------------------
--
-- The bootstrap table used a smallint status and required a user_language_id.
-- We add the enum ladder, the lemma lookup key, tags, FSRS state and direct
-- scheduling columns so a LingQ is self-contained.

alter table public.vocabulary_entries
  add column if not exists language_code text references public.languages(code) on update cascade,
  add column if not exists lemma text,
  add column if not exists word_status public.word_status not null default '1',
  add column if not exists pronunciation text,
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists lesson_id uuid references public.lessons(id) on delete set null,
  add column if not exists fsrs_card jsonb,
  add column if not exists next_review_at timestamptz,
  add column if not exists last_reviewed_at timestamptz,
  add column if not exists review_count integer not null default 0,
  add column if not exists correct_streak integer not null default 0;

-- Backfill lemma from the existing normalized_term before enforcing NOT NULL.
update public.vocabulary_entries
  set lemma = normalized_term
  where lemma is null;

update public.vocabulary_entries ve
  set language_code = ul.language_code
  from public.user_languages ul
  where ve.user_language_id = ul.id
    and ve.language_code is null;

alter table public.vocabulary_entries
  add constraint vocabulary_lemma_check check (lemma is null or length(btrim(lemma)) > 0),
  add constraint vocabulary_review_count_check check (review_count >= 0),
  add constraint vocabulary_correct_streak_check check (correct_streak >= 0);

-- A learner saves a given lemma once per language.
create unique index vocabulary_user_language_lemma_key
  on public.vocabulary_entries (user_id, language_code, lemma)
  where lemma is not null and language_code is not null;

create index vocabulary_due_idx
  on public.vocabulary_entries (user_id, language_code, next_review_at)
  where next_review_at is not null;

create index vocabulary_phrases_idx
  on public.vocabulary_entries (user_id, language_code)
  where lemma like '% %';

-- ---------------------------------------------------------------------------
-- Aggregated daily stats
-- ---------------------------------------------------------------------------
--
-- Pre-aggregated per user/language/day so the profile graphs never scan
-- activity_events.

create table public.daily_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language_code text not null references public.languages(code) on update cascade,
  stat_date date not null default current_date,
  words_read integer not null default 0,
  listening_seconds integer not null default 0,
  lingqs_created integer not null default 0,
  reviews_completed integer not null default 0,
  known_words integer not null default 0,
  coins integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_stats_non_negative_check check (
    words_read >= 0
    and listening_seconds >= 0
    and lingqs_created >= 0
    and reviews_completed >= 0
    and known_words >= 0
    and coins >= 0
  ),
  constraint daily_stats_user_language_date_key unique (user_id, language_code, stat_date)
);

create index daily_stats_range_idx
  on public.daily_stats (user_id, language_code, stat_date desc);

-- ---------------------------------------------------------------------------
-- Coins
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists coins integer not null default 0,
  add column if not exists equipped_mascot text,
  add column if not exists purchased_mascots text[] not null default '{}'::text[];

alter table public.profiles
  add constraint profiles_coins_check check (coins >= 0);

create table public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  action text not null,
  created_at timestamptz not null default now(),
  constraint coin_transactions_action_check check (length(btrim(action)) > 0),
  constraint coin_transactions_amount_check check (amount <> 0)
);

create index coin_transactions_user_date_idx
  on public.coin_transactions (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Challenges
-- ---------------------------------------------------------------------------

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  language_code text references public.languages(code) on update cascade,
  goal_metric text not null,
  goal_value integer not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint challenges_title_check check (length(btrim(title)) > 0),
  constraint challenges_goal_value_check check (goal_value > 0),
  constraint challenges_dates_check check (ends_at > starts_at),
  constraint challenges_goal_metric_check check (
    goal_metric in ('words_read', 'listening_seconds', 'lingqs_created', 'reviews_completed', 'coins')
  )
);

create index challenges_active_idx on public.challenges (starts_at, ends_at);

create table public.challenge_participants (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  progress integer not null default 0,
  completed_at timestamptz,
  joined_at timestamptz not null default now(),
  constraint challenge_participants_progress_check check (progress >= 0),
  constraint challenge_participants_unique_key unique (challenge_id, user_id)
);

-- Leaderboard ordering.
create index challenge_participants_leaderboard_idx
  on public.challenge_participants (challenge_id, progress desc);

create index challenge_participants_user_idx
  on public.challenge_participants (user_id);

-- ---------------------------------------------------------------------------
-- Review configuration
-- ---------------------------------------------------------------------------

create table public.user_review_config (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled_activities public.review_activity[] not null
    default '{flashcard,cloze,multiple_choice}'::public.review_activity[],
  multiple_choice_options integer not null default 4,
  daily_limit integer not null default 25,
  auto_play_tts boolean not null default true,
  flashcard_front text[] not null default '{term}'::text[],
  flashcard_back text[] not null default '{translation,phrase,status}'::text[],
  updated_at timestamptz not null default now(),
  constraint review_config_options_check
    check (multiple_choice_options between 2 and 6),
  -- LingQ caps "LingQs of the Day" at 200.
  constraint review_config_daily_limit_check
    check (daily_limit between 1 and 200),
  constraint review_config_activities_check
    check (array_length(enabled_activities, 1) >= 1)
);

-- ---------------------------------------------------------------------------
-- Lesson progress extensions
-- ---------------------------------------------------------------------------

-- words_read and reader_position already exist; paged and sentence modes need
-- their own cursors so switching modes preserves both positions.
alter table public.lesson_progress
  add column if not exists last_page integer not null default 1,
  add column if not exists last_sentence integer not null default 0;

alter table public.lesson_progress
  add constraint lesson_progress_page_check check (last_page >= 1),
  add constraint lesson_progress_sentence_check check (last_sentence >= 0);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.courses enable row level security;
alter table public.lesson_tags enable row level security;
alter table public.word_statuses enable row level security;
alter table public.daily_stats enable row level security;
alter table public.coin_transactions enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.user_review_config enable row level security;

-- Courses: published are public, drafts are owner-only.
create policy courses_select_published_anon
on public.courses for select
to anon
using (is_published);

create policy courses_select_visible_authenticated
on public.courses for select
to authenticated
using (is_published or (select auth.uid()) = owner_id);

create policy courses_insert_own
on public.courses for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy courses_update_own
on public.courses for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy courses_delete_own
on public.courses for delete
to authenticated
using ((select auth.uid()) = owner_id);

-- Lesson tags follow the visibility of their lesson.
create policy lesson_tags_select_visible
on public.lesson_tags for select
to anon, authenticated
using (
  exists (
    select 1
    from public.lessons l
    where l.id = lesson_id
      and (l.is_published or l.owner_id = (select auth.uid()))
  )
);

create policy lesson_tags_write_own_lesson
on public.lesson_tags for all
to authenticated
using (
  exists (
    select 1 from public.lessons l
    where l.id = lesson_id and l.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.lessons l
    where l.id = lesson_id and l.owner_id = (select auth.uid())
  )
);

-- Word statuses, stats, coins and review config are strictly private.
create policy word_statuses_select_own
on public.word_statuses for select
to authenticated
using ((select auth.uid()) = user_id);

create policy word_statuses_insert_own
on public.word_statuses for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy word_statuses_update_own
on public.word_statuses for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy word_statuses_delete_own
on public.word_statuses for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy daily_stats_select_own
on public.daily_stats for select
to authenticated
using ((select auth.uid()) = user_id);

create policy daily_stats_insert_own
on public.daily_stats for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy daily_stats_update_own
on public.daily_stats for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy coin_transactions_select_own
on public.coin_transactions for select
to authenticated
using ((select auth.uid()) = user_id);

create policy coin_transactions_insert_own
on public.coin_transactions for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy user_review_config_select_own
on public.user_review_config for select
to authenticated
using ((select auth.uid()) = user_id);

create policy user_review_config_insert_own
on public.user_review_config for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy user_review_config_update_own
on public.user_review_config for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Challenges are readable by everyone; only the participant row is writable.
create policy challenges_select_all
on public.challenges for select
to anon, authenticated
using (true);

-- Leaderboards are intentionally public across participants of a challenge.
create policy challenge_participants_select_all
on public.challenge_participants for select
to authenticated
using (true);

create policy challenge_participants_insert_own
on public.challenge_participants for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy challenge_participants_update_own
on public.challenge_participants for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy challenge_participants_delete_own
on public.challenge_participants for delete
to authenticated
using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger courses_set_updated_at
before update on public.courses
for each row execute function private.set_updated_at();

create trigger word_statuses_set_updated_at
before update on public.word_statuses
for each row execute function private.set_updated_at();

create trigger daily_stats_set_updated_at
before update on public.daily_stats
for each row execute function private.set_updated_at();

create trigger user_review_config_set_updated_at
before update on public.user_review_config
for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
--
-- The bootstrap revokes everything in public by default, so each new table
-- must be opted into the Data API explicitly.

grant select on public.courses to anon, authenticated;
grant insert, update, delete on public.courses to authenticated;

grant select on public.lesson_tags to anon, authenticated;
grant insert, update, delete on public.lesson_tags to authenticated;

grant select, insert, update, delete on public.word_statuses to authenticated;
grant select, insert, update on public.daily_stats to authenticated;
grant select, insert on public.coin_transactions to authenticated;

grant select on public.challenges to anon, authenticated;
grant select, insert, update, delete on public.challenge_participants to authenticated;
grant select, insert, update on public.user_review_config to authenticated;

-- ---------------------------------------------------------------------------
-- Helper: upsert a word status
-- ---------------------------------------------------------------------------
--
-- The reader marks words known in bulk (paging moves to known), so a single
-- round-trip per page matters.

create or replace function public.set_word_statuses(
  p_language_code text,
  p_lemmas text[],
  p_status public.word_status
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected integer;
begin
  if p_lemmas is null or array_length(p_lemmas, 1) is null then
    return 0;
  end if;

  insert into public.word_statuses (user_id, language_code, lemma, status)
  select auth.uid(), p_language_code, lemma, p_status
  from unnest(p_lemmas) as lemma
  where length(btrim(lemma)) > 0
  on conflict (user_id, language_code, lemma)
    do update set status = excluded.status, updated_at = now();

  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke all on function public.set_word_statuses(text, text[], public.word_status)
  from public, anon;

grant execute on function public.set_word_statuses(text, text[], public.word_status)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Helper: increment daily stats
-- ---------------------------------------------------------------------------

create or replace function public.bump_daily_stats(
  p_language_code text,
  p_words_read integer default 0,
  p_listening_seconds integer default 0,
  p_lingqs_created integer default 0,
  p_reviews_completed integer default 0,
  p_coins integer default 0
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.daily_stats (
    user_id, language_code, stat_date,
    words_read, listening_seconds, lingqs_created, reviews_completed, coins
  )
  values (
    auth.uid(), p_language_code, current_date,
    greatest(p_words_read, 0), greatest(p_listening_seconds, 0),
    greatest(p_lingqs_created, 0), greatest(p_reviews_completed, 0),
    greatest(p_coins, 0)
  )
  on conflict (user_id, language_code, stat_date) do update set
    words_read = daily_stats.words_read + greatest(p_words_read, 0),
    listening_seconds = daily_stats.listening_seconds + greatest(p_listening_seconds, 0),
    lingqs_created = daily_stats.lingqs_created + greatest(p_lingqs_created, 0),
    reviews_completed = daily_stats.reviews_completed + greatest(p_reviews_completed, 0),
    coins = daily_stats.coins + greatest(p_coins, 0),
    updated_at = now();
end;
$$;

revoke all on function public.bump_daily_stats(text, integer, integer, integer, integer, integer)
  from public, anon;

grant execute on function public.bump_daily_stats(text, integer, integer, integer, integer, integer)
  to authenticated;

