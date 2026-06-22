import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Seo } from "@/components/seo/Seo";
import { SITE } from "@/lib/site";

/**
 * Cinematic premium landing placeholder shown at the site root while the real
 * site is staged under /mvp. Renders standalone (no SiteLayout / locale tree)
 * so it stays independent of the main app routing. Remove at launch by
 * restoring the /:lang routes to the root in App.tsx.
 */

/** Launch target for the countdown. Change to retarget; clamps to zero when past. */
const LAUNCH_DATE = new Date("2026-07-01T00:00:00+03:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function diffToLaunch(target: Date): TimeLeft {
  const ms = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** Live countdown to a target date, ticking every second and cleaned up on unmount. */
function useCountdown(target: Date): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => diffToLaunch(target));

  useEffect(() => {
    const id = window.setInterval(() => setTimeLeft(diffToLaunch(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return timeLeft;
}

const COUNTDOWN_LABELS: Array<{ key: keyof TimeLeft; label: string }> = [
  { key: "days", label: "Gün" },
  { key: "hours", label: "Saat" },
  { key: "minutes", label: "Dakika" },
  { key: "seconds", label: "Saniye" },
];

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/** Soft rising light particles, evenly distributed across the width. */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 100) / 18 + 2}%`,
  size: 4 + ((i * 7) % 10),
  delay: (i % 9) * 0.9,
  duration: 9 + (i % 6) * 2,
  drift: i % 2 === 0 ? 24 : -24,
}));

export default function ComingSoon() {
  const reduceMotion = useReducedMotion();
  const time = useCountdown(LAUNCH_DATE);

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <>
      <Seo title={`${SITE.name} — Coming Soon`} description="Çok yakında / Coming soon." />
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-teal-deep px-6 text-center text-white">
        {/* Layer 1: drifting radial glow blobs */}
        {!reduceMotion && (
          <>
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -left-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-teal-light/25 blur-3xl"
              animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-orange/20 blur-3xl"
              animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        {/* Layer 2: rising light particles */}
        {!reduceMotion && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {PARTICLES.map((p, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-foam/40"
                style={{ left: p.left, bottom: "-5%", width: p.size, height: p.size }}
                animate={{ y: ["0%", "-110vh"], x: [0, p.drift, 0], opacity: [0, 0.8, 0] }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>
        )}

        {/* Layer 3: paddling kayak gliding left→right above the waves */}
        <div
          aria-hidden
          className={`pointer-events-none absolute bottom-[70px] z-[2] w-[90px] ${
            reduceMotion ? "left-8" : "animate-paddle"
          }`}
        >
          <div className={reduceMotion ? "" : "animate-rock"}>
            <svg viewBox="0 0 120 60" className="h-auto w-full">
              <path d="M8 38 Q60 56 112 38 Q60 46 8 38 Z" fill="#f16e0b" />
              <line x1="40" y1="14" x2="80" y2="42" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="38" cy="12" rx="7" ry="3.5" fill="#fff" transform="rotate(35 38 12)" />
              <ellipse cx="82" cy="44" rx="7" ry="3.5" fill="#fff" transform="rotate(35 82 44)" />
              {/* Paddler head + body: white so they stand out on the dark teal. */}
              <circle cx="60" cy="28" r="6" fill="#ffffff" />
              <rect x="55" y="32" width="10" height="9" rx="4" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* Layer 4: animated drifting waves along the bottom edge */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] leading-none">
          <svg viewBox="0 24 150 28" preserveAspectRatio="none" className="block h-[130px] w-full">
            <defs>
              <path
                id="wavepath"
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
              />
            </defs>
            <g>
              {[
                { y: 0, fill: "rgba(255,255,255,0.25)", duration: 9, delay: -2, opacity: 0.35 },
                { y: 3, fill: "rgba(255,255,255,0.4)", duration: 12, delay: -3, opacity: 0.5 },
                { y: 6, fill: "#eaf6f3", duration: 16, delay: -4, opacity: 0.85 },
              ].map((w, i) => (
                <use
                  key={i}
                  href="#wavepath"
                  x="48"
                  y={w.y}
                  fill={w.fill}
                  opacity={w.opacity}
                  style={
                    reduceMotion
                      ? undefined
                      : {
                          animation: `moveWave ${w.duration}s cubic-bezier(.55,.5,.45,.5) ${w.delay}s infinite`,
                        }
                  }
                />
              ))}
            </g>
          </svg>
        </div>

        {/* Foreground content */}
        <motion.div
          className="relative z-10 flex flex-col items-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={item}
            className={`mb-8 rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl ring-1 ring-black/5 backdrop-blur-sm ${reduceMotion ? "" : "animate-bob"}`}
          >
            <div className="rounded-2xl bg-foam px-12 py-9">
              <img src="/logo.png?v=3" alt={SITE.name} className="h-28 w-auto sm:h-32" />
            </div>
          </motion.div>

          <motion.p
            variants={item}
            className="text-xs font-semibold uppercase tracking-[0.35em] text-foam/60 sm:text-sm"
          >
            {SITE.parentBrand}
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl"
          >
            {SITE.name}
          </motion.h1>

          <motion.div variants={item} className="mt-3 flex items-center gap-3">
            <span className="h-px w-10 bg-orange/70" />
            <p className="text-base text-foam/80 sm:text-lg">Çok yakında · Coming soon</p>
            <span className="h-px w-10 bg-orange/70" />
          </motion.div>

          {/* Countdown */}
          <motion.div variants={item} className="mt-10 flex gap-3 sm:gap-5">
            {COUNTDOWN_LABELS.map(({ key, label }) => (
              <div
                key={key}
                className="flex min-w-[4.5rem] flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-3 py-4 backdrop-blur-sm sm:min-w-[5.5rem] sm:px-5"
              >
                <span className="text-3xl font-extrabold tabular-nums sm:text-4xl">
                  {pad(time[key])}
                </span>
                <span className="mt-1 text-[0.65rem] uppercase tracking-widest text-foam/55 sm:text-xs">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}
