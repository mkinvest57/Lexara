begin;

create extension if not exists pgtap with schema extensions;

select plan(13);

select is(
  (
    select count(*)::integer
    from pg_class
    join pg_namespace on pg_namespace.oid = pg_class.relnamespace
    where pg_namespace.nspname = 'public'
      and pg_class.relkind = 'r'
      and pg_class.relrowsecurity
  ),
  15,
  'RLS is enabled on every Immerli public table'
);

select is(
  (select count(*)::integer from pg_policies where schemaname = 'public'),
  52,
  'the complete policy set is installed'
);

insert into auth.users (id, email)
values
  ('10000000-0000-4000-8000-000000000001', 'learner-a@example.test'),
  ('20000000-0000-4000-8000-000000000002', 'learner-b@example.test');

select is(
  (select count(*)::integer from public.profiles),
  2,
  'the Auth trigger provisions one profile per identity'
);

select is(
  (select count(*)::integer from public.playlists where is_default),
  2,
  'the Auth trigger provisions one default playlist per identity'
);

set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000001';

select lives_ok(
  $$
    insert into public.user_languages (
      user_id,
      language_code,
      level,
      is_active
    ) values (
      '10000000-0000-4000-8000-000000000001',
      'es',
      'beginner',
      true
    )
  $$,
  'a learner can add their own study language'
);

select lives_ok(
  $$
    insert into public.lessons (
      owner_id,
      language_code,
      title,
      content,
      word_count
    ) values (
      '10000000-0000-4000-8000-000000000001',
      'es',
      'Mi lección',
      'Hola, este texto es privado.',
      5
    )
  $$,
  'a learner can create a private imported lesson'
);

select lives_ok(
  $$
    insert into public.vocabulary_entries (
      user_id,
      user_language_id,
      term,
      normalized_term,
      translation
    )
    select
      user_id,
      id,
      'Hola',
      'hola',
      'Bonjour'
    from public.user_languages
    where user_id = '10000000-0000-4000-8000-000000000001'
      and language_code = 'es'
  $$,
  'a learner can save vocabulary in their own language profile'
);

select is(
  (select count(*)::integer from public.srs_items),
  1,
  'saving vocabulary automatically creates its SRS schedule'
);

select throws_ok(
  $$
    update public.lessons
    set is_published = true,
        published_at = now()
    where owner_id = '10000000-0000-4000-8000-000000000001'
  $$,
  '42501',
  'new row violates row-level security policy for table "lessons"',
  'a learner cannot self-publish imported content'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '20000000-0000-4000-8000-000000000002';

select is(
  (select count(*)::integer from public.vocabulary_entries),
  0,
  'a second learner cannot read another learner vocabulary'
);

select results_eq(
  $$
    update public.vocabulary_entries
    set translation = 'Compromised'
    where user_id = '10000000-0000-4000-8000-000000000001'
    returning 1
  $$,
  $$ values (1) limit 0 $$,
  'a second learner cannot update another learner vocabulary'
);

reset role;
set local role anon;

select is(
  (select count(*)::integer from public.languages),
  9,
  'anonymous clients can read the enabled language catalog'
);

select throws_ok(
  $$ select * from public.profiles $$,
  '42501',
  'permission denied for table profiles',
  'anonymous clients have no object privilege on profiles'
);

reset role;

select * from finish();

rollback;
