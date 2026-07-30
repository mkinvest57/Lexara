'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const { data: todayStats, isLoading: loadingToday } = useQuery({
    queryKey: ['stats', 'today'],
    queryFn: () => apiClient.getTodayStats(token),
    enabled: !!token,
  });

  const { data: overviewStats, isLoading: loadingOverview } = useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: () => apiClient.getOverviewStats(token),
    enabled: !!token,
  });

  const { data: profile } = useQuery({
    queryKey: ['language-profile'],
    queryFn: () => apiClient.getLanguageProfile(token),
    enabled: !!token,
  });

  if (loadingToday || loadingOverview) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const wordsProgress = profile?.dailyGoalWords
    ? (todayStats?.wordsRead / profile.dailyGoalWords) * 100
    : 0;
  const cardsProgress = profile?.dailyGoalCards
    ? (todayStats?.cardsReviewed / profile.dailyGoalCards) * 100
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name || 'Learner'}!</p>
      </div>

      {/* Today's Goals */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Read Today</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats?.wordsRead || 0}</div>
            <p className="text-xs text-muted-foreground">
              Goal: {profile?.dailyGoalWords || 100} words
            </p>
            <Progress value={wordsProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Reviewed</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats?.cardsReviewed || 0}</div>
            <p className="text-xs text-muted-foreground">
              Goal: {profile?.dailyGoalCards || 10} cards
            </p>
            <Progress value={cardsProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minutes Listened</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats?.minutesListened || 0}</div>
            <p className="text-xs text-muted-foreground">
              Goal: {profile?.dailyGoalMinutes || 15} minutes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Known Words</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats?.knownWords || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total LingQs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats?.totalLingqs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Read</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewStats?.totalWordsRead?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Cards</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats?.dueCards || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href="/library">
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Lessons
            </Button>
          </Link>
          {overviewStats?.dueCards > 0 && (
            <Link href="/review">
              <Button variant="secondary">
                <Brain className="mr-2 h-4 w-4" />
                Review {overviewStats.dueCards} Cards
              </Button>
            </Link>
          )}
          <Link href="/vocab">
            <Button variant="outline">View Vocabulary</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
