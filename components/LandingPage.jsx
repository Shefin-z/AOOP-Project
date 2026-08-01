import { Link } from "../lib/router";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import AdaptiveHeroImage from "./AdaptiveHeroImage";
import { PublicFooter, PublicHeader } from "./public/PublicChrome";
import UniversityMarquee from "./public/UniversityMarquee";

const features = [
  {
    icon: Target,
    tone: "bg-cobalt text-white",
    title: "AI job matching",
    copy: "See why a role fits, which skills matter, and the smartest next step—before you apply.",
    stat: "Explainable matches",
  },
  {
    icon: BarChart3,
    tone: "bg-jade text-white",
    title: "Skill intelligence",
    copy: "Benchmark your strengths with timed assessments and get a living readiness score.",
    stat: "10 adaptive levels",
  },
  {
    icon: FileText,
    tone: "bg-coral text-white",
    title: "Career Vault",
    copy: "Turn your profile into an ATS-ready resume and tailored cover letter in minutes.",
    stat: "PDF-ready export",
  },
  {
    icon: Users,
    tone: "bg-plum text-white",
    title: "Community momentum",
    copy: "Learn from peers, share wins, discover events, and keep moving with accountability.",
    stat: "Real student network",
  },
];

const steps = [
  ["01", "Build your signal", "Add your skills, goals and experience. CareerForge turns them into a clear professional profile."],
  ["02", "Close the right gaps", "Take focused assessments and follow a learning plan built around the roles you actually want."],
  ["03", "Apply with confidence", "Match with relevant jobs, tailor your story and track every application in one place."],
];

export default function LandingPage() {
  return (
    <main className="noise min-h-screen overflow-hidden">
      <PublicHeader />

      <section className="landing-hero-section page-shell relative pb-20 pt-10 sm:pt-16 lg:pb-28 lg:pt-20">
        <div className="landing-aurora landing-aurora-coral" aria-hidden="true" />
        <div className="landing-aurora landing-aurora-cobalt" aria-hidden="true" />
        <div className="grid items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-5">
          <div className="relative z-10">
            <div className="eyebrow mb-6">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-cobalt text-white"><Sparkles size={14} /></span>
              Career clarity, engineered
            </div>
            <h1 className="display-title max-w-[700px]">
              Your ambition,
              <span className="block italic text-cobalt">made actionable.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-muted sm:text-lg">
              CareerForge connects your skills, goals and progress into one intelligent career system—so every next move feels deliberate.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/login/student?mode=register" className="btn-accent landing-primary-cta px-6">
                Start forging your path
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15"><ArrowRight size={15} /></span>
              </Link>
              <a href="#journey" className="btn-secondary px-5">
                <Play size={16} fill="currentColor" /> See how it works
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
          </div>

          <div className="landing-hero-frame relative lg:-mr-20">
            <div className="hero-stage overflow-hidden rounded-[32px] border-[7px] border-white/50 shadow-lift sm:rounded-[40px]">
              <AdaptiveHeroImage
                alt="Two students exploring their AI-guided career path together"
                className="aspect-[1.55/1] w-full lg:aspect-[1.45/1]"
                imageClassName="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      <UniversityMarquee />

      <section id="platform" className="page-shell py-20 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <div className="eyebrow mb-5"><Zap size={14} /> One connected platform</div>
            <h2 className="section-title max-w-xl">Less guessing.<br /><i className="text-coral">More becoming.</i></h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-muted lg:justify-self-end">
            Most career tools solve one isolated problem. CareerForge connects the entire journey, translating what you do today into stronger opportunities tomorrow.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, tone, title, copy, stat }, index) => (
            <article key={title} className={`landing-feature-card panel group min-h-[310px] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift ${index === 1 ? "lg:translate-y-7" : ""}`}>
              <div className="flex items-start justify-between">
                <div className={`grid h-12 w-12 place-items-center rounded-[18px] ${tone}`}><Icon size={20} /></div>
                <span className="font-display text-2xl italic text-ink/20">0{index + 1}</span>
              </div>
              <h3 className="mt-8 text-xl font-extrabold tracking-[-0.035em]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{copy}</p>
              <div className="mt-7 flex items-center justify-between border-t border-ink/[0.08] pt-4">
                <span className="text-xs font-bold text-muted">{stat}</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-ink/[0.06] transition group-hover:bg-ink group-hover:text-white"><ChevronRight size={15} /></span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="journey" className="bg-ink py-20 text-white sm:py-28">
        <div className="page-shell">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
            <div className="lg:sticky lg:top-10 lg:self-start">
              <div className="eyebrow mb-5 !text-[#9cb1ff]"><Sparkles size={14} /> Your CareerForge journey</div>
              <h2 className="section-title">A system that<br /><i className="text-[#E59779]">moves with you.</i></h2>
              <p className="mt-6 max-w-md text-sm leading-6 text-white/60">
                Start wherever you are. The platform keeps learning from every assessment, application and milestone.
              </p>
            </div>
            <div>
              {steps.map(([number, title, copy]) => (
                <article key={number} className="landing-journey-step grid gap-5 border-b border-white/10 py-8 first:pt-0 sm:grid-cols-[70px_1fr]">
                  <span className="font-display text-4xl italic text-[#E59779]">{number}</span>
                  <div>
                    <h3 className="text-2xl font-bold tracking-[-0.035em]">{title}</h3>
                    <p className="mt-3 max-w-xl leading-7 text-white/60">{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="page-shell py-20 sm:py-28">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="panel relative overflow-hidden bg-[#DED2BE] p-7 sm:p-10">
            <div className="relative z-10 max-w-lg">
              <div className="eyebrow mb-5 !text-ink"><MessageCircle size={14} /> Powered by peers</div>
              <h2 className="section-title">Progress feels better <i>together.</i></h2>
              <p className="mt-5 leading-7 text-ink/65">Ask questions, share breakthroughs, find accountability and meet people building toward the same future.</p>
              <Link to="/community" className="btn-primary mt-7">Explore the community <ArrowRight size={16} /></Link>
            </div>
            <div className="absolute -bottom-14 -right-12 h-64 w-64 rounded-full border-[45px] border-coral/70" />
            <div className="absolute -right-3 top-5 hidden h-28 w-28 rotate-12 rounded-[34px] bg-white/35 sm:grid sm:place-items-center" aria-hidden="true">
              <Users size={38} className="text-ink/45" />
            </div>
          </div>

          <div id="resources" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <Link to="/resources" className="panel landing-resource-link flex items-center gap-5 p-6">
              <span className="icon-tile !bg-cobalt"><BookOpen size={20} /></span>
              <div className="min-w-0 flex-1"><b className="block text-base">Curated learning vault</b><p className="mt-1 text-sm text-muted">Resources matched to your current skill gaps.</p></div>
              <ArrowRight className="landing-resource-arrow text-muted" size={17} />
            </Link>
            <Link to="/resources" className="panel landing-resource-link flex items-center gap-5 p-6">
              <span className="icon-tile !bg-coral"><CalendarDays size={20} /></span>
              <div className="min-w-0 flex-1"><b className="block text-base">Career events that matter</b><p className="mt-1 text-sm text-muted">Workshops, career fairs and live mentor sessions.</p></div>
              <ArrowRight className="landing-resource-arrow text-muted" size={17} />
            </Link>
            <Link to="/login/student?mode=register" className="panel landing-resource-link flex items-center gap-5 p-6">
              <span className="icon-tile !bg-jade"><BarChart3 size={20} /></span>
              <div className="min-w-0 flex-1"><b className="block text-base">Progress you can prove</b><p className="mt-1 text-sm text-muted">Weekly insights and achievement milestones.</p></div>
              <ArrowRight className="landing-resource-arrow text-muted" size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell pb-20">
        <div className="relative overflow-hidden rounded-[38px] bg-cobalt px-7 py-12 text-white shadow-lift sm:px-12 sm:py-16">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/65">Your next chapter is waiting</span>
            <h2 className="mt-4 font-display text-5xl leading-[1] tracking-[-0.05em] sm:text-6xl">Stop planning around potential. <i>Build it.</i></h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login/student?mode=register" className="btn-primary !bg-white !text-ink">Create free account <ArrowRight size={17} /></Link>
              <Link to="/login/admin" className="btn-secondary !border-white/20 !bg-white/10 !text-white hover:!bg-white/20">Administrator portal</Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-white/70">
              <span className="flex items-center gap-2"><ShieldCheck size={14} /> Verified student accounts</span>
              <span className="flex items-center gap-2"><Zap size={14} /> Personalized next steps</span>
            </div>
          </div>
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[70px] border-white/10" />
          <div className="absolute -bottom-36 right-56 h-72 w-72 rotate-12 rounded-[70px] bg-coral/85" />
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
