import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  Heart,
  Link2,
  Menu,
  MessagesSquare,
  MousePointer2,
  Quote,
  Radio,
  ShieldCheck,
  Target,
  Timer,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/mainContext";
import BrandLogo from "../components/BrandLogo";

/*
  Fonts: assumes "Inter" at weights 400/600/800/900. Add to index.html <head>:

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
    rel="stylesheet"
  />

  Layout note: root is `w-full min-h-screen`, navbar is `sticky` (not
  `fixed`), and nothing here uses viewport-fixed positioning — so this
  component cannot itself produce a layout gap. If content still gets
  squeezed next to an empty panel, check the parent route/App shell for a
  stray full-height sibling (e.g. a leftover Three.js canvas container)
  that isn't collapsing when this component mounts.
*/

const GlowOrb = ({ className }) => (
  <div
    className={`pointer-events-none absolute rounded-full opacity-30 blur-[100px] ${className}`}
    aria-hidden="true"
  />
);

const CountUp = ({ to, suffix = "" }) => {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const handleEnter = () => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const duration = 1200;
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.floor(progress * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  return (
    <motion.span onViewportEnter={handleEnter} viewport={{ once: true }}>
      {value}
      {suffix}
    </motion.span>
  );
};

// ---------- navbar ----------

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

const NavBar = ({ user }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-[#05050A]/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={28} animated={false} />
          <span className="text-lg font-extrabold tracking-tight">
            Campus Connect
          </span>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-[#9C9AB8] transition hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link
            to={user ? "/discover" : "/login"}
            className="text-sm font-medium text-[#D9D3EE] hover:text-white"
          >
            {user ? "Open App" : "Log in"}
          </Link>
          <Link
            to={user ? "/discover" : "/login"}
            className="rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(139,92,246,0.35)] transition hover:brightness-110"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-white lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/10 bg-[#05050A] lg:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-[#D9D3EE]"
                >
                  {l.label}
                </a>
              ))}
              <Link
                to={user ? "/discover" : "/login"}
                className="mt-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                {user ? "Open App" : "Get Started"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// ---------- hero visual: dashboard mockup ----------

const FloatingChip = ({ className, delay, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className={`absolute hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-medium text-[#E7E5FF] shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:flex ${className}`}
  >
    <motion.span
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
      className="flex items-center gap-2"
    >
      {children}
    </motion.span>
  </motion.div>
);

const DashboardMockup = () => (
  <div className="relative">
    <FloatingChip className="-left-6 top-6" delay={0.3}>
      <span className="h-2 w-2 rounded-full bg-[#34D399]" />
      3 new connections nearby
    </FloatingChip>
    <FloatingChip className="-right-6 top-1/3" delay={0.55}>
      <span className="h-2 w-2 rounded-full bg-[#22D3EE]" />
      Hackathon starts in 20m
    </FloatingChip>

    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_90px_rgba(139,92,246,0.15)] backdrop-blur-2xl">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#F87171]/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#34D399]/60" />
        <span className="ml-3 text-xs text-[#7A7793]">campusconnect.app</span>
      </div>

      <div className="flex">
        <div className="hidden w-14 flex-col items-center gap-4 border-r border-white/10 py-5 sm:flex">
          {[Users, CalendarDays, MessagesSquare, Radio].map((Icon, i) => (
            <div
              key={i}
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                i === 0 ? "bg-[#8B5CF6]/20 text-[#C4B5FD]" : "text-[#635F80]"
              }`}
            >
              <Icon size={16} />
            </div>
          ))}
        </div>

        <div className="flex-1 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8B5CF6]">
            Live campus feed
          </p>
          <div className="mt-3 space-y-2.5">
            {[
              { name: "Arjun S.", note: "posted in Open Source Club" },
              { name: "Priya K.", note: "is going to Open Mic Night" },
              { name: "Sameer D.", note: "started a study room" },
            ].map((row) => (
              <div
                key={row.name}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] text-[10px] font-bold text-white">
                  {row.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <p className="text-xs text-[#D9D3EE]">
                  <span className="font-semibold text-white">{row.name}</span>{" "}
                  {row.note}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-2.5 text-xs text-[#C4B5FD]">
            98% match confidence on your next study group
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ---------- discovery stack demo (reused as a feature visual) ----------

const demoProfiles = [
  { id: 1, initials: "RM", name: "Ridhi M.", meta: "2nd year · Design", bio: "Building a hackathon team for this weekend.", tags: ["Figma", "Hackathons"] },
  { id: 2, initials: "AS", name: "Arjun S.", meta: "3rd year · CSE", bio: "Runs the campus open-source club.", tags: ["React", "Open Source"] },
  { id: 3, initials: "PK", name: "Priya K.", meta: "1st year · Economics", bio: "Looking for a debate team before tryouts close.", tags: ["Debate", "Reading"] },
  { id: 4, initials: "SD", name: "Sameer D.", meta: "4th year · ECE", bio: "Final-year embedded ML project, needs testers.", tags: ["ML", "Hardware"] },
];

const DiscoveryDemo = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [connections, setConnections] = useState(0);
  const [exitDir, setExitDir] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-16, 16]);
  const likeOpacity = useTransform(x, [30, 140], [0, 1]);
  const passOpacity = useTransform(x, [-140, -30], [1, 0]);

  const active = demoProfiles[activeIndex % demoProfiles.length];

  const commit = (dir) => {
    setExitDir(dir);
    if (dir === 1) setConnections((c) => c + 1);
    setActiveIndex((i) => i + 1);
    x.set(0);
  };

  const onDragEnd = (_, info) => {
    if (info.offset.x > 110) commit(1);
    else if (info.offset.x < -110) commit(-1);
  };

  return (
    <div className="relative mx-auto w-full max-w-sm select-none">
      <div className="relative h-[300px]">
        <div className="absolute inset-0 translate-y-3 scale-[0.96] rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl" />
        <AnimatePresence initial={false}>
          <motion.div
            key={active.id + "-" + activeIndex}
            className="absolute inset-0 flex cursor-grab flex-col justify-between rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-[0_20px_60px_rgba(139,92,246,0.25)] backdrop-blur-2xl active:cursor-grabbing"
            style={{ x, rotate }}
            drag={prefersReducedMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.85}
            onDragEnd={onDragEnd}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ x: exitDir * 420, opacity: 0, rotate: exitDir * 20, transition: { duration: 0.3 } }}
          >
            <motion.span style={{ opacity: likeOpacity }} className="absolute right-4 top-4 rounded-md border-2 border-[#34D399] px-2 py-0.5 text-[10px] font-bold uppercase text-[#34D399]">
              Connect
            </motion.span>
            <motion.span style={{ opacity: passOpacity }} className="absolute left-4 top-4 rounded-md border-2 border-[#F87171] px-2 py-0.5 text-[10px] font-bold uppercase text-[#F87171]">
              Pass
            </motion.span>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] text-base font-bold text-white">
                {active.initials}
              </div>
              <p className="mt-3 text-lg font-bold text-white">{active.name}</p>
              <p className="text-xs text-[#B8AED9]">{active.meta}</p>
              <p className="mt-3 text-sm leading-6 text-[#D9D3EE]">{active.bio}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {active.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-[#C9C0E8]">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button onClick={() => commit(-1)} aria-label="Pass" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#F87171] transition hover:bg-white/10">
          <X size={18} />
        </button>
        <button onClick={() => commit(1)} aria-label="Connect" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#34D399] transition hover:bg-white/10">
          <Heart size={18} />
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-[#8B81AD]">
        {connections} connection{connections === 1 ? "" : "s"} made — drag or tap to try it.
      </p>
    </div>
  );
};

// ---------- ephemeral room countdown visual ----------

const RoomCountdown = () => {
  const [seconds, setSeconds] = useState(47 * 60 + 12);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Pre-Fest Study Room</p>
        <span className="flex items-center gap-1 rounded-full border border-[#F87171]/40 bg-[#F87171]/10 px-2.5 py-1 text-[11px] font-semibold text-[#F87171]">
          <Timer size={12} /> {mins}:{secs}
        </span>
      </div>
      <div className="mt-4 space-y-2.5">
        {[
          { name: "Nisha T.", text: "does anyone have the ch.4 notes?" },
          { name: "Arjun S.", text: "uploading mine now" },
          { name: "Priya K.", text: "same, this room is a lifesaver" },
        ].map((m) => (
          <div key={m.name} className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
            <p className="text-[11px] font-semibold text-[#8B5CF6]">{m.name}</p>
            <p className="text-xs text-[#D9D3EE]">{m.text}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-[#8B81AD]">
        This room closes itself automatically — nothing lingers after.
      </p>
    </div>
  );
};

// ---------- onboarding pulse (falling-signal visual) ----------

const OnboardingPulse = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(72), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative mx-auto flex w-full max-w-xs flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 pb-6 pt-10 backdrop-blur-xl">
      <div className="relative h-24 w-px bg-gradient-to-b from-transparent via-[#8B5CF6] to-[#22D3EE]">
        <motion.div
          className="absolute -left-[5px] h-3 w-3 rounded-full bg-[#22D3EE] shadow-[0_0_20px_6px_rgba(34,211,238,0.55)]"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="mt-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-xl">
        🎓
      </div>
      <div className="mt-4 w-full">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        </div>
        <p className="mt-2 text-center text-xs font-semibold tracking-wide text-[#9C9AB8]">
          {progress}% VERIFIED
        </p>
      </div>
      <div className="mt-5 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5">
          <ShieldCheck size={16} className="text-[#8B5CF6]" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8B5CF6]">
            Step 01
          </p>
          <p className="text-sm font-semibold text-white">
            Verify registration number
          </p>
        </div>
      </div>
    </div>
  );
};

// ---------- funnel / convergence section ----------

const funnelInputs = [
  { icon: FileText, label: "Class notes & slides" },
  { icon: CalendarDays, label: "Your timetable" },
  { icon: Users, label: "Club interests" },
  { icon: Target, label: "Target GPA" },
  { icon: BookOpen, label: "Reading list" },
  { icon: Link2, label: "Event links" },
];

const FunnelSection = () => (
  <section className="relative border-t border-white/10 py-20 lg:py-28">
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#8B5CF6]">
        One profile
      </p>
      <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
        Give it everything about your campus life.
      </h2>
      <p className="mt-4 text-sm leading-6 text-[#9C9AB8] sm:text-base">
        Every input feeds one profile, so matches and recommendations are
        actually about you — not a generic student.
      </p>
    </div>

    <div className="relative mx-auto mt-16 max-w-5xl">
      <div className="grid grid-cols-3 gap-6 sm:grid-cols-6">
        {funnelInputs.map(({ icon: Icon, label }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#C4B5FD]">
              <Icon size={20} />
            </div>
            <p className="text-[11px] font-medium text-[#9C9AB8]">{label}</p>
          </motion.div>
        ))}
      </div>

      <svg
        viewBox="0 0 1200 260"
        className="mt-4 h-auto w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {[100, 300, 500, 700, 900, 1100].map((startX, i) => (
          <motion.path
            key={startX}
            d={`M ${startX} 0 C ${startX} 140, 600 120, 600 240`}
            fill="none"
            stroke="url(#funnelGradient)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.6 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: i * 0.08 }}
          />
        ))}
        <defs>
          <linearGradient id="funnelGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>

      <div className="-mt-6 flex justify-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] shadow-[0_0_50px_10px_rgba(139,92,246,0.35)]">
          <CampusMark size={28} />
        </div>
      </div>
    </div>
  </section>
);

// ---------- feature storytelling ----------

const FeatureRow = ({ index, label, title, body, reverse, visual }) => (
  <div className="grid items-center gap-10 border-t border-white/10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
    <div className={reverse ? "lg:order-2" : ""}>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#8B5CF6]">
        Feature {index}
      </p>
      <h3 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
        {title}
      </h3>
      <p className="mt-4 max-w-md text-base leading-7 text-[#9C9AB8]">
        {body}
      </p>
      <a
        href="#pricing"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#8B5CF6]"
      >
        {label} <ArrowRight size={14} />
      </a>
    </div>
    <div className={reverse ? "lg:order-1" : ""}>{visual}</div>
  </div>
);

// ---------- AI demo centerpiece ----------

const AIDemo = () => {
  const [revealed, setRevealed] = useState(0);
  const [running, setRunning] = useState(false);
  const steps = [
    "Scanning who's active on campus right now…",
    "Found 4 students into hackathons nearby",
    "Drafted an opening message for you",
  ];

  const run = () => {
    if (running) return;
    setRunning(true);
    setRevealed(0);
    steps.forEach((_, i) => {
      setTimeout(() => setRevealed(i + 1), 700 * (i + 1));
    });
    setTimeout(() => setRunning(false), 700 * (steps.length + 1));
  };

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]" />
        <div className="rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 text-sm text-[#E7E5FF]">
          Who's around campus right now that's into hackathons?
        </div>
      </div>

      <div className="mt-5 min-h-[132px] space-y-2.5">
        {steps.map((s, i) => (
          <AnimatePresence key={s}>
            {revealed > i && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2.5"
              >
                <Check size={14} className="shrink-0 text-[#34D399]" />
                <p className="text-sm text-[#D9D3EE]">{s}</p>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <button
        onClick={run}
        disabled={running}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {running ? "Thinking…" : "Try it yourself"} <ArrowRight size={14} />
      </button>
    </div>
  );
};

// ---------- how it works ----------

const steps = [
  { n: "01", title: "Verify", body: "Confirm your university registration number once — that's your key in." },
  { n: "02", title: "Describe what you need", body: "Study group, teammates, event, or just people nearby — tell it what you're looking for." },
  { n: "03", title: "Let it find your people", body: "Discovery Stack surfaces real, currently-active students who match." },
];

// ---------- data ----------

const trustLogos = ["TechSociety", "Debate Union", "Founders Club", "Camera Collective", "Hack Circle", "Lit Society"];

const problems = [
  { n: "01", title: "Too many group chats", body: "Six WhatsApp groups, three Discords, one forgotten Telegram — and you still miss the event." },
  { n: "02", title: "No idea who's around", body: "Hundreds of people on your course, and you couldn't name five of them outside your friend group." },
  { n: "03", title: "Events you hear about too late", body: "By the time it hits your feed, the club meetup already happened." },
];

const testimonials = [
  { name: "Ridhi M.", role: "2nd year, Design", quote: "Found my entire hackathon team through the discovery feed in one evening." },
  { name: "Arjun S.", role: "3rd year, CSE", quote: "The ephemeral rooms are perfect for exam week — no clutter left behind." },
  { name: "Priya K.", role: "1st year, Economics", quote: "As a fresher this was the only way I actually met people outside my hostel block." },
  { name: "Sameer D.", role: "4th year, ECE", quote: "Real-time presence means I stop messaging people who logged off two days ago." },
];

const pricingPlans = [
  {
    name: "Free",
    price: "₹0",
    desc: "Everything a student needs to find their people.",
    features: ["Verified campus profile", "Discovery Stack", "Group & 1-to-1 chat", "Ephemeral study rooms"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Plus",
    price: "₹99/mo",
    desc: "For students who organize as much as they attend.",
    features: ["Everything in Free", "Priority event visibility", "Unlimited active rooms", "Early feature access"],
    cta: "Go Plus",
    highlight: true,
  },
  {
    name: "Campus Partner",
    price: "Custom",
    desc: "For clubs and student unions running the show.",
    features: ["Everything in Plus", "Verified club badge", "Event analytics", "Direct support line"],
    cta: "Talk to us",
    highlight: false,
  },
];

const faqs = [
  { q: "What exactly is Campus Connect?", a: "A real-time, campus-exclusive network for finding students, clubs, and events actually around you — verified with your registration number, not open to outsiders." },
  { q: "How does the matching work?", a: "Your profile, interests, and activity feed a discovery layer that surfaces relevant people and events first — no generic directory scrolling." },
  { q: "Is it really free for students?", a: "Yes. Every core feature — profile, discovery, chat, study rooms — is free. Plus is optional, for people who want extra visibility for what they organize." },
  { q: "Is my data secure?", a: "Access is gated behind your real registration number, and Firestore security rules enforce who can read what at the database level, not just in the interface." },
  { q: "What happens to ephemeral rooms?", a: "They close automatically about an hour after creation. Nothing lingers, nothing needs cleaning up." },
  { q: "Can I use this if I'm not very tech-savvy?", a: "If you can use WhatsApp, you can use this — verification is a one-time step, and the rest works like any chat app." },
];

const FAQItem = ({ q, a, isOpen, onToggle }) => (
  <div className="border-b border-white/10 py-5">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between text-left"
    >
      <span className="text-sm font-semibold text-white sm:text-base">{q}</span>
      <ChevronDown
        size={18}
        className={`shrink-0 text-[#9C9AB8] transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <p className="pt-3 text-sm leading-6 text-[#9C9AB8]">{a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ---------- page ----------

const LandingPage = () => {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [openFAQ, setOpenFAQ] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const glowX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const glowY = useSpring(rawY, { stiffness: 60, damping: 20 });

  const handleHeroMouseMove = (e) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set(e.clientX - rect.left);
    rawY.set(e.clientY - rect.top);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[#05050A] font-[Inter,sans-serif] text-[#F5F4FF]">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-[#05050A]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(34,211,238,0.12),transparent_30%)]" />
            <motion.div
              initial={{ scale: 0.82, y: 18, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="relative flex flex-col items-center gap-6 px-6 text-center"
            >
              <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
                <BrandLogo size={176} animated />
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.45em] text-[#8B81AD]">
                  Welcome to Campus Connect
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-[0.22em] text-white sm:text-4xl">
                  CAMPUS CONNECT
                </h1>
              </div>

              <div className="w-48 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-1.5 rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#22D3EE] to-[#FF4FD8]"
                  initial={{ x: "-40%" }}
                  animate={{ x: "140%" }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <NavBar user={user} />

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        {/* hero */}
        <main
          id="product"
          onMouseMove={handleHeroMouseMove}
          className="relative grid gap-14 overflow-hidden py-16 lg:grid-cols-[1fr_0.95fr] lg:gap-10 lg:py-24"
        >
          <GlowOrb className="left-1/4 top-0 h-72 w-72 bg-[#8B5CF6]" />
          <GlowOrb className="right-0 top-1/3 h-72 w-72 bg-[#22D3EE]" />

          {!prefersReducedMotion && (
            <motion.div
              className="pointer-events-none absolute h-64 w-64 rounded-full opacity-20 blur-[80px]"
              style={{
                left: glowX,
                top: glowY,
                x: "-50%",
                y: "-50%",
                background: "radial-gradient(circle, #A78BFA 0%, transparent 70%)",
              }}
              aria-hidden="true"
            />
          )}

          <section className="relative">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mb-5 inline-flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl"
            >
              <BrandLogo size={54} animated />
              <div className="text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#8B81AD]">
                  Campus Connect
                </p>
                <p className="text-sm font-semibold text-white">
                  Verified people. Real campus moments.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[#C4B5FD]"
            >
              ✦ The intelligent way to actually meet your campus
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-5 text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-[3.6rem]"
            >
              Meet faster.
              <br />
              Discover smarter.
              <br />
              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#60A5FA] to-[#22D3EE] bg-clip-text text-transparent">
                Belong instantly.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 max-w-md text-base leading-7 text-[#9C9AB8] sm:text-lg"
            >
              Campus Connect is a real-time, verified network for university
              students — built to surface the people, clubs, and events
              actually around you, right now.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to={user ? "/discover" : "/login"}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.4)] transition hover:brightness-110"
              >
                {user ? "Go to Discover" : "Get Started — It's Free"}
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D9D3EE] hover:text-white"
              >
                See how it works <ArrowRight size={14} />
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-5 flex items-center gap-2 text-xs text-[#8B81AD]"
            >
              <MousePointer2 size={13} /> No spam · Verified students only ·
              Setup in minutes
            </motion.p>
          </section>

          <motion.section
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex items-center"
          >
            <DashboardMockup />
          </motion.section>
        </main>

        {/* trust bar */}
        <section className="border-t border-white/10 py-10">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-[#635F80]">
            Trusted by student communities across campus
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60 grayscale">
            {trustLogos.map((name) => (
              <span key={name} className="text-sm font-semibold text-[#9C9AB8]">
                {name}
              </span>
            ))}
          </div>
        </section>

        {/* problem -> solution */}
        <section className="border-t border-white/10 py-16 lg:py-20">
          <h2 className="max-w-lg text-3xl font-extrabold leading-tight sm:text-4xl">
            Stop working around six different apps.
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {problems.map((p) => (
              <div key={p.n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <span className="text-xs font-bold text-[#635F80]">{p.n}</span>
                <h3 className="mt-3 text-lg font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#9C9AB8]">{p.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-2xl font-extrabold text-white">
            One campus feed.{" "}
            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">
              Nothing missed.
            </span>
          </p>
        </section>

        <FunnelSection />

        {/* features */}
        <section id="features">
          <FeatureRow
            index="01"
            label="See how verification works"
            title="Understand who's real, instantly."
            body="Every profile is checked against your university's actual registration records before it goes live. No outsiders, no fakes, no bots."
            visual={<OnboardingPulse />}
          />
          <FeatureRow
            index="02"
            label="Try the discovery stack"
            title="Turn strangers into study partners."
            body="Swipe through students who share your course, your interests, or your free period right now — powered by live Firestore data, not a static list."
            reverse
            visual={<DiscoveryDemo />}
          />
          <FeatureRow
            index="03"
            label="See who's online"
            title="Know who's actually around."
            body="Real-time presence means you're messaging people who are here, not people who logged off two days ago."
            visual={<DashboardMockup />}
          />
          <FeatureRow
            index="04"
            label="Learn about ephemeral rooms"
            title="Conversations that clean up after themselves."
            body="Spin up a room for tonight's study session or event — it closes itself automatically about an hour later. Nothing to archive or delete."
            reverse
            visual={<RoomCountdown />}
          />
        </section>

        {/* AI demo centerpiece */}
        <section className="border-t border-white/10 py-16 lg:py-24">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              See the discovery engine in action.
            </h2>
            <p className="mt-3 text-sm text-[#9C9AB8] sm:text-base">
              This is a live preview — the real thing runs on your actual
              campus data.
            </p>
          </div>
          <div className="mt-10">
            <AIDemo />
          </div>
        </section>

        {/* how it works */}
        <section id="how-it-works" className="border-t border-white/10 py-16 lg:py-24">
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            Three steps in.
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {steps.map((s) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-5xl font-extrabold text-white/10">
                  {s.n}
                </span>
                <h3 className="mt-3 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#9C9AB8]">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* stats */}
        <section className="border-t border-white/10 py-16 lg:py-20">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
            Built for people who want more done on campus.
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { to: 500, suffix: "+", label: "Students waitlisted" },
              { to: 40, suffix: "+", label: "Campus clubs" },
              { to: 12, suffix: "", label: "Colleges onboarding" },
              { to: 24, suffix: "/7", label: "Live presence" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold sm:text-4xl">
                  <CountUp to={s.to} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-xs text-[#9C9AB8]">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-[11px] text-[#635F80]">
            Early, pre-launch numbers — update with real figures once live.
          </p>
        </section>

        {/* testimonials */}
        <section className="border-t border-white/10 py-16 lg:py-20">
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            What students are saying.
          </h2>
          <div className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="min-w-[280px] max-w-[280px] shrink-0 snap-start rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <Quote size={18} className="text-[#8B5CF6]" />
                <p className="mt-3 text-sm leading-6 text-[#D9D3EE]">
                  "{t.quote}"
                </p>
                <div className="mt-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] text-[10px] font-bold text-white">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{t.name}</p>
                    <p className="text-[11px] text-[#8B81AD]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* pricing */}
        <section id="pricing" className="border-t border-white/10 py-16 lg:py-24">
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            Simple pricing.
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-7 ${
                  plan.highlight
                    ? "border-[#8B5CF6] bg-gradient-to-b from-[#8B5CF6]/10 to-transparent"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-3 py-1 text-[11px] font-semibold text-white">
                    Recommended
                  </span>
                )}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-2 text-3xl font-extrabold">{plan.price}</p>
                <p className="mt-2 text-sm text-[#9C9AB8]">{plan.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#D9D3EE]">
                      <Check size={14} className="shrink-0 text-[#34D399]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={user ? "/discover" : "/login"}
                  className={`mt-7 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition ${
                    plan.highlight
                      ? "bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:brightness-110"
                      : "border border-white/15 text-white hover:bg-white/5"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-white/10 py-16 lg:py-20">
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            Frequently asked.
          </h2>
          <div className="mt-8 max-w-2xl">
            {faqs.map((f, i) => (
              <FAQItem
                key={f.q}
                q={f.q}
                a={f.a}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? -1 : i)}
              />
            ))}
          </div>
        </section>

        {/* final CTA */}
        <section className="relative overflow-hidden border-t border-white/10 py-20 text-center lg:py-28">
          <GlowOrb className="left-1/2 top-0 h-80 w-80 -translate-x-1/2 bg-[#8B5CF6]" />
          <div className="relative">
            <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Ready to actually meet your campus?
            </h2>
            <p className="mt-4 text-base text-[#9C9AB8] sm:text-lg">
              Start with Campus Connect today — free, verified, yours.
            </p>
            <Link
              to={user ? "/discover" : "/login"}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.4)] transition hover:brightness-110"
            >
              Get Started Free <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* footer */}
        <footer className="border-t border-white/10 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <BrandLogo size={26} animated={false} />
                <span className="text-base font-extrabold">Campus Connect</span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-[#8B81AD]">
                Built for students, by students.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Company", links: ["About", "Contact", "Careers"] },
              { title: "Resources", links: ["Help Center", "Community", "Guides"] },
              { title: "Legal", links: ["Privacy", "Terms"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#635F80]">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-[#9C9AB8] hover:text-white">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-xs text-[#635F80]">
            © {new Date().getFullYear()} Campus Connect. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;