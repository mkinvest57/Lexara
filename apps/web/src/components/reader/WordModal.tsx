'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestTranslation } from '@/lib/translate';
import { Loader2 } from 'lucide-react';

interface WordModalProps {
  word: string;
  sentence: string;
  /** Language of `word`; the meaning is always shown in the interface language. */
  sourceLanguage?: string;
  onClose: () => void;
  onSave: (translation: string) => void;
}

export function WordModal({
  word,
  sentence,
  sourceLanguage = 'en',
  onClose,
  onSave,
}: WordModalProps) {
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchTranslation = async () => {
      setFetching(true);
      try {
        const result = await requestTranslation(word, 'fr', sourceLanguage, controller.signal);
        if (active) setTranslation(result.translatedText);
      } catch (error) {
        if ((error as { name?: string })?.name !== 'AbortError')
          console.error('Translation error:', error);
        if (active) setTranslation('');
      } finally {
        if (active) setFetching(false);
      }
    };

    void fetchTranslation();
    return () => {
      active = false;
      controller.abort();
    };
  }, [sourceLanguage, word]);

  const handleSave = async () => {
    if (!translation.trim()) return;
    setLoading(true);
    try {
      await onSave(translation);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">{word}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Context */}
          <div>
            <Label className="text-xs text-muted-foreground">Context</Label>
            <p className="text-sm italic text-muted-foreground mt-1">{sentence}</p>
          </div>

          {/* Translation */}
          <div className="space-y-2">
            <Label htmlFor="translation">Translation</Label>
            {fetching ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Translating...
              </div>
            ) : (
              <Input
                id="translation"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Enter translation…"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleSave();
                  }
                }}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || fetching || !translation.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save word'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
