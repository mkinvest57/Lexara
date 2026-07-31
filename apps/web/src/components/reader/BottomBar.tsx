'use client';

import { BookOpenText, Pause, Play, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomBarProps {
  onPlayAudio: () => void;
  onToggleFocus: () => void;
  isPlaying: boolean;
  focusMode: boolean;
  wordsRead: number;
  savedWordCount: number;
}

export function BottomBar({ onPlayAudio, onToggleFocus, isPlaying, focusMode, wordsRead, savedWordCount }: BottomBarProps) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-2 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 rounded-full bg-teal-700 text-white hover:bg-teal-800 hover:text-white" onClick={onPlayAudio} aria-label={isPlaying ? 'Pause lesson audio' : 'Listen to lesson'}>
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
        </Button>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-800">{isPlaying ? 'Reading the lesson aloud' : 'Listen while you read'}</p>
          <p className="text-xs text-slate-500">Browser voice · tap again to pause</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-4 rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-500 md:flex"><span><strong className="text-slate-800">{wordsRead}</strong> explored</span><span><strong className="text-slate-800">{savedWordCount}</strong> saved</span></div>
        <Button variant="outline" size="sm" onClick={onToggleFocus} className="min-h-10 gap-2 rounded-xl">
          {focusMode ? <Volume2 className="h-4 w-4" /> : <BookOpenText className="h-4 w-4" />}
          <span className="hidden sm:inline">{focusMode ? 'Show tools' : 'Focus view'}</span>
        </Button>
      </div>
    </div>
  );
}
