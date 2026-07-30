'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function LibraryPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const [levelFilter, setLevelFilter] = useState<string | undefined>(undefined);

  const { data: profile } = useQuery({
    queryKey: ['language-profile'],
    queryFn: () => apiClient.getLanguageProfile(token),
    enabled: !!token,
  });

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons', profile?.id, levelFilter],
    queryFn: () => apiClient.getLessons(token, profile.id, levelFilter),
    enabled: !!token && !!profile,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Library</h1>
          <p className="text-muted-foreground">Choose a lesson to start learning</p>
        </div>
      </div>

      {/* Level Filter */}
      <div className="flex gap-2">
        <Button
          variant={levelFilter === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLevelFilter(undefined)}
        >
          All Levels
        </Button>
        <Button
          variant={levelFilter === 'beginner' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLevelFilter('beginner')}
        >
          Beginner
        </Button>
        <Button
          variant={levelFilter === 'intermediate' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLevelFilter('intermediate')}
        >
          Intermediate
        </Button>
        <Button
          variant={levelFilter === 'advanced' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLevelFilter('advanced')}
        >
          Advanced
        </Button>
      </div>

      {/* Lessons Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lessons?.map((lesson: any) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>

      {!lessons || lessons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No lessons found</h3>
            <p className="text-sm text-muted-foreground text-center">
              Try selecting a different level or check back later for new content.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function LessonCard({ lesson }: { lesson: any }) {
  const levelColors = {
    beginner: 'bg-green-500/10 text-green-500',
    intermediate: 'bg-yellow-500/10 text-yellow-500',
    advanced: 'bg-red-500/10 text-red-500',
  };

  return (
    <Link href={`/lesson/${lesson.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        {lesson.imageUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={lesson.imageUrl}
              alt={lesson.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{lesson.title}</CardTitle>
            <Badge className={levelColors[lesson.level as keyof typeof levelColors]}>
              {lesson.level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{lesson.wordCount} words</span>
            <span className="capitalize">{lesson.type}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
