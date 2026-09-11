import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Compass,
  MessageSquareMore,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/mainContext";

const featureCards = [
  {
    icon: Users,
    title: "Find your campus circle",
    description:
      "Discover students, creators, and collaborators who match your vibe, interests, and energy.",
  },
  {
    icon: CalendarDays,
    title: "Join real student activity",
    description:
      "Explore clubs, events, volunteering drives, and communities without the usual chaos.",
  },
  {
    icon: MessageSquareMore,
    title: "Start better conversations",
    description:
      "Move from random introductions to meaningful campus connections with shared context.",
  },
];

const highlights = [
  "Smart discovery for people and activities",
  "Designed for students, clubs, and community leads",
  "Fast onboarding with a premium, modern UI",
];

const stats = [
  { value: "24/7", label: "campus networking flow" },
  { value: "1 hub", label: "for events, chats, and people" },
  { value: "∞ vibes", label: "for communities that actually connect" },
];

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-80 w-80 rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute right-[-10%] top-[12%] h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[25%] h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_32%),linear-gradient(180deg,rgba(7,10,28,0.2),rgba(5,8,22,0.95))]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/60">
                Campus
              </p>
              <h1 className="text-lg font-black tracking-[0.25em] text-white">
                CONNECT
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={user ? "/discover" : "/login"}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-cyan-400/50 hover:bg-white/8 hover:text-white"
            >
              {user ? "Open App" : "Sign In"}
            </Link>
            <Link
              to={user ? "/discover" : "/login"}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
            >
              Get Started
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center py-10 lg:py-14">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100"
              >
                <BadgeCheck size={16} />
                Better discovery for modern student communities
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.05 }}
                className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl"
              >
                The landing page your campus product deserved.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.12 }}
                className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg"
              >
                Campus Connect brings students, clubs, and communities into one
                premium experience so people can meet faster, discover better,
                and actually show up for what matters on campus.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.18 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link
                  to={user ? "/discover" : "/login"}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_50px_rgba(59,130,246,0.35)] transition hover:translate-y-[-1px]"
                >
                  {user ? "Go To Discover" : "Launch Campus Connect"}
                  <ArrowRight size={16} />
                </Link>

                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/90 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
                >
                  Explore Features
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.24 }}
                className="mt-10 grid gap-3 sm:grid-cols-3"
              >
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                  >
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-10 grid gap-3"
              >
                {highlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                      <ShieldCheck size={16} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </motion.div>
            </section>

            <motion.section
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-cyan-500/20 via-transparent to-fuchsia-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-5 shadow-[0_30px_120px_rgba(2,6,23,0.7)] backdrop-blur-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                      Live Preview
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-white">
                      Student networking, upgraded
                    </h3>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Premium UI
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.7rem] border border-white/10 bg-[#0d1328] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                          Discovery
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          Meet students, events, and communities in one flow
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gradient-to-br from-cyan-400/15 to-blue-500/15 p-3 text-cyan-300">
                        <Compass size={22} />
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3">
                      <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              AI Club Meetup
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              Find students into building, hacking, and shipping.
                            </p>
                          </div>
                          <div className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                            Open
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-fuchsia-400/10 p-3 text-fuchsia-300">
                              <Zap size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">
                                Fast match flow
                              </p>
                              <p className="text-xs text-slate-400">
                                Swipe, connect, join
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">
                              <Users size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">
                                Real communities
                              </p>
                              <p className="text-xs text-slate-400">
                                Built for student groups
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {featureCards.map(({ icon: Icon, title, description }) => (
                      <div
                        key={title}
                        className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                      >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/10 to-violet-500/10 text-cyan-300">
                          <Icon size={20} />
                        </div>
                        <h4 className="text-base font-semibold text-white">{title}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </main>

        <section
          id="features"
          className="grid gap-5 border-t border-white/10 py-8 lg:grid-cols-3"
        >
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm font-semibold text-cyan-300">Why it hits better</p>
            <h3 className="mt-3 text-2xl font-bold text-white">
              Clean visuals. Clear actions. Better campus engagement.
            </h3>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-slate-400">
              Every section is shaped to feel modern, premium, and mobile-friendly
              while still fitting your current app direction.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-violet-500/10 p-6 backdrop-blur-xl">
            <p className="text-sm text-slate-200">
              Ready to move from concept to actual student adoption?
            </p>
            <Link
              to={user ? "/discover" : "/login"}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              {user ? "Open your dashboard" : "Sign in and continue"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
