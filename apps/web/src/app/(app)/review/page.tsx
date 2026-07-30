'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ReviewPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const { data: dueCards, isLoading } = useQuery({
    queryKey: ['srs', 'due'],
    queryFn: () => apiClient.getDueCards(token, 20),
    enabled: !!token,
  });

  const submitReviewMutation = useMutation({
    mutationFn: ({ srsItemId, correct }: { srsItemId: string; correct: boolean }) =>
      apiClient.submitReview(token, srsItemId, correct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['srs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: () => apiClient.startSession(token, dueCards?.length || 0, 'flashcard'),
    onSuccess: (data) => {
      setSessionId(data.id);
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: () => apiClient.endSession(token, sessionId!, correctCount),
  });

  // Start session on mount
  useEffect(() => {
    if (dueCards && dueCards.length > 0 && !sessionId) {
      startSessionMutation.mutate();
    }
  }, [dueCards, sessionId]);

  // End session when complete
  useEffect(() => {
    if (sessionComplete && sessionId) {
      endSessionMutation.mutate();
      // Log review activity
      apiClient.logReview(token, 'es', dueCards?.length || 0);
    }
  }, [sessionComplete, sessionId]);

  const handleAnswer = async (correct: boolean) => {
    const currentCard = dueCards[currentIndex];
    await submitReviewMutation.mutateAsync({
      srsItemId: currentCard.id,
      correct,
    });

    if (correct) {
      setCorrectCount((prev) => prev + 1);
    }

    // Move to next card
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      // Session complete
      setSessionComplete(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading review session...</div>
      </div>
    );
  }

  if (!dueCards || dueCards.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cards due for review</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Great job! Check back later or save more vocabulary to review.
            </p>
            <div className="flex gap-3">
              <Link href="/library">
                <Button>Browse Lessons</Button>
              </Link>
              <Link href="/vocab">
                <Button variant="outline">View Vocabulary</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionComplete) {
    const accuracy = Math.round((correctCount / dueCards.length) * 100);

    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Session Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl font-bold text-primary">{accuracy}%</div>
              <p className="text-muted-foreground">
                {correctCount} correct out of {dueCards.length} cards
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Link href="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
              <Link href="/vocab">
                <Button variant="outline">View Vocabulary</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];
  const progress = ((currentIndex + 1) / dueCards.length) * 100;

  return (
    <div className="min-h-full flex flex-col bg-muted/30">
      {/* Progress Bar */}
      <div className="bg-background border-b p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {dueCards.length}
            </span>
            <span className="text-sm text-muted-foreground">
              Correct: {correctCount}
            </span>
          </div>
          <Progress value={progress} />
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-12 space-y-8">
            {/* Word */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold">{currentCard.vocabEntry.term}</h2>

              {showAnswer && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="border-t pt-4">
                    <p className="text-2xl text-muted-foreground">
                      {currentCard.vocabEntry.translation}
                    </p>
                  </div>

                  {currentCard.vocabEntry.occurrences &&
                    currentCard.vocabEntry.occurrences.length > 0 && (
                      <div className="text-sm italic text-muted-foreground">
                        "{currentCard.vocabEntry.occurrences[0].context}"
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              {!showAnswer ? (
                <Button size="lg" onClick={() => setShowAnswer(true)} className="px-12">
                  Show Answer
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={() => handleAnswer(false)}
                    disabled={submitReviewMutation.isPending}
                    className="px-8"
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    Wrong
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleAnswer(true)}
                    disabled={submitReviewMutation.isPending}
                    className="px-8"
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Correct
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
