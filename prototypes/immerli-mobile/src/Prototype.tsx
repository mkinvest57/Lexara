import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  ArrowRightIcon,
  BarChartIcon,
  BellIcon,
  BookmarkIcon,
  CameraIcon,
  CardStackIcon,
  ChatBubbleIcon,
  CheckCircledIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  Cross1Icon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  DownloadIcon,
  EyeOpenIcon,
  FileTextIcon,
  GearIcon,
  GlobeIcon,
  HeartFilledIcon,
  HeartIcon,
  HomeIcon,
  InfoCircledIcon,
  LightningBoltIcon,
  Link2Icon,
  ListBulletIcon,
  MagicWandIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  PauseIcon,
  Pencil1Icon,
  PersonIcon,
  PlayIcon,
  PlusIcon,
  QuestionMarkCircledIcon,
  ReaderIcon,
  ReloadIcon,
  RocketIcon,
  SpeakerLoudIcon,
  StarIcon,
  StopwatchIcon,
  TrashIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import {
  BottomSheet,
  Carousel,
  FlowStack,
  KeyboardInput,
  KeyboardTextarea,
  MobileScroll,
  type FlowControls,
  type FlowScreen,
  useKeyboard,
} from "./mobile";

type Tab = "library" | "vocabulary" | "playlist" | "more";
type ImportMode = "url" | "scan" | "text" | "file";

type Lesson = {
  id: string;
  title: string;
  source: string;
  level: number;
  words: number;
  imagePosition: string;
  category: "continue" | "guided" | "popular" | "news" | "imported";
  text: string;
};

type VocabularyWord = {
  id: string;
  term: string;
  translation: string;
  context: string;
  level: number;
  known: boolean;
};

type Preferences = {
  sound: boolean;
  reminders: boolean;
  autoplay: boolean;
};

type AppContextValue = {
  lessons: Lesson[];
  vocabulary: VocabularyWord[];
  playlist: string[];
  likedLessons: string[];
  language: string;
  profileName: string;
  searchOpen: boolean;
  preferences: Preferences;
  completedLessons: number;
  coins: number;
  setLanguage: (language: string) => void;
  setProfileName: (name: string) => void;
  setSearchOpen: (open: boolean) => void;
  setPreference: (key: keyof Preferences, value: boolean) => void;
  addLesson: (input: { title: string; source: string; text: string }) => Lesson;
  saveWord: (word: Omit<VocabularyWord, "id" | "level" | "known">) => void;
  gradeWord: (term: string, level: number, known?: boolean) => void;
  removeWord: (term: string) => void;
  togglePlaylist: (lessonId: string) => void;
  clearPlaylist: () => void;
  toggleLiked: (lessonId: string) => void;
  completeLesson: () => void;
};

const defaultText =
  "A quiet café sits near the park. Every Thursday, Lucia takes the same table by the window. She orders tea, opens her notebook, and writes three things that made her grateful. Outside, the city slowly wakes up. The waiter knows her name and smiles when she arrives.";

const seedLessons: Lesson[] = [
  {
    id: "small-talk-1",
    title: "1. Hello! How are you?",
    source: "Greetings and Goodbyes",
    level: 1,
    words: 67,
    imagePosition: "78% 32%",
    category: "continue",
    text: defaultText,
  },
  {
    id: "meeting-people",
    title: "Meeting People",
    source: "Mini Stories",
    level: 1,
    words: 184,
    imagePosition: "96% 15%",
    category: "continue",
    text: defaultText,
  },
  {
    id: "who-is-she",
    title: "Who is She?",
    source: "Formation Guidée",
    level: 2,
    words: 296,
    imagePosition: "57% 78%",
    category: "guided",
    text: defaultText,
  },
  {
    id: "lingua-stories",
    title: "Everyday English",
    source: "Formation Guidée",
    level: 2,
    words: 348,
    imagePosition: "24% 72%",
    category: "guided",
    text: defaultText,
  },
  {
    id: "easy-english",
    title: "Easy English Conversations",
    source: "Populaire",
    level: 3,
    words: 522,
    imagePosition: "73% 17%",
    category: "popular",
    text: defaultText,
  },
  {
    id: "tiny-habits",
    title: "Tiny Habits, Big Results",
    source: "Populaire",
    level: 3,
    words: 634,
    imagePosition: "12% 27%",
    category: "popular",
    text: defaultText,
  },
  {
    id: "world-today",
    title: "The World Today",
    source: "Actualités en anglais",
    level: 4,
    words: 418,
    imagePosition: "87% 82%",
    category: "news",
    text: defaultText,
  },
  {
    id: "science-daily",
    title: "Science in Five Minutes",
    source: "Actualités en anglais",
    level: 4,
    words: 714,
    imagePosition: "37% 48%",
    category: "news",
    text: defaultText,
  },
];

const translations: Record<string, string> = {
  quiet: "calme",
  café: "café",
  park: "parc",
  every: "chaque",
  thursday: "jeudi",
  table: "table",
  window: "fenêtre",
  orders: "commande",
  notebook: "carnet",
  grateful: "reconnaissante",
  city: "ville",
  waiter: "serveur",
  smiles: "sourit",
};

const AppContext = createContext<AppContextValue | null>(null);

function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}

function AppProvider({ children }: { children: ReactNode }) {
  const [lessons, setLessons] = useState(seedLessons);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [likedLessons, setLikedLessons] = useState<string[]>([]);
  const [language, setLanguage] = useState("anglais");
  const [profileName, setProfileName] = useState("Demo");
  const [searchOpen, setSearchOpen] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({ sound: true, reminders: true, autoplay: false });
  const [completedLessons, setCompletedLessons] = useState(4);
  const [coins, setCoins] = useState(326);

  const addLesson = useCallback((input: { title: string; source: string; text: string }) => {
    const lesson: Lesson = {
      id: `imported-${Date.now()}`,
      title: input.title.trim() || "Ma nouvelle leçon",
      source: input.source,
      level: 1,
      words: Math.max(1, input.text.trim().split(/\s+/).length),
      imagePosition: "66% 44%",
      category: "imported",
      text: input.text.trim() || defaultText,
    };
    setLessons((current) => [lesson, ...current]);
    return lesson;
  }, []);

  const saveWord = useCallback((word: Omit<VocabularyWord, "id" | "level" | "known">) => {
    setVocabulary((current) => {
      const found = current.find((entry) => entry.term.toLowerCase() === word.term.toLowerCase());
      if (found) {
        return current.map((entry) =>
          entry.id === found.id ? { ...entry, translation: word.translation, context: word.context } : entry,
        );
      }
      return [{ ...word, id: `word-${Date.now()}-${word.term}`, level: 1, known: false }, ...current];
    });
    setCoins((current) => current + 1);
  }, []);

  const gradeWord = useCallback((term: string, level: number, known = false) => {
    setVocabulary((current) => {
      const found = current.find((entry) => entry.term.toLowerCase() === term.toLowerCase());
      if (!found) {
        return [
          {
            id: `word-${Date.now()}-${term}`,
            term,
            translation: translations[term.toLowerCase()] || "traduction",
            context: defaultText.split(".")[0],
            level,
            known,
          },
          ...current,
        ];
      }
      return current.map((entry) => (entry.id === found.id ? { ...entry, level, known } : entry));
    });
  }, []);

  const removeWord = useCallback((term: string) => {
    setVocabulary((current) => current.filter((entry) => entry.term.toLowerCase() !== term.toLowerCase()));
  }, []);

  const togglePlaylist = useCallback((lessonId: string) => {
    setPlaylist((current) =>
      current.includes(lessonId) ? current.filter((id) => id !== lessonId) : [...current, lessonId],
    );
  }, []);

  const clearPlaylist = useCallback(() => setPlaylist([]), []);

  const toggleLiked = useCallback((lessonId: string) => {
    setLikedLessons((current) =>
      current.includes(lessonId) ? current.filter((id) => id !== lessonId) : [...current, lessonId],
    );
  }, []);

  const setPreference = useCallback((key: keyof Preferences, value: boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  }, []);

  const completeLesson = useCallback(() => {
    setCompletedLessons((current) => current + 1);
    setCoins((current) => current + 25);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      lessons,
      vocabulary,
      playlist,
      likedLessons,
      language,
      profileName,
      searchOpen,
      preferences,
      completedLessons,
      coins,
      setLanguage,
      setProfileName,
      setSearchOpen,
      setPreference,
      addLesson,
      saveWord,
      gradeWord,
      removeWord,
      togglePlaylist,
      clearPlaylist,
      toggleLiked,
      completeLesson,
    }),
    [
      addLesson,
      clearPlaylist,
      coins,
      completeLesson,
      completedLessons,
      gradeWord,
      language,
      lessons,
      likedLessons,
      playlist,
      preferences,
      profileName,
      removeWord,
      saveWord,
      searchOpen,
      setPreference,
      toggleLiked,
      togglePlaylist,
      vocabulary,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

function IconButton({ label, onClick, children, className = "" }: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function LanguageMark() {
  return <span className="language-mark" aria-hidden="true"><GlobeIcon /><b>EN</b></span>;
}

function RootHeader({ flow, tab }: { flow: FlowControls; tab: Tab }) {
  const { language, setSearchOpen, searchOpen } = useApp();
  if (tab === "library") {
    return (
      <div className="root-header library-root-header">
        <button className="language-switcher" onClick={() => flow.push(makeLanguageScreen())}>
          <LanguageMark />
          <span><strong>{language}</strong><small>Changer de langue</small></span>
          <ChevronDownIcon />
        </button>
        <div className="header-actions">
          <IconButton label={searchOpen ? "Fermer la recherche" : "Rechercher"} onClick={() => setSearchOpen(!searchOpen)}>
            {searchOpen ? <Cross1Icon /> : <MagnifyingGlassIcon />}
          </IconButton>
          <IconButton label="Réglages" onClick={() => flow.push(makeSettingsScreen())}><GearIcon /></IconButton>
        </div>
      </div>
    );
  }

  const title = tab === "vocabulary" ? "Vocabulaire" : tab === "playlist" ? "Liste de lecture" : "Plus";
  return (
    <div className="root-header simple-root-header">
      <div className="root-title-wrap">
        {tab === "vocabulary" ? <LanguageMark /> : tab === "playlist" ? <span className="title-icon green"><ListBulletIcon /></span> : null}
        <div><h1>{title}</h1>{tab === "playlist" ? <span>Playlist active</span> : null}</div>
      </div>
      <div className="header-actions">
        {tab === "vocabulary" ? (
          <IconButton label="Ajouter un mot" onClick={() => flow.push(makeAddWordScreen())}><PlusIcon /></IconButton>
        ) : null}
        <IconButton
          label={tab === "more" ? "Réglages" : "Plus d’options"}
          onClick={() => tab === "more" ? flow.push(makeSettingsScreen()) : flow.push(makeInfoScreen("Options", "Toutes vos préférences sont disponibles dans les réglages."))}
        >
          {tab === "more" ? <GearIcon /> : <DotsHorizontalIcon />}
        </IconButton>
      </div>
    </div>
  );
}

const tabItems: Array<{ id: Tab; label: string; icon: ReactNode }> = [
  { id: "library", label: "Bibliothèque", icon: <HomeIcon /> },
  { id: "vocabulary", label: "Vocabulaire", icon: <BookmarkIcon /> },
  { id: "playlist", label: "Playlist", icon: <ListBulletIcon /> },
  { id: "more", label: "Plus", icon: <DotsHorizontalIcon /> },
];

function TabBar({ flow, active }: { flow: FlowControls; active: Tab }) {
  return (
    <div className="tab-shell">
      <nav className="tab-bar" aria-label="Navigation principale">
        {tabItems.map((item) => (
          <button
            key={item.id}
            className={`tab-item ${active === item.id ? "active" : ""}`}
            aria-current={active === item.id ? "page" : undefined}
            onClick={() => flow.replace(makeRootScreen(item.id))}
          >
            {item.icon}<span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function ProgressSummary({ flow }: { flow: FlowControls }) {
  const { coins, vocabulary, completedLessons } = useApp();
  return (
    <button className="progress-summary" onClick={() => flow.push(makeStatsScreen())}>
      <span className="streak-disc"><LightningBoltIcon /></span>
      <span><strong>{completedLessons + 2} jours</strong><small>Série actuelle</small></span>
      <span className="summary-divider" />
      <span className="coin-disc"><StarIcon /></span>
      <span><strong>{coins}</strong><small>{vocabulary.length} mots</small></span>
      <ChevronRightIcon />
    </button>
  );
}

function LessonCard({ lesson, onOpen }: { lesson: Lesson; onOpen: () => void }) {
  return (
    <button className="lesson-card" onClick={onOpen}>
      <span className="lesson-cover" style={{ backgroundPosition: lesson.imagePosition }}>
        <span className="level-badge">{lesson.level}</span>
      </span>
      <span className="lesson-card-copy">
        <strong>{lesson.title}</strong>
        <small>{lesson.source}</small>
        <span className="lesson-metrics"><b>{lesson.words}</b> mots <i /> <b>{Math.max(1, Math.round(lesson.words / 86))}</b> min</span>
      </span>
    </button>
  );
}

function LessonShelf({ title, lessons, flow }: { title: string; lessons: Lesson[]; flow: FlowControls }) {
  return (
    <section className="library-section">
      <div className="section-title-row"><h2>{title}</h2><button onClick={() => flow.push(makeShelfScreen(title, lessons.map((lesson) => lesson.id)))}>Tout voir <ChevronRightIcon /></button></div>
      <Carousel className="lesson-carousel" contentClassName="lesson-carousel-track" ariaLabel={title}>
        {lessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} onOpen={() => flow.push(makeReaderScreen(lesson.id))} />)}
      </Carousel>
    </section>
  );
}

function ImportSheet({ open, onOpenChange, flow }: { open: boolean; onOpenChange: (open: boolean) => void; flow: FlowControls }) {
  const options: Array<{ mode: ImportMode; label: string; icon: ReactNode }> = [
    { mode: "url", label: "URL", icon: <Link2Icon /> },
    { mode: "scan", label: "Scanner", icon: <CameraIcon /> },
    { mode: "text", label: "Texte", icon: <FileTextIcon /> },
    { mode: "file", label: "Fichier", icon: <UploadIcon /> },
  ];
  const choose = (mode: ImportMode) => {
    onOpenChange(false);
    flow.push(makeImportScreen(mode));
  };
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Importer une leçon" description="Ajoutez n’importe quel contenu à votre bibliothèque." snap={0.5}>
      <div className="import-grid">
        {options.map((option) => (
          <button key={option.mode} className="import-option" onClick={() => choose(option.mode)}>
            <span>{option.icon}</span><strong>{option.label}</strong>
          </button>
        ))}
      </div>
      <button className="sheet-cancel" onClick={() => onOpenChange(false)}>Annuler</button>
    </BottomSheet>
  );
}

function AssistantSheet({ open, onOpenChange, flow }: { open: boolean; onOpenChange: (open: boolean) => void; flow: FlowControls }) {
  const { setSearchOpen } = useApp();
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Immerli AI" description="Votre guide de lecture personnel" snap={0.44}>
      <div className="assistant-card">
        <span><MagicWandIcon /></span>
        <div><strong>Prêt pour une courte lecture ?</strong><p>Je peux trouver une leçon adaptée à votre niveau et à vos centres d’intérêt.</p></div>
      </div>
      <button className="primary-button" onClick={() => { onOpenChange(false); setSearchOpen(true); flow.replace(makeRootScreen("library")); }}>
        Trouver une leçon <ArrowRightIcon />
      </button>
    </BottomSheet>
  );
}

function LibraryScreen({ flow }: { flow: FlowControls }) {
  const { lessons, searchOpen, setSearchOpen } = useApp();
  const keyboard = useKeyboard();
  const [query, setQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const filtered = query.trim()
    ? lessons.filter((lesson) => `${lesson.title} ${lesson.source}`.toLowerCase().includes(query.toLowerCase()))
    : lessons;
  const shelf = (category: Lesson["category"]) => filtered.filter((lesson) => lesson.category === category);

  return (
    <>
      <MobileScroll className="app-screen library-scroll">
        <main className="library-content">
          {searchOpen ? (
            <div className="search-box">
              <MagnifyingGlassIcon />
              <KeyboardInput
                autoFocus
                value={query}
                placeholder="Rechercher une leçon"
                aria-label="Rechercher une leçon"
                onChange={(event) => setQuery(event.target.value)}
                onBlur={() => keyboard.hide()}
              />
              {query ? <button aria-label="Effacer" onClick={() => setQuery("")}><Cross1Icon /></button> : null}
            </div>
          ) : null}
          <ProgressSummary flow={flow} />
          {filtered.length ? (
            <>
              {shelf("imported").length ? <LessonShelf title="Mes imports" lessons={shelf("imported")} flow={flow} /> : null}
              <LessonShelf title="Continuer à étudier" lessons={shelf("continue")} flow={flow} />
              <LessonShelf title="Formations guidées" lessons={shelf("guided")} flow={flow} />
              <LessonShelf title="Populaire" lessons={shelf("popular")} flow={flow} />
              <LessonShelf title="Ressources d’actualités" lessons={shelf("news")} flow={flow} />
            </>
          ) : (
            <div className="empty-state compact"><MagnifyingGlassIcon /><h2>Aucune leçon trouvée</h2><p>Essayez un autre mot-clé.</p><button className="secondary-button" onClick={() => { setQuery(""); setSearchOpen(false); }}>Réinitialiser</button></div>
          )}
        </main>
      </MobileScroll>
      <div className="floating-actions">
        <button className="assistant-chip" onClick={() => setAssistantOpen(true)}><MagicWandIcon /> Immerli AI</button>
        <button className="import-chip" onClick={() => setImportOpen(true)}><PlusIcon /> Importer</button>
      </div>
      <ImportSheet open={importOpen} onOpenChange={setImportOpen} flow={flow} />
      <AssistantSheet open={assistantOpen} onOpenChange={setAssistantOpen} flow={flow} />
    </>
  );
}

function VocabularyScreen({ flow }: { flow: FlowControls }) {
  const { vocabulary, removeWord } = useApp();
  const keyboard = useKeyboard();
  const [query, setQuery] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const [selected, setSelected] = useState<VocabularyWord | null>(null);
  const filtered = vocabulary
    .filter((word) => `${word.term} ${word.translation}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sortNewest ? b.id.localeCompare(a.id) : a.term.localeCompare(b.term));
  return (
    <>
      <MobileScroll className="app-screen">
        <main className="vocabulary-content root-content">
          <div className="search-box vocabulary-search"><MagnifyingGlassIcon /><KeyboardInput value={query} placeholder="Rechercher" aria-label="Rechercher dans le vocabulaire" onChange={(event) => setQuery(event.target.value)} onBlur={() => keyboard.hide()} />{query ? <button onClick={() => setQuery("")} aria-label="Effacer"><Cross1Icon /></button> : null}</div>
          <div className="filter-row">
            <button onClick={() => setSortNewest((current) => !current)}>Tous les mots <ChevronDownIcon /></button>
            <button onClick={() => setSortNewest((current) => !current)}><MixerHorizontalIcon /> {sortNewest ? "Récents" : "A–Z"}</button>
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state vocabulary-empty">
              <span className="empty-illustration"><ReaderIcon /></span>
              <h2>{query ? "Aucun résultat" : "Votre vocabulaire commence ici"}</h2>
              <p>{query ? "Essayez une autre recherche." : "Touchez un mot bleu pendant une lecture pour enregistrer sa traduction."}</p>
              <button className="primary-button" onClick={() => flow.replace(makeRootScreen("library"))}><HomeIcon /> Choisir une leçon</button>
            </div>
          ) : (
            <>
              <button className="review-banner" onClick={() => flow.push(makeReviewScreen())}><span><CardStackIcon /></span><div><strong>Réviser {filtered.length} mots</strong><small>Une session de 3 minutes</small></div><ChevronRightIcon /></button>
              <div className="word-list">
                {filtered.map((word) => (
                  <button className="word-row" key={word.id} onClick={() => setSelected(word)}>
                    <span className={`word-level level-${word.level}`}>{word.known ? <CheckIcon /> : word.level}</span>
                    <span><strong>{word.term}</strong><small>{word.translation}</small></span>
                    <ChevronRightIcon />
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
      </MobileScroll>
      <BottomSheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.term || "Mot"} description="anglais → français" snap={0.48}>
        {selected ? <div className="word-detail"><div className="word-detail-translation"><strong>{selected.translation}</strong><button onClick={() => speak(selected.term)} aria-label="Écouter"><SpeakerLoudIcon /></button></div><p>{selected.context}</p><div className="sheet-button-row"><button className="danger-button" onClick={() => { removeWord(selected.term); setSelected(null); }}><TrashIcon /> Supprimer</button><button className="primary-button" onClick={() => { setSelected(null); flow.push(makeReviewScreen()); }}><ReloadIcon /> Réviser</button></div></div> : null}
      </BottomSheet>
    </>
  );
}

function PlaylistScreen({ flow }: { flow: FlowControls }) {
  const { playlist, lessons, clearPlaylist } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const queued = playlist.map((id) => lessons.find((lesson) => lesson.id === id)).filter(Boolean) as Lesson[];
  return (
    <>
      <MobileScroll className="app-screen">
        <main className="playlist-content root-content">
          {queued.length ? (
            <>
              <button className="start-playlist" onClick={() => flow.push(makeReaderScreen(queued[0].id))}><PlayIcon /> Démarrer</button>
              <div className="playlist-list">
                {queued.map((lesson, index) => (
                  <button className="playlist-row" key={lesson.id} onClick={() => flow.push(makeReaderScreen(lesson.id))}>
                    <span className="queue-index">{index + 1}</span><span className="playlist-thumb" style={{ backgroundPosition: lesson.imagePosition }} /><span><strong>{lesson.title}</strong><small>{lesson.words} mots · niveau {lesson.level}</small></span><ChevronRightIcon />
                  </button>
                ))}
              </div>
              <button className="secondary-button full" onClick={() => setMenuOpen(true)}><DotsHorizontalIcon /> Gérer la playlist</button>
            </>
          ) : (
            <div className="empty-state playlist-empty"><span className="empty-illustration green"><ListBulletIcon /></span><h2>Votre liste est vide</h2><p>Ajoutez des leçons terminées ou choisissez-en une dans la bibliothèque.</p><button className="primary-button" onClick={() => flow.replace(makeRootScreen("library"))}><PlusIcon /> Ajouter des leçons</button></div>
          )}
        </main>
      </MobileScroll>
      <BottomSheet open={menuOpen} onOpenChange={setMenuOpen} title="Gérer la playlist" snap={0.38}>
        <div className="sheet-list"><button onClick={() => { setMenuOpen(false); flow.replace(makeRootScreen("library")); }}><PlusIcon /><span><strong>Ajouter une leçon</strong><small>Ouvrir la bibliothèque</small></span><ChevronRightIcon /></button><button className="danger-row" onClick={() => { clearPlaylist(); setMenuOpen(false); }}><TrashIcon /><span><strong>Vider la playlist</strong><small>Retirer toutes les leçons</small></span><ChevronRightIcon /></button></div>
      </BottomSheet>
    </>
  );
}

const moreRows: Array<{ title: string; subtitle: string; icon: ReactNode }> = [
  { title: "Alertes", subtitle: "Vos rappels et nouveautés", icon: <BellIcon /> },
  { title: "Défis", subtitle: "Atteignez votre prochain objectif", icon: <RocketIcon /> },
  { title: "Forum", subtitle: "Discutez avec la communauté", icon: <ChatBubbleIcon /> },
  { title: "Guide de grammaire", subtitle: "Les règles essentielles", icon: <FileTextIcon /> },
  { title: "Aide et documentation", subtitle: "Réponses et conseils", icon: <QuestionMarkCircledIcon /> },
  { title: "Inviter des amis", subtitle: "Apprenez ensemble", icon: <PersonIcon /> },
];

function MoreScreen({ flow }: { flow: FlowControls }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    void navigator.clipboard?.writeText("https://immerli.app/invite/demo");
    setCopied(true);
  };
  return (
    <>
      <MobileScroll className="app-screen">
        <main className="more-content root-content">
          <button className="profile-card" onClick={() => flow.push(makeProfileScreen())}><span className="profile-avatar">D</span><span><strong>Demo Learner</strong><small>Voir le profil et les statistiques</small></span><ChevronRightIcon /></button>
          <div className="more-list">
            {moreRows.map((row) => (
              <button key={row.title} onClick={() => flow.push(makeInfoScreen(row.title, row.subtitle))}><span className="more-icon">{row.icon}</span><span><strong>{row.title}</strong><small>{row.subtitle}</small></span><ChevronRightIcon /></button>
            ))}
          </div>
          <button className="share-extension" onClick={() => setShareOpen(true)}><span><UploadIcon /></span><div><strong>Importer depuis n’importe quelle app</strong><p>Ajoutez Immerli à votre menu de partage pour créer une leçon en un geste.</p></div><ChevronRightIcon /></button>
        </main>
      </MobileScroll>
      <BottomSheet open={shareOpen} onOpenChange={setShareOpen} title="Partager avec Immerli" description="Votre lien d’invitation personnel" snap={0.4}>
        <div className="share-link"><span>immerli.app/invite/demo</span><button onClick={copyLink}>{copied ? <CheckIcon /> : <Link2Icon />} {copied ? "Copié" : "Copier"}</button></div>
        <button className="primary-button" onClick={() => setShareOpen(false)}>Terminé</button>
      </BottomSheet>
    </>
  );
}

function BackHeader({ flow, title, trailing }: { flow: FlowControls; title: string; trailing?: ReactNode }) {
  return (
    <div className="back-header"><IconButton label="Retour" onClick={flow.pop}><ChevronLeftIcon /></IconButton><strong>{title}</strong><span className="header-trailing">{trailing}</span></div>
  );
}

function ImportScreen({ mode, flow }: { mode: ImportMode; flow: FlowControls }) {
  const { addLesson } = useApp();
  const keyboard = useKeyboard();
  const labels: Record<ImportMode, { title: string; hint: string; sample: string }> = {
    url: { title: "Importer une URL", hint: "Collez le lien d’un article, d’une vidéo ou d’une page web.", sample: "https://example.com/a-quiet-cafe" },
    scan: { title: "Scanner un texte", hint: "Prenez une photo nette. Immerli prépare ensuite le texte.", sample: "A quiet café sits near the park…" },
    text: { title: "Importer du texte", hint: "Collez ou écrivez le contenu que vous voulez apprendre.", sample: defaultText },
    file: { title: "Importer un fichier", hint: "PDF, EPUB, DOCX ou fichier texte jusqu’à 20 Mo.", sample: "My English reading notes" },
  };
  const config = labels[mode];
  const [title, setTitle] = useState("");
  const [value, setValue] = useState(mode === "text" ? "" : config.sample);
  const [prepared, setPrepared] = useState(mode === "url" || mode === "file");

  const submit = () => {
    const text = mode === "text" ? value : `${value}. ${defaultText}`;
    const lesson = addLesson({ title: title || (mode === "url" ? "A quiet café" : "Ma leçon importée"), source: "Import personnel", text });
    keyboard.hide();
    flow.replace(makeReaderScreen(lesson.id));
  };

  return (
    <MobileScroll className="app-screen">
      <main className="form-screen">
        <span className="form-hero-icon">{mode === "url" ? <Link2Icon /> : mode === "scan" ? <CameraIcon /> : mode === "text" ? <FileTextIcon /> : <UploadIcon />}</span>
        <h1>{config.title}</h1><p>{config.hint}</p>
        <label className="field-label">Titre de la leçon <KeyboardInput value={title} placeholder="Ex. Mon article du jour" onChange={(event) => setTitle(event.target.value)} onBlur={() => keyboard.hide()} /></label>
        {mode === "text" ? (
          <label className="field-label">Texte <KeyboardTextarea value={value} placeholder="Collez votre texte ici…" rows={8} onChange={(event) => setValue(event.target.value)} onBlur={() => keyboard.hide()} /></label>
        ) : (
          <label className="field-label">{mode === "url" ? "Adresse" : mode === "scan" ? "Texte détecté" : "Fichier sélectionné"}<KeyboardInput value={value} onChange={(event) => setValue(event.target.value)} onBlur={() => keyboard.hide()} /></label>
        )}
        {mode === "scan" ? <button className="secondary-button full" onClick={() => { setValue(config.sample); setPrepared(true); }}><CameraIcon /> Simuler la capture</button> : null}
        {mode === "file" ? <button className="secondary-button full" onClick={() => { setValue("english-notes.pdf"); setPrepared(true); }}><DownloadIcon /> Choisir un autre fichier</button> : null}
        <div className="import-preview"><InfoCircledIcon /><span>{prepared || value.trim() ? "Le contenu est prêt à être transformé en leçon interactive." : "Ajoutez du contenu pour continuer."}</span></div>
        <button className="primary-button large" disabled={!value.trim()} onClick={submit}>Importer la leçon <ArrowRightIcon /></button>
      </main>
    </MobileScroll>
  );
}

function ReaderHeader({ flow, lessonId }: { flow: FlowControls; lessonId: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="reader-header">
        <IconButton label="Fermer la leçon" onClick={flow.pop}><Cross1Icon /></IconButton>
        <div className="reader-header-progress"><span><i /></span><small>34 %</small></div>
        <IconButton label="Options de la leçon" onClick={() => setMenuOpen(true)}><DotsHorizontalIcon /></IconButton>
      </div>
      <BottomSheet open={menuOpen} onOpenChange={setMenuOpen} title="Options de la leçon" snap={0.45}>
        <div className="sheet-list">
          <button onClick={() => { setMenuOpen(false); flow.push(makeDetailsScreen(lessonId)); }}><InfoCircledIcon /><span><strong>Détails</strong><small>À propos de cette leçon</small></span><ChevronRightIcon /></button>
          <button onClick={() => { setMenuOpen(false); flow.push(makeCreatedWordsScreen(lessonId)); }}><CheckCircledIcon /><span><strong>Terminer la leçon</strong><small>Voir votre progression</small></span><ChevronRightIcon /></button>
        </div>
      </BottomSheet>
    </>
  );
}

function ReaderScreen({ lessonId, flow }: { lessonId: string; flow: FlowControls }) {
  const { lessons, vocabulary, saveWord } = useApp();
  const lesson = lessons.find((entry) => entry.id === lessonId) || lessons[0];
  const keyboard = useKeyboard();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [translation, setTranslation] = useState("");
  const [playing, setPlaying] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const saved = new Set(vocabulary.map((word) => word.term.toLowerCase()));
  const context = "Every Thursday, Lucia takes the same table by the window.";

  const select = (term: string) => {
    setSelectedWord(term);
    setTranslation(translations[term.toLowerCase()] || "");
  };
  const word = (term: string) => (
    <button key={term} className={`reader-word ${saved.has(term.toLowerCase()) ? "saved" : "unknown"}`} onClick={() => select(term)}>{term}</button>
  );
  const save = () => {
    if (!selectedWord) return;
    saveWord({ term: selectedWord, translation: translation.trim() || translations[selectedWord.toLowerCase()] || "à traduire", context });
    keyboard.hide();
    setSelectedWord(null);
  };
  const toggleAudio = () => {
    if (playing) window.speechSynthesis?.cancel();
    else speak(lesson.text);
    setPlaying((current) => !current);
  };

  return (
    <>
      <MobileScroll className="app-screen reader-scroll">
        <article className="reader-content">
          <button className="lesson-mini" onClick={() => flow.push(makeDetailsScreen(lesson.id))}><span className="lesson-mini-art" style={{ backgroundPosition: lesson.imagePosition }} /><span><strong>{lesson.title}</strong><small>{lesson.source} · {lesson.words} mots</small></span><ChevronRightIcon /></button>
          <div className="reader-copy">
            <p>A {word("quiet")} {word("café")} sits near the {word("park")}.</p>
            <p>{word("Every")} {word("Thursday")}, Lucia takes the same {word("table")} by the {word("window")}.</p>
            <p>She {word("orders")} tea, opens her {word("notebook")}, and writes three things that made her {word("grateful")}.</p>
            <p>Outside, the {word("city")} slowly wakes up. The {word("waiter")} knows her name and {word("smiles")} when she arrives.</p>
          </div>
          <button className="finish-reading" onClick={() => flow.push(makeCreatedWordsScreen(lesson.id))}><CheckCircledIcon /> Terminer cette leçon</button>
        </article>
      </MobileScroll>
      <div className="reader-dock">
        <button className="reader-play" onClick={toggleAudio} aria-label={playing ? "Mettre en pause" : "Écouter"}>{playing ? <PauseIcon /> : <PlayIcon />}</button>
        <button className="reader-line" onClick={() => speak(context)}><span><strong>Every Thursday, Lucia takes the same table…</strong><small>Chaque jeudi, Lucia prend la même table…</small></span><SpeakerLoudIcon /></button>
        <button className="review-entry" onClick={() => setReviewOpen(true)}><CardStackIcon /><b>{vocabulary.length}</b></button>
      </div>
      <BottomSheet open={Boolean(selectedWord)} onOpenChange={(open) => !open && setSelectedWord(null)} title={selectedWord || "Mot"} description="anglais → français" snap={0.56}>
        <div className="meaning-sheet">
          <div className="selected-word-line"><strong>{selectedWord}</strong><button onClick={() => selectedWord && speak(selectedWord)} aria-label="Écouter le mot"><SpeakerLoudIcon /></button></div>
          <label className="field-label">Traduction <KeyboardInput value={translation} placeholder="Ajouter une traduction" onChange={(event) => setTranslation(event.target.value)} onBlur={() => keyboard.hide()} /></label>
          <blockquote>{context}</blockquote>
          <button className="primary-button large" onClick={save}><PlusIcon /> {selectedWord && saved.has(selectedWord.toLowerCase()) ? "Mettre à jour" : "Enregistrer ce mot"}</button>
        </div>
      </BottomSheet>
      <BottomSheet open={reviewOpen} onOpenChange={setReviewOpen} title="Réviser" description={`${vocabulary.length} mot${vocabulary.length === 1 ? "" : "s"} enregistré${vocabulary.length === 1 ? "" : "s"}`} snap={0.56}>
        <div className="sheet-list review-options">
          <button onClick={() => { setReviewOpen(false); flow.push(makeReviewScreen()); }}><EyeOpenIcon /><span><strong>Réviser la page</strong><small>Les mots visibles ici</small></span><ChevronRightIcon /></button>
          <button onClick={() => { setReviewOpen(false); flow.push(makeReviewScreen()); }}><CardStackIcon /><span><strong>Révision</strong><small>Flashcards personnalisées</small></span><ChevronRightIcon /></button>
          <button onClick={() => { setReviewOpen(false); flow.push(makeReviewScreen()); }}><ReloadIcon /><span><strong>Réviser la leçon</strong><small>Tous les mots de cette leçon</small></span><ChevronRightIcon /></button>
          <button onClick={() => { setReviewOpen(false); flow.replace(makeRootScreen("vocabulary")); }}><BookmarkIcon /><span><strong>Vocabulaire</strong><small>Voir tous les mots</small></span><ChevronRightIcon /></button>
        </div>
      </BottomSheet>
    </>
  );
}

function ReviewHeader({ flow, progress }: { flow: FlowControls; progress: number }) {
  return <div className="review-header"><IconButton label="Quitter la révision" onClick={flow.pop}><Cross1Icon /></IconButton><div className="review-progress"><span style={{ width: `${progress}%` }} /></div><IconButton label="Réglages de révision" onClick={() => flow.push(makeSettingsScreen())}><GearIcon /></IconButton></div>;
}

function ReviewScreen({ flow }: { flow: FlowControls }) {
  const { vocabulary, gradeWord, removeWord } = useApp();
  const fallback: VocabularyWord = { id: "review-a", term: "a", translation: "un, une", context: "A quiet café sits near the park.", level: 1, known: false };
  const cards = vocabulary.length ? vocabulary : [fallback];
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"front" | "back" | "choice" | "feedback" | "done">("front");
  const [correct, setCorrect] = useState(false);
  const card = cards[Math.min(index, cards.length - 1)] || fallback;
  const progress = mode === "done" ? 100 : Math.round((index / Math.max(1, cards.length)) * 100);

  const advance = (level: number, known = false) => {
    gradeWord(card.term, level, known);
    if (index + 1 >= cards.length) {
      setMode("done");
      return;
    }
    setIndex((current) => current + 1);
    setMode(index % 2 === 0 ? "choice" : "front");
  };

  const answer = (value: string) => {
    const isCorrect = value === card.translation;
    setCorrect(isCorrect);
    gradeWord(card.term, isCorrect ? Math.min(4, card.level + 1) : 1, false);
    setMode("feedback");
  };

  if (mode === "done") {
    return (
      <div className="review-done"><span><CheckCircledIcon /></span><h1>Révision terminée</h1><p>{cards.length} mot{cards.length > 1 ? "s" : ""} révisé{cards.length > 1 ? "s" : ""}. Les niveaux ont été mis à jour.</p><button className="primary-button large" onClick={flow.pop}>Continuer <ArrowRightIcon /></button></div>
    );
  }

  const options = [card.translation, "cuisiner", "une personne", "demain"].sort((a, b) => a.localeCompare(b));
  return (
    <div className="review-screen">
      <ReviewHeader flow={flow} progress={progress} />
      <div className="review-stage">
        {mode === "front" ? (
          <div className="flashcard front"><span className="card-number">{index + 1} / {cards.length}</span><strong>{card.translation}</strong><small>français</small><button className="flip-button" onClick={() => setMode("back")}>Retourner la carte</button></div>
        ) : mode === "back" ? (
          <div className="flashcard back"><button className="speak-circle" onClick={() => speak(card.term)} aria-label="Écouter"><SpeakerLoudIcon /></button><strong>{card.term}</strong><b>{card.translation}</b><p>{card.context}</p><div className="grade-row"><button className="delete-grade" aria-label="Supprimer le mot" onClick={() => { removeWord(card.term); advance(1); }}><TrashIcon /></button>{[1, 2, 3, 4].map((grade) => <button key={grade} onClick={() => advance(grade)}>{grade}</button>)}<button className="known-grade" aria-label="Je connais ce mot" onClick={() => advance(4, true)}><CheckIcon /></button></div><div className="binary-row"><button aria-label="À revoir" onClick={() => advance(1)}><Cross1Icon /></button><button aria-label="Connu" onClick={() => advance(4, true)}><CheckIcon /></button></div></div>
        ) : mode === "choice" ? (
          <div className="choice-card"><button className="listening-button" onClick={() => speak(card.term)}><SpeakerLoudIcon /><span>Écouter le mot</span></button><p>Choisissez la bonne traduction</p><div className="choice-grid">{options.map((option) => <button key={option} onClick={() => answer(option)}>{option}</button>)}</div><button className="unknown-button" onClick={() => answer("")}>Je ne sais pas</button></div>
        ) : (
          <div className={`feedback-card ${correct ? "correct" : "incorrect"}`}><span>{correct ? <CheckCircledIcon /> : <CrossCircledIcon />}</span><h2>{correct ? "Exact !" : "Pas encore"}</h2><p><strong>{card.term}</strong> signifie <b>{card.translation}</b>.</p><button className="primary-button large" onClick={() => index + 1 >= cards.length ? setMode("done") : (setIndex((current) => current + 1), setMode("front"))}>Continuer <ArrowRightIcon /></button></div>
        )}
      </div>
    </div>
  );
}

function CreatedWordsScreen({ lessonId, flow }: { lessonId: string; flow: FlowControls }) {
  const { vocabulary } = useApp();
  const words = vocabulary.slice(0, 5);
  return (
    <MobileScroll className="app-screen completion-pre-scroll">
      <main className="created-words-screen">
        <span className="completion-icon"><BookmarkIcon /></span>
        <h1>{words.length || 5} mots enregistrés</h1>
        <p>Ces mots sont prêts pour vos prochaines révisions.</p>
        <div className="created-word-list">
          {(words.length ? words : [
            { id: "w1", term: "quiet", translation: "calme", level: 1, known: false, context: "" },
            { id: "w2", term: "grateful", translation: "reconnaissante", level: 1, known: false, context: "" },
            { id: "w3", term: "waiter", translation: "serveur", level: 1, known: false, context: "" },
            { id: "w4", term: "window", translation: "fenêtre", level: 1, known: false, context: "" },
            { id: "w5", term: "notebook", translation: "carnet", level: 1, known: false, context: "" },
          ]).map((word) => <div key={word.id}><span>{word.level}</span><strong>{word.term}</strong><small>{word.translation}</small></div>)}
        </div>
        <button className="primary-button large" onClick={() => flow.replace(makeCompletionScreen(lessonId))}>Continuer <ArrowRightIcon /></button>
      </main>
    </MobileScroll>
  );
}

function CompletionScreen({ lessonId, flow }: { lessonId: string; flow: FlowControls }) {
  const { lessons, vocabulary, playlist, likedLessons, togglePlaylist, toggleLiked, completeLesson, coins } = useApp();
  const lesson = lessons.find((entry) => entry.id === lessonId) || lessons[0];
  const nextLesson = lessons[(lessons.findIndex((entry) => entry.id === lesson.id) + 1) % lessons.length];
  const [recorded, setRecorded] = useState(false);
  const isQueued = playlist.includes(lesson.id);
  const isLiked = likedLessons.includes(lesson.id);
  const record = () => {
    if (!recorded) completeLesson();
    setRecorded(true);
  };
  return (
    <>
      <MobileScroll className="app-screen completion-scroll">
        <main className="completion-screen">
          <span className="completion-kicker"><CheckCircledIcon /> Leçon terminée</span>
          <div className="completion-hero" style={{ backgroundPosition: lesson.imagePosition }}><span><CheckIcon /></span></div>
          <h1>{lesson.title}</h1><p>{lesson.source}</p>
          <div className="completion-actions"><button className={isQueued ? "active" : ""} onClick={() => togglePlaylist(lesson.id)}><ListBulletIcon />{isQueued ? "Dans la playlist" : "Ajouter à la playlist"}</button><button className={isLiked ? "active" : ""} onClick={() => toggleLiked(lesson.id)}>{isLiked ? <HeartFilledIcon /> : <HeartIcon />}{isLiked ? "Aimée" : "J’aime"}</button></div>
          <section className="congrats-card"><span><StarIcon /></span><div><h2>Bravo, belle lecture !</h2><p>Vous avancez chaque fois que vous terminez une leçon.</p></div></section>
          <section className="stats-section"><h2>Votre session</h2><div className="stats-grid"><div><span><BookmarkIcon /></span><strong>{Math.max(5, vocabulary.length)}</strong><small>Mots enregistrés</small></div><div><span><CheckIcon /></span><strong>{vocabulary.filter((word) => word.known).length + 8}</strong><small>Mots connus</small></div><div><span><ClockIcon /></span><strong>4:28</strong><small>Temps étudié</small></div><div><span><StopwatchIcon /></span><strong>127</strong><small>Mots / minute</small></div><div><span><SpeakerLoudIcon /></span><strong>2:14</strong><small>Écouté</small></div><div><span><ReaderIcon /></span><strong>{lesson.words}</strong><small>Mots lus</small></div></div></section>
          <section className="reward-card"><span><StarIcon /></span><div><strong>+25 pièces</strong><small>{recorded ? coins : coins + 25} au total</small></div><button onClick={record}>{recorded ? <CheckIcon /> : <PlusIcon />} {recorded ? "Ajoutées" : "Récupérer"}</button></section>
          <section className="streak-card"><div className="streak-top"><span><LightningBoltIcon /></span><div><strong>6 jours de suite</strong><small>Votre meilleure série cette semaine</small></div></div><div className="week-row">{["L", "M", "M", "J", "V", "S", "D"].map((day, index) => <span key={`${day}-${index}`} className={index < 6 ? "done" : ""}>{index < 6 ? <CheckIcon /> : day}</span>)}</div></section>
          <section className="language-progress-card"><div><LanguageMark /><span><strong>Anglais · Niveau 2</strong><small>1 240 mots connus sur 2 000</small></span></div><div className="wide-progress"><span /></div><p>Encore 760 mots avant le niveau suivant.</p></section>
          <section className="next-preview"><span className="next-cover" style={{ backgroundPosition: nextLesson.imagePosition }} /><div><small>Prochaine leçon</small><strong>{nextLesson.title}</strong><p>{nextLesson.words} mots · niveau {nextLesson.level}</p></div></section>
        </main>
      </MobileScroll>
      <div className="completion-dock"><button className="primary-button large" onClick={() => flow.replace(makeReaderScreen(nextLesson.id))}>Leçon suivante <ArrowRightIcon /></button></div>
    </>
  );
}

function SettingsScreen({ flow }: { flow: FlowControls }) {
  const { preferences, setPreference } = useApp();
  const rows: Array<{ key: keyof Preferences; title: string; subtitle: string }> = [
    { key: "sound", title: "Sons", subtitle: "Prononciation et feedback" },
    { key: "reminders", title: "Rappels quotidiens", subtitle: "Une notification pour garder le rythme" },
    { key: "autoplay", title: "Lecture automatique", subtitle: "Lancer l’audio à l’ouverture" },
  ];
  return <MobileScroll className="app-screen"><main className="settings-screen detail-screen"><h1>Réglages</h1><p>Personnalisez votre expérience d’apprentissage.</p><div className="settings-list">{rows.map((row) => <button key={row.key} onClick={() => setPreference(row.key, !preferences[row.key])}><span><strong>{row.title}</strong><small>{row.subtitle}</small></span><i className={preferences[row.key] ? "on" : ""}><b /></i></button>)}</div><button className="secondary-button full" onClick={() => flow.push(makeLanguageScreen())}><GlobeIcon /> Langue étudiée <ChevronRightIcon /></button><button className="secondary-button full" onClick={() => flow.push(makeInfoScreen("Confidentialité", "Vos données d’apprentissage restent sous votre contrôle."))}><InfoCircledIcon /> Confidentialité <ChevronRightIcon /></button></main></MobileScroll>;
}

function ProfileScreen({ flow }: { flow: FlowControls }) {
  const { profileName, setProfileName, completedLessons, vocabulary } = useApp();
  const keyboard = useKeyboard();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profileName);
  const save = () => { setProfileName(name.trim() || "Demo"); setEditing(false); keyboard.hide(); };
  return <MobileScroll className="app-screen"><main className="profile-screen detail-screen"><span className="profile-avatar large">{profileName.charAt(0).toUpperCase()}</span>{editing ? <div className="profile-edit"><KeyboardInput value={name} onChange={(event) => setName(event.target.value)} onBlur={() => keyboard.hide()} aria-label="Votre nom" /><button className="primary-button" onClick={save}><CheckIcon /> Enregistrer</button></div> : <><h1>{profileName}</h1><button className="text-button" onClick={() => setEditing(true)}><Pencil1Icon /> Modifier le profil</button></>}<div className="profile-stats"><button onClick={() => flow.push(makeStatsScreen())}><strong>{completedLessons}</strong><small>Leçons</small></button><button onClick={() => flow.replace(makeRootScreen("vocabulary"))}><strong>{vocabulary.length}</strong><small>Mots</small></button><button onClick={() => flow.push(makeStatsScreen())}><strong>6</strong><small>Jours</small></button></div><button className="primary-button large" onClick={() => flow.push(makeStatsScreen())}><BarChartIcon /> Voir mes statistiques</button></main></MobileScroll>;
}

function StatsScreen() {
  const { completedLessons, vocabulary, coins } = useApp();
  return <MobileScroll className="app-screen"><main className="stats-screen detail-screen"><h1>Votre progression</h1><p>Une vue claire de tout le travail accompli.</p><div className="stats-hero"><span><BarChartIcon /></span><div><strong>{completedLessons * 7 + 12}</strong><small>minutes étudiées cette semaine</small></div></div><div className="stats-grid standalone"><div><span><ReaderIcon /></span><strong>{completedLessons}</strong><small>Leçons terminées</small></div><div><span><BookmarkIcon /></span><strong>{vocabulary.length}</strong><small>Mots enregistrés</small></div><div><span><StarIcon /></span><strong>{coins}</strong><small>Pièces gagnées</small></div><div><span><LightningBoltIcon /></span><strong>6</strong><small>Jours de série</small></div></div><section className="weekly-chart"><h2>Cette semaine</h2><div>{[42, 68, 35, 82, 57, 96, 20].map((height, index) => <span key={index}><i style={{ height: `${height}%` }} /><small>{["L", "M", "M", "J", "V", "S", "D"][index]}</small></span>)}</div></section></main></MobileScroll>;
}

function LanguageScreen({ flow }: { flow: FlowControls }) {
  const { language, setLanguage } = useApp();
  const options = [{ name: "anglais", code: "EN" }, { name: "espagnol", code: "ES" }, { name: "allemand", code: "DE" }];
  return <MobileScroll className="app-screen"><main className="language-screen detail-screen"><h1>Langue étudiée</h1><p>Choisissez la bibliothèque que vous voulez ouvrir.</p><div className="language-list">{options.map((option) => <button key={option.name} onClick={() => { setLanguage(option.name); flow.pop(); }}><span>{option.code}</span><strong>{option.name}</strong>{language === option.name ? <CheckCircledIcon /> : <ChevronRightIcon />}</button>)}</div></main></MobileScroll>;
}

function AddWordScreen({ flow }: { flow: FlowControls }) {
  const { saveWord } = useApp();
  const keyboard = useKeyboard();
  const [term, setTerm] = useState("");
  const [translation, setTranslation] = useState("");
  const submit = () => { saveWord({ term, translation, context: "Ajouté manuellement" }); keyboard.hide(); flow.replace(makeRootScreen("vocabulary")); };
  return <MobileScroll className="app-screen"><main className="form-screen"><span className="form-hero-icon"><BookmarkIcon /></span><h1>Ajouter un mot</h1><p>Créez une nouvelle fiche dans votre vocabulaire.</p><label className="field-label">Mot en anglais <KeyboardInput value={term} onChange={(event) => setTerm(event.target.value)} onBlur={() => keyboard.hide()} placeholder="Ex. grateful" /></label><label className="field-label">Traduction <KeyboardInput value={translation} onChange={(event) => setTranslation(event.target.value)} onBlur={() => keyboard.hide()} placeholder="Ex. reconnaissant" /></label><button className="primary-button large" disabled={!term.trim() || !translation.trim()} onClick={submit}><PlusIcon /> Ajouter au vocabulaire</button></main></MobileScroll>;
}

function DetailsScreen({ lessonId }: { lessonId: string }) {
  const { lessons } = useApp();
  const lesson = lessons.find((entry) => entry.id === lessonId) || lessons[0];
  return <MobileScroll className="app-screen"><main className="lesson-details detail-screen"><div className="details-cover" style={{ backgroundPosition: lesson.imagePosition }} /><h1>{lesson.title}</h1><p>{lesson.source}</p><div className="detail-metrics"><span><ReaderIcon /><strong>{lesson.words}</strong><small>mots</small></span><span><StopwatchIcon /><strong>{Math.max(2, Math.round(lesson.words / 86))}</strong><small>minutes</small></span><span><BarChartIcon /><strong>{lesson.level}</strong><small>niveau</small></span></div><section><h2>À propos</h2><p>Cette leçon courte utilise un anglais naturel et accessible. Touchez chaque mot bleu pour voir sa traduction, l’enregistrer et le réviser plus tard.</p></section><section><h2>Comment apprendre</h2><p>Lisez une première fois, écoutez l’audio, puis relisez le texte en créant seulement les mots qui vous intéressent.</p></section></main></MobileScroll>;
}

function ShelfScreen({ ids, flow }: { ids: string[]; flow: FlowControls }) {
  const { lessons } = useApp();
  const visible = ids.map((id) => lessons.find((lesson) => lesson.id === id)).filter(Boolean) as Lesson[];
  return <MobileScroll className="app-screen"><main className="shelf-screen detail-screen"><div className="shelf-grid">{visible.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} onOpen={() => flow.push(makeReaderScreen(lesson.id))} />)}</div></main></MobileScroll>;
}

function InfoScreen({ title, description, flow }: { title: string; description: string; flow: FlowControls }) {
  return <MobileScroll className="app-screen"><main className="info-screen detail-screen"><span className="form-hero-icon"><InfoCircledIcon /></span><h1>{title}</h1><p>{description}</p><div className="info-card"><strong>Cette section est prête.</strong><p>Retrouvez ici les outils, conseils et contenus liés à {title.toLowerCase()}.</p></div><button className="primary-button large" onClick={flow.pop}>Compris <CheckIcon /></button></main></MobileScroll>;
}

function makeRootScreen(tab: Tab): FlowScreen {
  return {
    id: `root-${tab}`,
    header: (flow) => <RootHeader flow={flow} tab={tab} />,
    headerHeight: 72,
    footer: (flow) => <TabBar flow={flow} active={tab} />,
    footerHeight: 82,
    render: (flow) => tab === "library" ? <LibraryScreen flow={flow} /> : tab === "vocabulary" ? <VocabularyScreen flow={flow} /> : tab === "playlist" ? <PlaylistScreen flow={flow} /> : <MoreScreen flow={flow} />,
  };
}

function makeImportScreen(mode: ImportMode): FlowScreen {
  return { id: `import-${mode}`, header: (flow) => <BackHeader flow={flow} title="Importer une leçon" />, headerHeight: 62, render: (flow) => <ImportScreen mode={mode} flow={flow} /> };
}

function makeReaderScreen(lessonId: string): FlowScreen {
  return { id: `reader-${lessonId}`, header: (flow) => <ReaderHeader flow={flow} lessonId={lessonId} />, headerHeight: 62, render: (flow) => <ReaderScreen lessonId={lessonId} flow={flow} /> };
}

function makeReviewScreen(): FlowScreen {
  return { id: "review", render: (flow) => <ReviewScreen flow={flow} /> };
}

function makeCreatedWordsScreen(lessonId: string): FlowScreen {
  return { id: `created-${lessonId}`, header: (flow) => <BackHeader flow={flow} title="Nouveaux mots" />, headerHeight: 62, render: (flow) => <CreatedWordsScreen lessonId={lessonId} flow={flow} /> };
}

function makeCompletionScreen(lessonId: string): FlowScreen {
  return { id: `complete-${lessonId}`, header: (flow) => <BackHeader flow={flow} title="Leçon terminée" trailing={<button className="header-text-button" onClick={() => flow.replace(makeRootScreen("library"))}>Fermer</button>} />, headerHeight: 62, render: (flow) => <CompletionScreen lessonId={lessonId} flow={flow} /> };
}

function makeSettingsScreen(): FlowScreen {
  return { id: "settings", header: (flow) => <BackHeader flow={flow} title="Réglages" />, headerHeight: 62, render: (flow) => <SettingsScreen flow={flow} /> };
}

function makeProfileScreen(): FlowScreen {
  return { id: "profile", header: (flow) => <BackHeader flow={flow} title="Profil" />, headerHeight: 62, render: (flow) => <ProfileScreen flow={flow} /> };
}

function makeStatsScreen(): FlowScreen {
  return { id: "stats", header: (flow) => <BackHeader flow={flow} title="Statistiques" />, headerHeight: 62, render: () => <StatsScreen /> };
}

function makeLanguageScreen(): FlowScreen {
  return { id: "language", header: (flow) => <BackHeader flow={flow} title="Langue" />, headerHeight: 62, render: (flow) => <LanguageScreen flow={flow} /> };
}

function makeAddWordScreen(): FlowScreen {
  return { id: "add-word", header: (flow) => <BackHeader flow={flow} title="Nouveau mot" />, headerHeight: 62, render: (flow) => <AddWordScreen flow={flow} /> };
}

function makeDetailsScreen(lessonId: string): FlowScreen {
  return { id: `details-${lessonId}`, header: (flow) => <BackHeader flow={flow} title="Détails" />, headerHeight: 62, render: () => <DetailsScreen lessonId={lessonId} /> };
}

function makeShelfScreen(title: string, ids: string[]): FlowScreen {
  return { id: `shelf-${title}`, header: (flow) => <BackHeader flow={flow} title={title} />, headerHeight: 62, render: (flow) => <ShelfScreen ids={ids} flow={flow} /> };
}

function makeInfoScreen(title: string, description: string): FlowScreen {
  return { id: `info-${title}`, header: (flow) => <BackHeader flow={flow} title={title} />, headerHeight: 62, render: (flow) => <InfoScreen title={title} description={description} flow={flow} /> };
}

export default function Prototype() {
  const initial = useMemo<FlowScreen>(() => makeRootScreen("library"), []);
  return <AppProvider><FlowStack initial={initial} /></AppProvider>;
}
