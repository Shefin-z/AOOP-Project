import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  Award,
  BarChart3,
  BellRing,
  BookOpen,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Flame,
  Gauge,
  Heart,
  Lightbulb,
  Link2,
  ListChecks,
  MapPin,
  Medal,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Upload,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import DashboardShell from "../DashboardShell";
import Toast from "../Toast";
import {
  achievements as seedAchievements,
  assessments,
  communityPosts as seedPosts,
  events as seedEvents,
  jobs,
  performanceSeries,
  resources,
} from "../../lib/mockData";

const navItems = [
  { id: "overview", label: "Overview", icon: Gauge, group: "Workspace" },
  { id: "jobs", label: "Recommended jobs", icon: BriefcaseBusiness, badge: "12" },
  { id: "applications", label: "My applications", icon: FileCheck2, badge: "4" },
  { id: "vault", label: "Career Vault", icon: FileText },
  { id: "assessments", label: "Skill assessments", icon: ListChecks, group: "Growth" },
  { id: "analytics", label: "Performance", icon: BarChart3 },
  { id: "learning", label: "Learning resources", icon: BookOpen },
  { id: "community", label: "Community", icon: Users, badge: "New", group: "Connect" },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "profile", label: "Profile & settings", icon: Settings, group: "Account" },
];

const pageMeta = {
  overview: ["Good afternoon, Nadia", "Here’s what is moving your career forward today."],
  jobs: ["Your best-fit opportunities", "Personalized from your skills, interests and assessment results."],
  applications: ["Application tracker", "Stay on top of every opportunity and follow-up."],
  vault: ["Career Vault", "Build, refine and export your professional story."],
  assessments: ["Skill assessments", "Measure what you know and make the next learning step obvious."],
  analytics: ["Performance intelligence", "A clear view of your skills, consistency and readiness."],
  learning: ["Learning resources", "Focused material selected for the roles you want."],
  community: ["Career community", "Learn in public, ask better questions and celebrate progress."],
  events: ["Events & workshops", "Meet recruiters, mentors and students building alongside you."],
  achievements: ["Your milestones", "Proof that consistent effort is becoming real progress."],
  profile: ["Profile & preferences", "Keep your career signal accurate and your experience personal."],
};

const applicationsSeed = [
  { company: "Pathao", role: "Product Analyst", applied: "Jul 25", status: "Interview", match: 94, tone: "bg-coral" },
  { company: "Brain Station 23", role: "Junior Frontend Engineer", applied: "Jul 22", status: "In review", match: 89, tone: "bg-cobalt" },
  { company: "bKash", role: "Data Science Intern", applied: "Jul 18", status: "Assessment", match: 86, tone: "bg-plum" },
  { company: "ShopUp", role: "UX Research Associate", applied: "Jul 12", status: "Applied", match: 81, tone: "bg-jade" },
];

const quizQuestions = [
  {
    text: "Which JavaScript method creates a new array containing elements that pass a test?",
    answers: ["map()", "filter()", "reduce()", "forEach()"],
    correct: 1,
  },
  {
    text: "What is the most useful first step when a metric suddenly changes?",
    answers: ["Publish the result", "Validate the data", "Change the target", "Ignore the outlier"],
    correct: 1,
  },
  {
    text: "Which structure is best for a behavioral interview answer?",
    answers: ["SWOT", "STAR", "AIDA", "RACE"],
    correct: 1,
  },
];

export default function StudentWorkspace() {
  const [active, setActive] = useState("overview");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [applications, setApplications] = useState(applicationsSeed);
  const [savedJobs, setSavedJobs] = useState([2]);
  const [events, setEvents] = useState(seedEvents);
  const [posts, setPosts] = useState(seedPosts);
  const [jobSearch, setJobSearch] = useState("");
  const [jobType, setJobType] = useState("All types");
  const [quiz, setQuiz] = useState({ index: 0, answers: {}, finished: false, score: 0 });

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  const pageActions = {
    jobs: (
      <button className="btn-secondary"><BellRing size={16} /> Create job alert</button>
    ),
    vault: (
      <button onClick={() => window.print()} className="btn-accent"><Download size={16} /> Export PDF</button>
    ),
    community: (
      <button onClick={() => setModal({ type: "post" })} className="btn-accent"><Plus size={16} /> New post</button>
    ),
    events: (
      <button className="btn-secondary"><CalendarDays size={16} /> Sync calendar</button>
    ),
  };

  return (
    <>
      <DashboardShell
        role="student"
        navItems={navItems}
        active={active}
        onNavigate={setActive}
        title={pageMeta[active][0]}
        subtitle={pageMeta[active][1]}
        actions={pageActions[active]}
      >
        {active === "overview" && <Overview onNavigate={setActive} onOpenJob={(job) => setModal({ type: "job", job })} />}
        {active === "jobs" && (
          <JobsPage
            search={jobSearch}
            setSearch={setJobSearch}
            type={jobType}
            setType={setJobType}
            saved={savedJobs}
            onSave={(id) => setSavedJobs((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])}
            onOpen={(job) => setModal({ type: "job", job })}
          />
        )}
        {active === "applications" && <ApplicationsPage applications={applications} notify={notify} />}
        {active === "vault" && <CareerVault notify={notify} />}
        {active === "assessments" && <AssessmentsPage onStart={(assessment) => { setQuiz({ index: 0, answers: {}, finished: false, score: 0 }); setModal({ type: "quiz", assessment }); }} />}
        {active === "analytics" && <AnalyticsPage notify={notify} />}
        {active === "learning" && <LearningPage notify={notify} />}
        {active === "community" && <CommunityPage posts={posts} setPosts={setPosts} notify={notify} onNewPost={() => setModal({ type: "post" })} />}
        {active === "events" && <EventsPage events={events} onRegister={(id) => { setEvents((current) => current.map((event) => event.id === id ? { ...event, registered: !event.registered } : event)); notify("Event registration updated."); }} />}
        {active === "achievements" && <AchievementsPage />}
        {active === "profile" && <ProfilePage notify={notify} />}
      </DashboardShell>
      <Toast message={toast} onClose={() => setToast("")} />
      {modal?.type === "job" && (
        <JobModal
          job={modal.job}
          applied={applications.some((item) => item.role === modal.job.title)}
          onClose={() => setModal(null)}
          onApply={() => {
            if (!applications.some((item) => item.role === modal.job.title)) {
              setApplications((current) => [{ company: modal.job.company, role: modal.job.title, applied: "Today", status: "Applied", match: modal.job.match, tone: modal.job.tone }, ...current]);
            }
            setModal({ type: "apply", job: modal.job });
          }}
        />
      )}
      {modal?.type === "apply" && <ApplyModal job={modal.job} onClose={() => setModal(null)} onSubmit={() => { setModal(null); notify(`Application sent to ${modal.job.company}.`); }} />}
      {modal?.type === "quiz" && (
        <QuizModal
          assessment={modal.assessment}
          quiz={quiz}
          setQuiz={setQuiz}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "post" && <PostModal onClose={() => setModal(null)} onSubmit={(text) => { setPosts((current) => [{ id: Date.now(), author: "Nadia Ahmed", role: "CSE · North South University", time: "now", initials: "NA", tone: "bg-plum", text, tags: ["Career journey"], likes: 0, comments: 0, liked: false }, ...current]); setModal(null); notify("Your post is live."); }} />}
    </>
  );
}

function Overview({ onNavigate, onOpenJob }) {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Target} label="Readiness score" value="78%" delta="+6% this month" tone="bg-cobalt" />
        <Metric icon={ListChecks} label="Assessments" value="8" delta="3 completed recently" tone="bg-jade" />
        <Metric icon={BriefcaseBusiness} label="Applications" value="4" delta="1 interview scheduled" tone="bg-coral" />
        <Metric icon={Flame} label="Learning streak" value="6 days" delta="Personal best: 11 days" tone="bg-plum" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="panel overflow-hidden p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="eyebrow"><Sparkles size={13} /> Career intelligence</span>
              <h2 className="mt-2 text-xl font-extrabold tracking-[-0.035em]">You are closer than you think.</h2>
              <p className="mt-1 text-sm text-muted">Three focused actions can move your readiness above 80%.</p>
            </div>
            <button onClick={() => onNavigate("analytics")} className="btn-ghost">View analysis <ArrowRight size={15} /></button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-[180px_1fr] md:items-center">
            <div className="relative mx-auto grid h-40 w-40 place-items-center rounded-full" style={{ background: "conic-gradient(#3155C6 0 78%, rgba(30,36,48,.08) 78% 100%)" }}>
              <div className="grid h-[124px] w-[124px] place-items-center rounded-full bg-paper text-center shadow-inner">
                <span><b className="block text-3xl tracking-[-0.05em]">78%</b><small className="text-[10px] font-bold uppercase tracking-[.12em] text-muted">Role ready</small></span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                ["Complete Data Analysis assessment", "High impact", "bg-coral", "+4%"],
                ["Add one quantified project result", "Profile", "bg-cobalt", "+2%"],
                ["Finish SQL learning module", "45 min left", "bg-jade", "+3%"],
              ].map(([title, label, tone, impact]) => (
                <div key={title} className="flex items-center gap-3 rounded-2xl border border-ink/[0.07] bg-white/55 p-3">
                  <span className={`h-9 w-1 rounded-full ${tone}`} />
                  <span className="flex-1"><b className="block text-sm">{title}</b><small className="text-muted">{label}</small></span>
                  <b className="text-xs text-jade">{impact}</b>
                  <ChevronRight size={15} className="text-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-center justify-between">
            <div><h2 className="text-lg font-extrabold tracking-[-0.03em]">Skill signal</h2><p className="text-xs text-muted">Role-weighted strength</p></div>
            <button onClick={() => onNavigate("assessments")} className="btn-ghost"><Plus size={15} /> Assess</button>
          </div>
          <div className="mt-6 space-y-5">
            {[
              ["Communication", 91, "bg-coral"],
              ["JavaScript", 82, "bg-cobalt"],
              ["SQL & data", 76, "bg-jade"],
              ["Product thinking", 68, "bg-plum"],
            ].map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-xs"><b>{label}</b><span className="font-bold text-muted">{value}%</span></div>
                <div className="progress-track"><div className={`reveal-bar h-full rounded-full ${color}`} style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-jade/10 p-4 text-xs leading-5 text-jade">
            <b className="block">Strongest signal: Communication</b>
            You score in the top 18% of students targeting analyst roles.
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <div className="panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <div><h2 className="text-lg font-extrabold tracking-[-0.03em]">Best matches for you</h2><p className="text-xs text-muted">Refreshed from your latest assessment</p></div>
            <button onClick={() => onNavigate("jobs")} className="btn-ghost">View all <ArrowRight size={15} /></button>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {jobs.slice(0, 2).map((job) => <CompactJob key={job.id} job={job} onClick={() => onOpenJob(job)} />)}
          </div>
        </div>
        <div className="panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <div><h2 className="text-lg font-extrabold tracking-[-0.03em]">Next event</h2><p className="text-xs text-muted">Sunday · Online</p></div>
            <span className="icon-tile !h-9 !w-9 !rounded-xl !bg-coral"><CalendarDays size={16} /></span>
          </div>
          <p className="text-base font-bold leading-6">Designing your first 90-day career plan</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted"><span><Clock3 className="mr-1 inline" size={13} />7:00 PM</span><span><Users className="mr-1 inline" size={13} />126 going</span></div>
          <button onClick={() => onNavigate("events")} className="btn-secondary mt-5 w-full">View event details</button>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, delta, tone }) {
  return (
    <article className="metric-card">
      <div className="flex items-start justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-2xl text-white ${tone}`}><Icon size={18} /></span>
        <MoreHorizontal size={17} className="text-muted" />
      </div>
      <b className="mt-5 block text-2xl tracking-[-0.04em]">{value}</b>
      <p className="mt-0.5 text-xs font-bold">{label}</p>
      <p className="mt-3 text-[11px] text-muted">{delta}</p>
    </article>
  );
}

function CompactJob({ job, onClick }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-3 rounded-2xl border border-ink/[0.07] bg-white/55 p-3 text-left transition hover:border-cobalt/20 hover:bg-white">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-extrabold text-white ${job.tone}`}>{job.logo}</span>
      <span className="min-w-0 flex-1"><b className="block truncate text-sm">{job.title}</b><small className="text-muted">{job.company} · {job.location.split(" · ")[0]}</small></span>
      <span className="rounded-full bg-jade/10 px-2 py-1 text-[10px] font-extrabold text-jade">{job.match}%</span>
    </button>
  );
}

function JobsPage({ search, setSearch, type, setType, saved, onSave, onOpen }) {
  const filtered = useMemo(() => jobs.filter((job) => {
    const matchesSearch = `${job.title} ${job.company} ${job.skills.join(" ")}`.toLowerCase().includes(search.toLowerCase());
    const matchesType = type === "All types" || job.type === type;
    return matchesSearch && matchesType;
  }), [search, type]);

  return (
    <div className="space-y-5">
      <section className="glass flex flex-col gap-3 rounded-[24px] p-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input bg-white/60 pl-11" placeholder="Search title, company or skill" />
        </label>
        <label className="relative sm:w-44">
          <select value={type} onChange={(e) => setType(e.target.value)} className="select bg-white/60">
            {["All types", "Full-time", "Internship", "Contract"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-muted" size={15} />
        </label>
        <button className="btn-secondary"><Filter size={16} /> More filters</button>
      </section>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted"><b className="text-ink">{filtered.length} strong matches</b> based on your profile</p>
        <button className="btn-ghost">Best match <ChevronRight size={14} className="rotate-90" /></button>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        {filtered.map((job) => (
          <article key={job.id} className="panel group p-5 transition hover:-translate-y-0.5 hover:shadow-glass">
            <div className="flex items-start gap-4">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[18px] text-base font-extrabold text-white ${job.tone}`}>{job.logo}</span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3">
                  <div><h3 className="truncate text-base font-extrabold">{job.title}</h3><p className="mt-0.5 text-xs font-semibold text-muted">{job.company}</p></div>
                  <button onClick={() => onSave(job.id)} className={`grid h-9 w-9 place-items-center rounded-xl border border-ink/[0.08] ${saved.includes(job.id) ? "bg-cobalt text-white" : "bg-white/60 text-muted"}`}><Bookmark size={16} fill={saved.includes(job.id) ? "currentColor" : "none"} /></button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted"><span><MapPin className="mr-1 inline" size={12} />{job.location}</span><span><Clock3 className="mr-1 inline" size={12} />{job.type}</span></div>
              </div>
            </div>
            <div className="my-5 border-t border-ink/[0.07]" />
            <div className="flex items-center gap-3">
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink/[0.07]"><div className="h-full rounded-full bg-jade" style={{ width: `${job.match}%` }} /></div>
              <b className="text-xs text-jade">{job.match}% match</b>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">{job.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>
            <div className="mt-5 flex items-center justify-between">
              <span><b className="block text-sm">{job.salary}</b><small className="text-[10px] text-muted">per month · {job.posted}</small></span>
              <button onClick={() => onOpen(job)} className="btn-primary min-h-10 px-4">View role <ArrowRight size={15} /></button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function ApplicationsPage({ applications, notify }) {
  const [filter, setFilter] = useState("All");
  const rows = filter === "All" ? applications : applications.filter((item) => item.status === filter);
  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["Total applications", applications.length, BriefcaseBusiness, "bg-cobalt"], ["In review", 1, Eye, "bg-plum"], ["Next stage", 2, ListChecks, "bg-coral"], ["Interview rate", "25%", Target, "bg-jade"]].map(([label, value, Icon, tone]) => <Metric key={label} icon={Icon} label={label} value={value} delta="Updated today" tone={tone} />)}
      </section>
      <section className="panel p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {["All", "Applied", "In review", "Assessment", "Interview"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`min-h-9 rounded-xl px-3 text-xs font-bold ${filter === item ? "bg-ink text-white" : "bg-white/60 text-muted"}`}>{item}</button>)}
          </div>
          <button onClick={() => notify("Application report downloaded.")} className="btn-secondary min-h-10"><ArrowDownToLine size={15} /> Export</button>
        </div>
        <div className="table-shell overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-ink/[0.07] bg-ink/[0.035] text-[10px] uppercase tracking-[.1em] text-muted">
              <tr>{["Company & role", "Applied", "Match", "Status", "Next action", ""].map((item) => <th key={item} className="px-4 py-3 font-extrabold">{item}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {rows.map((item) => (
                <tr key={item.role} className="hover:bg-white/60">
                  <td className="px-4 py-4"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-bold text-white ${item.tone}`}>{item.company[0]}</span><span><b className="block text-xs">{item.role}</b><small className="text-muted">{item.company}</small></span></div></td>
                  <td className="px-4 py-4 text-xs text-muted">{item.applied}</td>
                  <td className="px-4 py-4"><b className="text-xs text-jade">{item.match}%</b></td>
                  <td className="px-4 py-4"><Status value={item.status} /></td>
                  <td className="px-4 py-4 text-xs font-semibold">{item.status === "Interview" ? "Aug 2 · 11:00 AM" : item.status === "Assessment" ? "Due in 2 days" : "Monitor response"}</td>
                  <td className="px-4 py-4"><button className="btn-ghost min-h-8"><MoreHorizontal size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Status({ value }) {
  const styles = {
    Interview: "bg-jade/12 text-jade",
    Assessment: "bg-coral/12 text-coral",
    "In review": "bg-plum/12 text-plum",
    Applied: "bg-cobalt/10 text-cobalt",
  };
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${styles[value] || "bg-ink/10 text-muted"}`}>{value}</span>;
}

function CareerVault({ notify }) {
  const [data, setData] = useState({
    name: "Nadia Ahmed",
    title: "Aspiring Product & Data Analyst",
    email: "nadia.ahmed@email.com",
    phone: "+880 17 0000 0000",
    summary: "Analytical CSE student with hands-on product research, SQL and frontend experience. Motivated by turning complex user needs into clear product decisions.",
    skills: "SQL, JavaScript, React, Product Analytics, User Research",
  });
  const update = (key, value) => setData((current) => ({ ...current, [key]: value }));
  return (
    <div className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
      <section className="panel h-fit p-5">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Resume details</h2><p className="text-xs text-muted">Changes update the preview instantly.</p></div><span className="tag text-jade"><Check size={12} /> Saved</span></div>
        <div className="space-y-4">
          {[["Full name", "name"], ["Professional title", "title"], ["Email", "email"], ["Phone", "phone"]].map(([label, key]) => (
            <label key={key} className="block"><span className="mb-1.5 block text-xs font-bold">{label}</span><input className="input" value={data[key]} onChange={(e) => update(key, e.target.value)} /></label>
          ))}
          <label className="block"><span className="mb-1.5 block text-xs font-bold">Professional summary</span><textarea className="input min-h-28 resize-none py-3" value={data.summary} onChange={(e) => update("summary", e.target.value)} /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold">Core skills</span><textarea className="input min-h-20 resize-none py-3" value={data.skills} onChange={(e) => update("skills", e.target.value)} /></label>
          <button onClick={() => notify("AI strengthened your summary and added role keywords.")} className="btn-secondary w-full text-cobalt"><Sparkles size={16} /> Improve with AI</button>
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold text-muted">LIVE PREVIEW · MODERN EDITORIAL</span><button onClick={() => notify("Resume version duplicated.")} className="btn-ghost"><Plus size={15} /> New version</button></div>
        <article id="resume-print" className="min-h-[840px] overflow-hidden rounded-[8px] bg-white p-8 shadow-lift sm:p-12">
          <header className="border-b-2 border-ink pb-7">
            <div className="flex items-start justify-between gap-5">
              <div><h1 className="font-display text-4xl tracking-[-0.04em]">{data.name}</h1><p className="mt-2 text-sm font-bold uppercase tracking-[.12em] text-cobalt">{data.title}</p></div>
              <span className="grid h-14 w-14 place-items-center rounded-full bg-coral text-sm font-extrabold text-white">NA</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-[11px] font-semibold text-muted"><span>{data.email}</span><span>{data.phone}</span><span>Dhaka, Bangladesh</span></div>
          </header>
          <div className="grid gap-8 pt-7 sm:grid-cols-[.35fr_.65fr]">
            <aside className="space-y-8">
              <ResumeBlock title="Expertise"><div className="flex flex-wrap gap-2">{data.skills.split(",").map((skill) => <span className="rounded-md bg-canvas px-2 py-1 text-[10px] font-bold" key={skill}>{skill.trim()}</span>)}</div></ResumeBlock>
              <ResumeBlock title="Education"><b className="text-xs">BSc in Computer Science</b><p className="mt-1 text-[11px] leading-5 text-muted">North South University<br />2023 — 2027</p></ResumeBlock>
              <ResumeBlock title="Languages"><p className="text-[11px] leading-5"><b>Bangla</b> · Native<br /><b>English</b> · Professional</p></ResumeBlock>
            </aside>
            <div className="space-y-8">
              <ResumeBlock title="Profile"><p className="text-[11px] leading-5 text-muted">{data.summary}</p></ResumeBlock>
              <ResumeBlock title="Experience">
                <ResumeEntry title="Product Research Intern" place="LaunchPad Labs · Dhaka" date="Jan — Jun 2026" points={["Analyzed 1,200+ feedback records to identify three high-impact onboarding improvements.", "Built a SQL reporting view that reduced weekly reporting time by 35%."]} />
                <ResumeEntry title="Student Project Lead" place="Campus Connect" date="Aug — Dec 2025" points={["Led a four-person team to prototype and test a peer mentorship platform.", "Translated 18 user interviews into a prioritized product roadmap."]} />
              </ResumeBlock>
              <ResumeBlock title="Selected project"><ResumeEntry title="Career outcome dashboard" place="Personal project" date="2026" points={["Designed a React dashboard to surface graduate employment trends from 6,000+ records."]} /></ResumeBlock>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function ResumeBlock({ title, children }) {
  return <section><h3 className="mb-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-coral">{title}</h3>{children}</section>;
}

function ResumeEntry({ title, place, date, points }) {
  return <div className="mb-5 last:mb-0"><div className="flex justify-between gap-4"><div><b className="block text-xs">{title}</b><small className="text-[10px] text-muted">{place}</small></div><small className="shrink-0 text-[9px] font-bold text-muted">{date}</small></div><ul className="mt-2 space-y-1.5">{points.map((point) => <li className="flex gap-2 text-[10px] leading-4 text-muted" key={point}><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cobalt" />{point}</li>)}</ul></div>;
}

function AssessmentsPage({ onStart }) {
  const [category, setCategory] = useState("All");
  const list = category === "All" ? assessments : assessments.filter((item) => item.category === category);
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel col-span-2 overflow-hidden bg-ink p-6 text-white md:col-span-2">
          <div className="flex items-start justify-between gap-5">
            <div><span className="eyebrow !text-[#AFC0FF]"><Sparkles size={13} /> Recommended next</span><h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em]">Data Analysis Essentials</h2><p className="mt-2 max-w-md text-sm leading-6 text-white/60">This assessment unlocks more analyst roles and can add up to 4% to your readiness score.</p><button onClick={() => onStart(assessments[1])} className="btn-accent mt-5 !bg-white !text-ink">Start 15-minute assessment <ArrowRight size={16} /></button></div>
            <span className="hidden h-28 w-28 shrink-0 place-items-center rounded-full border-[18px] border-jade text-center sm:grid"><b className="text-2xl">+4%</b></span>
          </div>
        </div>
        <div className="panel p-6"><span className="icon-tile !bg-coral"><Award size={20} /></span><b className="mt-5 block text-3xl tracking-[-0.05em]">83%</b><p className="text-xs font-bold">Average score</p><p className="mt-3 text-[11px] text-muted">Top 22% of your peer group</p></div>
      </section>
      <div className="flex flex-wrap gap-2">
        {["All", "Development", "Analytics", "Soft Skills", "Business", "Design"].map((item) => <button key={item} onClick={() => setCategory(item)} className={`min-h-9 rounded-xl px-3 text-xs font-bold transition ${category === item ? "bg-ink text-white" : "border border-ink/[0.07] bg-white/60 text-muted"}`}>{item}</button>)}
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((assessment) => {
          const colors = { cobalt: "bg-cobalt", jade: "bg-jade", coral: "bg-coral", plum: "bg-plum", ink: "bg-ink", sand: "bg-[#A57945]" };
          return (
            <article key={assessment.id} className="panel p-5">
              <div className="flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-2xl text-white ${colors[assessment.color]}`}><Code2 size={19} /></span>{assessment.score ? <span className="tag !text-jade"><CheckCircle2 size={12} /> {assessment.score}%</span> : <span className="tag">{assessment.level}</span>}</div>
              <h3 className="mt-6 text-base font-extrabold">{assessment.title}</h3><p className="mt-1 text-xs text-muted">{assessment.category}</p>
              <div className="mt-4 flex gap-4 text-[11px] text-muted"><span><CircleHelp className="mr-1 inline" size={12} />{assessment.questions} questions</span><span><Clock3 className="mr-1 inline" size={12} />{assessment.minutes} min</span></div>
              <button onClick={() => onStart(assessment)} className={`mt-5 w-full ${assessment.score ? "btn-secondary" : "btn-primary"}`}>{assessment.score ? "Retake assessment" : "Start assessment"} <ArrowRight size={15} /></button>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function AnalyticsPage({ notify }) {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Activity} label="Learning hours" value="14.8h" delta="+2.4h vs last week" tone="bg-cobalt" />
        <Metric icon={ListChecks} label="Quiz accuracy" value="83%" delta="+5% this month" tone="bg-jade" />
        <Metric icon={Target} label="Career readiness" value="78%" delta="Target: 85%" tone="bg-coral" />
        <Metric icon={Flame} label="Weekly streak" value="6/7" delta="One day to a full week" tone="bg-plum" />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-extrabold">Readiness trend</h2><p className="text-xs text-muted">Seven-week progress toward Product Analyst</p></div><select className="select min-h-9 w-32 py-0 text-xs"><option>7 weeks</option><option>3 months</option></select></div>
          <MiniLineChart />
        </div>
        <div className="panel p-6">
          <h2 className="text-lg font-extrabold">Skill balance</h2><p className="text-xs text-muted">Targeted against your top role</p>
          <div className="mt-6 space-y-4">{[["Communication", 91, 80, "bg-coral"], ["Technical fluency", 79, 84, "bg-cobalt"], ["Analysis", 76, 88, "bg-jade"], ["Business context", 68, 76, "bg-plum"]].map(([label, value, target, tone]) => <div key={label}><div className="mb-1.5 flex justify-between text-[11px]"><b>{label}</b><span className="text-muted">{value}% / {target}% target</span></div><div className="progress-track relative"><div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} /><span className="absolute inset-y-[-2px] w-0.5 bg-ink" style={{ left: `${target}%` }} /></div></div>)}</div>
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <div className="panel p-6"><h2 className="text-lg font-extrabold">Weekly consistency</h2><p className="text-xs text-muted">Learning and platform activity</p><div className="mt-8 flex h-40 items-end justify-between gap-2">{[35, 62, 48, 85, 72, 94, 20].map((value, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><div className={`w-full max-w-8 rounded-t-lg ${index === 5 ? "bg-coral" : "bg-cobalt/80"}`} style={{ height: `${value}%` }} /><span className="text-[10px] font-bold text-muted">{["M", "T", "W", "T", "F", "S", "S"][index]}</span></div>)}</div></div>
        <div className="panel p-6"><div className="flex justify-between"><div><h2 className="text-lg font-extrabold">Weekly performance report</h2><p className="text-xs text-muted">Jul 21 — Jul 27</p></div><button onClick={() => notify("Weekly report downloaded.")} className="btn-secondary min-h-9"><Download size={14} /> PDF</button></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{[["Biggest win", "SQL score improved by 11 points", "bg-jade/10 text-jade"], ["Focus next", "Complete one analytics project", "bg-coral/10 text-coral"], ["Momentum", "6-day learning streak", "bg-cobalt/10 text-cobalt"]].map(([title, copy, tone]) => <div className={`rounded-2xl p-4 ${tone}`} key={title}><b className="text-xs">{title}</b><p className="mt-2 text-xs leading-5">{copy}</p></div>)}</div><div className="mt-5 flex items-center gap-3 rounded-2xl border border-ink/[0.07] bg-white/55 p-4"><Lightbulb className="text-coral" size={20} /><p className="text-xs leading-5 text-muted"><b className="text-ink">AI insight:</b> Your assessment scores improve most when you complete a related learning module within three days.</p></div></div>
      </section>
    </div>
  );
}

function MiniLineChart() {
  const points = performanceSeries.map((item, index) => `${index * 100 / (performanceSeries.length - 1)},${100 - item.value}`).join(" ");
  return (
    <div className="mt-7">
      <svg viewBox="0 0 100 60" className="h-56 w-full overflow-visible" preserveAspectRatio="none" aria-label="Readiness chart">
        {[15, 30, 45].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(30,36,48,.08)" strokeWidth=".35" />)}
        <polyline points={points} fill="none" stroke="#3155C6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {performanceSeries.map((item, index) => <circle key={item.label} cx={index * 100 / (performanceSeries.length - 1)} cy={100 - item.value} r="1.7" fill="#FBF9F4" stroke="#3155C6" strokeWidth=".8" vectorEffect="non-scaling-stroke" />)}
      </svg>
      <div className="flex justify-between">{performanceSeries.map((item) => <span className="text-[10px] font-bold text-muted" key={item.label}>{item.label}</span>)}</div>
    </div>
  );
}

function LearningPage({ notify }) {
  const [category, setCategory] = useState("All resources");
  const filtered = category === "All resources" ? resources : resources.filter((item) => item.category.includes(category));
  return (
    <div className="space-y-5">
      <section className="panel grid overflow-hidden md:grid-cols-[1fr_.6fr]">
        <div className="p-6 sm:p-8"><span className="eyebrow"><Sparkles size={13} /> Personalized next step</span><h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em]">Finish SQL for Product Decisions</h2><p className="mt-2 max-w-lg text-sm leading-6 text-muted">Completing this course supports three of your top five job matches and closes your biggest analytics gap.</p><div className="mt-5 flex items-center gap-4"><button onClick={() => notify("Course resumed at lesson 7.")} className="btn-accent"><Play size={15} fill="currentColor" /> Continue learning</button><span className="text-xs font-bold text-muted">32 min left</span></div></div>
        <div className="relative hidden place-items-center bg-[#DED2BE] md:grid"><div className="grid h-36 w-36 place-items-center rounded-full border-[20px] border-cobalt bg-white/50"><span className="text-center"><b className="block text-2xl">68%</b><small className="text-[10px] font-bold text-muted">complete</small></span></div></div>
      </section>
      <div className="flex flex-wrap gap-2">{["All resources", "Career Toolkit", "Data & Analytics", "Development", "Communication"].map((item) => <button key={item} onClick={() => setCategory(item)} className={`min-h-9 rounded-xl px-3 text-xs font-bold ${category === item ? "bg-ink text-white" : "bg-white/60 text-muted"}`}>{item}</button>)}</div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((resource) => (
          <article className="panel overflow-hidden" key={resource.id}>
            <div className={`flex h-32 items-end justify-between p-5 text-white ${resource.tone}`}><span className="font-display text-4xl italic">{resource.icon}</span><button className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur-md"><Bookmark size={16} /></button></div>
            <div className="p-5"><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-coral">{resource.category}</p><h3 className="mt-2 text-base font-extrabold">{resource.title}</h3><div className="mt-3 flex gap-3 text-[11px] text-muted"><span>{resource.level}</span><span>·</span><span>{resource.time}</span></div>{resource.progress > 0 && <div className="mt-4"><div className="mb-1.5 flex justify-between text-[10px] font-bold text-muted"><span>Progress</span><span>{resource.progress}%</span></div><div className="progress-track"><div className="h-full rounded-full bg-jade" style={{ width: `${resource.progress}%` }} /></div></div>}<button onClick={() => notify(resource.category.includes("PDF") ? "Resource downloaded." : "Learning resource opened.")} className="btn-secondary mt-5 w-full">{resource.category.includes("PDF") ? <><Download size={15} /> Download resource</> : <><Play size={15} /> {resource.progress ? "Continue" : "Start learning"}</>}</button></div>
          </article>
        ))}
      </section>
    </div>
  );
}

function CommunityPage({ posts, setPosts, notify, onNewPost }) {
  const toggleLike = (id) => setPosts((current) => current.map((post) => post.id === id ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post));
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
      <section className="space-y-4">
        <button onClick={onNewPost} className="panel flex w-full items-center gap-3 p-4 text-left"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-plum text-xs font-extrabold text-white">NA</span><span className="input flex min-h-10 items-center text-muted">Share a question, insight or win...</span><span className="btn-accent min-h-10 px-4"><Send size={15} /></span></button>
        {posts.map((post) => (
          <article className="panel p-5" key={post.id}>
            <header className="flex items-start gap-3"><span className={`grid h-11 w-11 place-items-center rounded-2xl text-xs font-extrabold text-white ${post.tone}`}>{post.initials}</span><div className="flex-1"><b className="block text-sm">{post.author}</b><small className="text-[11px] text-muted">{post.role} · {post.time}</small></div><button className="btn-ghost min-h-8"><MoreHorizontal size={16} /></button></header>
            <p className="mt-5 text-sm leading-7 text-ink/80">{post.text}</p>
            <div className="mt-4 flex flex-wrap gap-2">{post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
            <footer className="mt-5 flex items-center gap-2 border-t border-ink/[0.07] pt-4">
              <button onClick={() => toggleLike(post.id)} className={`btn-ghost min-h-9 ${post.liked ? "!bg-coral/10 !text-coral" : ""}`}><Heart size={15} fill={post.liked ? "currentColor" : "none"} /> {post.likes}</button>
              <button onClick={() => notify("Comment thread opened.")} className="btn-ghost min-h-9"><MessageCircle size={15} /> {post.comments}</button>
              <button onClick={() => notify("Post link copied.")} className="btn-ghost ml-auto min-h-9"><Share2 size={15} /> Share</button>
            </footer>
          </article>
        ))}
      </section>
      <aside className="space-y-5">
        <div className="panel p-5"><div className="flex items-center justify-between"><h2 className="font-extrabold">Trending circles</h2><Users size={17} className="text-muted" /></div><div className="mt-4 space-y-3">{[["Data Career Circle", "1.2k members", "bg-cobalt"], ["Fresh Graduate Network", "884 members", "bg-coral"], ["Women in Product BD", "620 members", "bg-jade"]].map(([name, count, tone]) => <div className="flex items-center gap-3" key={name}><span className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-bold text-white ${tone}`}>{name[0]}</span><span className="flex-1"><b className="block text-xs">{name}</b><small className="text-[10px] text-muted">{count}</small></span><button className="text-xs font-bold text-cobalt">Join</button></div>)}</div></div>
        <div className="overflow-hidden rounded-[28px] bg-cobalt p-6 text-white"><Sparkles size={20} /><h2 className="mt-5 text-xl font-extrabold">Community challenge</h2><p className="mt-2 text-sm leading-6 text-white/65">Share one lesson from your latest assessment by Friday.</p><div className="mt-5 flex items-center justify-between text-xs"><b>84 joined</b><ArrowRight size={16} /></div></div>
      </aside>
    </div>
  );
}

function EventsPage({ events, onRegister }) {
  const [view, setView] = useState("list");
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><div className="flex rounded-xl bg-ink/[0.05] p-1">{["list", "calendar"].map((item) => <button onClick={() => setView(item)} key={item} className={`min-h-9 rounded-lg px-3 text-xs font-bold capitalize ${view === item ? "bg-white shadow-sm" : "text-muted"}`}>{item}</button>)}</div><p className="text-xs font-semibold text-muted">August 2026</p></div>
      {view === "list" ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {events.map((event) => <article className="panel flex gap-4 p-5" key={event.id}><div className="grid h-16 w-16 shrink-0 place-items-center rounded-[20px] bg-ink text-center text-white"><span><b className="block text-xl leading-none">{event.day}</b><small className="text-[9px] font-bold text-white/60">{event.month}</small></span></div><div className="min-w-0 flex-1"><span className="tag mb-2">{event.type}</span><h3 className="text-sm font-extrabold leading-5">{event.title}</h3><p className="mt-2 text-[11px] text-muted"><Clock3 className="mr-1 inline" size={12} />{event.time} · {event.host}</p><button onClick={() => onRegister(event.id)} className={`mt-4 min-h-9 ${event.registered ? "btn-secondary !text-jade" : "btn-primary"}`}>{event.registered ? <><Check size={14} /> Registered</> : "Reserve a seat"}</button></div></article>)}
        </section>
      ) : <Calendar events={events} />}
    </div>
  );
}

function Calendar({ events }) {
  return <section className="panel overflow-hidden p-5"><div className="mb-5 flex items-center justify-between"><button className="btn-ghost"><ChevronLeft size={16} /></button><h2 className="font-extrabold">August 2026</h2><button className="btn-ghost"><ChevronRight size={16} /></button></div><div className="calendar-grid border-l border-t border-ink/[0.07]">{["SUN","MON","TUE","WED","THU","FRI","SAT"].map((day) => <div key={day} className="border-b border-r border-ink/[0.07] p-2 text-center text-[9px] font-extrabold text-muted">{day}</div>)}{Array.from({ length: 35 }, (_, i) => i - 1).map((day, index) => <div key={index} className="relative min-h-20 border-b border-r border-ink/[0.07] p-2 text-xs font-semibold text-muted">{day > 0 && day <= 31 ? day : ""}{events.some((e) => Number(e.day) === day) && <span className="absolute bottom-2 left-2 right-2 rounded-lg bg-cobalt px-1.5 py-1 text-[8px] font-bold text-white">Career event</span>}</div>)}</div></section>;
}

function AchievementsPage() {
  const iconMap = { user: UserRound, zap: Zap, message: MessageCircle, target: Target, briefcase: BriefcaseBusiness, book: BookOpen };
  return (
    <div className="space-y-5">
      <section className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
        <div className="panel flex items-center gap-5 p-6"><div className="grid h-28 w-28 shrink-0 place-items-center rounded-full bg-coral text-white shadow-lg"><span className="text-center"><Medal className="mx-auto" size={30} /><b className="mt-1 block text-xl">560</b><small className="text-[9px] font-bold">XP</small></span></div><div><span className="eyebrow">Level 6</span><h2 className="mt-2 text-xl font-extrabold">Career Builder</h2><p className="mt-2 text-xs leading-5 text-muted">140 XP until Level 7</p><div className="progress-track mt-3 w-full"><div className="h-full w-[72%] rounded-full bg-coral" /></div></div></div>
        <div className="rounded-[28px] bg-ink p-6 text-white"><div className="flex items-start justify-between"><div><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#AFC0FF]">Next milestone</span><h2 className="mt-2 text-2xl font-extrabold">Interview Ready</h2><p className="mt-2 text-sm text-white/60">Reach an 80% readiness score to unlock.</p></div><Target className="text-coral" size={34} /></div><div className="mt-6 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[96%] rounded-full bg-coral" /></div><b className="text-xs">78 / 80</b></div></div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {seedAchievements.map((item) => { const Icon = iconMap[item.icon]; return <article className={`panel p-5 ${!item.unlocked ? "opacity-70" : ""}`} key={item.title}><div className="flex items-start justify-between"><span className={`grid h-14 w-14 place-items-center rounded-[20px] ${item.unlocked ? "bg-jade text-white shadow-lg" : "bg-ink/[0.07] text-muted"}`}><Icon size={23} /></span>{item.unlocked ? <span className="tag !text-jade"><Check size={12} /> Unlocked</span> : <ShieldCheck size={17} className="text-muted" />}</div><h3 className="mt-5 text-base font-extrabold">{item.title}</h3><p className="mt-1 text-xs leading-5 text-muted">{item.description}</p>{item.unlocked ? <p className="mt-5 text-[10px] font-bold text-muted">Earned {item.date}</p> : <div className="mt-5"><div className="mb-1 flex justify-between text-[10px] font-bold text-muted"><span>Progress</span><span>{item.progress}%</span></div><div className="progress-track"><div className="h-full rounded-full bg-cobalt" style={{ width: `${item.progress}%` }} /></div></div>}</article>; })}
      </section>
    </div>
  );
}

function ProfilePage({ notify }) {
  const [avatar, setAvatar] = useState(null);
  const [form, setForm] = useState({ name: "Nadia Ahmed", university: "North South University", degree: "BSc in Computer Science", graduation: "2027", target: "Product Analyst", location: "Dhaka, Bangladesh" });
  return (
    <div className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
      <aside className="space-y-5">
        <div className="panel p-6 text-center"><label className="group relative mx-auto block h-28 w-28 cursor-pointer overflow-hidden rounded-[32px] bg-cobalt text-white shadow-lift">{avatar ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-3xl font-extrabold">NA</span>}<span className="absolute inset-0 grid place-items-center bg-ink/50 opacity-0 transition group-hover:opacity-100"><Camera size={22} /></span><input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setAvatar(URL.createObjectURL(file)); }} /></label><h2 className="mt-4 text-xl font-extrabold">{form.name}</h2><p className="mt-1 text-xs text-muted">{form.degree}</p><span className="tag mt-4 !text-jade"><CheckCircle2 size={12} /> 92% profile complete</span></div>
        <div className="panel p-5"><h3 className="text-sm font-extrabold">Visibility</h3><div className="mt-4 space-y-3">{[["Open to opportunities", true], ["Show profile in community", true], ["Weekly progress email", false]].map(([label, enabled]) => <label key={label} className="flex items-center justify-between text-xs font-semibold"><span>{label}</span><input type="checkbox" defaultChecked={enabled} className="h-4 w-4 accent-cobalt" /></label>)}</div></div>
      </aside>
      <section className="panel p-6">
        <div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Personal & career details</h2><p className="text-xs text-muted">Used to personalize recommendations.</p></div><Pencil size={17} className="text-muted" /></div>
        <div className="grid gap-4 sm:grid-cols-2">{[["Full name", "name"], ["University", "university"], ["Degree", "degree"], ["Graduation year", "graduation"], ["Target role", "target"], ["Location", "location"]].map(([label, key]) => <label key={key} className="block"><span className="mb-1.5 block text-xs font-bold">{label}</span><input value={form[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} className="input" /></label>)}</div>
        <div className="mt-6"><span className="mb-2 block text-xs font-bold">Career interests</span><div className="flex flex-wrap gap-2">{["Product", "Data & Analytics", "Technology", "Research"].map((item) => <span className="tag !bg-cobalt/10 !text-cobalt" key={item}>{item}<X size={11} /></span>)}<button className="tag"><Plus size={11} /> Add</button></div></div>
        <div className="mt-8 flex justify-end"><button onClick={() => notify("Profile changes saved.")} className="btn-accent"><Check size={16} /> Save changes</button></div>
      </section>
    </div>
  );
}

function JobModal({ job, applied, onClose, onApply }) {
  return (
    <div className="modal-backdrop" onClick={onClose}><div className="modal-card" onClick={(e) => e.stopPropagation()}><div className="flex items-start gap-4"><span className={`grid h-14 w-14 shrink-0 place-items-center rounded-[20px] text-lg font-extrabold text-white ${job.tone}`}>{job.logo}</span><div className="flex-1"><h2 className="text-xl font-extrabold">{job.title}</h2><p className="mt-1 text-sm text-muted">{job.company} · {job.location}</p></div><button onClick={onClose} className="btn-ghost min-h-9"><X size={18} /></button></div><div className="mt-6 flex flex-wrap gap-2"><span className="tag !bg-jade/10 !text-jade"><Sparkles size={12} /> {job.match}% match</span><span className="tag">{job.type}</span><span className="tag">{job.salary}</span><span className="tag"><Star size={11} fill="currentColor" className="text-coral" /> {job.review} employee rating</span></div><div className="my-6 h-px bg-ink/[0.08]" /><h3 className="text-sm font-extrabold">About the opportunity</h3><p className="mt-2 text-sm leading-7 text-muted">{job.description}</p><h3 className="mt-6 text-sm font-extrabold">Why you match</h3><div className="mt-3 grid gap-2 sm:grid-cols-3">{job.skills.map((skill) => <div className="rounded-2xl bg-jade/10 p-3 text-xs font-bold text-jade" key={skill}><Check size={14} className="mb-2" />{skill}</div>)}</div><div className="mt-7 flex flex-wrap justify-end gap-3"><button className="btn-secondary"><Bookmark size={16} /> Save role</button><button onClick={onApply} className="btn-accent">{applied ? "Application sent" : "Apply with CareerForge"} <ArrowRight size={16} /></button></div></div></div>
  );
}

function ApplyModal({ job, onClose, onSubmit }) {
  const [coverLetter, setCoverLetter] = useState("");
  const generate = () => setCoverLetter(`Dear ${job.company} Hiring Team,

I am excited to apply for the ${job.title} role. My background in product analysis, SQL and user-centered problem solving aligns strongly with the opportunity. In my recent work, I translated over 1,200 feedback records into actionable product recommendations and built reporting workflows that reduced manual analysis time.

I would welcome the opportunity to bring this analytical, collaborative approach to ${job.company}.`);
  return (
    <div className="modal-backdrop" onClick={onClose}><div className="modal-card" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><div><span className="eyebrow"><Sparkles size={13} /> Smart application</span><h2 className="mt-2 text-xl font-extrabold">{job.title} · {job.company}</h2></div><button onClick={onClose} className="btn-ghost"><X size={18} /></button></div><div className="mt-6 space-y-4"><div className="rounded-2xl border border-ink/[0.08] bg-white/55 p-4"><div className="flex items-center justify-between"><span><b className="block text-sm">Nadia_Ahmed_Resume.pdf</b><small className="text-muted">Career Vault · Updated today</small></span><span className="tag !text-jade"><Check size={12} /> Selected</span></div></div><label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/20 bg-white/35 p-5 text-xs font-bold text-muted hover:bg-white/60"><Upload size={17} /> Upload a different resume<input className="hidden" type="file" accept=".pdf,.doc,.docx" /></label><div><div className="mb-2 flex items-center justify-between"><b className="text-xs">Cover letter</b><button onClick={generate} className="text-xs font-bold text-cobalt"><Sparkles size={13} className="mr-1 inline" />Generate with AI</button></div><textarea className="input min-h-40 resize-none py-3" value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} placeholder="Write your note or generate a tailored draft..." /></div></div><div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="btn-secondary">Save draft</button><button onClick={onSubmit} className="btn-accent">Submit application <Send size={15} /></button></div></div></div>
  );
}

function QuizModal({ assessment, quiz, setQuiz, onClose }) {
  const question = quizQuestions[quiz.index];
  const select = (answer) => setQuiz((current) => ({ ...current, answers: { ...current.answers, [current.index]: answer } }));
  const finish = () => {
    const correct = quizQuestions.filter((q, index) => quiz.answers[index] === q.correct).length;
    setQuiz((current) => ({ ...current, finished: true, score: Math.round(correct / quizQuestions.length * 100) }));
  };
  return <div className="modal-backdrop"><div className="modal-card max-w-3xl">{quiz.finished ? <div className="py-6 text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-jade text-white shadow-lift"><Trophy size={32} /></span><span className="eyebrow mt-6">Assessment complete</span><h2 className="mt-2 font-display text-5xl">{quiz.score}%</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Great work. Your result has been added to your skill profile and job recommendations have been refreshed.</p><div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3"><div className="rounded-2xl bg-jade/10 p-4"><b className="text-lg text-jade">{quizQuestions.filter((q, i) => quiz.answers[i] === q.correct).length}/{quizQuestions.length}</b><small className="block text-muted">Correct</small></div><div className="rounded-2xl bg-cobalt/10 p-4"><b className="text-lg text-cobalt">+2%</b><small className="block text-muted">Readiness</small></div></div><button onClick={onClose} className="btn-accent mt-7">Return to assessments</button></div> : <><div className="flex items-center justify-between"><div><span className="eyebrow">{assessment.category}</span><h2 className="mt-1 text-lg font-extrabold">{assessment.title}</h2></div><div className="flex items-center gap-2 rounded-xl bg-coral/10 px-3 py-2 text-xs font-bold text-coral"><Clock3 size={15} /> 14:32</div></div><div className="mt-6 flex gap-1.5">{quizQuestions.map((_, index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= quiz.index ? "bg-cobalt" : "bg-ink/[0.08]"}`} />)}</div><p className="mt-8 text-xs font-bold text-muted">QUESTION {quiz.index + 1} OF {quizQuestions.length}</p><h3 className="mt-3 text-xl font-extrabold leading-7">{question.text}</h3><div className="mt-6 grid gap-3">{question.answers.map((answer, index) => <button onClick={() => select(index)} key={answer} className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-semibold transition ${quiz.answers[quiz.index] === index ? "border-cobalt bg-cobalt/10 text-cobalt" : "border-ink/[0.08] bg-white/55 hover:bg-white"}`}><span className={`grid h-7 w-7 place-items-center rounded-lg text-xs ${quiz.answers[quiz.index] === index ? "bg-cobalt text-white" : "bg-ink/[0.06] text-muted"}`}>{String.fromCharCode(65 + index)}</span>{answer}</button>)}</div><div className="mt-7 flex items-center justify-between"><button disabled={quiz.index === 0} onClick={() => setQuiz((current) => ({ ...current, index: current.index - 1 }))} className="btn-secondary disabled:opacity-40"><ChevronLeft size={15} /> Back</button>{quiz.index === quizQuestions.length - 1 ? <button disabled={quiz.answers[quiz.index] === undefined} onClick={finish} className="btn-accent disabled:opacity-40">Submit answers <Check size={15} /></button> : <button disabled={quiz.answers[quiz.index] === undefined} onClick={() => setQuiz((current) => ({ ...current, index: current.index + 1 }))} className="btn-primary disabled:opacity-40">Next question <ChevronRight size={15} /></button>}</div></>}</div></div>;
}

function PostModal({ onClose, onSubmit }) {
  const [text, setText] = useState("");
  return <div className="modal-backdrop" onClick={onClose}><div className="modal-card max-w-xl" onClick={(e) => e.stopPropagation()}><div className="flex justify-between"><div><span className="eyebrow"><Users size={13} /> Career community</span><h2 className="mt-2 text-xl font-extrabold">Share with the community</h2></div><button onClick={onClose} className="btn-ghost"><X size={18} /></button></div><div className="mt-6 flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-plum text-xs font-bold text-white">NA</span><textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} className="input min-h-40 resize-none py-3" placeholder="What are you learning, building or wondering?" /></div><div className="mt-4 flex flex-wrap gap-2"><button className="tag"><Link2 size={12} /> Add link</button><button className="tag"><Target size={12} /> Add topic</button><button className="tag"><Upload size={12} /> Add image</button></div><div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="btn-secondary">Cancel</button><button disabled={!text.trim()} onClick={() => onSubmit(text)} className="btn-accent disabled:opacity-40">Publish post <Send size={15} /></button></div></div></div>;
}
