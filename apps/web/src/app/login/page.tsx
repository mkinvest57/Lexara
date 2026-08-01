'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandMark } from '@/components/brand/BrandMark';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!configured) {
      setError(
        "La synchronisation n'est pas configurée sur cette installation. Continuez en mode local sur cet appareil."
      );
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/library');
      router.refresh();
    } catch (signInError) {
      const message = (signInError as { message?: string })?.message ?? '';
      setError(
        /confirm/i.test(message)
          ? "Confirmez votre adresse email avant de vous connecter."
          : "L'email ou le mot de passe est incorrect."
      );
    } finally {
      setLoading(false);
    }
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
