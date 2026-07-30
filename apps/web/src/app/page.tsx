import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 bg-[#F5F0E8] border-b-3 border-[#2D1810] z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#5D4037] rounded-full flex items-center justify-center text-[#F5F0E8] font-bold text-xl rotate-[-4deg]">
              L
            </div>
            <span className="text-2xl font-display font-bold">Lexara</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[#2D1810] hover:text-[#5D4037] font-medium transition-colors">
              Log in
            </Link>
            <Link href="/signup">
              <button className="btn-primary">
                Try it free
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-[#81C784] text-[#2D1810] px-4 py-2 rounded-md font-semibold text-sm rotate-[-1deg] shadow-[2px_2px_0px_#2D1810]">
              No more boring drills →
            </div>

            <h1 className="font-display font-bold text-[#2D1810] leading-tight">
              Learn languages by reading what you <span className="text-[#5D4037] underline decoration-wavy decoration-[#81C784]">actually love</span>
            </h1>

            <p className="text-xl text-[#2D1810] opacity-80 leading-relaxed">
              I tried Duolingo for 6 months. Got to level 12. Still couldn't order coffee in Barcelona.
              Then I started reading Spanish articles about coffee roasting—my actual hobby—and everything clicked.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/signup">
                <button className="btn-primary">
                  Start reading for free
                </button>
              </Link>
              <Link href="/login">
                <button className="btn-secondary">
                  See how it works
                </button>
              </Link>
            </div>

            <p className="text-sm text-[#2D1810] opacity-60">
              ✓ 7 demo lessons included · ✓ No credit card · ✓ Works in your browser
            </p>
          </div>

          {/* Collage of real objects - signature element */}
          <div className="relative">
            <div className="card rotate-slight-alt p-8 bg-white">
              <div className="space-y-4">
                <div className="bg-[#F5F0E8] p-6 rounded-lg border-2 border-[#2D1810]">
                  <p className="text-lg font-medium mb-4">
                    "María <span className="bg-[#81C784] px-2 py-1 rounded cursor-pointer hover:bg-[#5D4037] hover:text-white transition-colors">va</span> al <span className="bg-yellow-200 px-2 py-1 rounded">café</span> todos los días..."
                  </p>
                  <div className="text-sm opacity-70 italic">
                    ← Click any word to learn it
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <div className="w-12 h-12 bg-[#5D4037] rounded-full flex items-center justify-center text-white font-bold">
                    27
                  </div>
                  <div>
                    <div className="font-semibold">Words saved today</div>
                    <div className="text-sm opacity-70">3 day streak 🔥</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative stamp */}
            <div className="absolute -top-4 -right-4 bg-[#81C784] text-[#2D1810] w-24 h-24 rounded-full flex items-center justify-center font-display font-bold text-sm border-4 border-[#2D1810] rotate-12 shadow-lg">
              NO<br/>DRILLS
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Bento Grid */}
      <section className="bg-white border-y-3 border-[#2D1810] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-display font-bold text-center mb-4">
            Three steps. That's it.
          </h2>
          <p className="text-center text-xl opacity-80 mb-12 max-w-2xl mx-auto">
            No grammar tables. No multiple choice. Just you, interesting content, and words that stick.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="card rotate-slight bg-[#F5F0E8]">
              <div className="text-5xl font-display font-bold text-[#5D4037] mb-4">01</div>
              <h3 className="font-display font-bold mb-3">Pick what interests you</h3>
              <p className="opacity-80">
                Articles about cooking, tech news, YouTube videos, Netflix shows. Import anything or browse our library.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white border-2 border-[#2D1810] rounded text-sm font-medium">🍕 Food</span>
                <span className="px-3 py-1 bg-white border-2 border-[#2D1810] rounded text-sm font-medium">💻 Tech</span>
                <span className="px-3 py-1 bg-white border-2 border-[#2D1810] rounded text-sm font-medium">⚽ Sports</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card bg-[#81C784]">
              <div className="text-5xl font-display font-bold text-[#2D1810] mb-4">02</div>
              <h3 className="font-display font-bold mb-3">Click words you don't know</h3>
              <p className="opacity-90">
                Every word is clickable. See translation + example. Save it. It'll stay highlighted in every future lesson.
              </p>
              <div className="mt-6 p-4 bg-white rounded-lg border-2 border-[#2D1810]">
                <div className="text-sm font-mono">
                  café → <span className="font-bold">coffee</span><br/>
                  <span className="text-xs opacity-70">"Va al café todos los días"</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card rotate-slight-alt bg-[#5D4037] text-[#F5F0E8]">
              <div className="text-5xl font-display font-bold mb-4">03</div>
              <h3 className="font-display font-bold mb-3">Review when you forget</h3>
              <p className="opacity-90">
                Flashcards appear at smart intervals. 1 day, 3 days, 7 days... Science-backed spacing so words stick for good.
              </p>
              <div className="mt-6 text-center py-4">
                <div className="text-4xl font-display font-bold">café</div>
                <div className="mt-4 flex gap-3 justify-center">
                  <button className="px-4 py-2 bg-white text-[#2D1810] rounded-md font-semibold text-sm hover:bg-[#81C784] transition-colors">
                    ✓ I know
                  </button>
                  <button className="px-4 py-2 bg-[#F5F0E8] text-[#2D1810] rounded-md font-semibold text-sm hover:bg-white transition-colors">
                    ✗ Show me
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Story Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="card bg-[#F5F0E8] max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6">💬</div>
          <blockquote className="text-2xl font-display font-bold mb-6 leading-snug">
            "I learned more Spanish in 2 weeks reading tech blogs than in 3 months of Duolingo."
          </blockquote>
          <p className="opacity-80 mb-4">
            That's from Alex, a developer who tried Lexara while learning about React... in Spanish.
            He's now reading Spanish docs daily and his team noticed.
          </p>
          <div className="mt-8 pt-8 border-t-2 border-[#2D1810]">
            <p className="text-sm opacity-70">
              Real person. Real result. We asked permission to share this. (Most reviews are fake. This one isn't.)
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#81C784] border-y-3 border-[#2D1810] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-6xl font-display font-bold text-[#2D1810] mb-2">500+</div>
              <div className="text-xl font-medium">Words saved by demo users</div>
            </div>
            <div>
              <div className="text-6xl font-display font-bold text-[#2D1810] mb-2">7</div>
              <div className="text-xl font-medium">Lessons included free</div>
            </div>
            <div>
              <div className="text-6xl font-display font-bold text-[#2D1810] mb-2">$0</div>
              <div className="text-xl font-medium">To start learning today</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="card bg-[#5D4037] text-[#F5F0E8] text-center max-w-3xl mx-auto rotate-[-0.5deg]">
          <h2 className="font-display font-bold mb-6">
            Ready to actually learn a language?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Stop drilling. Start reading. Your first 7 lessons are waiting.
          </p>
          <Link href="/signup">
            <button className="bg-[#81C784] text-[#2D1810] px-8 py-4 rounded-lg font-bold text-xl shadow-[4px_4px_0px_#2D1810] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#2D1810] transition-all">
              Get started free →
            </button>
          </Link>
          <p className="text-sm opacity-70 mt-6">
            No credit card. No trial period BS. Just log in and read.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-3 border-[#2D1810] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#5D4037] rounded-full flex items-center justify-center text-[#F5F0E8] font-bold">
                L
              </div>
              <span className="font-display font-bold text-xl">Lexara</span>
            </div>

            <div className="flex gap-8 text-sm">
              <Link href="/about" className="hover:text-[#5D4037] transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-[#5D4037] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#5D4037] transition-colors">Terms</Link>
            </div>

            <div className="text-sm opacity-70">
              Made with ❤️ for language learners
            </div>
          </div>

          <div className="text-center mt-8 pt-8 border-t-2 border-[#2D1810] opacity-60 text-sm">
            © 2024 Lexara. Learn languages by reading what you love.
          </div>
        </div>
      </footer>
    </div>
  );
}
