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
import { apiClient } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

interface WordModalProps {
  word: string;
  sentence: string;
  onClose: () => void;
  onSave: (translation: string) => void;
  token: string;
}

export function WordModal({ word, sentence, onClose, onSave, token }: WordModalProps) {
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    // Fetch translation
    const fetchTranslation = async () => {
      try {
        setFetching(true);
        const result = await apiClient.translate(token, word, 'en', sentence);
        setTranslation(result.translatedText || word);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslation('');
      } finally {
        setFetching(false);
      }
    };

    fetchTranslation();
  }, [word, sentence, token]);

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
