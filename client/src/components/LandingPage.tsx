import { LuArrowRight, LuCirclePlay, LuCompass, LuHeart, LuSparkles, LuUsers, LuZap } from "react-icons/lu";
import LandingBackground from "./LandingBackground";

interface LandingPageProps {
  onExplore: () => void;
  onLogin: () => void;
}

function LandingPage({ onExplore, onLogin }: LandingPageProps) {
  return (
    <div className="landing-page min-h-screen overflow-hidden bg-[#08090d] text-white">
      <LandingBackground />
      <header className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <button onClick={onExplore} className="flex items-center gap-3">
          <img src="/logo.png" alt="Vision" className="h-10 w-10 object-contain" />
          <span className="text-lg font-black tracking-tight">Vision<span className="text-red-500">.</span></span>
        </button>
        <button
          onClick={onLogin}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-red-400/60 hover:text-white"
        >
          Sign in
        </button>
      </header>

      <main className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl items-center px-6 pb-16 pt-6 sm:px-10 lg:px-16">
        <div className="landing-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="landing-glow landing-glow-one" aria-hidden="true" />
        <div className="landing-glow landing-glow-two" aria-hidden="true" />

        <section className="relative z-20 w-full lg:w-[56%]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
            <LuSparkles className="h-3.5 w-3.5" />
            Enter the Vision world
          </div>
          <h1 className="landing-title max-w-3xl font-black leading-[0.95] tracking-[-0.06em]">
            Make your
            <span className="block text-red-500">world move.</span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-white/55 sm:text-lg">
            A playful home for videos, creators, and ideas in motion. Explore the signal, then make it yours.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              onClick={onExplore}
              className="group inline-flex items-center gap-3 rounded-full bg-red-500 px-6 py-3.5 text-sm font-bold shadow-2xl shadow-red-500/25 transition-all hover:-translate-y-1 hover:bg-red-400"
            >
              Enter the world
              <LuArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={onLogin}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-white/75 transition-colors hover:border-white/35 hover:text-white"
            >
              <LuCirclePlay className="h-4 w-4" />
              See how it works
            </button>
          </div>
          <div className="mt-12 flex flex-wrap gap-6 text-xs text-white/40">
            <span className="inline-flex items-center gap-2"><LuZap className="h-4 w-4 text-red-400" /> Explore freely</span>
            <span className="inline-flex items-center gap-2"><LuUsers className="h-4 w-4 text-red-400" /> Create together</span>
          </div>
        </section>

        <section className="landing-stage pointer-events-none absolute z-0 hidden md:block" aria-label="Vision preview">
          <div className="landing-ring landing-ring-one" />
          <div className="landing-ring landing-ring-two" />
          <div className="landing-creature">
            <div className="landing-creature-eye landing-creature-eye-left" />
            <div className="landing-creature-eye landing-creature-eye-right" />
            <div className="landing-creature-smile" />
            <img src="/logo.png" alt="" />
          </div>
          <div className="landing-media-card landing-media-back landing-media-back-left">
            <span className="landing-media-label">02 / discover</span>
            <strong>New voices</strong>
          </div>
          <div className="landing-media-card landing-media-back landing-media-back-right">
            <span className="landing-media-label">03 / create</span>
            <strong>Make your mark</strong>
          </div>
          <div className="landing-orb">
            <div className="landing-orb-shine" />
            <div className="landing-orb-core">
              <img src="/logo.png" alt="" />
              <span>VISION</span>
            </div>
          </div>
          <div className="landing-media-card landing-media-main">
            <div className="landing-media-art">
              <span>V</span>
              <div className="landing-media-art-orbit" />
            </div>
            <div className="landing-media-meta">
              <div>
                <span className="landing-media-label">01 / now playing</span>
                <strong>Ideas in motion</strong>
              </div>
              <span className="landing-media-play">↗</span>
            </div>
          </div>
          <div className="landing-card landing-card-bottom">
            <span className="text-2xl font-black">∞</span>
            <span className="text-xs leading-4 text-white/50">Find your<br />next signal</span>
          </div>
        </section>
      </main>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 sm:px-10 lg:px-16">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Built for motion</p>
            <h2 className="max-w-xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              One space for every signal.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-white/45">
            Browse deeply, connect naturally, and give your ideas somewhere to go next.
          </p>
        </div>
        <div className="landing-bento-grid">
          <article className="landing-bento-card landing-bento-wide">
            <div className="landing-bento-icon"><LuCompass className="h-5 w-5" /></div>
            <div>
              <span className="landing-bento-kicker">01 / discover</span>
              <h3>Find your next obsession.</h3>
              <p>Smart categories and creator-led recommendations keep every scroll feeling fresh.</p>
            </div>
            <div className="landing-bento-lines" aria-hidden="true"><i /><i /><i /><i /></div>
          </article>
          <article className="landing-bento-card landing-bento-tall">
            <div className="landing-bento-icon"><LuHeart className="h-5 w-5" /></div>
            <span className="landing-bento-kicker">02 / connect</span>
            <h3>Make it personal.</h3>
            <p>Save what matters, follow the voices you trust, and build a feed that feels like yours.</p>
            <div className="landing-bento-pulse" aria-hidden="true" />
          </article>
          <article className="landing-bento-card landing-bento-dark">
            <span className="landing-bento-kicker">03 / create</span>
            <h3>Your turn.</h3>
            <p>Share a video, a Short, or a thought with the people already listening.</p>
            <button onClick={onExplore} className="mt-auto inline-flex w-fit items-center gap-2 text-sm font-bold text-red-300">
              Start creating <LuArrowRight className="h-4 w-4" />
            </button>
          </article>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
