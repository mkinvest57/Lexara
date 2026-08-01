'use client';

import { useState, useRef, useEffect } from 'react';
import { useProductStore } from '@/lib/product-store';
import { Button } from '@/components/ui/button';

type Message = { role: 'user' | 'assistant'; content: string };

export function LynxChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const profile = useProductStore((s) => s.profile);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting: Message = {
        role: 'assistant',
        content: `Hi! I'm Lynx, your language coach 🦊 I'm here to help you practice ${profile.targetLanguage || 'your target language'}. What would you like to work on today?`,
      };
      setMessages([greeting]);
    }
  }, [open, messages.length, profile.targetLanguage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const next: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          targetLanguage: profile.targetLanguage || 'English',
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (data.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message! }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Ouvrir le coach Lynx"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 dark:bg-orange-600">
        🦊
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Coach Lynx"
          className="fixed bottom-24 right-6 z-50 flex w-80 flex-col rounded-2xl border border-border bg-background shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🦊</span>
              <div>
                <p className="text-sm font-semibold leading-none">Lynx</p>
                <p className="text-xs text-muted-foreground">Language Coach · AI</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="rounded p-1 text-muted-foreground hover:bg-muted">
              ✕
            </button>
          </div>

          <div className="h-72 overflow-y-auto px-4 py-3">
            <div className="flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'ml-auto bg-orange-500 text-white'
                      : 'bg-muted text-foreground'
                  }`}>
                  {msg.content}
                </div>
              ))}
              {loading && (
                <div className="w-fit rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <span className="animate-pulse">Lynx is thinking…</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Ask Lynx anything…"
                rows={1}
                className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
              <Button
                onClick={() => void send()}
                disabled={!input.trim() || loading}
                size="sm"
                className="shrink-0 bg-orange-500 hover:bg-orange-600">
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
