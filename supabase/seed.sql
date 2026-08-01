-- YAPRO seed content.
--
-- These lessons previously lived as string constants in
-- apps/web/src/lib/product-store.ts. They belong in the database: the store is
-- a cache, not a source of truth.
--
-- Published lessons have no owner, which makes them readable by anon under the
-- existing `lessons_select_published_anon` policy.

-- ---------------------------------------------------------------------------
-- Extra languages beyond the bootstrap nine
-- ---------------------------------------------------------------------------

insert into public.languages (code, english_name, native_name, flag_emoji)
values
  ('ru', 'Russian', 'Русский', '🇷🇺'),
  ('ar', 'Arabic', 'العربية', '🇸🇦'),
  ('nl', 'Dutch', 'Nederlands', '🇳🇱'),
  ('sv', 'Swedish', 'Svenska', '🇸🇪'),
  ('pl', 'Polish', 'Polski', '🇵🇱'),
  ('tr', 'Turkish', 'Türkçe', '🇹🇷'),
  ('el', 'Greek', 'Ελληνικά', '🇬🇷'),
  ('he', 'Hebrew', 'עברית', '🇮🇱'),
  ('hi', 'Hindi', 'हिन्दी', '🇮🇳'),
  ('th', 'Thai', 'ไทย', '🇹🇭'),
  ('vi', 'Vietnamese', 'Tiếng Việt', '🇻🇳'),
  ('uk', 'Ukrainian', 'Українська', '🇺🇦'),
  ('cs', 'Czech', 'Čeština', '🇨🇿'),
  ('da', 'Danish', 'Dansk', '🇩🇰'),
  ('fi', 'Finnish', 'Suomi', '🇫🇮'),
  ('no', 'Norwegian', 'Norsk', '🇳🇴'),
  ('ro', 'Romanian', 'Română', '🇷🇴'),
  ('id', 'Indonesian', 'Bahasa Indonesia', '🇮🇩')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Courses
-- ---------------------------------------------------------------------------

insert into public.courses (id, language_code, title, description, level, position, is_published)
values
  (
    '11111111-1111-4111-8111-111111111101',
    'en',
    'Mini-histoires · Niveau 1',
    'Histoires courtes à audio natif, répétant le vocabulaire à haute fréquence.',
    'beginner',
    1,
    true
  ),
  (
    '11111111-1111-4111-8111-111111111102',
    'en',
    'Formations guidées',
    'Méthode de lecture et d''écoute, une habitude par leçon.',
    'beginner',
    2,
    true
  ),
  (
    '11111111-1111-4111-8111-111111111103',
    'en',
    'Actualités faciles',
    'Actualités locales courtes pour le vocabulaire du quotidien.',
    'intermediate',
    3,
    true
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Mini stories
-- ---------------------------------------------------------------------------

insert into public.lessons (
  id, owner_id, language_code, course_id, title, description, kind, level,
  content, translation, word_count, duration_seconds, collection,
  cover_image_url, course_position, is_published, published_at
)
values
  (
    '22222222-2222-4222-8222-000000000001',
    null,
    'en',
    '11111111-1111-4111-8111-111111111101',
    '1a · Mike est cuisinier, première partie',
    'Mike ouvre la cuisine avant le réveil de la ville.',
    'mini_story',
    'beginner',
    'Every morning, Mike opens the little kitchen before the city wakes. He checks the bread, warms the pans, and writes the menu on a small blackboard. Today, a new guest arrives early and asks about the soup. Mike smiles and explains that the vegetables came from the market across the river. The guest chooses a table near the window and listens while the first buses begin to move outside.',
    'Chaque matin, Mike ouvre la petite cuisine avant le réveil de la ville. Il vérifie le pain, chauffe les poêles et écrit le menu sur un petit tableau noir.',
    94,
    168,
    'Mini-histoires',
    '/lessons/mike-kitchen.jpg',
    1,
    true,
    now()
  ),
  (
    '22222222-2222-4222-8222-000000000002',
    null,
    'en',
    '11111111-1111-4111-8111-111111111101',
    '1b · Mike au marché, deuxième partie',
    'Mike fait ses courses au marché du samedi.',
    'mini_story',
    'beginner',
    'Mike walks to the Saturday market with a short list in his pocket. The square is already bright with fruit, flowers, and people calling to their neighbours. He tastes a tomato, chooses fresh herbs, and speaks with Anna at the cheese stall. They compare recipes and decide to cook dinner together after work.',
    'Mike va au marché du samedi avec une courte liste dans sa poche. La place est déjà pleine de fruits, de fleurs et de voisins.',
    82,
    151,
    'Mini-histoires',
    '/lessons/mike-market.jpg',
    2,
    true,
    now()
  ),
  (
    '22222222-2222-4222-8222-000000000003',
    null,
    'en',
    '11111111-1111-4111-8111-111111111101',
    '1c · Anna attend son train',
    'Anna patiente à la gare sous la pluie.',
    'mini_story',
    'beginner',
    'Anna reaches the station just as the rain begins. Her train is delayed, so she buys a coffee and watches travellers hurry beneath the old clock. A child drops a red scarf near the platform. Anna picks it up and returns it to his father before her train finally appears.',
    'Anna arrive à la gare au moment où la pluie commence. Son train est retardé, alors elle achète un café.',
    76,
    136,
    'Mini-histoires',
    '/lessons/anna-station.jpg',
    3,
    true,
    now()
  ),
  (
    '22222222-2222-4222-8222-000000000004',
    null,
    'en',
    '11111111-1111-4111-8111-111111111101',
    '2 · Stella redécouvre sa ville',
    'Une promenade attentive en fin d''après-midi.',
    'mini_story',
    'beginner_2',
    'Stella loves walking through the city at the quiet end of the afternoon. She notices balconies full of plants, small cafés preparing for dinner, and musicians testing their instruments. Each street feels familiar, but there is always one doorway or conversation she has never noticed before.',
    'Stella aime marcher dans la ville à la fin tranquille de l''après-midi. Elle remarque les balcons pleins de plantes.',
    71,
    127,
    'Mini-histoires',
    '/lessons/stella-city.jpg',
    4,
    true,
    now()
  ),
  (
    '22222222-2222-4222-8222-000000000005',
    null,
    'en',
    '11111111-1111-4111-8111-111111111101',
    '3 · Cinq habitudes pour mieux lire',
    'Un court podcast sur les habitudes de lecture.',
    'podcast',
    'beginner_2',
    'Welcome to the Daily Five, a short podcast for curious language learners. In today''s episode, we look at five simple habits that make reading easier: choose a calm place, read a little every day, keep moving when a word is unclear, save only useful vocabulary, and return to stories you genuinely enjoy.',
    'Bienvenue dans le Daily Five, un court podcast pour les apprenants curieux. Aujourd''hui, nous observons cinq habitudes simples.',
    86,
    184,
    'Mini-histoires',
    '/lessons/daily-podcast.jpg',
    5,
    true,
    now()
  ),
  (
    '22222222-2222-4222-8222-000000000006',
    null,
    'en',
    '11111111-1111-4111-8111-111111111103',
    '4 · Le marché ouvre plus tard',
    'Le conseil municipal teste de nouveaux horaires.',
    'news',
    'intermediate',
    'The neighbourhood market will stay open later this summer after residents asked for more evening hours. Local farmers say the change will help people shop after work. The council will test the new schedule for six weeks and collect feedback from visitors and stall owners.',
    'Le marché du quartier restera ouvert plus tard cet été après la demande des habitants.',
    69,
    159,
    'Actualités faciles',
    '/lessons/market-news.jpg',
    1,
    true,
    now()
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Guided courses and articles
-- ---------------------------------------------------------------------------

insert into public.lessons (
  id, owner_id, language_code, course_id, title, description, kind, level,
  content, translation, word_count, duration_seconds, collection,
  cover_image_url, course_position, is_published, published_at
)
values
  (
    '22222222-2222-4222-8222-000000000007',
    null,
    'en',
    '11111111-1111-4111-8111-111111111102',
    'Lire sans tout traduire',
    'Garder le rythme sans interrompre chaque phrase.',
    'story',
    'beginner',
    'Reading in a new language works best when you keep moving. Choose a text slightly above your level, read a whole paragraph before stopping, and let unclear words pass on the first attempt. Meaning often arrives from the sentences around a word rather than from the word itself. Save only the vocabulary you expect to meet again.',
    'Une méthode courte pour conserver le rythme et comprendre le sens général sans interrompre chaque phrase.',
    104,
    252,
    'Pour vous',
    '/lessons/daily-podcast.jpg',
    1,
    true,
    now()
  ),
  (
    '22222222-2222-4222-8222-000000000008',
    null,
    'en',
    '11111111-1111-4111-8111-111111111102',
    'Écouter avec le texte',
    'Associer audio et lecture pour ancrer le rythme.',
    'story',
    'beginner_2',
    'Listening and reading together builds sound and meaning at the same time. Play the audio once without looking at the text and accept that much will escape you. Then read along while it plays again, noticing where sentences rise and fall. Finally, listen with your eyes closed and see how much more settles into place.',
    'Écoutez une première fois, puis relisez le texte en remarquant le rythme des phrases.',
    88,
    226,
    'Pour vous',
    '/lessons/anna-station.jpg',
    2,
    true,
    now()
  ),
  (
    '22222222-2222-4222-8222-000000000009',
    null,
    'en',
    '11111111-1111-4111-8111-111111111102',
    'Comprendre les mots en contexte',
    'S''appuyer sur la phrase avant de sauvegarder un sens.',
    'story',
    'intermediate',
    'A word rarely carries one fixed meaning. Before saving a definition, read the full sentence and ask what role the word plays in it. The same word can be a warning in one story and an invitation in another. Saving the sentence alongside the word gives your future self the context needed to recognise it again.',
    'Appuyez-vous sur la phrase complète avant de sauvegarder une nouvelle signification.',
    118,
    302,
    'Pour vous',
    '/lessons/mike-kitchen.jpg',
    3,
    true,
    now()
  ),
  (
    '22222222-2222-4222-8222-00000000000a',
    null,
    'en',
    '11111111-1111-4111-8111-111111111102',
    'Raconter une histoire simple',
    'Reformuler l''idée principale avec ses propres mots.',
    'story',
    'intermediate',
    'Retelling is the fastest way to turn recognition into production. Read a short story twice, close the text, and describe what happened in your own words. You will reach for vocabulary you only half know, and those gaps show you exactly what to study next. Speak aloud even when no one is listening.',
    'Relisez, fermez le texte, puis racontez l''idée principale avec vos propres mots.',
    97,
    277,
    'Pour vous',
    '/lessons/stella-city.jpg',
    4,
    true,
    now()
  ),
  (
    '22222222-2222-4222-8222-00000000000b',
    null,
    'en',
    '11111111-1111-4111-8111-111111111103',
    'Nouvelles du quartier',
    'Actualité locale courte pour le vocabulaire du quotidien.',
    'news',
    'beginner_2',
    'Residents gathered on Tuesday evening to discuss the future of the old library building. Some want a community centre, others prefer a covered market. The council promised to publish every proposal online and to hold a second meeting before deciding anything.',
    'Une actualité locale courte, pensée pour développer le vocabulaire du quotidien.',
    69,
    159,
    'Actualités faciles',
    '/lessons/market-news.jpg',
    2,
    true,
    now()
  ),
  (
    '22222222-2222-4222-8222-00000000000c',
    null,
    'en',
    '11111111-1111-4111-8111-111111111103',
    'Carnet de ville',
    'Un portrait attentif de la ville et de ses voix.',
    'article',
    'intermediate_2',
    'The city keeps two rhythms at once. In the morning it belongs to deliveries, school runs and the shutters of small shops rolling up. By late evening the same streets slow into conversation, and the noise that felt like interruption in daylight becomes company. Living well here means learning which rhythm you are in.',
    'Un portrait attentif de la ville, de ses voix et des petits détails que l''on oublie de regarder.',
    121,
    318,
    'Actualités faciles',
    '/lessons/stella-city.jpg',
    3,
    true,
    now()
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Lesson tags
-- ---------------------------------------------------------------------------

insert into public.lesson_tags (lesson_id, tag)
select id, 'mini-story'
from public.lessons
where kind = 'mini_story'
on conflict (lesson_id, tag) do nothing;

insert into public.lesson_tags (lesson_id, tag)
values
  ('22222222-2222-4222-8222-000000000005', 'podcast'),
  ('22222222-2222-4222-8222-000000000006', 'news'),
  ('22222222-2222-4222-8222-00000000000b', 'news'),
  ('22222222-2222-4222-8222-00000000000c', 'city')
on conflict (lesson_id, tag) do nothing;

-- ---------------------------------------------------------------------------
-- Sample challenges
-- ---------------------------------------------------------------------------

insert into public.challenges (
  id, title, description, language_code, goal_metric, goal_value, starts_at, ends_at
)
values
  (
    '33333333-3333-4333-8333-000000000001',
    'Défi 90 jours',
    'Lire 500 mots par jour pendant 90 jours.',
    null,
    'words_read',
    45000,
    date_trunc('day', now()),
    date_trunc('day', now()) + interval '90 days'
  ),
  (
    '33333333-3333-4333-8333-000000000002',
    'Sprint vocabulaire du mois',
    'Créer 300 LingQs ce mois-ci.',
    null,
    'lingqs_created',
    300,
    date_trunc('month', now()),
    date_trunc('month', now()) + interval '1 month'
  )
on conflict (id) do nothing;


