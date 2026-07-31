'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandMark } from '@/components/brand/BrandMark';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error === 'API_UNAVAILABLE') {
        setError('The learning service is temporarily unavailable. Please try again in a moment.');
      } else if (result?.error) setError('The email or password is incorrect.');
      else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('We could not log you in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useDemo = () => {
    setEmail('demo@immerli.com');
    setPassword('demo123456');
  };

  return (
    <div className="grid min-h-screen bg-[#f5faf9] lg:grid-cols-[1.05fr_.95fr]">
      <aside className="relative hidden overflow-hidden bg-[#052f31] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(45,212,191,.18),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(242,118,58,.16),transparent_32%)]" />
        <div className="relative">
          <BrandMark inverse />
        </div>
        <div className="relative max-w-xl">
          <p className="font-display text-5xl font-semibold leading-tight tracking-[-0.04em]">
            Return to the story. Your words are waiting.
          </p>
          <div className="mt-8 space-y-3 text-sm text-teal-50">
            {[
              'Your reading progress, synced',
              'Vocabulary in its original context',
              'A focused review queue',
            ].map((item) => (
              <p key={item} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-teal-300" />
                {item}
              </p>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-teal-100/60">
          YAPRO · Apprenez des langues naturellement par l'immersion.
        </p>
      </aside>
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Link href="/">
              <BrandMark />
            </Link>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
              Bienvenue
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              Continuer l'apprentissage
            </h1>
            <p className="mt-2 text-slate-600">
              Connectez-vous pour ouvrir votre bibliothèque et votre vocabulaire.
            </p>
          </div>
          <Card className="border-slate-200 shadow-[0_20px_70px_rgba(15,23,42,.08)]">
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription>Utilisez vos identifiants YAPRO.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="min-h-11 w-full gap-2" disabled={loading}>
                  {loading ? (
                    'Connexion…'
                  ) : (
                    <>
                      Se connecter <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-slate-600">
                  Nouveau sur YAPRO ?{' '}
                  <Link href="/signup" className="font-semibold text-teal-800 hover:underline">
                    Créer un compte
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
          <button
            onClick={useDemo}
            className="min-h-11 w-full rounded-2xl border border-teal-100 bg-teal-50 p-3 text-center text-sm font-medium text-teal-950 hover:bg-teal-100"
          >
            Fill in the demo account
          </button>
          <Link
            href="/library"
            className="flex min-h-11 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Continuer en mode local sur cet appareil
          </Link>
        </div>
      </div>
    </div>
  );
}
