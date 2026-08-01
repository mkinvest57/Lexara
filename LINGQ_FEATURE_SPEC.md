# LingQ Complete Feature Specification

> **Purpose**: Reference document for rebuilding LingQ as YAPRO clone.
> **Last updated**: July 31, 2026
> **Source**: lingq.com, App Store, Google Play, blog posts, forum, third-party reviews, knowledge base

---

## Table of Contents

1. [Navigation & Page Structure](#1-navigation--page-structure)
2. [Library / Browse](#2-library--browse)
3. [Reader (Core Experience)](#3-reader-core-experience)
4. [Vocabulary Management](#4-vocabulary-management)
5. [SRS Review System](#5-srs-review-system)
6. [Audio Player](#6-audio-player)
7. [Playlists](#7-playlists)
8. [Import Functionality](#8-import-functionality)
9. [Stats & Progress Tracking](#9-stats--progress-tracking)
10. [Profile & Gamification](#10-profile--gamification)
11. [Community Features](#11-community-features)
12. [Tutor Marketplace](#12-tutor-marketplace)
13. [AI Features](#13-ai-features)
14. [Settings & Customization](#14-settings--customization)
15. [Mobile App Features](#15-mobile-app-features)
16. [Pricing Tiers & Limits](#16-pricing-tiers--limits)
17. [Supported Languages](#17-supported-languages)
18. [Gap Analysis vs YAPRO](#18-gap-analysis-vs-yapro)

---

## 1. Navigation & Page Structure

### Top-Level Navigation (Web)

| Tab | URL Pattern | Description |
|-----|-------------|-------------|
| **Lessons** | `/library/` | Main content hub with Library, Playlists, Vocabulary sub-tabs |
| **Tutors** | `/tutors/` | Tutor marketplace, My Activities sub-tabs |
| **Community** | `/community/` | Forum, Challenges, Writing Exchange, My Profile, Contribute sub-tabs |
| **Groups** | (conditional) | Only visible for users in classrooms/groups |

### Sub-Navigation Under Lessons
- **Library** — Netflix-style scrollable shelves of content
- **Playlists** — Manage audio playlists
- **Vocabulary** — All vocabulary management (All LingQs, Phrases, Due for Review)

### Sub-Navigation Under Community
- **Forum** — Discourse-powered community forum
- **Challenges** — Active/completed challenges with leaderboards
- **Writing Exchange** — Submit and correct writing
- **My Profile** — Public profile with stats, avatar, bio, social links
- **Contribute** — Share lessons to library, translate content

### Header (Global)
- Streak indicator (fire icon, changes color based on 30-day activity)
- Coins counter
- Avatar/profile dropdown
- Language switcher (for multi-language learners)
- Settings gear icon
- Notifications bell

### Mobile (Bottom Tab Bar)
- **Library** (house icon)
- **Playlists** (headphones icon)
- **Reader** (book icon) — context-sensitive
- **Vocabulary** (flashcards icon)
- **More** — Settings, Profile, Challenges, etc.

---

## 2. Library / Browse

### Layout: "Netflix-Style" Shelves

The library is organized as vertically scrollable horizontal shelves. Each shelf represents a category/topic/format.

### Shelf Types

| Shelf | Content |
|-------|---------|
| **Continue Studying** | Lessons/courses the user has already opened (most recently accessed first) |
| **Trending** | Popular lessons across the platform |
| **What's New** | Recently added lessons |
| **Mini Stories** | Short, beginner-friendly stories (60 per language, with native audio) |
| **Guided Courses** | Structured course bundles from LingQ |
| **News Feed / News to Import** | Daily news headlines from target language sources, importable with 1 click |
| **Entertainment** | 10,000+ lessons: TV shows, movies, Netflix content |
| **Culture** | 10,000+ lessons |
| **News** | 20,000+ lessons |
| **Lifestyle** | 4,000+ lessons |
| **Science** | 4,000+ lessons |
| **Food** | 4,000+ lessons |
| **Sports** | 4,000+ lessons |
| **External Content Shelves** | Netflix series, YouTube videos, songs, seasonal content |
| **Topic-Based Shelves** | User-chosen topics (from registration) prioritized above others |

### Library Features
- **Content types**: Podcasts, Books, Articles, Videos, Interviews, TV Shows, Songs
- **Level filtering**: Beginner 1, Beginner 2, Intermediate 1, Intermediate 2, Advanced 1, Advanced 2
- **Course view**: Grouped lessons within a course
- **Lesson card**: Thumbnail image, title, level badge, duration, % new words, % known words
- **Search**: Search lessons by title, topic, tags
- **Recently accessed**: Shows where user left off
- **Adaptive ordering**: Most-used shelves rise to top

### Lesson Info Page
- Description
- Difficulty level
- Word count
- Audio duration
- % new words / % LingQs / % known words (computed from user's vocabulary)
- "Open" / "Continue" button
- Add to Playlist button
- Share lesson
- Course context (if part of a course)

### Mini Stories (60 per language)
- Short texts with native audio
- Each story: main narrative + retell from different perspective + comprehension questions
- Repetition of high-frequency vocabulary and core grammar patterns
- Arranged in order of complexity
- 60 stories per language, 100+ being developed

### Grammar Guides
- Available for 20+ languages
- Accessible explanations of grammar concepts
- Linked from library as resource

---

## 3. Reader (Core Experience)

### 3.1 Word Status & Color Coding

Every word in every lesson is color-coded based on user's vocabulary history:

| Status | Color | Meaning |
|--------|-------|---------|
| **New Word** | Blue highlight | Never encountered before |
| **LingQ (Status 1)** | Yellow highlight | Saved but barely known (1 day SRS interval) |
| **LingQ (Status 2)** | Yellow highlight | Learning (3 day SRS interval) |
| **LingQ (Status 3)** | Yellow highlight | Familiar (7 day SRS interval) |
| **LingQ (Status 4)** | Yellow highlight | Known → moves towards white (15 day interval) |
| **Known Word** | White (no highlight) | Fully learned |

### 3.2 Clicking/Tapping a Word

When user clicks a blue (new) word:
1. **Popup widget appears** showing:
   - The word/phrase in target language
   - **Dictionary definitions** from multiple sources (user's selected dictionaries)
   - **AI-suggested translation** (Premium)
   - **Google Images** integration
   - **Community hints** (other users' definitions/tips)
   - **Phrase detection**: Grey highlighting on nearby words that might form a phrase
   - **Status bar**: 1-2-3-4-Known with visual progress indicator
2. User can:
   - Select a dictionary meaning → **creates a LingQ** (word saved with status 1)
   - Click the green check → mark as **Known** (white, no LingQ created)
   - Click "Ignore" / dismiss → leave as blue (no action)
   - Click "I know this" → mark as Known

When user clicks a yellow (LingQ) word:
1. Same popup but shows current status and saved definition
2. User can:
   - Change definition
   - Move status up/down manually via status bar (1→2→3→4→Known)
   - Delete the LingQ (reverts to blue)
   - Mark as Known (green check)

When user clicks a white (known) word:
1. Shows definition if available
2. Option to "un-know" it (turn back into a LingQ)

### 3.3 Reading Modes

| Mode | Description |
|------|-------------|
| **Page View (default)** | Full text, paginated. Scroll/page through content. |
| **Sentence View / Sentence Mode** | One sentence at a time. Shows sentence translation (if available), vocabulary list for that sentence. Play button for sentence audio. Premium feature. |
| **Listening Mode / Karaoke Mode** | Full-screen audio player with karaoke-style auto-scrolling text synced to audio. Requires timestamped audio. |

### 3.4 Sentence Mode Details
- Shows one sentence at a time
- **Sentence audio button**: Plays audio for current sentence (timestamped or TTS)
- **Show Translation button**: Toggle sentence translation below text
- **Sentence vocabulary**: Lists all LingQs appearing in that sentence
- **Review Sentence button**: Opens sentence-level review activities:
  - **Unscramble**: Reassemble sentence from word parts
  - **Speaking**: Record voice, get feedback on pronunciation accuracy

### 3.5 Lesson Translation
- **In-line translations**: View translations line-by-line within the reader
- **AI-generated translations** for imported content
- **Full Sentence Translations** (Premium feature)
- Translate Lesson option via `...` menu → shows translation below each line

### 3.6 Reader Toolbar / Controls

Top bar:
- Lesson title
- `...` menu (three dots) with: Reader Settings, Translate Lesson, Lesson Info, Share
- Page counter (e.g., "Page 3 of 12")
- Previous/Next page arrows
- Streak/coins indicator

Bottom bar:
- **Sentence View / Page View toggle**
- **Review button** (shows count of LingQs in lesson) with hover/expand sub-options:
  - Review Page / Review Sentence (review LingQs for current page/sentence)
  - Review Due (SRS) (review all LingQs due for SRS review)
  - Review Lesson (review all LingQs in this lesson)
  - Vocabulary List (list all words in lesson with tabs for LingQs, New Words, Known Words)
- Audio player mini-bar (collapsed)

### 3.7 Paging Behavior
- Lessons split into pages
- **"Paging moves to known"** setting: When user turns page, all remaining blue words on that page automatically become Known (white). Can be disabled in Reader Settings.

### 3.8 Vocabulary List (within Reader)
- Popup list of all words in current lesson
- Tabs: LingQs | New Words | All Words
- All Words tab shows even Known Words (no LingQ created), which users requested
- Quick scan to ignore names/native-language words

### 3.9 Sentence Editor (for imported lessons)
- Click sentence in reader to edit:
  - Text
  - Translation
  - Note
  - Audio timestamp
- Edit sentence-by-sentence

---

## 4. Vocabulary Management

### 4.1 Vocabulary Page Structure

Located under Lessons > Vocabulary. Three tabs:

| Tab | Content |
|-----|---------|
| **All LingQs** | Every saved word/phrase across all lessons |
| **Phrases** | Only multi-word phrases (filtered from LingQs) |
| **Due for Review (SRS)** | LingQs that are due for SRS review based on their status and last review date |

### 4.2 Vocabulary List Features
- **Sort**: By date created, status, alphabetical, lesson, random
- **Filter**: By status level (1-4), by course/lesson, by tag, by date range
- **Search**: Search within saved vocabulary
- **Batch actions** (select checkboxes):
  - Increase Status by 1
  - Decrease Status by 1
  - Move to Known
  - Delete
  - Mark as Reviewed (resets SRS timer)
  - Add tags
- **Export**: Download vocabulary list (CSV/Excel)
- **Status bar display**: Visual indicator per word (1-2-3-4-Known)

### 4.3 LingQs of the Day
- Daily email with vocabulary items due for review
- Clickable links to open flashcards/cloze directly from email
- "LingQs of the Day" dropdown on Vocabulary page: view previous 14 days of daily lists
- Daily LingQs due for review take precedence, plus random collection from SRS list
- Configurable count (up to 200 per day)

### 4.4 Word Status Progression

| Status | SRS Interval | How to advance |
|--------|-------------|-----------------|
| Status 1 (New) | 1 day | Manual click OR correct 2x in a row in review |
| Status 2 (Learning) | 3 days | Manual click OR correct 2x in a row in review |
| Status 3 (Familiar) | 7 days | Manual click OR correct 2x in a row in review |
| Status 4 (Known) | 15 days | Manual click OR correct 2x in a row in review |
| Status 4a | 30 days | Correct 1x in review |
| Status 4b | 90 days | Correct 1x in review |
| Status 4c | Never | Fully known — never reviewed again |

### 4.5 Word Data Per LingQ
- Term (the word/phrase in target language)
- Translation/definition
- Phrase context (the sentence it appeared in)
- Status level (1-4c)
- Date created
- Last reviewed date
- Source lesson
- Tags (user-assigned)
- Notes (user notes)

---

## 5. SRS Review System

### 5.1 Review Activities

Five distinct review activity types:

| Activity | Description | Configurable Options |
|----------|-------------|---------------------|
| **Flashcards** | Show term on front, tap to reveal back | Front: term, phrase / Back: term, translation, phrase, status bar |
| **Reverse Flashcards** | Show translation on front, recall term | Same as flashcards, reversed |
| **Cloze (Fill-in-the-blank)** | Show sentence with word blanked out | Context sentence from original lesson |
| **Dictation** | Listen to audio, type the word | Audio playback, text input field |
| **Multiple Choice** | Choose correct translation from options | Number of options configurable |

### 5.2 Review Session Flow
1. User clicks "Review Now" on Vocabulary page (or Review Due from reader)
2. Activities cycle through based on user settings (which activities are enabled)
3. Per word:
   - If answered correctly 2x in a row in same session → status auto-increases 1 level
   - Status bar shown on flashcard backs
   - "Skip" button available
4. Session ends when all words reviewed or user exits
5. Reviewed words are removed from "Due for Review" list

### 5.3 SRS Algorithm Details
- LingQs added to "Due for Review" based on days since last review
- A LingQ is "reviewed" when: created, status changed, or marked as reviewed
- Date resets on status change
- Status 4 LingQs only need 1 correct answer to advance (not 2)
- Mark as Reviewed: manually reset SRS timer without changing status

### 5.4 Where to Review
- **Vocabulary page** → "Due for Review" tab → "Review Now" button
- **Reader** → Review button → "Review Due (SRS)"
- **Reader** → Review button → "Review Page/Sentence"
- **Reader** → Review button → "Review Lesson"
- **Daily email** → Click links to jump into flashcard/cloze

### 5.5 Review Settings
- Enable/disable individual activity types
- Configure flashcards front/back content
- Set number of multiple choice options
- Set daily LingQs of the Day count (1-200)
- Auto-play TTS on flashcards

---

## 6. Audio Player

### 6.1 In-Reader Mini Player
- Always visible at bottom of reader (collapsed bar)
- Play/Pause button
- Current position / total duration
- Expand button → opens full Listening Mode

### 6.2 Full Audio Player / Listening Mode (Karaoke Mode)
- Full-screen overlay or large panel
- Karaoke-style auto-scrolling text synced to audio (requires timestamped audio)
- Play/Pause, Skip back 5s, Skip forward 5s
- Playback speed adjustment (0.5x - 2.0x)
- Volume control
- Progress bar (seekable)
- Current sentence highlighted as audio plays
- Auto-scroll keeps current sentence centered
- If no timestamps, manual scrolling available

### 6.3 Audio Sources
- **Native audio**: Uploaded/imported with lesson
- **Text-to-Speech (TTS)**: Auto-generated for imported lessons (Premium)
- **AI Voices**: Natural-sounding TTS voices (Premium Plus)
- Multiple TTS voice options per language

### 6.4 Playback Behavior
- Real-time tracking: listening to any portion counts (not just full completion)
- Listening time tracked across all audio (lessons + playlists)
- TTS settings:
  - Auto-play TTS: on/off
  - Stop lesson audio to play TTS: on/off
  - Don't play TTS when lesson audio is playing: on/off

### 6.5 Audio Import Limits
- Max 60 minutes per audio file
- Max 60MB file size
- Supported formats: MP3 primarily

---

## 7. Playlists

### 7.1 Playlist Features
- **Multiple playlists**: Users can create and manage multiple playlists (Premium: unlimited; Free: 1)
- Organize by topic, course, difficulty level, or any criteria
- **Add to Playlist**: From Lesson Info page, select existing playlist or create new
- **Playlist playback**: Play all audio in sequence, shuffle, repeat
- **Cross-device sync**: Playlists sync across web, iOS, Android
- **Offline playback**: Download playlist for offline listening (Premium)
- **Auto-play**: Continuous playback through playlist items

### 7.2 Playlist Management
- Create new playlist
- Rename playlist
- Delete playlist
- Add/remove lessons
- Reorder lessons within playlist
- Shuffle toggle
- Total duration display

### 7.3 Mini-Player for Playlists
- Persistent audio player bar
- Shows current lesson title + thumbnail
- Play/Pause, Next, Previous
- Expand to full player

---

## 8. Import Functionality

### 8.1 Import Sources

| Source | Method | Details |
|--------|--------|---------|
| **Web articles / blogs** | Browser extension or manual | Auto-captures title, text, image, URL |
| **YouTube** | Browser extension | Requires video to have captions (CC). Captions become transcript. |
| **Netflix** | Browser extension | Imports subtitles as transcript |
| **Podcasts** | Browser extension + AI transcription | AI audio transcription (Premium Plus) |
| **eBooks** | Manual upload | EPUB, PDF, TXT. Size limit: 60MB |
| **Songs** | Browser extension | Import lyrics |
| **Manual text** | Copy-paste into import form | Title, text, image URL, audio upload, translation |
| **Amazon Prime Video** | Browser extension | Subtitles import |
| **Disney+** | Browser extension | Subtitles import |
| **Apple TV** | Browser extension | Subtitles import |
| **TikTok** | Browser extension | Captions import |
| **YouTube Shorts** | Browser extension | Captions import |
| **Spotify** | Browser extension | (with lyrics) |

### 8.2 Browser Extension (LingQ Importer)
- Available for: **Chrome, Firefox, Safari, Edge**
- **One-click import**: Click extension icon on any supported page
- **Captures**: Title, text/content, image, captions/subtitles, original URL
- **Settings per import**: Language selection, target course (existing or new), tags
- **Mobile import**: Via browser Share → LingQ Importer extension (iOS/Android)
- Works on apps with built-in browsers (Twitter, etc.)
- Auto-creates course if specified course doesn't exist

### 8.3 Manual Import Form
- **Title** (required)
- **Language** selection
- **Image** URL or upload
- **Text content** (paste or type)
- **Original URL** (for sharing in library)
- **Audio file** upload (MP3, max 60MB, max 60 min)
- **Translation** text (optional)
- **Video URL** (optional)
- **Script/Exercise** (optional)
- **Attachment** (optional)
- **Level**: Beginner 1/2, Intermediate 1/2, Advanced 1/2
- **Tags**: Comma-separated for categorization
- **Course**: Select existing or create new
- **Share to Library**: Option to make publicly available (copyright-free content only)

### 8.4 Auto-Generated Content
- **Auto-generated audio**: TTS audio created for imported text lessons (Premium)
- **AI transcription**: Turn podcast/audiobook into interactive lesson (Premium Plus, limited credits)
- **AI-simplified lesson**: Generate simpler version of advanced content (Premium Plus)

### 8.5 Import Limits
- Free: 5 lessons total
- Premium: Unlimited
- 60 min / 60MB per audio file
- Longer content split into chunks (separate lessons)
- YouTube imports require video to have CC/subtitles
- Netflix imports may take time to process audio

---

## 9. Stats & Progress Tracking

### 9.1 Tracked Metrics

| Metric | Description |
|--------|-------------|
| **Known Words** | Total count of Status 4+Known words |
| **LingQs Created** | Total LingQs ever created |
| **LingQs Learned** | Count moved to Status 4 or Known |
| **Words Read** | Every word read on LingQ (real-time tracking in v5) |
| **Listening Hours** | All time listening to lesson audio & playlists (real-time tracking) |
| **Coins Earned** | From creating LingQs, increasing status, marking known, reading, listening |
| **Streak (Days)** | Consecutive days meeting daily goal |
| **Activity Score** | Based on coins earned in last 30 days |

### 9.2 Stats Display

**Weekly Summary Widget** (accessible via Streak icon in header):
- Current week's activity graph
- Words read this week
- Listening time this week
- LingQs created this week
- Coins earned this week
- Comparison to previous week

**Profile Page** (`/community/profile`):
- **All languages view**: Toggle between languages studied
- **Timeframes**: Day, Week, Month, Year, All Time
- **Graphs**: 
  - Known words over time
  - Words read over time
  - Listening hours over time
  - LingQs created over time
  - Activity by day of week
- **Breakdown by language**: Each language has its own stats
- **Manual stat entry**: `+` button to manually add stats for offline activity

**Streak Indicator**:
- Fire icon in header
- Changes color based on coins earned in last 30 days (Activity Score)
- Cold (grey) → Warm (orange) → Hot (red/flame)

### 9.3 Known Words by Language (Milestones)
- Badges at milestones: 1K, 5K, 10K, 25K, 50K, 100K+
- Known word count varies by language grammar (e.g., Finnish has higher counts due to agglutination)

### 9.4 Lesson-Level Stats
- Before opening lesson: Shows % new words, % LingQs, % known words
- In reader: Review button shows LingQ count
- After completing: Stats update automatically

---

## 10. Profile & Gamification

### 10.1 User Profile
- **Avatar**: Customizable avatar that grows as user levels up
- **Bio**: Text description
- **Social links**: Connect social media
- **Language list**: Languages being studied with stats per language
- **Badges**: Earned from challenges
- **Streak**: Current streak displayed
- **Coins**: Total coins accumulated
- **Follower system**: Follow other learners, be followed
- **Profile wall**: Comments from other users (social network style)

### 10.2 Coins System
- **Earned by**: Creating LingQs, increasing status, marking words known, listening, reading
- **Used for**: Avatar upgrades/customization (cosmetic only)
- **NOT the same as Points** (Points = currency for tutoring/writing correction)

### 10.3 Daily Goal & Streak
- **Daily Goal**: Configurable target (e.g., 500 words read, 30 min listening)
- **Streak**: Consecutive days meeting the goal
- **Streak freezes**: Available (vacation mode?)
- **Notifications**: Reminders to maintain streak
- Based on **Coins earned per day** (comprehensive: not just LingQs created)

### 10.4 Challenges
- Located under Community > Challenges
- **Active challenges**: Join ongoing challenges with specific goals
- **Types**: 90-day challenges, monthly LingQ creation challenges
- **Leaderboard**: Compete against other learners
- **Badges**: Earned for completing challenges, displayed on profile
- **Goals tracked**: Based on LingQ statistics (reading, listening, LingQs created)

### 10.5 Avatar System
- Grows/upgrades as user achieves levels
- Coin-purchasable customization items
- Separate from learning progress (cosmetic)

---

## 11. Community Features

### 11.1 Forum
- Powered by Discourse
- Categories: Open Forum, Support & Feedback, Content Forum, Language-specific forums
- Discussion threads, replies, likes
- Feature requests (Canny integration)
- Updates & announcements from LingQ team

### 11.2 Writing Exchange
- Located at Community > Writing Exchange
- **Submit writing**: Select language, add title, write up to 200 words
- **Spell check**: Built-in before submission
- **Correction by community**: Native speakers correct writing
- **Correct others**: Native speakers can highlight words/phrases and suggest corrections
- **Correction guidelines**: Focus on natural-sounding corrections, highlight words rather than sentences
- **Import corrected text**: Corrected text can be imported as a new lesson
- **Reciprocal**: Users correct in their native language, get corrected in target language

### 11.3 Groups / Classrooms
- Create private groups (classrooms) to share lessons
- Invite friends/students
- Group-specific lessons: imported content shared only within the group
- Used by teachers for classroom settings

### 11.4 Contribute
- Share user-created lessons to the public library
- Must be copyright-free content
- Requires: lesson text, audio file, appropriate tags, level, description
- Translate existing content
- Earn points for contributions

### 11.5 Language Exchange Partnerships
- Find native speakers learning your language
- Reciprocal learning arrangement
- Video, voice, or written communication

---

## 12. Tutor Marketplace

### 12.1 Tutor Discovery
- Located at Tutors tab
- **Browse tutors** by: Language, price, rating, availability
- **Tutor profile**: Photo, bio, languages, hourly rate, student reviews, availability calendar
- **Filter**: By language taught, price range, rating

### 12.2 Booking & Sessions
- **Session lengths**: 30, 45, 60, 90 minutes
- **Session types**: Live conversation, writing correction
- **Platform**: Sessions conducted via Skype (external)
- **Payment**: Via LingQ Points (not coins)
- **Scheduling**: Calendar-based booking system
- **Post-session**: Rating and review system

### 12.3 LingQ Points (Currency)
- **Used for**: Tutoring sessions, writing corrections, premium lessons
- **Value**: ~$0.01 per point
- **Earned by**: 
  - Purchasing (via subscription or directly)
  - Tutoring others
  - Referring friends
  - Sharing lessons in library
- **Premium Plus includes**: 3,000 points/month
- **Tutor rates**: Typically 10-20 EUR/hour, varies by language

### 12.4 My Activities
- View upcoming and past tutoring sessions
- Session history
- Writing corrections received/sent
- Points balance and transaction history

### 12.5 Becoming a Tutor
- Any user can create a tutor profile
- Set own hourly rate
- Set availability
- LingQ serves as marketplace (not employer)
- Similar model to italki/Preply

---

## 13. AI Features

### 13.1 Lynx AI Chatbot (Premium Plus)
- In-reader AI assistant
- Explain words, sentences, grammar in context
- Real-time web search capability
- Detailed tutor-like responses
- Available from reader and vocabulary views

### 13.2 AI Audio Transcription (Premium Plus)
- Turn podcasts and audiobooks into interactive lessons
- Auto-generates transcript from audio
- Limited to ~6x per month (Premium Plus)

### 13.3 AI Voices / TTS (Premium Plus)
- Natural-sounding text-to-speech voices
- Multiple voice options per language
- Used for: lessons, reviews, chatbot responses

### 13.4 AI-Simplified Lesson (Premium Plus)
- Generate simplified version of advanced content
- Helps beginners/intermediates access interesting content earlier
- One-click simplification of any lesson

### 13.5 AI-Suggested Translations (Premium)
- Context-aware translation suggestions when clicking words
- Appears alongside dictionary definitions in the popup widget
- Can be selected as the LingQ definition

---

## 14. Settings & Customization

### 14.1 General Settings
- **Theme**: Light / Dark mode
- **Language**: Interface language (17 languages)
- **Daily Goal**: Set targets for reading/listening/LingQs

### 14.2 Reader Settings

| Setting | Options | Description |
|---------|---------|-------------|
| **Font Family** | 12 fonts on web, 4 on iOS | Font selection for lesson text |
| **Font Size** | Slider/± buttons | Adjustable text size |
| **Line Spacing** | 1.0x – 3.0x | Space between lines |
| **Page Width** | Single / Double page | Double simulates open book |
| **Highlight Style** | Standard / Underline | How new/LingQ words are highlighted |
| **Related Phrases** | On / Off | Grey highlight on nearby words that could form phrases |
| **Paging Moves to Known** | On / Off | Auto-mark remaining blue words as known when turning page |
| **Show Vocabulary in Sentence View** | On / Off | Show LingQs list below sentence |
| **Merge Separate Meanings** | On / Off | Show definitions in one paragraph vs. separate lines |
| **Text Direction** | LTR / RTL | For RTL languages (Arabic, Hebrew, etc.) |

### 14.3 Audio / TTS Settings
- **Auto-play TTS**: On/Off
- **Stop lesson audio to play TTS**: On/Off
- **Don't play TTS when lesson audio is playing**: On/Off
- **Playback speed**: Default speed for all audio
- **TTS voice selection**: Per language

### 14.4 Review Settings
- Enable/disable each review activity type
- Flashcard front/back configuration
- Multiple choice options count
- Daily LingQs of the Day count (1-200)

### 14.5 Account Settings
- Email, password
- Subscription management (upgrade/downgrade/cancel)
- Payment method
- Linked accounts
- Language learning languages (add/remove)
- Delete account
- Delete language data (reset progress for one language)

### 14.6 Notification Settings
- Daily reminder
- Streak warnings
- Challenge updates
- Forum replies
- New content alerts
- Email frequency

---

## 15. Mobile App Features

### 15.1 Platform Support
- **iOS**: Native app (App Store, 4.7★, 45,000+ reviews)
- **Android**: Native app (Google Play)
- Cross-device sync with web platform

### 15.2 Mobile-Specific Features
- **Bottom tab navigation**: Library, Playlists, Reader, Vocabulary, More
- **Offline mode**: Download lessons for offline study (Premium)
- **Background audio**: Continue listening when app is backgrounded
- **Playlist sync**: Download playlists via WiFi (3G optional in settings)
- **Streak Widget**: Home-screen widget showing streak status (Android)
- **Push notifications**: Reminders, streak warnings, challenge updates
- **Share extension**: Import from other apps via iOS/Android share menu
- **Auto-rotate support**: Reader rotation for landscape reading
- **Karaoke mode**: Smooth-scrolling text synced to audio
- **Sentence Mode**: Swipe between sentences (one-hand operation)
- **Auto-play in sentence mode**: Audio auto-plays when changing sentences (v5.14+)

### 15.3 Offline Behavior
- Lessons fully loaded while online are available offline
- Vocabulary data syncs when back online
- Stats update on server when connection restored
- Offline streaks sync when reconnected

### 15.4 Mobile Import
- Via browser Share menu → LingQ Importer
- Works from mobile browser (not YouTube/Netflix native apps)
- Same import flow as desktop extension

---

## 16. Pricing Tiers & Limits

### 16.1 Free Tier
- ✅ Thousands of hours of audio with transcript
- ✅ Save up to **20 LingQs** (words/phrases) total
- ✅ Import up to **5 lessons** total
- ✅ **1 audio playlist**
- ✅ Flashcard quizzes
- ✅ Basic progress tracking
- ❌ Ads displayed
- ❌ No offline access
- ❌ No sentence translations
- ❌ No auto-generated audio
- ❌ No challenges
- ❌ No AI features

### 16.2 Premium ($10-$14.99/month)
Everything in Free, plus:
- ✅ **Unlimited LingQs** (saved words)
- ✅ **Unlimited imports**
- ✅ **Unlimited playlists**
- ✅ Full sentence translations
- ✅ Auto-generated TTS audio for imported lessons
- ✅ Full statistic tracking
- ✅ Language learning challenges
- ✅ Offline access
- ✅ Streak tracking
- ✅ Community features
- ✅ AI-suggested translations
- ✅ No ads

### 16.3 Premium Plus ($29.99-$41.99/month)
Everything in Premium, plus:
- ✅ **3,000 LingQ Points/month** (for tutoring, writing correction, premium lessons)
- ✅ Live tutoring sessions
- ✅ Writing correction by tutors
- ✅ Premium lessons
- ✅ AI audio transcription (6x/month)
- ✅ AI voices (natural TTS)
- ✅ Advanced Lynx AI Chatbot
- ✅ AI simplified lessons

### 16.4 Points (Separate Currency)
- Used for: Tutoring, writing corrections, premium lessons
- Purchased: Directly or included in Premium Plus
- Earned by: Tutoring others, referring friends, sharing lessons
- Rate: ~$0.01 per point

---

## 17. Supported Languages

### 17.1 Full List (52+ languages)

Arabic, Armenian, Belarusian, Bulgarian, Cantonese, Catalan, Chinese (Mandarin), Croatian, Czech, Danish, Dutch, English, Esperanto, Finnish, French, Georgian, German, Greek, Gujarati, Hebrew, Hindi, Hungarian, Icelandic, Indonesian, Irish Gaelic, Italian, Japanese, Khmer, Korean, Latin, Macedonian, Malay, Norwegian, Persian (Farsi), Polish, Portuguese, Punjabi, Romanian, Russian, Serbian, Slovak, Slovenian, Spanish, Swahili, Swedish, Tagalog, Taiwanese Mandarin, Thai, Turkish, Ukrainian, Urdu, Vietnamese

### 17.2 Language Maturity Levels
- **Full-featured**: Spanish, French, German, Japanese, Chinese, Korean, Italian, Portuguese, English, Russian, Swedish, Dutch, Polish, Greek, Finnish, Norwegian, Czech, Arabic, Hebrew, Turkish
- **Growing content**: Vietnamese, Punjabi, Hungarian, Irish Gaelic, Tagalog, Swahili, etc.
- **Beta**: Some less-common languages have limited content

### 17.3 Per-Language Features
- **60 Mini Stories**: Available in every supported language
- **Grammar guides**: Available for 20+ languages
- **Furigana reading aid**: For Japanese
- **Pinyin option**: For Mandarin Chinese
- **RTL support**: Arabic, Hebrew
- Each language has independent:
  - Known word count
  - Listening hours
  - Words read
  - LingQs
  - Stats history

---

## 18. Gap Analysis vs YAPRO

Based on what YAPRO already has implemented vs the full LingQ feature set above.

### ✅ Already Implemented
- Auth system
- Lesson library (basic)
- Reader with tokenized text + translation panel
- Vocab saving with SRS levels
- Basic flashcards
- Stats dashboard (basic)

### ❌ Missing / Not Yet Implemented

#### Critical (Core Experience)
- [ ] **Word color-coding** in reader (blue/yellow/white per word across all lessons)
- [ ] **Word click popup widget** with dictionary definitions, AI translations, status bar
- [ ] **Multiple dictionary sources** in popup
- [ ] **Phrase detection** (grey highlighting nearby words)
- [ ] **SRS status bar** (visual 1-2-3-4-Known indicator)
- [ ] **Sentence Mode** (one sentence at a time with audio, translation, vocabulary)
- [ ] **Listening Mode / Karaoke Mode** (full-screen with synced text scroll)
- [ ] **Review button in reader** with sub-options (Review Page/Sentence/Due/Lesson)
- [ ] **Vocabulary List within reader** (All Words / New Words / LingQs tabs)
- [ ] **"Paging moves to known"** behavior
- [ ] **Multiple review activity types** (cloze, dictation, multiple choice, reverse flashcards)
- [ ] **Manual status advancement** (status bar clicking)
- [ ] **"Correct 2x in a row → auto-advance"** logic
- [ ] **"Mark as Reviewed"** batch action
- [ ] **Vocabulary page tabs** (All LingQs / Phrases / Due for Review)
- [ ] **Vocabulary filter/sort/search/batch actions**

#### High Priority (Platform Value)
- [ ] **Audio player with playback speed, skip, progress bar**
- [ ] **TTS integration** (auto-generate audio for text)
- [ ] **Playlists** (create, manage, play, shuffle, download)
- [ ] **Import system** (manual form, browser extension concept)
- [ ] **Netflix-style library shelves** (Continue Studying, Trending, What's New, etc.)
- [ ] **Lesson Info page** (% new words, add to playlist, etc.)
- [ ] **Complete stats/progress** (known words graph, listening hours, words read, activity score)
- [ ] **Streak system** with fire icon and Activity Score
- [ ] **Daily Goal setting**
- [ ] **Coins system** (earned through activity)
- [ ] **Avatar system** (upgradable with coins)
- [ ] **Profile page** with per-language stats, timeframes
- [ ] **Challenges** (join, leaderboards, badges)
- [ ] **Multi-language support** (user studies multiple languages)
- [ ] **Mini Stories** content type
- [ ] **Grammar guides** content type
- [ ] **Lesson sharing** (user-generated to public library)
- [ ] **Dark mode**

#### Medium Priority (Community & Extended)
- [ ] **Writing Exchange** (submit, correct, import corrected text)
- [ ] **Forum** (Discourse integration or custom)
- [ ] **Tutor marketplace** (browse, book, sessions, points payment)
- [ ] **LingQ Points** currency system (separate from coins)
- [ ] **Groups / Classrooms** (private lesson sharing)
- [ ] **Social profile** (followers, wall, bio, social links)
- [ ] **Mobile offline mode** (download lessons, sync)
- [ ] **Push notifications**
- [ ] **Browser extension** (Chrome, Firefox, Safari, Edge)
- [ ] **Sentence Editor** (edit text, translation, timestamp per sentence)
- [ ] **Audio timestamping** tool
- [ ] **Daily LingQs email**
- [ ] **LingQs of the Day** stored 14-day history

#### Lower Priority (Premium Plus / AI)
- [ ] **AI chatbot** (Lynx-style in-reader assistant)
- [ ] **AI audio transcription** (podcasts → lessons)
- [ ] **AI voices** (natural TTS)
- [ ] **AI simplified lessons** (generate easier version)
- [ ] **AI suggested translations** in reader popup
- [ ] **Sentence review activities** (Unscramble, Speaking with voice recording)

#### Nice-to-Have
- [ ] **Pricing tiers** (Free/Premium/Premium Plus with feature gating)
- [ ] **Referral system** (earn points)
- [ ] **Streak freezes / vacation mode**
- [ ] **Google Images integration** in popup
- [ ] **RTL text support** (Arabic, Hebrew)
- [ ] **Furigana for Japanese**
- [ ] **Pinyin for Mandarin**
- [ ] **15-writing correction workflow** (200 word limit, spell check)

---

## Appendix A: Key User Flows

### A.1: New User Onboarding
1. Create account / sign in
2. Select target language(s)
3. Select interests/topics (populates prioritized shelves)
4. Set initial level (Beginner/Intermediate/Advanced)
5. Land on Library → "Continue Studying" shelf empty, "Mini Stories" and "Getting Started" shelves visible
6. Open first lesson → reader with mostly blue words

### A.2: Core Reading Flow
1. Browse Library → find interesting lesson
2. Open lesson → reader loads, all words color-coded
3. Click blue words → popup shows definitions → select meaning → word turns yellow (LingQ created)
4. Click yellow words → adjust status, change definition, or mark known
5. Toggle Sentence Mode → read one sentence at a time, listen to audio, review sentence vocabulary
6. Complete lesson → stats update (words read, LingQs created, listening time, coins)

### A.3: Review Flow
1. Notification/email: "You have X LingQs due for review"
2. Go to Vocabulary > Due for Review tab
3. Click "Review Now"
4. Cycle through review activities (flashcards → cloze → dictation → multiple choice)
5. Correct answers advance status; reviewed words removed from queue
6. Return to reading new content

### A.4: Import Flow
1. Find content online (article, YouTube video, Netflix show)
2. Click LingQ Importer browser extension
3. Select language, course, add tags
4. Click Import
5. Open in LingQ reader → all text ready, word tracking active
6. For YouTube/Netflix: captions become transcript, audio auto-generated

---

## Appendix B: Database Schema Requirements (High-Level)

From the feature set above, the key data entities needed:

```
User
  - id, email, name, avatar, bio, social_links
  - subscription_tier (free/premium/premium_plus)
  - coins_balance
  - points_balance
  - daily_goal_config

UserLanguage
  - user_id, language_code
  - known_words_count, words_read, listening_seconds
  - streak_days, activity_score

Lesson
  - id, title, description, language_code
  - content (full text, paginated)
  - audio_url, audio_duration
  - video_url
  - thumbnail_url
  - source_url
  - level (beginner_1..advanced_2)
  - content_type (article, podcast, video, book, mini_story, grammar)
  - tags[]
  - is_public, author_user_id
  - course_id
  - created_at, updated_at

Course
  - id, title, description, language_code
  - lesson_count, audio_hours
  - created_by_user_id

Page
  - id, lesson_id, page_number, content

Sentence
  - id, lesson_id, page_id, order
  - text, translation
  - audio_start_ms, audio_end_ms

LingQ (VocabularyItem)
  - id, user_id, language_code
  - term, translation, phrase_context
  - status (1,2,3,4,4a,4b,4c,known)
  - source_lesson_id, source_sentence_id
  - tags[]
  - notes
  - created_at, last_reviewed_at, status_changed_at

Playlist
  - id, user_id, name
  - lesson_ids[] (ordered)
  - created_at

Challenge
  - id, title, description, language_code
  - type, goal_metric, goal_value
  - start_date, end_date
  - participants[], leaderboard[]

WritingSubmission
  - id, user_id, language_code
  - title, content (max 200 words)
  - status (pending/corrected)
  - corrected_text
  - corrector_user_id

TutorProfile
  - user_id, languages_taught[]
  - hourly_rate_points, bio
  - rating, review_count

TutoringSession
  - id, tutor_user_id, student_user_id
  - language_code, session_type
  - scheduled_at, duration_minutes
  - status, points_cost

ReviewActivityConfig
  - user_id
  - flashcard_enabled, reverse_enabled, cloze_enabled
  - dictation_enabled, multiple_choice_enabled
  - flashcard_front_config, flashcard_back_config
  - daily_lingqs_count
```

---

## Appendix C: Key LingQ 5.0 Changes (Dec 2021)

1. **Library redesign**: Netflix-style scrollable shelves replacing old layout
2. **Daily Goal / Streak overhaul**: Based on Coins earned (not just LingQs created)
3. **Real-time tracking**: Reading/listening tracked continuously, not just first-read/full-completion
4. **Activity Apple replaced** with Streak Indicator (fire icon, color-coded)
5. **Expanded external content**: Shelves for Netflix, YouTube, TV shows, songs
6. **Streamlined reader**: Less cluttered UI
7. **In-line translations**: View translations within reader
8. **Improved dictionary access**: Horizontal scroll in widget
9. **Dark Mode**: Across web, iOS, Android
10. **Reader customization**: 12 fonts, line spacing 1.0-3.0, highlight styles
11. **Listening Mode / Karaoke Mode**: Auto-scrolling text synced to audio
12. **Multiple playlists**: Not just one big playlist
13. **Review button sub-options**: Review Page/Sentence/Due/Lesson + Vocabulary List
14. **Sentence Editor**: Edit text, translation, notes, timestamps per sentence
15. **Import improvements**: Easier translations, audio timestamping

---

*End of specification. This document should be treated as the canonical reference for LingQ features when building YAPRO.*
