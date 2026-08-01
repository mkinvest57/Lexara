-- Enum extensions, isolated in their own migration.
--
-- Postgres forbids using a value added by ALTER TYPE ... ADD VALUE inside the
-- same transaction that adds it. Supabase wraps each migration in a
-- transaction, so these additions must land before any migration or seed that
-- references them.

-- LingQ splits each level in two (Beginner 1/2, Intermediate 1/2, Advanced 1/2).
alter type public.proficiency_level add value if not exists 'beginner_2' after 'beginner';
alter type public.proficiency_level add value if not exists 'intermediate_2' after 'intermediate';
alter type public.proficiency_level add value if not exists 'advanced_2' after 'advanced';

alter type public.lesson_kind add value if not exists 'mini_story';
alter type public.lesson_kind add value if not exists 'grammar';
alter type public.lesson_kind add value if not exists 'news';
alter type public.lesson_kind add value if not exists 'song';
