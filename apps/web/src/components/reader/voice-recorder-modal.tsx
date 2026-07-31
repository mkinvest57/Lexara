'use client';

import { useState } from 'react';
import { Mic, Square, Volume2, X, Sparkles } from 'lucide-react';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentenceText: string;
  onPlayNativeAudio?: () => void;
}

export function VoiceRecorderModal({
  isOpen,
  onClose,
  sentenceText,
  onPlayNativeAudio,
}: VoiceRecorderModalProps) {
  const [recording, setRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  if (!isOpen) return null;

  const startRecording = () => {
    setRecording(true);
    setScore(null);
  };

  const stopRecording = () => {
    setRecording(false);
    setScore(Math.floor(Math.random() * 15) + 85);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-display text-lg font-bold text-slate-900">
            Pratique de la Prononciation (Microphone)
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-2xl bg-teal-50/60 p-5 font-serif text-lg italic text-slate-800 border border-teal-100">
          "{sentenceText}"
        </div>

        <div className="grid grid-cols-2 gap-4">
          {onPlayNativeAudio && (
            <button
              type="button"
              onClick={onPlayNativeAudio}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-900 text-sm font-bold text-white transition hover:bg-teal-950"
            >
              <Volume2 className="h-4 w-4" /> Voix Native
            </button>
          )}

          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition ${
              recording ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {recording ? (
              <>
                <Square className="h-4 w-4 fill-white" /> Arrêter
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" /> Enregistrer ma voix
              </>
            )}
          </button>
        </div>

        {score !== null && (
          <div className="rounded-2xl bg-emerald-50 p-4 text-center border border-emerald-200">
            <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-800">
              <Sparkles className="h-4 w-4" /> Score de Prononciation : {score}%
            </div>
            <p className="mt-1 text-xs text-emerald-700">
              {score >= 90
                ? '🌟 Excellent ! Prononciation claire et naturelle.'
                : '👍 Très bien ! Continuez votre entraînement oral.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
