'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookMarked, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function VocabPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);

  const { data: vocabList, isLoading } = useQuery({
    queryKey: ['vocab', statusFilter],
    queryFn: () => apiClient.getVocab(token, statusFilter),
    enabled: !!token,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      apiClient.updateVocabStatus(token, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocab'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const handleMarkAsKnown = (id: string) => {
    updateStatusMutation.mutate({ id, status: 4 });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading vocabulary...</div>
      </div>
    );
  }

  const statusLabels = {
    1: 'Learning 1',
    2: 'Learning 2',
    3: 'Learning 3',
    4: 'Known',
  };

  const statusColors = {
    1: 'bg-blue-500/10 text-blue-500',
    2: 'bg-yellow-500/10 text-yellow-500',
    3: 'bg-orange-500/10 text-orange-500',
    4: 'bg-green-500/10 text-green-500',
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vocabulary</h1>
          <p className="text-muted-foreground">
            {vocabList?.length || 0} saved words (LingQs)
          </p>
        </div>
        <Link href="/review">
          <Button>Review Vocabulary</Button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <Button
          variant={statusFilter === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter(undefined)}
        >
          All
        </Button>
        {[1, 2, 3, 4].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {statusLabels[status as keyof typeof statusLabels]}
          </Button>
        ))}
      </div>

      {/* Vocabulary List */}
      <div className="space-y-3">
        {vocabList?.map((vocab: any) => (
          <Card key={vocab.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{vocab.term}</h3>
                    <Badge className={statusColors[vocab.status as keyof typeof statusColors]}>
                      {statusLabels[vocab.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{vocab.translation}</p>
                  {vocab.occurrences && vocab.occurrences.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm italic text-muted-foreground">
                        "{vocab.occurrences[0].context}"
                      </p>
                      {vocab.occurrences[0].lesson && (
                        <Link
                          href={`/lesson/${vocab.occurrences[0].lesson.id}`}
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {vocab.occurrences[0].lesson.title}
                        </Link>
                      )}
                    </div>
                  )}
                  {vocab.srsItem && (
                    <p className="text-xs text-muted-foreground">
                      Next review:{' '}
                      {new Date(vocab.srsItem.nextReview).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {vocab.status < 4 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsKnown(vocab.id)}
                      disabled={updateStatusMutation.isPending}
                    >
                      Mark as Known
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!vocabList || vocabList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookMarked className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vocabulary yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Start reading lessons and click on words to save them here.
            </p>
            <Link href="/library">
              <Button>Browse Lessons</Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
