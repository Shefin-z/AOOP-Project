import { useEffect, useRef, useState } from "react";
import { Link } from "../lib/router";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheckBig,
  Code2,
  FileText,
  Gauge,
  GraduationCap,
  Layers3,
  MessageCircle,
  MousePointer2,
  Play,
  Radar,
  Route,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
import AdaptiveHeroImage from "./AdaptiveHeroImage";
import { PublicFooter, PublicHeader } from "./public/PublicChrome";
import UniversityMarquee from "./public/UniversityMarquee";

const rolePaths = [
  {
    id: "product",
    label: "Product",
    role: "Product Analyst",
    match: 94,
    readiness: 82,
    color: "bg-coral",
    accent: "text-coral",
    skills: ["SQL", "Product sense", "Research"],
    missing: "Data storytelling",
    openings: "38 live roles",
  },
  {
    id: "engineering",
    label: "Engineering",
    role: "Frontend Engineer",
    match: 91,
    readiness: 76,
    color: "bg-cobalt",
    accent: "text-cobalt",
    skills: ["React", "JavaScript", "UI systems"],
    missing: "Testing strategy",
    openings: "52 live roles",
  },
  {
    id: "data",
    label: "Data & AI",
    role: "Data Analyst",
    match: 89,
    readiness: 79,
    color: "bg-jade",
    accent: "text-jade",
    skills: ["Python", "SQL", "Dashboards"],
    missing: "Experiment design",
    openings: "44 live roles",
  },
];

const features = [
  {
    icon: Target,
    tone: "bg-cobalt text-white",
    title: "AI job matching",
    copy: "See why a role fits, which strengths stand out, and the smartest next move before you apply.",
    stat: "Explainable matches",
  },
  {
    icon: BarChart3,
    tone: "bg-jade text-white",
    title: "Skill intelligence",
    copy: "Benchmark your strengths with focused assessments and watch your readiness change in real time.",
    stat: "Living skill profile",
  },
  {
    icon: FileText,
    tone: "bg-coral text-white",
    title: "Career Vault",
    copy: "Build an ATS-ready resume, keep every version organized, and tailor your story for each role.",
    stat: "One-click PDF",
  },
  {
    icon: Users,
    tone: "bg-plum text-white",
    title: "Community momentum",
    copy: "Learn with ambitious peers, share wins, discover events, and keep moving with accountability.",
    stat: "Built for students",
  },
];

const journeySteps = [
  {
    number: "01",
    title: "Build your signal",
    copy: "Add your skills, goals and experience. CareerForge shapes them into a professional identity that gets sharper over time.",
    label: "Profile intelligence",
    icon: Radar,
    metric: "Profile strength",
    value: "86%",
    detail: "4 high-signal strengths identified",
    color: "bg-cobalt",
    bars: [86, 68, 78],
  },
  {
    number: "02",
    title: "Close the right gaps",
    copy: "Take focused assessments and follow a learning plan built around the roles you actually want—not generic advice.",
    label: "Adaptive growth",
    icon: TrendingUp,
    metric: "Weekly momentum",
    value: "+12%",
    detail: "2 priority skills moving forward",
    color: "bg-jade",
    bars: [72, 90, 64],
  },
  {
    number: "03",
    title: "Apply with confidence",
    copy: "Match with relevant jobs, tailor your story, generate application assets, and track every opportunity in one place.",
    label: "Opportunity engine",
    icon: BriefcaseBusiness,
    metric: "Top role match",
    value: "94%",
    detail: "Ready to apply with CareerForge",
    color: "bg-coral",
    bars: [94, 82, 88],
  },
];

const outcomes = [
  { value: "360°", label: "career visibility", icon: Radar },
  { value: "1", label: "connected workspace", icon: Layers3 },
  { value: "24/7", label: "progress intelligence", icon: Gauge },
  { value: "0", label: "guesswork required", icon: Route },
];

function useInView() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.14 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...props }) {
  const [ref, visible] = useInView();
  return (
    <Tag
      ref={ref}
      className={`landing-reveal ${visible ? "landing-reveal-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(available > 0 ? Math.min(100, (window.scrollY / available) * 100) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="landing-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  );
}

function SpotlightCard({ className = "", children, ...props }) {
  const cardRef = useRef(null);
  const pointerFrame = useRef(null);
  const lastPointer = useRef(null);

  const handlePointerMove = (event) => {
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;
    const card = cardRef.current;
    if (!card) return;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    if (pointerFrame.current) return;
    pointerFrame.current = window.requestAnimationFrame(() => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${lastPointer.current.x - bounds.left}px`);
      card.style.setProperty("--spot-y", `${lastPointer.current.y - bounds.top}px`);
      pointerFrame.current = null;
    });
  };

  return (
    <article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`landing-spotlight ${className}`}
      {...props}
    >
      {children}
    </article>
  );
}

function HeroExperience() {
  const stageRef = useRef(null);
  const pointerFrame = useRef(null);
  const lastPointer = useRef(null);
  const [activeRole, setActiveRole] = useState(rolePaths[0]);

  const handlePointerMove = (event) => {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;
    const stage = stageRef.current;
    if (!stage) return;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    if (pointerFrame.current) return;
    pointerFrame.current = window.requestAnimationFrame(() => {
      const bounds = stage.getBoundingClientRect();
      const x = (lastPointer.current.x - bounds.left) / bounds.width - 0.5;
      const y = (lastPointer.current.y - bounds.top) / bounds.height - 0.5;
      stage.style.setProperty("--hero-tilt-x", `${y * -3.2}deg`);
      stage.style.setProperty("--hero-tilt-y", `${x * 4.5}deg`);
      stage.style.setProperty("--hero-shift-x", `${x * 12}px`);
      stage.style.setProperty("--hero-shift-y", `${y * 12}px`);
      stage.style.setProperty("--hero-glow-x", `${(x + 0.5) * 100}%`);
      stage.style.setProperty("--hero-glow-y", `${(y + 0.5) * 100}%`);
      pointerFrame.current = null;
    });
  };

  const resetPointer = () => {
    const stage = stageRef.current;
    if (!stage) return;
    ["--hero-tilt-x", "--hero-tilt-y"].forEach((property) => stage.style.setProperty(property, "0deg"));
    ["--hero-shift-x", "--hero-shift-y"].forEach((property) => stage.style.setProperty(property, "0px"));
    stage.style.setProperty("--hero-glow-x", "72%");
    stage.style.setProperty("--hero-glow-y", "18%");
  };

  return (
    <div
      ref={stageRef}
      className="career-cockpit"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div className="career-cockpit-glow" />
      <div className="career-cockpit-frame">
        <AdaptiveHeroImage
          alt="Two students exploring their AI-guided career path together"
          className="h-full min-h-[510px] w-full sm:min-h-[600px] lg:min-h-[660px]"
          imageClassName="object-cover object-center"
        />
        <div className="career-cockpit-shade" />
      </div>

      <div className="career-live-pill glass-strong">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jade opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-jade" />
        </span>
        Career OS live
      </div>

      <div className="career-readiness-card glass-strong">
        <span className="grid h-10 w-10 place-items-center rounded-[15px] bg-jade text-white">
          <Zap size={18} />
        </span>
        <span>
          <b className="block text-sm">Readiness +12%</b>
          <small className="text-muted">strong week</small>
        </span>
      </div>

      <div className="career-orbit career-orbit-one"><Code2 size={14} /> React</div>
      <div className="career-orbit career-orbit-two"><BarChart3 size={14} /> SQL</div>
      <div className="career-orbit career-orbit-three"><Sparkles size={14} /> AI-ready</div>

      <div className="career-match-panel glass-strong">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">Live opportunity radar</span>
            <h3 className="mt-1.5 text-lg font-extrabold tracking-[-0.035em]">{activeRole.role}</h3>
          </div>
          <span className={`grid h-11 w-11 place-items-center rounded-2xl text-sm font-extrabold text-white ${activeRole.color}`}>
            {activeRole.match}%
          </span>
        </div>
        <div className="mt-4 flex gap-1 rounded-[14px] bg-ink/[0.055] p-1">
          {rolePaths.map((path) => (
            <button
              key={path.id}
              type="button"
              onClick={() => setActiveRole(path)}
              className={`min-h-8 flex-1 rounded-[11px] px-2 text-[10px] font-extrabold transition ${
                activeRole.id === path.id ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
              aria-pressed={activeRole.id === path.id}
            >
              {path.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="font-bold">{activeRole.openings}</span>
          <span className={activeRole.accent}>{activeRole.missing} next</span>
        </div>
      </div>

      <div className="career-cursor-hint">
        <MousePointer2 size={13} />
        Move to explore
      </div>
    </div>
  );
}

function PlatformSection() {
  const [selected, setSelected] = useState(rolePaths[0]);

  return (
    <section id="platform" className="page-shell scroll-mt-28 py-20 sm:py-28">
      <Reveal className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
        <div>
          <div className="eyebrow mb-5"><Zap size={14} /> One connected platform</div>
          <h2 className="section-title max-w-xl">Less guessing.<br /><i className="text-coral">More becoming.</i></h2>
        </div>
        <p className="max-w-2xl text-base leading-7 text-muted lg:justify-self-end">
          CareerForge turns every skill, assessment, application and achievement into one clear career signal—so you always know what deserves your attention next.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-12">
        <Reveal className="lg:col-span-7" delay={60}>
          <SpotlightCard className="panel min-h-[430px] overflow-hidden p-6 sm:p-8">
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="eyebrow"><Bot size={14} /> AI opportunity engine</span>
                  <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">Your market, decoded.</h3>
                </div>
                <span className="tag"><span className="h-2 w-2 rounded-full bg-jade" /> Live intelligence</span>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {rolePaths.map((path) => (
                  <button
                    key={path.id}
                    type="button"
                    onClick={() => setSelected(path)}
                    className={`rounded-[20px] border p-4 text-left transition duration-300 ${
                      selected.id === path.id
                        ? "border-cobalt/25 bg-cobalt text-white shadow-button"
                        : "border-ink/[0.08] bg-white/55 hover:-translate-y-1 hover:bg-white"
                    }`}
                    aria-pressed={selected.id === path.id}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.13em] opacity-70">{path.label}</span>
                    <b className="mt-2 block text-sm">{path.role}</b>
                    <small className="mt-1 block opacity-70">{path.openings}</small>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid flex-1 gap-4 rounded-[24px] border border-ink/[0.08] bg-white/55 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Current signal</span>
                    <b className={selected.accent}>{selected.match}% role match</b>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink/[0.08]">
                    <span className={`block h-full rounded-full transition-all duration-700 ${selected.color}`} style={{ width: `${selected.match}%` }} />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {selected.skills.map((skill) => <span key={skill} className="tag">{skill}<Check size={11} /></span>)}
                  </div>
                  <p className="mt-5 text-sm leading-6 text-muted">
                    One focused improvement in <b className="text-ink">{selected.missing}</b> could move this path into your strongest opportunity zone.
                  </p>
                </div>
                <div
                  className="match-orb"
                  style={{ "--match-value": `${selected.match * 3.6}deg` }}
                  aria-label={`${selected.match}% match`}
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={selected.match}
                >
                  <span><b>{selected.match}%</b><small>match</small></span>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={120}>
          <SpotlightCard className="panel min-h-[430px] overflow-hidden p-6 sm:p-8">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-jade text-white"><Gauge size={21} /></span>
                <span className="tag">Updated today</span>
              </div>
              <h3 className="mt-7 text-2xl font-extrabold tracking-[-0.04em]">Readiness that responds.</h3>
              <p className="mt-3 text-sm leading-6 text-muted">Every meaningful action sharpens your score and reorders your next best moves.</p>

              <div className="mt-7 grid grid-cols-[130px_1fr] items-center gap-5">
                <div className="readiness-orb">
                  <div><b>78</b><small>/100</small></div>
                </div>
                <div className="space-y-4">
                  {[
                    ["Skills", 84, "bg-cobalt"],
                    ["Profile", 76, "bg-coral"],
                    ["Experience", 68, "bg-jade"],
                  ].map(([label, value, tone]) => (
                    <div key={label}>
                      <div className="mb-1.5 flex justify-between text-[11px] font-bold"><span>{label}</span><span>{value}%</span></div>
                      <div className="h-1.5 rounded-full bg-ink/[0.08]"><span className={`block h-full rounded-full ${tone}`} style={{ width: `${value}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-7 flex items-start gap-3 rounded-[18px] bg-jade/10 p-4">
                <CircleCheckBig className="mt-0.5 shrink-0 text-jade" size={17} />
                <p className="text-xs leading-5 text-muted"><b className="text-ink">Best next move:</b> complete the intermediate SQL assessment to unlock 14 additional matches.</p>
              </div>
            </div>
          </SpotlightCard>
        </Reveal>

        {features.map(({ icon: Icon, tone, title, copy, stat }, index) => (
          <Reveal className="lg:col-span-3" delay={70 * index} key={title}>
            <SpotlightCard className="panel group min-h-[300px] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className="relative z-10">
                <div className={`grid h-12 w-12 place-items-center rounded-[18px] ${tone}`}><Icon size={20} /></div>
                <h3 className="mt-7 text-xl font-extrabold tracking-[-0.035em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{copy}</p>
                <div className="mt-7 flex items-center justify-between border-t border-ink/[0.08] pt-4">
                  <span className="text-xs font-bold text-muted">{stat}</span>
                  <span className="tag !px-2">Connected</span>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function JourneySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = journeySteps[activeIndex];
  const ActiveIcon = active.icon;

  return (
    <section id="journey" className="journey-section scroll-mt-28 overflow-hidden bg-ink py-20 text-white sm:py-28">
      <div className="journey-ambient journey-ambient-one" />
      <div className="journey-ambient journey-ambient-two" />
      <div className="page-shell relative z-10">
        <Reveal className="grid gap-12 lg:grid-cols-[.65fr_1.35fr]">
          <div>
            <div className="eyebrow mb-5 !text-[#9cb1ff]"><Sparkles size={14} /> Your CareerForge journey</div>
            <h2 className="section-title">A system that<br /><i className="text-[#E59779]">moves with you.</i></h2>
            <p className="mt-6 max-w-md text-sm leading-6 text-white/60">
              Start wherever you are. CareerForge keeps learning from every assessment, application and milestone.
            </p>
            <Link to="/login/student?mode=register" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:gap-3">
              Build your career signal <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
            <div className="space-y-3" role="tablist" aria-label="Career journey steps">
              {journeySteps.map((step, index) => (
                <button
                  key={step.number}
                  type="button"
                  role="tab"
                  id={`journey-tab-${index}`}
                  aria-controls={`journey-panel-${index}`}
                  aria-selected={activeIndex === index}
                  onClick={() => setActiveIndex(index)}
                  className={`journey-step w-full rounded-[24px] border p-5 text-left transition duration-300 ${
                    activeIndex === index
                      ? "border-white/20 bg-white/[0.10]"
                      : "border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span className={`font-display text-3xl italic ${activeIndex === index ? "text-[#E59779]" : "text-white/30"}`}>{step.number}</span>
                    <span>
                      <b className="block text-lg tracking-[-0.025em]">{step.title}</b>
                      <small className="mt-1 block text-white/45">{step.label}</small>
                    </span>
                    <ChevronRight className={`ml-auto transition ${activeIndex === index ? "translate-x-1 text-white" : "text-white/25"}`} size={17} />
                  </span>
                </button>
              ))}
            </div>

            <div
              id={`journey-panel-${activeIndex}`}
              role="tabpanel"
              aria-labelledby={`journey-tab-${activeIndex}`}
              className="journey-console rounded-[30px] border border-white/10 bg-white/[0.07] p-6 backdrop-blur-xl sm:p-7"
            >
              <div key={active.number} className="animate-enter">
                <div className="flex items-center justify-between">
                  <span className={`grid h-12 w-12 place-items-center rounded-[18px] text-white ${active.color}`}><ActiveIcon size={21} /></span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/55">Live preview</span>
                </div>
                <p className="mt-7 leading-7 text-white/60">{active.copy}</p>
                <div className="my-7 h-px bg-white/10" />
                <div className="flex items-end justify-between">
                  <span><small className="block text-xs text-white/45">{active.metric}</small><b className="mt-1 block text-4xl tracking-[-0.05em]">{active.value}</b></span>
                  <TrendingUp className="text-[#9cb1ff]" size={27} />
                </div>
                <div className="mt-6 space-y-3">
                  {active.bars.map((value, index) => (
                    <div key={`${active.number}-${value}-${index}`} className="h-2 overflow-hidden rounded-full bg-white/10">
                      <span className={`reveal-bar block h-full rounded-full ${active.color}`} style={{ width: `${value}%`, animationDelay: `${index * 90}ms` }} />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-white/65"><CircleCheckBig size={15} className="text-[#7ac5a4]" /> {active.detail}</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="noise min-h-screen overflow-x-clip">
      <ScrollProgress />
      <PublicHeader />

      <section className="page-shell relative pb-16 pt-10 sm:pt-16 lg:pb-24 lg:pt-20">
        <div className="hero-mesh hero-mesh-one" />
        <div className="hero-mesh hero-mesh-two" />
        <div className="grid items-center gap-12 lg:grid-cols-[0.84fr_1.16fr] lg:gap-7">
          <Reveal className="relative z-10">
            <div className="eyebrow mb-6">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-cobalt text-white"><Sparkles size={14} /></span>
              Career clarity, engineered
            </div>
            <h1 className="display-title max-w-[720px]">
              Your ambition,
              <span className="block italic text-cobalt">made actionable.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-muted sm:text-lg">
              CareerForge connects your skills, goals and progress into one intelligent career system—so every next move feels deliberate.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/login/student?mode=register" className="btn-accent group px-6">
                Start forging your path <ArrowRight className="transition group-hover:translate-x-1" size={17} />
              </Link>
              <a href="#journey" className="btn-secondary group px-5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-white transition group-hover:scale-110"><Play size={12} fill="currentColor" /></span>
                See how it works
              </a>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-muted">
              {["Free student account", "No credit card", "Progress saved"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-jade/15 text-jade"><Check size={12} /></span>
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-4 border-t border-ink/[0.08] pt-6">
              <div className="flex -space-x-2">
                {[
                  ["UI", "bg-cobalt"],
                  ["DU", "bg-jade"],
                  ["BU", "bg-coral"],
                  ["NS", "bg-plum"],
                ].map(([label, tone]) => (
                  <span key={label} className={`grid h-9 w-9 place-items-center rounded-full border-2 border-canvas text-[9px] font-extrabold text-white ${tone}`}>{label}</span>
                ))}
              </div>
              <p className="text-xs leading-5 text-muted"><b className="block text-ink">Built with students in mind</b>Across Bangladesh’s leading universities</p>
            </div>
          </Reveal>

          <Reveal className="relative lg:-mr-20" delay={100}>
            <HeroExperience />
          </Reveal>
        </div>
      </section>

      <UniversityMarquee />

      <section className="page-shell py-10 sm:py-14">
        <Reveal className="grid overflow-hidden rounded-[28px] border border-ink/[0.08] bg-white/40 sm:grid-cols-2 lg:grid-cols-4">
          {outcomes.map(({ value, label, icon: Icon }, index) => (
            <div key={label} className={`group flex items-center gap-4 p-5 sm:p-6 ${index ? "border-t border-ink/[0.08] sm:border-l sm:border-t-0" : ""}`}>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink/[0.06] text-cobalt transition group-hover:rotate-3 group-hover:bg-cobalt group-hover:text-white"><Icon size={18} /></span>
              <span><b className="block text-2xl tracking-[-0.04em]">{value}</b><small className="text-muted">{label}</small></span>
            </div>
          ))}
        </Reveal>
      </section>

      <PlatformSection />
      <JourneySection />

      <section id="community" className="page-shell scroll-mt-28 py-20 sm:py-28">
        <Reveal className="mb-10 grid gap-7 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
          <div>
            <div className="eyebrow mb-5"><Users size={14} /> Beyond the dashboard</div>
            <h2 className="section-title">Momentum needs<br /><i className="text-jade">an ecosystem.</i></h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-muted lg:justify-self-end">
            The right people, resources and moments matter just as much as the right data. CareerForge brings all three into your weekly rhythm.
          </p>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <Reveal delay={60}>
            <SpotlightCard className="community-board relative min-h-[480px] overflow-hidden rounded-[34px] border border-ink/[0.08] p-7 sm:p-10">
              <div className="community-grid" />
              <div className="relative z-10 max-w-lg">
                <div className="eyebrow mb-5 !text-ink"><MessageCircle size={14} /> Powered by peers</div>
                <h2 className="section-title">Progress feels better <i>together.</i></h2>
                <p className="mt-5 leading-7 text-ink/65">Ask sharper questions, share breakthroughs, find accountability and meet people building toward the same future.</p>
                <Link to="/community" className="btn-primary mt-7 group">
                  Explore the community <ArrowRight className="transition group-hover:translate-x-1" size={16} />
                </Link>
              </div>

              <div className="community-message community-message-one">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-cobalt text-[10px] font-extrabold text-white">UIU</span>
                <span><b>Mock interview circle</b><small>Starts in 18 minutes</small></span>
              </div>
              <div className="community-message community-message-two">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-jade text-[10px] font-extrabold text-white">DU</span>
                <span><b>Portfolio feedback</b><small>12 peers joined today</small></span>
              </div>
              <div className="community-signal">
                <div className="flex -space-x-2">
                  {["bg-cobalt", "bg-jade", "bg-coral", "bg-plum"].map((tone) => <span key={tone} className={`h-9 w-9 rounded-full border-2 border-white ${tone}`} />)}
                </div>
                <b className="mt-3 block text-sm">148 active now</b>
                <small className="text-muted">Your circle is growing</small>
              </div>
            </SpotlightCard>
          </Reveal>

          <div id="resources" className="grid scroll-mt-28 gap-5">
            {[
              { icon: BookOpen, tone: "bg-cobalt", label: "Curated learning vault", copy: "Resources matched to your current skill gaps.", meta: "124 learning assets", to: "/resources" },
              { icon: CalendarDays, tone: "bg-coral", label: "Career events that matter", copy: "Workshops, career fairs and live mentor sessions.", meta: "8 upcoming events", to: "/login/student" },
              { icon: GraduationCap, tone: "bg-jade", label: "Progress you can prove", copy: "Weekly insights and milestones you can carry forward.", meta: "Achievement ready", to: "/login/student" },
            ].map(({ icon: Icon, tone, label, copy, meta, to }, index) => (
              <Reveal key={label} delay={100 + index * 70}>
                <Link to={to} className="resource-card panel group flex min-h-[145px] items-center gap-5 p-6">
                  <span className={`icon-tile !h-12 !w-12 ${tone}`}><Icon size={20} /></span>
                  <span className="min-w-0 flex-1">
                    <b className="block text-base">{label}</b>
                    <span className="mt-1 block text-sm leading-5 text-muted">{copy}</span>
                    <small className="mt-3 block font-bold text-cobalt">{meta}</small>
                  </span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/[0.06] transition group-hover:translate-x-1 group-hover:bg-ink group-hover:text-white"><ArrowRight size={15} /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell pb-20">
        <Reveal className="cta-stage relative overflow-hidden rounded-[40px] bg-cobalt px-7 py-14 text-white shadow-lift sm:px-12 sm:py-20">
          <div className="cta-grid" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white/65"><WandSparkles size={15} /> Your next chapter is waiting</span>
            <h2 className="mt-5 font-display text-5xl leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">Stop planning around potential. <i>Build it.</i></h2>
            <p className="mt-6 max-w-xl leading-7 text-white/70">One profile. One clear signal. Every part of your career journey moving in the same direction.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/login/student?mode=register" className="btn-primary group !bg-white !text-ink">
                Create free account <ArrowRight className="transition group-hover:translate-x-1" size={17} />
              </Link>
              <Link to="/login/admin" className="btn-secondary !border-white/20 !bg-white/10 !text-white hover:!bg-white/20">Administrator portal</Link>
            </div>
          </div>
          <div className="cta-orbit cta-orbit-one"><Target size={20} /></div>
          <div className="cta-orbit cta-orbit-two"><BriefcaseBusiness size={20} /></div>
          <div className="cta-orbit cta-orbit-three"><Sparkles size={20} /></div>
        </Reveal>
      </section>

      <PublicFooter />
    </main>
  );
}
