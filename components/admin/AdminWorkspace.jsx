"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Database,
  Download,
  Eye,
  FileCheck2,
  FileQuestion,
  FileText,
  Filter,
  Flag,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
  X,
  Zap,
} from "lucide-react";
import DashboardShell from "../DashboardShell";
import Toast from "../Toast";
import { assessments, events as seedEvents, jobs as seedJobs, resources as seedResources } from "../../lib/mockData";

const navItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, group: "Command center" },
  { id: "users", label: "User management", icon: Users, badge: "2,846" },
  { id: "assessments", label: "Assessments", icon: FileCheck2, group: "Content" },
  { id: "questions", label: "Question bank", icon: FileQuestion, badge: "384" },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "jobs", label: "Jobs", icon: BriefcaseBusiness, group: "Operations" },
  { id: "community", label: "Moderation", icon: ShieldCheck, badge: "8" },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "performance", label: "Performance", icon: BarChart3 },
  { id: "settings", label: "System settings", icon: Settings, group: "System" },
];

const meta = {
  overview: ["Operations overview", "Monitor platform health, momentum and actions that need attention."],
  users: ["User management", "Search, review and manage student accounts and access."],
  assessments: ["Assessment management", "Create and maintain skill assessments across every category."],
  questions: ["Question bank", "Keep assessment content accurate, balanced and up to date."],
  resources: ["Resource library", "Publish focused learning material and manage downloads."],
  events: ["Event management", "Schedule workshops, career fairs and live sessions."],
  jobs: ["Job management", "Review opportunities and keep listings relevant and active."],
  community: ["Community moderation", "Protect a constructive, safe and useful student community."],
  applications: ["Application management", "Track application volume, progression and outcomes."],
  performance: ["Platform performance", "Understand engagement, learning and career outcomes."],
  settings: ["System settings", "Configure platform defaults, notifications and security."],
};

const usersSeed = [
  { id: 1, name: "Nadia Ahmed", email: "nadia@northsouth.edu", university: "North South University", joined: "Jul 24, 2026", readiness: 78, status: "Active", initials: "NA", tone: "bg-cobalt" },
  { id: 2, name: "Samiha Noor", email: "samiha@bracu.edu", university: "BRAC University", joined: "Jul 23, 2026", readiness: 84, status: "Active", initials: "SN", tone: "bg-coral" },
  { id: 3, name: "Raihan Kabir", email: "raihan@aiub.edu", university: "AIUB", joined: "Jul 22, 2026", readiness: 71, status: "Active", initials: "RK", tone: "bg-jade" },
  { id: 4, name: "Tasnia Islam", email: "tasnia@northsouth.edu", university: "North South University", joined: "Jul 19, 2026", readiness: 79, status: "Active", initials: "TI", tone: "bg-plum" },
  { id: 5, name: "Fahim Chowdhury", email: "fahim@iub.edu", university: "Independent University", joined: "Jul 17, 2026", readiness: 62, status: "Suspended", initials: "FC", tone: "bg-ink" },
];

const moderationSeed = [
  { id: 1, author: "Anonymous Student", content: "This workshop organizer is a complete scam. Everyone should spam their page until they refund us.", reason: "Harassment", reports: 5, time: "12 min ago", type: "Post" },
  { id: 2, author: "CareerBoost BD", content: "Guaranteed job in 7 days! Pay the registration fee through this personal number.", reason: "Possible scam", reports: 12, time: "37 min ago", type: "Post" },
  { id: 3, author: "Jubayer Hasan", content: "You clearly have no idea what you're talking about. Stop giving advice.", reason: "Incivility", reports: 2, time: "1 hr ago", type: "Comment" },
];

const applicationRows = [
  { job: "Product Analyst", company: "Pathao", total: 126, screening: 58, interview: 18, offers: 4, rate: "14.3%" },
  { job: "Junior Frontend Engineer", company: "Brain Station 23", total: 98, screening: 42, interview: 14, offers: 3, rate: "14.2%" },
  { job: "Data Science Intern", company: "bKash", total: 154, screening: 66, interview: 21, offers: 6, rate: "13.6%" },
  { job: "UX Research Associate", company: "ShopUp", total: 73, screening: 28, interview: 8, offers: 2, rate: "10.9%" },
];

export default function AdminWorkspace() {
  const [active, setActive] = useState("overview");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [users, setUsers] = useState(usersSeed);
  const [moderation, setModeration] = useState(moderationSeed);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  const addLabel = {
    users: "Add user",
    assessments: "New assessment",
    questions: "Add question",
    resources: "Add resource",
    events: "Create event",
    jobs: "Add job",
  }[active];

  return (
    <>
      <DashboardShell
        role="admin"
        navItems={navItems}
        active={active}
        onNavigate={setActive}
        title={meta[active][0]}
        subtitle={meta[active][1]}
        actions={addLabel ? <button onClick={() => setModal({ type: "create", entity: active })} className="btn-primary !bg-plum hover:!bg-[#64465b]"><Plus size={16} /> {addLabel}</button> : active === "performance" ? <button onClick={() => notify("Analytics report exported.")} className="btn-secondary"><Download size={15} /> Export report</button> : null}
      >
        {active === "overview" && <AdminOverview onNavigate={setActive} />}
        {active === "users" && <UsersPage users={users} setUsers={setUsers} notify={notify} />}
        {active === "assessments" && <AssessmentAdmin notify={notify} />}
        {active === "questions" && <QuestionsAdmin notify={notify} />}
        {active === "resources" && <ResourcesAdmin notify={notify} />}
        {active === "events" && <EventsAdmin notify={notify} />}
        {active === "jobs" && <JobsAdmin notify={notify} />}
        {active === "community" && <ModerationPage items={moderation} setItems={setModeration} notify={notify} />}
        {active === "applications" && <ApplicationsAdmin />}
        {active === "performance" && <PerformanceAdmin />}
        {active === "settings" && <SettingsAdmin notify={notify} />}
      </DashboardShell>
      <Toast message={toast} onClose={() => setToast("")} />
      {modal?.type === "create" && <CreateEntityModal entity={modal.entity} onClose={() => setModal(null)} onSubmit={() => { setModal(null); notify(`New ${modal.entity.replace(/s$/, "")} created successfully.`); }} />}
    </>
  );
}

function AdminOverview({ onNavigate }) {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetric label="Total students" value="2,846" delta="+8.4%" note="vs last month" icon={Users} tone="bg-cobalt" />
        <AdminMetric label="Active assessments" value="24" delta="+3" note="published this month" icon={FileCheck2} tone="bg-jade" />
        <AdminMetric label="Live jobs" value="186" delta="+18" note="new this week" icon={BriefcaseBusiness} tone="bg-coral" />
        <AdminMetric label="Applications" value="4,392" delta="+12.1%" note="vs last month" icon={FileText} tone="bg-plum" />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-extrabold">Platform growth</h2><p className="text-xs text-muted">Student acquisition and weekly active users</p></div><select className="select min-h-9 w-36 py-0 text-xs"><option>Last 8 weeks</option><option>Last 6 months</option></select></div>
          <div className="mt-7 flex h-56 items-end gap-3">{[["W1", 44, 31], ["W2", 56, 40], ["W3", 52, 43], ["W4", 68, 50], ["W5", 72, 58], ["W6", 78, 64], ["W7", 85, 70], ["W8", 94, 78]].map(([label, total, active]) => <div className="flex flex-1 items-end justify-center gap-1" key={label}><div className="w-[38%] rounded-t-md bg-sand" style={{ height: `${total}%` }} /><div className="w-[38%] rounded-t-md bg-cobalt" style={{ height: `${active}%` }} /><span className="absolute mt-5 self-end translate-y-5 text-[9px] font-bold text-muted">{label}</span></div>)}</div><div className="mt-8 flex gap-5 text-[10px] font-bold text-muted"><span><i className="mr-2 inline-block h-2 w-2 rounded-sm bg-sand" />New students</span><span><i className="mr-2 inline-block h-2 w-2 rounded-sm bg-cobalt" />Weekly active</span></div>
        </div>
        <div className="panel p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-extrabold">System health</h2><p className="text-xs text-muted">All services operational</p></div><span className="h-3 w-3 rounded-full bg-jade shadow-[0_0_0_6px_rgba(78,120,100,.12)]" /></div><div className="mt-6 space-y-4">{[["Web application", "99.99%", "Healthy"], ["Express API", "184ms", "Healthy"], ["MySQL database", "37%", "Healthy"], ["Python AI service", "212ms", "Healthy"]].map(([label, value, status]) => <div className="flex items-center justify-between border-b border-ink/[0.07] pb-3 last:border-0" key={label}><span><b className="block text-xs">{label}</b><small className="text-[10px] text-jade">{status}</small></span><b className="text-xs text-muted">{value}</b></div>)}</div></div>
      </section>
      <section className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <div className="panel p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Needs attention</h2><p className="text-xs text-muted">Prioritized operational queue</p></div><span className="tag !bg-coral/10 !text-coral">8 items</span></div><div className="mt-5 space-y-3">{[[Flag, "8 reported community items", "Review now", "community", "text-coral bg-coral/10"], [BriefcaseBusiness, "12 job listings expire soon", "Manage", "jobs", "text-cobalt bg-cobalt/10"], [FileQuestion, "16 questions need review", "Open bank", "questions", "text-plum bg-plum/10"]].map(([Icon, text, action, page, tone]) => <button onClick={() => onNavigate(page)} key={text} className="flex w-full items-center gap-3 rounded-2xl border border-ink/[0.07] bg-white/55 p-3 text-left hover:bg-white"><span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}><Icon size={16} /></span><b className="flex-1 text-xs">{text}</b><span className="text-[10px] font-bold text-muted">{action}</span><ChevronRight size={14} className="text-muted" /></button>)}</div></div>
        <div className="panel p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Recent platform activity</h2><p className="text-xs text-muted">Live operational feed</p></div><button className="btn-ghost"><RefreshCw size={15} /></button></div><div className="mt-5 space-y-4">{[["New assessment published", "Product Thinking · Advanced", "6 min", FileCheck2, "bg-jade"], ["Job listing approved", "Associate UX Researcher · ShopUp", "18 min", BriefcaseBusiness, "bg-cobalt"], ["Community post removed", "Harassment policy violation", "32 min", ShieldCheck, "bg-coral"], ["Resource downloaded 100 times", "Product Analytics Field Guide", "1 hr", BookOpen, "bg-plum"]].map(([title, detail, time, Icon, tone]) => <div className="flex items-start gap-3" key={title}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white ${tone}`}><Icon size={15} /></span><span className="flex-1"><b className="block text-xs">{title}</b><small className="text-[10px] text-muted">{detail}</small></span><small className="text-[9px] font-bold text-muted">{time}</small></div>)}</div></div>
      </section>
    </div>
  );
}

function AdminMetric({ label, value, delta, note, icon: Icon, tone }) {
  return <article className="metric-card"><div className="flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-2xl text-white ${tone}`}><Icon size={19} /></span><span className="tag !border-0 !bg-jade/10 !text-jade"><TrendingUp size={11} />{delta}</span></div><b className="mt-5 block text-2xl tracking-[-0.04em]">{value}</b><p className="mt-0.5 text-xs font-bold">{label}</p><p className="mt-2 text-[10px] text-muted">{note}</p></article>;
}

function UsersPage({ users, setUsers, notify }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All users");
  const list = useMemo(() => users.filter((user) => `${user.name} ${user.email} ${user.university}`.toLowerCase().includes(search.toLowerCase()) && (status === "All users" || user.status === status)), [users, search, status]);
  const toggleStatus = (id) => { setUsers((current) => current.map((user) => user.id === id ? { ...user, status: user.status === "Active" ? "Suspended" : "Active" } : user)); notify("User access status updated."); };
  return <div className="space-y-5"><section className="glass flex flex-col gap-3 rounded-[24px] p-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-11" placeholder="Search name, email or university" /></label><select value={status} onChange={(e) => setStatus(e.target.value)} className="select sm:w-40"><option>All users</option><option>Active</option><option>Suspended</option></select><button className="btn-secondary"><Filter size={15} /> Filters</button><button onClick={() => notify("User list exported.")} className="btn-secondary"><ArrowDownToLine size={15} /> Export</button></section><section className="panel p-5"><div className="table-shell overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="border-b border-ink/[0.07] bg-ink/[0.035] text-[10px] uppercase tracking-[.1em] text-muted"><tr>{["Student", "University", "Joined", "Readiness", "Status", "Actions"].map((item) => <th className="px-4 py-3" key={item}>{item}</th>)}</tr></thead><tbody className="divide-y divide-ink/[0.06]">{list.map((user) => <tr key={user.id} className="hover:bg-white/60"><td className="px-4 py-4"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl text-[10px] font-bold text-white ${user.tone}`}>{user.initials}</span><span><b className="block text-xs">{user.name}</b><small className="text-[10px] text-muted">{user.email}</small></span></div></td><td className="px-4 py-4 text-xs text-muted">{user.university}</td><td className="px-4 py-4 text-xs text-muted">{user.joined}</td><td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-1.5 w-16 rounded-full bg-ink/[0.07]"><div className="h-full rounded-full bg-cobalt" style={{ width: `${user.readiness}%` }} /></div><b className="text-[10px]">{user.readiness}%</b></div></td><td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${user.status === "Active" ? "bg-jade/10 text-jade" : "bg-coral/10 text-coral"}`}>{user.status}</span></td><td className="px-4 py-4"><div className="flex gap-1"><button onClick={() => notify(`Opened ${user.name}'s profile.`)} className="btn-ghost min-h-8"><Eye size={14} /></button><button onClick={() => toggleStatus(user.id)} className="btn-ghost min-h-8">{user.status === "Active" ? <LockKeyhole size={14} /> : <UserCheck size={14} />}</button><button className="btn-ghost min-h-8"><MoreHorizontal size={14} /></button></div></td></tr>)}</tbody></table></div><div className="mt-4 flex items-center justify-between text-xs text-muted"><span>Showing {list.length} of 2,846 students</span><div className="flex gap-1"><button className="btn-secondary min-h-8 px-3">Previous</button><button className="btn-secondary min-h-8 px-3">Next</button></div></div></section></div>;
}

function AssessmentAdmin({ notify }) {
  return <DataGrid title="24 assessments" subtitle="18 published · 4 draft · 2 archived" columns={["Assessment", "Category", "Difficulty", "Questions", "Attempts", "Avg. score", "Status", ""]} rows={assessments.map((item) => [item.title, item.category, item.level, item.questions, Math.floor(420 + item.id * 117), `${item.score || 74 + item.id}%`, item.id % 4 === 0 ? "Draft" : "Published"])} notify={notify} />;
}

function QuestionsAdmin({ notify }) {
  const rows = [
    ["Which method creates a filtered array?", "JavaScript Foundations", "Intermediate", "Multiple choice", "82%", "Published"],
    ["What is the first step in metric diagnosis?", "Data Analysis Essentials", "Intermediate", "Multiple choice", "71%", "Published"],
    ["Choose the clearest STAR response.", "Professional Communication", "Beginner", "Scenario", "88%", "Published"],
    ["Calculate customer retention rate.", "Product Thinking", "Advanced", "Numeric", "54%", "Needs review"],
    ["Write a query using a window function.", "SQL & Databases", "Advanced", "Code", "61%", "Draft"],
  ];
  return <DataGrid title="384 questions" subtitle="Organized across 24 assessments" columns={["Question", "Assessment", "Difficulty", "Type", "Success rate", "Status", ""]} rows={rows} notify={notify} />;
}

function ResourcesAdmin({ notify }) {
  return <DataGrid title="68 learning resources" subtitle="9.8k downloads this month" columns={["Resource", "Category", "Level", "Format", "Downloads", "Completion", "Status", ""]} rows={seedResources.map((item, index) => [item.title, item.category, item.level, item.category.includes("PDF") ? "PDF" : "Course", 320 + index * 114, `${34 + index * 7}%`, index === 5 ? "Draft" : "Published"])} notify={notify} />;
}

function EventsAdmin({ notify }) {
  return <DataGrid title="12 upcoming events" subtitle="1,846 total registrations" columns={["Event", "Type", "Date", "Time", "Host", "Registrations", "Status", ""]} rows={seedEvents.map((item, index) => [item.title, item.type, `${item.day} ${item.month}`, item.time, item.host, 84 + index * 43, index === 3 ? "Draft" : "Published"])} notify={notify} />;
}

function JobsAdmin({ notify }) {
  return <DataGrid title="186 live job listings" subtitle="28 companies · 12 pending review" columns={["Role", "Company", "Location", "Type", "Applications", "Expires", "Status", ""]} rows={seedJobs.map((item, index) => [item.title, item.company, item.location, item.type, 73 + index * 27, `${8 + index * 3} days`, index === 3 ? "Pending" : "Live"])} notify={notify} />;
}

function DataGrid({ title, subtitle, columns, rows, notify }) {
  const [search, setSearch] = useState("");
  const filtered = rows.filter((row) => row.join(" ").toLowerCase().includes(search.toLowerCase()));
  return <div className="space-y-5"><section className="glass flex flex-col gap-3 rounded-[24px] p-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-11" placeholder="Search records..." /></label><button className="btn-secondary"><Filter size={15} /> Filter</button><button onClick={() => notify("Data exported as CSV.")} className="btn-secondary"><Download size={15} /> Export</button></section><section className="panel p-5"><div className="mb-5"><h2 className="text-lg font-extrabold">{title}</h2><p className="text-xs text-muted">{subtitle}</p></div><div className="table-shell overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="border-b border-ink/[0.07] bg-ink/[0.035] text-[10px] uppercase tracking-[.09em] text-muted"><tr>{columns.map((item) => <th className="px-4 py-3" key={item}>{item}</th>)}</tr></thead><tbody className="divide-y divide-ink/[0.06]">{filtered.map((row, index) => <tr key={index} className="text-xs hover:bg-white/60">{row.map((cell, cIndex) => <td className={`max-w-[280px] px-4 py-4 ${cIndex === 0 ? "font-bold text-ink" : "text-muted"}`} key={cIndex}>{cIndex === row.length - 1 ? <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${["Published","Live"].includes(cell) ? "bg-jade/10 text-jade" : cell === "Draft" ? "bg-ink/10 text-muted" : "bg-coral/10 text-coral"}`}>{cell}</span> : cell}</td>)}<td className="px-4 py-4"><div className="flex"><button onClick={() => notify("Record editor opened.")} className="btn-ghost min-h-8"><Pencil size={14} /></button><button className="btn-ghost min-h-8"><MoreHorizontal size={14} /></button></div></td></tr>)}</tbody></table></div></section></div>;
}

function ModerationPage({ items, setItems, notify }) {
  const resolve = (id, action) => { setItems((current) => current.filter((item) => item.id !== id)); notify(action === "remove" ? "Content removed and author notified." : "Report dismissed after review."); };
  return <div className="space-y-5"><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><AdminMetric label="Open reports" value={items.length + 5} delta="-14%" note="vs last week" icon={Flag} tone="bg-coral" /><AdminMetric label="Posts today" value="286" delta="+9%" note="healthy activity" icon={MessageCircle} tone="bg-cobalt" /><AdminMetric label="Comments today" value="842" delta="+11%" note="healthy activity" icon={Users} tone="bg-jade" /><AdminMetric label="Resolution time" value="18m" delta="-4m" note="weekly average" icon={Clock3} tone="bg-plum" /></section><section className="panel p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Reported content queue</h2><p className="text-xs text-muted">Review context before taking action.</p></div><span className="tag !bg-coral/10 !text-coral"><AlertTriangle size={12} /> {items.length} high priority</span></div><div className="space-y-3">{items.map((item) => <article className="rounded-[22px] border border-ink/[0.08] bg-white/55 p-4" key={item.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><b className="text-sm">{item.author}</b><span className="tag">{item.type}</span><span className="tag !bg-coral/10 !text-coral">{item.reason}</span></div><p className="mt-3 max-w-3xl text-sm leading-6 text-ink/75">{item.content}</p><p className="mt-3 text-[10px] font-bold text-muted">{item.reports} reports · {item.time}</p></div><div className="flex shrink-0 gap-2"><button onClick={() => resolve(item.id, "dismiss")} className="btn-secondary min-h-10">Dismiss</button><button onClick={() => resolve(item.id, "remove")} className="btn-primary min-h-10 !bg-coral"><Trash2 size={14} /> Remove</button></div></div></article>)}</div>{!items.length && <div className="py-16 text-center"><CheckCircle2 className="mx-auto text-jade" size={34} /><h3 className="mt-3 font-extrabold">Queue cleared</h3><p className="mt-1 text-xs text-muted">No reported content needs review.</p></div>}</section></div>;
}

function ApplicationsAdmin() {
  return <div className="space-y-5"><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><AdminMetric label="Applications" value="4,392" delta="+12%" note="this month" icon={FileText} tone="bg-cobalt" /><AdminMetric label="Screening rate" value="43%" delta="+3.2%" note="monthly rate" icon={Eye} tone="bg-plum" /><AdminMetric label="Interview rate" value="13.8%" delta="+1.1%" note="of screened" icon={Users} tone="bg-coral" /><AdminMetric label="Offer rate" value="3.4%" delta="+0.6%" note="of applicants" icon={CheckCircle2} tone="bg-jade" /></section><section className="panel p-5"><div className="mb-5"><h2 className="text-lg font-extrabold">Application funnel by role</h2><p className="text-xs text-muted">Current live opportunities</p></div><div className="table-shell overflow-x-auto"><table className="w-full min-w-[800px] text-left text-xs"><thead className="border-b border-ink/[0.07] bg-ink/[0.035] text-[10px] uppercase tracking-[.1em] text-muted"><tr>{["Role", "Total", "Screening", "Interview", "Offers", "Conversion"].map((x) => <th className="px-4 py-3" key={x}>{x}</th>)}</tr></thead><tbody className="divide-y divide-ink/[0.06]">{applicationRows.map((row) => <tr key={row.job}><td className="px-4 py-4"><b className="block">{row.job}</b><small className="text-muted">{row.company}</small></td><td className="px-4 py-4 font-bold">{row.total}</td><td className="px-4 py-4 text-muted">{row.screening}</td><td className="px-4 py-4 text-muted">{row.interview}</td><td className="px-4 py-4 text-muted">{row.offers}</td><td className="px-4 py-4 font-bold text-jade">{row.rate}</td></tr>)}</tbody></table></div></section></div>;
}

function PerformanceAdmin() {
  return <div className="space-y-5"><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><AdminMetric label="Weekly active users" value="1,934" delta="+7.8%" note="67.9% of students" icon={Activity} tone="bg-cobalt" /><AdminMetric label="Assessments completed" value="892" delta="+14%" note="this month" icon={FileCheck2} tone="bg-jade" /><AdminMetric label="Avg. readiness" value="68.4%" delta="+2.6%" note="monthly change" icon={Gauge} tone="bg-coral" /><AdminMetric label="Placement signals" value="312" delta="+18%" note="interviews + offers" icon={TrendingUp} tone="bg-plum" /></section><section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><div className="panel p-6"><h2 className="text-lg font-extrabold">Engagement by feature</h2><p className="text-xs text-muted">Share of monthly active students</p><div className="mt-8 space-y-5">{[["Job recommendations", 88, "bg-cobalt"], ["Skill assessments", 72, "bg-jade"], ["Learning resources", 65, "bg-coral"], ["Career Vault", 58, "bg-plum"], ["Community", 46, "bg-[#A57945]"]].map(([label, value, tone]) => <div key={label}><div className="mb-2 flex justify-between text-xs"><b>{label}</b><span className="font-bold text-muted">{value}%</span></div><div className="progress-track h-3"><div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} /></div></div>)}</div></div><div className="panel p-6"><h2 className="text-lg font-extrabold">Readiness distribution</h2><p className="text-xs text-muted">All active student profiles</p><div className="mt-8 flex h-56 items-end justify-between gap-4">{[["0–40", 18, "bg-coral/70"], ["41–60", 52, "bg-coral"], ["61–75", 85, "bg-cobalt"], ["76–90", 66, "bg-jade"], ["91+", 28, "bg-plum"]].map(([label, value, tone]) => <div className="flex flex-1 flex-col items-center gap-2" key={label}><div className={`w-full rounded-t-xl ${tone}`} style={{ height: `${value}%` }} /><span className="text-[9px] font-bold text-muted">{label}</span></div>)}</div></div></section></div>;
}

function SettingsAdmin({ notify }) {
  return <div className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]"><aside className="panel h-fit p-4">{[["General", Settings], ["Security", ShieldCheck], ["Email templates", Mail], ["Integrations", Database], ["AI configuration", Sparkles]].map(([label, Icon], index) => <button className={`dash-side-link ${index === 0 ? "dash-side-link-active" : ""}`} key={label}><Icon size={16} />{label}</button>)}</aside><section className="panel p-6"><div><h2 className="text-lg font-extrabold">General platform settings</h2><p className="text-xs text-muted">Core presentation and operational defaults.</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{[["Platform name", "CareerForge"], ["Support email", "support@careerforge.com"], ["Default timezone", "Asia/Dhaka"], ["Student locale", "English (Bangladesh)"]].map(([label, value]) => <label key={label}><span className="mb-1.5 block text-xs font-bold">{label}</span><input className="input" defaultValue={value} /></label>)}</div><div className="my-7 h-px bg-ink/[0.08]" /><h3 className="text-sm font-extrabold">Feature controls</h3><div className="mt-4 space-y-4">{[["Allow new student registration", "Students can create accounts from the public landing page.", true], ["AI cover letter generator", "Generate tailored drafts inside job applications.", true], ["Community posting", "Allow students to create public community posts.", true], ["Maintenance mode", "Temporarily restrict student access.", false]].map(([title, copy, checked]) => <label className="flex items-start justify-between gap-5" key={title}><span><b className="block text-xs">{title}</b><small className="text-[10px] leading-4 text-muted">{copy}</small></span><input type="checkbox" defaultChecked={checked} className="mt-1 h-4 w-4 accent-plum" /></label>)}</div><div className="mt-8 flex justify-end"><button onClick={() => notify("System settings saved.")} className="btn-primary !bg-plum"><Check size={15} /> Save settings</button></div></section></div>;
}

function CreateEntityModal({ entity, onClose, onSubmit }) {
  const singular = { users: "user", assessments: "assessment", questions: "question", resources: "resource", events: "event", jobs: "job" }[entity];
  const fields = {
    users: [["Full name", "e.g. Ayesha Rahman"], ["Email address", "student@university.edu"], ["University", "University name"]],
    assessments: [["Assessment title", "e.g. Data Visualization"], ["Category", "Analytics"], ["Time limit", "20 minutes"]],
    questions: [["Question text", "Enter the question"], ["Assessment", "Choose assessment"], ["Difficulty", "Intermediate"]],
    resources: [["Resource title", "e.g. Interview Playbook"], ["Category", "Career Toolkit"], ["Resource URL", "https://..."]],
    events: [["Event title", "e.g. Career Fair 2026"], ["Date & time", "Aug 10, 2026 · 10:00"], ["Host / venue", "Host name"]],
    jobs: [["Role title", "e.g. Product Analyst"], ["Company", "Company name"], ["Location", "Dhaka · Hybrid"]],
  }[entity];
  return <div className="modal-backdrop" onClick={onClose}><form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="modal-card max-w-xl" onClick={(e) => e.stopPropagation()}><div className="flex items-start justify-between"><div><span className="eyebrow">Create record</span><h2 className="mt-2 text-xl font-extrabold capitalize">New {singular}</h2></div><button type="button" onClick={onClose} className="btn-ghost"><X size={18} /></button></div><div className="mt-6 space-y-4">{fields.map(([label, placeholder]) => <label className="block" key={label}><span className="mb-1.5 block text-xs font-bold">{label}</span><input required className="input" placeholder={placeholder} /></label>)}<label className="block"><span className="mb-1.5 block text-xs font-bold">Status</span><select className="select"><option>Draft</option><option>Published</option><option>Active</option></select></label></div><div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button className="btn-primary !bg-plum">Create {singular} <ArrowRight size={15} /></button></div></form></div>;
}
