-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "language_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "dailyGoalWords" INTEGER NOT NULL DEFAULT 100,
    "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 15,
    "dailyGoalCards" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "language_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "imageUrl" TEXT,
    "level" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentences" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "audioUrl" TEXT,
    "audioStart" DOUBLE PRECISION,
    "audioEnd" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sentences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" TEXT NOT NULL,
    "sentenceId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "form" TEXT NOT NULL,
    "lemma" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocab_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "notes" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocab_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocab_occurrences" (
    "id" TEXT NOT NULL,
    "vocabEntryId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "encounteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocab_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "srs_items" (
    "id" TEXT NOT NULL,
    "vocabEntryId" TEXT NOT NULL,
    "nextReview" TIMESTAMP(3) NOT NULL,
    "lastReview" TIMESTAMP(3),
    "interval" INTEGER NOT NULL DEFAULT 1,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "srs_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "itemsCount" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'flashcard',

    CONSTRAINT "review_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "wordsRead" INTEGER NOT NULL DEFAULT 0,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "language_profiles_userId_key" ON "language_profiles"("userId");

-- CreateIndex
CREATE INDEX "lessons_profileId_idx" ON "lessons"("profileId");

-- CreateIndex
CREATE INDEX "lessons_level_idx" ON "lessons"("level");

-- CreateIndex
CREATE INDEX "sentences_lessonId_idx" ON "sentences"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "sentences_lessonId_index_key" ON "sentences"("lessonId", "index");

-- CreateIndex
CREATE INDEX "tokens_sentenceId_idx" ON "tokens"("sentenceId");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_sentenceId_index_key" ON "tokens"("sentenceId", "index");

-- CreateIndex
CREATE INDEX "vocab_entries_userId_language_idx" ON "vocab_entries"("userId", "language");

-- CreateIndex
CREATE INDEX "vocab_entries_userId_status_idx" ON "vocab_entries"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "vocab_entries_userId_term_language_key" ON "vocab_entries"("userId", "term", "language");

-- CreateIndex
CREATE INDEX "vocab_occurrences_vocabEntryId_idx" ON "vocab_occurrences"("vocabEntryId");

-- CreateIndex
CREATE INDEX "vocab_occurrences_lessonId_idx" ON "vocab_occurrences"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "srs_items_vocabEntryId_key" ON "srs_items"("vocabEntryId");

-- CreateIndex
CREATE INDEX "srs_items_nextReview_idx" ON "srs_items"("nextReview");

-- CreateIndex
CREATE INDEX "review_sessions_userId_idx" ON "review_sessions"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_userId_createdAt_idx" ON "activity_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_logs_userId_type_idx" ON "activity_logs"("userId", "type");

-- AddForeignKey
ALTER TABLE "language_profiles" ADD CONSTRAINT "language_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "language_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentences" ADD CONSTRAINT "sentences_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "sentences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocab_entries" ADD CONSTRAINT "vocab_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocab_occurrences" ADD CONSTRAINT "vocab_occurrences_vocabEntryId_fkey" FOREIGN KEY ("vocabEntryId") REFERENCES "vocab_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocab_occurrences" ADD CONSTRAINT "vocab_occurrences_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocab_occurrences" ADD CONSTRAINT "vocab_occurrences_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "srs_items" ADD CONSTRAINT "srs_items_vocabEntryId_fkey" FOREIGN KEY ("vocabEntryId") REFERENCES "vocab_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_sessions" ADD CONSTRAINT "review_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
