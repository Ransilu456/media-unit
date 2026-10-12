'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Camera, Clapperboard, Film, Mic2, Radio, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

const workAreas = [
  {
    number: '01',
    label: 'Moving image',
    title: 'Film & cinematography',
    detail: 'Stories shaped through direction, camera, light, and edit.',
    icon: Clapperboard,
    tone: 'text-amber-300',
    accent: 'from-amber-400/20',
  },
  {
    number: '02',
    label: 'On air',
    title: 'Broadcast & presenting',
    detail: 'Clear voices, live coverage, and confident student presenters.',
    icon: Mic2,
    tone: 'text-amber-300',
    accent: 'from-amber-400/20',
  },
  {
    number: '03',
    label: 'Still stories',
    title: 'Photography & design',
    detail: 'A considered eye for people, place, culture, and detail.',
    icon: Camera,
    tone: 'text-emerald-300',
    accent: 'from-emerald-400/20',
  },
  {
    number: '04',
    label: 'Sound studio',
    title: 'Radio & audio',
    detail: 'Voice, atmosphere, and sound made into memorable experiences.',
    icon: AudioLines,
    tone: 'text-rose-300',
    accent: 'from-rose-400/20',
  },
];

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : delay, ease: [0.2, 0.75, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

function OrbitMark() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative flex aspect-square w-40 items-center justify-center sm:w-48 lg:w-52">
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 240 240"
        className="absolute inset-0 h-full w-full"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx="120" cy="120" r="112" fill="none" stroke="rgba(250,204,21,.16)" strokeWidth="1" strokeDasharray="1 9" />
        <circle cx="120" cy="120" r="96" fill="none" stroke="rgba(245,158,11,.38)" strokeWidth="1" strokeDasharray="120 18 12 22" />
        <path d="M120 8a112 112 0 0 1 96 54" fill="none" stroke="rgba(253,224,71,.75)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="216" cy="62" r="3" fill="#fcd34d" />
        <circle cx="24" cy="174" r="2" fill="#fcd34d" />
      </motion.svg>
      <motion.div
        className="absolute inset-[13%] rounded-full border border-amber-100/35 shadow-[0_0_65px_rgba(226,175,55,0.14)]"
        animate={reduceMotion ? undefined : { scale: [1, 1.035, 1], opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="relative z-10 h-[72%] w-[72%] overflow-hidden rounded-full border border-amber-100/70 bg-[#101424] p-1 shadow-[0_0_50px_rgba(234,179,8,0.2)]"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.76, rotate: -15 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: reduceMotion ? 0 : 1.3, delay: 0.25, type: 'spring', bounce: 0.24 }}
      >
        <Image src="/Agradhi.png" alt="Agradhi Media Unit crest" width={180} height={180} priority className="h-full w-full rounded-full object-cover" />
      </motion.div>
      <motion.span
        aria-hidden="true"
        className="absolute -right-1 top-8 h-2 w-2 rounded-full bg-amber-200 shadow-[0_0_18px_6px_rgba(251,191,36,.55)]"
        animate={reduceMotion ? undefined : { y: [0, 16, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function SignalGraphic() {
  const reduceMotion = useReducedMotion();
  return (
    <svg aria-hidden="true" viewBox="0 0 560 170" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id="signal-line" x1="0" x2="1">
          <stop stopColor="#fbbf24" stopOpacity="0" />
          <stop offset=".48" stopColor="#fbbf24" stopOpacity=".8" />
          <stop offset="1" stopColor="#7dd3fc" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((row) => (
        <motion.path
          key={row}
          d={`M0 ${52 + row * 16} C90 ${24 + row * 16}, 110 ${88 + row * 16}, 190 ${54 + row * 16} S300 ${30 + row * 16}, 390 ${54 + row * 16} S490 ${80 + row * 16}, 560 ${45 + row * 16}`}
          fill="none"
          stroke="url(#signal-line)"
          strokeWidth={row === 1 ? 1.5 : 0.8}
          strokeOpacity={0.16 + row * 0.035}
          strokeDasharray="6 9"
          animate={reduceMotion ? undefined : { strokeDashoffset: [0, -120] }}
          transition={{ duration: 22 + row * 4, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      <motion.circle
        cx="282"
        cy="67"
        r="4"
        fill="#fde68a"
        animate={reduceMotion ? undefined : { cx: [80, 490], opacity: [0, 0.9, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
      />
    </svg>
  );
}

function FrameDrawing() {
  const reduceMotion = useReducedMotion();
  return (
    <svg aria-hidden="true" viewBox="0 0 500 330" className="h-full w-full">
      <path d="M41 35h418v260H41z" fill="rgba(10,12,16,.62)" stroke="rgba(251,191,36,.46)" />
      <path d="M54 48h392v234H54z" fill="none" stroke="rgba(255,255,255,.12)" />
      <path d="M60 55h18v18H60zm362 0h18v18h-18zM60 257h18v18H60zm362 0h18v18h-18z" fill="none" stroke="rgba(255,255,255,.3)" />
      <motion.circle
        cx="250"
        cy="165"
        r="67"
        fill="none"
        stroke="rgba(125,211,252,.62)"
        strokeDasharray="4 7"
        animate={reduceMotion ? undefined : { rotate: 360, strokeDashoffset: [0, 44] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '250px 165px' }}
      />
      <circle cx="250" cy="165" r="45" fill="rgba(14,18,24,.76)" stroke="rgba(253,230,138,.34)" />
      <path d="M235 165h30m-15-15v30" stroke="#fde68a" strokeOpacity=".7" />
      <text x="67" y="91" fill="rgba(255,255,255,.46)" fontSize="9" letterSpacing="3">FRAME 001 / A.M.U.</text>
      <text x="380" y="268" fill="rgba(255,255,255,.35)" fontSize="8" letterSpacing="2">REC • 24 FPS</text>
    </svg>
  );
}

export function ExploreExperience() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen overflow-hidden bg-[#050607] text-[#f3f0e9] selection:bg-amber-300 selection:text-black">
      <section className="relative isolate flex min-h-[min(880px,100svh)] flex-col items-center px-4 pb-8 pt-5 sm:px-6" aria-labelledby="explore-title">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_41%,rgba(54,47,27,0.58),rgba(16,17,16,0.62)_35%,#050607_76%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-35 [background-image:radial-gradient(rgba(231,210,160,.4)_0.7px,transparent_0.9px)] [background-size:36px_36px]" />

        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-50" viewBox="0 0 1440 880" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="hero-glow"><stop stopColor="#eab308" stopOpacity=".16" /><stop offset="1" stopColor="#eab308" stopOpacity="0" /></radialGradient>
          </defs>
          <ellipse cx="720" cy="390" rx="430" ry="340" fill="url(#hero-glow)" />
          <path d="M-90 655C225 560 290 425 490 452s295 194 482 101 275-243 580-194" fill="none" stroke="rgba(234,179,8,.13)" />
          <path d="M-80 691C215 591 300 456 495 482s286 188 475 97 270-235 563-187" fill="none" stroke="rgba(125,211,252,.11)" />
          <path d="M-60 727C220 630 307 492 501 514s275 181 465 92 270-223 550-176" fill="none" stroke="rgba(255,255,255,.07)" />
          <path d="M0 790h1440" stroke="rgba(255,255,255,.08)" />
          {Array.from({ length: 28 }, (_, index) => {
            const x = (index * 197 + 73) % 1440;
            const y = (index * 113 + 89) % 750;
            return <circle key={index} cx={x} cy={y} r={index % 5 === 0 ? 1.8 : 1} fill="#fde68a" opacity={index % 4 === 0 ? '.62' : '.22'} />;
          })}
        </svg>

        <header className="z-10 w-full">
          <motion.nav
            aria-label="Explore Agradhi Media"
            initial={reduceMotion ? false : { opacity: 0, y: -18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.75, delay: 0.12 }}
            className="mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-[#0a0b0c]/78 p-1.5 shadow-[0_12px_50px_rgba(0,0,0,0.46)] backdrop-blur-xl scrollbar-none sm:gap-1.5 sm:px-2"
          >
            <Link href="/" aria-label="Agradhi Media home" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/4">
              <Image src="/Agradhi.png" alt="" width={25} height={25} priority className="h-6 w-6 rounded-full object-cover" />
            </Link>
            <Link href="/" className="rounded-full bg-white/[0.07] px-3 py-2 text-[11px] font-medium text-white sm:px-3.5 sm:text-xs">Home</Link>
            <a href="#works" className="rounded-full px-2.5 py-2 text-[11px] text-white/55 transition-colors hover:bg-white/6 hover:text-white sm:px-3 sm:text-xs">Works</a>
            <a href="#about" className="rounded-full px-2.5 py-2 text-[11px] text-white/55 transition-colors hover:bg-white/6 hover:text-white sm:px-3 sm:text-xs">About</a>
            <a href="#journal" className="hidden rounded-full px-3 py-2 text-xs text-white/55 transition-colors hover:bg-white/6 hover:text-white sm:block">Journal</a>
            <a href="#contact" className="hidden rounded-full px-3 py-2 text-xs text-white/55 transition-colors hover:bg-white/6 hover:text-white md:block">Contact</a>
            <a href="mailto:agradhimedia@saranath.edu.lk" className="ml-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:border-amber-300/40 hover:bg-amber-300/10 sm:px-3.5 sm:text-xs">
              Reach out <ArrowUpRight size={13} className="text-amber-300" />
            </a>
          </motion.nav>
        </header>

        <main className="relative flex w-full flex-1 flex-col items-center justify-center pb-5 pt-8 text-center sm:pt-10">
          <motion.div
            className="absolute left-[max(1rem,calc(50%-34rem))] top-[20%] hidden items-center gap-3 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-white/45 backdrop-blur-sm xl:flex"
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.7 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_12px_3px_rgba(251,113,133,.4)]" />
            Student media collective
          </motion.div>
          <motion.div
            className="absolute right-[max(1rem,calc(50%-34rem))] top-[28%] hidden w-28 items-end justify-center gap-1 xl:flex"
            aria-hidden="true"
          >
            {Array.from({ length: 13 }, (_, index) => (
              <motion.span
                key={index}
                className="w-1 rounded-full bg-amber-200/60"
                animate={reduceMotion ? undefined : { height: [6 + (index % 3) * 3, 14 + ((index * 7) % 20), 6 + (index % 3) * 3], opacity: [0.35, 0.9, 0.35] }}
                transition={{ duration: 1.6 + (index % 4) * 0.25, repeat: Infinity, ease: 'easeInOut', delay: index * 0.06 }}
              />
            ))}
          </motion.div>

          <OrbitMark />

          <motion.p
            className="mb-4 mt-8 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/45 sm:mb-5 sm:mt-9 sm:text-[11px]"
            initial={reduceMotion ? false : { opacity: 0, y: 14, letterSpacing: '0.08em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.3em' }}
            transition={{ duration: reduceMotion ? 0 : 0.9, delay: 0.72 }}
          >
            Collection &apos;26 <span className="px-1.5 text-amber-300/60">·</span> Saranath College
          </motion.p>
          <h1 id="explore-title" className="max-w-full font-serif text-[42px] leading-[0.98] text-white sm:text-6xl lg:text-8xl">
            <motion.span
              className="inline-block"
              initial={reduceMotion ? false : { opacity: 0, y: 58, rotateX: -32, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
              transition={{ duration: reduceMotion ? 0 : 1, delay: 0.82, ease: [0.16, 1, 0.3, 1] }}
            >Agradhi</motion.span>{' '}
            <motion.span
              className="inline-block bg-linear-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text italic text-transparent"
              initial={reduceMotion ? false : { opacity: 0, y: 58, rotateX: -32, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
              transition={{ duration: reduceMotion ? 0 : 1, delay: 1.02, ease: [0.16, 1, 0.3, 1] }}
            >Media</motion.span>{' '}
            <motion.span
              className="inline-block"
              initial={reduceMotion ? false : { opacity: 0, y: 58, rotateX: -32, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
              transition={{ duration: reduceMotion ? 0 : 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >Unit</motion.span>
          </h1>
          <motion.p
            className="mt-6 text-sm text-white/55 sm:mt-7 sm:text-base"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.46 }}
          >
            We are <motion.span className="inline-block font-serif font-semibold italic text-white" animate={reduceMotion ? undefined : { textShadow: ['0 0 0px rgba(255,255,255,0)', '0 0 18px rgba(255,255,255,.34)', '0 0 0px rgba(255,255,255,0)'] }} transition={{ duration: 3.6, repeat: Infinity }}>Creators</motion.span> at Saranath College
          </motion.p>
          <motion.p
            className="mx-auto mt-4 max-w-xl text-xs leading-6 text-white/45 sm:mt-5 sm:text-sm sm:leading-7"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 1.62 }}
          >
            Forging cinematic experiences through visual storytelling. We are the architects of motion and light at Saranath College.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10"
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.8 }}
          >
            <motion.a href="#works" whileHover={reduceMotion ? undefined : { y: -4, scale: 1.025 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-[#f4f2ed] px-6 text-xs font-semibold text-[#111214] sm:text-sm">
              <Film size={15} /> See Our Work <ArrowDown size={14} className="transition-transform group-hover:translate-y-0.5" />
            </motion.a>
            <motion.a href="#about" whileHover={reduceMotion ? undefined : { y: -4 }} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/10 px-6 text-xs font-semibold text-white/80 transition-colors hover:border-amber-300/40 hover:text-white sm:text-sm">
              Learn More <ArrowDown size={14} className="text-amber-300" />
            </motion.a>
          </motion.div>
        </main>

        <motion.a
          href="#works"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/35 transition-colors hover:text-white/70"
          animate={reduceMotion ? undefined : { y: [0, 5, 0], opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          Discover the work <ArrowDown size={12} />
        </motion.a>
      </section>

      <div aria-hidden="true" className="relative h-16 overflow-hidden border-y border-white/[0.06] bg-[#0a0c0d]">
        <motion.div className="absolute inset-0 opacity-75" animate={reduceMotion ? undefined : { x: ['-2%', '2%', '-2%'] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}>
          <SignalGraphic />
        </motion.div>
        <div className="relative flex h-full items-center justify-center gap-5 text-[9px] font-semibold uppercase tracking-[0.24em] text-white/45 sm:gap-10 sm:text-[10px]">
          <span>Observe</span><span className="text-amber-300">✳</span><span>Frame</span><span className="hidden text-amber-200 sm:inline">✳</span><span className="hidden sm:inline">Record</span><span className="text-amber-300">✳</span><span>Share</span>
        </div>
      </div>

      <section id="works" className="scroll-mt-8 border-b border-white/[0.07] bg-[#090b0c] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:mb-16 sm:flex-row sm:items-end">
            <Reveal>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-300/80">Explore Agradhi Media</p>
              <h2 className="max-w-2xl font-serif text-3xl leading-tight text-white sm:text-5xl">A place for stories in every medium.</h2>
            </Reveal>
            <Reveal delay={0.12}>
              <Link href="/competitions" className="inline-flex w-fit items-center gap-2 border-b border-amber-300/40 pb-2 text-xs font-semibold text-white/70 transition-colors hover:text-amber-200">
                Competition tracks <ArrowRight size={14} />
              </Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {workAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <motion.div
                  key={area.number}
                  initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : index * 0.1, ease: [0.2, 0.75, 0.25, 1] }}
                >
                  <Link href="/competitions" className={`group relative block h-full overflow-hidden rounded-md border border-white/8 bg-[#101315] p-6 transition-colors hover:border-amber-200/30 hover:bg-[#141719] sm:p-8`}>
                    <div aria-hidden="true" className={`pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-radial from-current to-transparent opacity-[0.07] ${area.tone}`} />
                    <span className="absolute right-5 top-4 font-serif text-5xl text-white/[0.035] transition-colors group-hover:text-white/[0.09] sm:right-7 sm:top-5 sm:text-6xl">{area.number}</span>
                    <motion.div className="relative mb-8 flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.035]" whileHover={reduceMotion ? undefined : { rotate: -8, scale: 1.12 }}>
                      <Icon size={18} className={area.tone} />
                    </motion.div>
                    <p className="relative mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{area.label}</p>
                    <h3 className="relative font-serif text-2xl text-white sm:text-3xl">{area.title}</h3>
                    <div className="relative mt-4 flex items-end justify-between gap-4">
                      <p className="max-w-sm text-xs leading-6 text-white/45 sm:text-sm">{area.detail}</p>
                      <ArrowUpRight size={17} className="shrink-0 text-white/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-amber-200" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-8 border-b border-white/[0.07] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-20">
          <Reveal className="relative mx-auto aspect-[5/4] w-full max-w-xl">
            <div className="absolute inset-0 overflow-hidden border border-white/10 bg-[radial-gradient(ellipse_at_50%_50%,rgba(39,44,48,.8),#0b0d0e_68%)] p-5 sm:p-8">
              <div className="absolute inset-5 border border-amber-300/15" />
              <FrameDrawing />
              <div className="absolute bottom-5 left-6 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/40">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Agradhi / Studio 01
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200/80">About the unit</p>
            <h2 className="font-serif text-3xl leading-tight text-white sm:text-5xl">Curiosity becomes craft. Craft becomes community.</h2>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/55">
              Agradhi Media Unit brings the Saranath College community together through film, photography, broadcasting, design, and sound. We learn by making, share what we discover, and give student voices room to travel.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              From the first idea to the final frame, every project is an invitation to look closer, listen well, and tell a story with intention.
            </p>
            <a href="#journal" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-amber-200 transition-colors hover:text-white">
              Read our journal <ArrowRight size={14} />
            </a>
          </Reveal>
        </div>
      </section>

      <section id="journal" className="scroll-mt-8 border-b border-white/[0.07] bg-[#090b0c] px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-9 flex items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-rose-200/80">Field notes</p>
              <h2 className="font-serif text-3xl text-white sm:text-4xl">The journal</h2>
            </div>
            <motion.div animate={reduceMotion ? undefined : { rotate: [0, 12, -12, 0], scale: [1, 1.12, 1] }} transition={{ duration: 5, repeat: Infinity }}>
              <Sparkles size={18} className="mb-1 text-amber-200/70" />
            </motion.div>
          </Reveal>
          <div className="divide-y divide-white/8 border-y border-white/8">
            {[
              { date: 'On the set · 2026', title: 'Finding the story before pressing record', text: 'A short field note on observation, patience, and making documentary images with care.' },
              { date: 'Studio notes · 2026', title: 'A good voice starts with a good listen', text: 'How sound, silence, and a little rehearsal help a message reach the room.' },
            ].map((entry, index) => (
              <Reveal key={entry.title} delay={index * 0.08}>
                <article className="grid gap-2 py-6 sm:grid-cols-[150px_1fr] sm:gap-8">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{entry.date}</p>
                  <div>
                    <h3 className="font-serif text-xl text-white sm:text-2xl">{entry.title}</h3>
                    <p className="mt-2 max-w-2xl text-xs leading-6 text-white/45 sm:text-sm">{entry.text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20">
        <Reveal className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200/80">Make something meaningful</p>
            <h2 className="max-w-2xl font-serif text-3xl leading-tight text-white sm:text-5xl">Have a story worth telling?</h2>
            <a href="mailto:agradhimedia@saranath.edu.lk" className="mt-5 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-amber-200">
              agradhimedia@saranath.edu.lk <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-xs font-semibold text-white/75 transition-colors hover:bg-white/6">Main website</Link>
            <Link href="/competitions" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-xs font-bold text-[#17130a] transition-colors hover:bg-amber-200">Explore competitions <ArrowRight size={14} /></Link>
          </div>
        </Reveal>
        <div className="mx-auto mt-14 flex max-w-6xl items-center justify-between border-t border-white/8 pt-5 text-[10px] text-white/35">
          <span>Agradhi Media Unit · Saranath College</span>
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-white/70"><Radio size={12} /> Back to home</Link>
        </div>
      </footer>
    </div>
  );
}