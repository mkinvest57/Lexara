'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { TokenizedText } from '@/components/reader/TokenizedText';
import { WordModal } from '@/components/reader/WordModal';
import { Card, CardContent } from '@/components/ui/card';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const queryClient = useQueryClient();

  const [selectedWord, setSelectedWord] = useState<{
    token: any;
    sentence: any;
  } | null>(null);
  const [wordsRead, setWordsRead] = useState(0);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', params.id],
    queryFn: () => apiClient.getLesson(token, params.id as string),
    enabled: !!token && !!params.id,
  });

  const { data: vocabList } = useQuery({
    queryKey: ['vocab'],
    queryFn: () => apiClient.getVocab(token),
    enabled: !!token,
  });

  const createVocabMutation = useMutation({
    mutationFn: (data: any) => apiClient.createVocab(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocab'] });
      setSelectedWord(null);
    },
  });

  // Log reading activity on mount
  useEffect(() => {
    if (lesson && token) {
      const wordCount = lesson.wordCount || 0;
      setWordsRead(wordCount);
    }
  }, [lesson, token]);

  // Log reading activity on unmount
  useEffect(() => {
    return () => {
      if (wordsRead > 0 && token && lesson) {
        apiClient.logReading(token, 'es', wordsRead, 0); // Assuming Spanish for now
      }
    };
  }, [wordsRead, token, lesson]);

  const handleWordClick = (token: any, sentence: any) => {
    setSelectedWord({ token, sentence });
  };

  const handleSaveWord = async (translation: string) => {
    if (!selectedWord) return;

    await createVocabMutation.mutateAsync({
      term: selectedWord.token.lemma || selectedWord.token.form,
      language: 'es', // TODO: Get from profile
      translation,
      context: selectedWord.sentence.text,
      tokenId: selectedWord.token.id,
      lessonId: lesson.id,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading lesson...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Lesson not found</p>
        <Link href="/library">
          <Button>Back to Library</Button>
        </Link>
      </div>
    );
  }

  // Create a set of saved vocab terms for highlighting
  const savedVocabTerms = new Set(
    vocabList?.map((v: any) => v.term.toLowerCase()) || []
  );

  return (
    <div className="min-h-full bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/library">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{lesson.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {lesson.wordCount} words • {lesson.level}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Words read: {wordsRead}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reader */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <TokenizedText
              sentences={lesson.sentences || []}
              onWordClick={handleWordClick}
              savedVocabTerms={savedVocabTerms}
            />
          </CardContent>
        </Card>
      </div>

      {/* Word Modal */}
      {selectedWord && (
        <WordModal
          word={selectedWord.token.form}
          sentence={selectedWord.sentence.text}
          onClose={() => setSelectedWord(null)}
          onSave={handleSaveWord}
          token={token}
        />
      )}
    </div>
  );
}
