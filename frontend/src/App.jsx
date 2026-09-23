import { useEffect, useState } from "react";
import {
  ArrowRight, BarChart3, BookOpen, BriefcaseBusiness, Building2, CalendarDays,
  Bell, ChevronDown, ChevronLeft, ChevronRight, CircleUserRound, ClipboardCheck, FileText, GraduationCap, LayoutDashboard,
  Download, ExternalLink, MapPin, MessageCircle, Pencil, Plus, RefreshCw, Save, Search, Settings, Star, Upload,
  ShieldCheck, Target, Trash2, Users,
} from "lucide-react";
import { AdminApplications, AdminCommunity, AdminContentManager, AdminOverview, AdminStudents } from "./AdminDashboard";
import studentSuccessPhoto from "./assets/hero-campus-graduates.jpg";
import { StudentResources } from "./StudentResources";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const studentNavGroups = [
  ["WORKSPACE", [["overview", "Overview", LayoutDashboard], ["jobs", "Available jobs", BriefcaseBusiness], ["applications", "My applications", ClipboardCheck], ["vault", "Career Vault", FileText]]],
  ["GROWTH", [["assessments", "Skill assessments", ClipboardCheck], ["performance", "Performance", BarChart3], ["resources", "Learning resources", BookOpen]]],
  ["CONNECT", [["community", "Community", Users], ["connect", "Connections & inbox", MessageCircle], ["events", "Events", CalendarDays], ["achievements", "Achievements", Star]]],
  ["ACCOUNT", [["profile", "My profile", CircleUserRound]]],
];
const studentItems = studentNavGroups.flatMap(([, items]) => items);
const adminItems = [["overview", "Overview", LayoutDashboard], ["students", "Students", Users], ["jobs", "Jobs", BriefcaseBusiness], ["applications", "Applications", FileText], ["assessments", "Assessments", ClipboardCheck], ["community", "Community", MessageCircle], ["resources", "Resources", BookOpen], ["events", "Events", CalendarDays], ["settings", "Settings", Settings]];
const workspaceSearchPlaceholders = {
  student: { overview: "Search jobs, resources or people...", jobs: "Search jobs by title, company or skill...", applications: "Search applications...", vault: "Search your CV sections...", assessments: "Search skills and assessments...", performance: "Search performance insights...", resources: "Search resources by title or skill...", community: "Search community posts...", connect: "Search students by name or ID...", events: "Search events and workshops...", achievements: "Search achievements...", profile: "Search profile settings..." },
  admin: { overview: "Search students, jobs or applications...", students: "Search students by name or ID...", jobs: "Search jobs by title or company...", applications: "Search applications by student or job...", assessments: "Search assessments...", community: "Search community activity...", resources: "Search resources...", events: "Search events...", settings: "Search settings..." },
};
const blankProfile = { university: "", degree: "", graduationYear: "", experienceYears: "", targetRole: "", location: "", bio: "", skills: "", hobbies: "", profilePhotoUrl: "" };
const blankJob = { companyName: "", companyWebsite: "", companyLocation: "", title: "", location: "", employmentType: "full_time", workMode: "hybrid", salaryText: "", description: "", expiryDate: "", status: "draft", minExperienceYears: "", maxExperienceYears: "" };
const blankResumeContent = { fullName: "", email: "", phone: "", location: "", headline: "", summary: "", skills: "", education: "", experience: "", projects: "" };

function getSession() { try { return JSON.parse(localStorage.getItem("careerforge_session")) || null; } catch { return null; } }
async function responseBody(response) { const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.message || body.detail || (response.status === 401 ? "Email or password is incorrect." : response.status === 403 ? "You do not have permission for this action." : response.status === 503 ? "The required service is not configured. Check the project .env file, then restart the backend." : response.status === 502 ? "The external provider could not complete this request right now." : body.error || "Something went wrong.")); return body; }

function useRoute() {
  const read = () => window.location.hash.replace("#", "") || "/";
  const [route, setRoute] = useState(read);
  useEffect(() => { const update = () => setRoute(read()); window.addEventListener("hashchange", update); return () => window.removeEventListener("hashchange", update); }, []);
  return [route, (to) => { window.location.hash = to; }];
}

function Brand({ onClick }) { return <button type="button" className="brand" onClick={onClick} aria-label="CareerForge home"><span className="brand-mark">CF</span><span>Career<span>Forge</span></span></button>; }
function Button({ children, className = "", ...props }) { return <button className={`button ${className}`} {...props}>{children}</button>; }
function EmptyPanel({ title, copy }) { return <section className="empty-panel"><span><Target size={21} /></span><h3>{title}</h3><p>{copy}</p></section>; }
function StudentStatusPanel({ title, copy }) { return <section className="student-status-page"><header className="student-page-heading"><p>MY CAREERFORGE</p><h2>{title}</h2><span>Track your progress and keep your next step visible.</span></header><div className="student-status-panel"><span><Target size={21} /></span><p>{copy}</p></div></section>; }

function LegacyLanding({ go }) {
  const features = [[Target, "Find your fit", "Turn your goals and skills into focused, explainable job opportunities."], [FileText, "Build your CV", "Create resume versions, upload documents, and use the right CV for each job."], [BriefcaseBusiness, "Take the next move", "Apply to published roles and keep your application history together."]];
  return <main className="public-page"><header className="public-header"><Brand onClick={() => go("/")} /><nav><button onClick={() => go("/community")}>Community</button><button onClick={() => go("/resources")}>Resources</button></nav><div className="header-actions"><Button className="quiet" onClick={() => go("/login/admin")}>Admin sign in</Button><Button onClick={() => go("/login/student")}>Get started <ArrowRight size={15} /></Button></div></header><section className="hero"><div className="hero-copy"><p className="eyebrow"><Target size={14} /> Career growth, made tangible</p><h1>Make your next <em>move feel real.</em></h1><p className="lede">One connected workspace for your student profile, meaningful job opportunities, and professional growth.</p><div className="row"><Button onClick={() => go("/register")}>Create student account <ArrowRight size={16} /></Button><Button className="quiet" onClick={() => go("/login/student")}>Student sign in</Button></div><div className="proof"><span><ShieldCheck size={15} /> Local MySQL data</span><span><Target size={15} /> Career focused</span><span><Users size={15} /> Student and admin roles</span></div></div><div className="hero-art"><div className="hero-card"><span className="icon-ball"><Target size={23} /></span><small>Career profile</small><strong>Build your professional signal</strong><div className="progress"><i /></div></div><div className="floating one"><BarChart3 size={17} /><span><small>Profile progress</small><b>Ready for your details</b></span></div><div className="floating two"><BriefcaseBusiness size={17} /><span><small>Job opportunities</small><b>Published by admins</b></span></div></div></section><section className="section"><div className="section-heading"><div><p className="eyebrow"><Target size={14} /> Your work, connected</p><h2>A career system that feels <em>human.</em></h2></div><p className="section-copy">CareerForge keeps your profile, CV, job search, and progress together.</p></div><div className="feature-grid">{features.map(([Icon, title, copy], index) => <article className="feature-card" key={title}><span className={`feature-icon tone-${index}`}><Icon size={22} /></span><small>0{index + 1}</small><h3>{title}</h3><p>{copy}</p><ChevronRight size={17} /></article>)}</div></section><section className="section journey"><div><p className="eyebrow"><Target size={14} /> A clearer rhythm</p><h2>No generic path.<br /><em>A path that reacts.</em></h2></div><div className="journey-list">{[["01", "Build your profile", "Add your education, direction, and professional information."], ["02", "Prepare your evidence", "Use Career Vault to create or upload the CV that represents you."], ["03", "Apply with confidence", "Choose a CV and submit it to relevant published opportunities."]].map(([number, title, copy]) => <article key={number}><b>{number}</b><div><h3>{title}</h3><p>{copy}</p></div><ArrowRight size={18} /></article>)}</div></section><section className="cta"><div><p>YOUR NEXT CHAPTER IS PRACTICAL</p><h2>Turn direction into <em>movement.</em></h2><Button className="light" onClick={() => go("/register")}>Create student account <ArrowRight size={16} /></Button></div><Target size={58} /></section><footer>CareerForge · Advanced Object Oriented Programming Laboratory</footer></main>;
}

function Landing({ go }) {
  const features = [[Target, "A career path with focus", "Capture your goals, education, and strengths in one polished profile."], [FileText, "Your CV, ready when you are", "Create tailored CV versions and choose the right one for every role."], [BriefcaseBusiness, "Applications without the chaos", "Discover roles, apply with confidence, and keep every next step visible."]];
  useEffect(() => {
    const items = document.querySelectorAll(".nex-home .reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { items.forEach((item) => item.classList.add("is-visible")); return undefined; }
    const revealAtScrollPoint = () => {
      const triggerLine = window.innerHeight * 0.82;
      const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      items.forEach((item) => {
        const box = item.getBoundingClientRect();
        item.classList.toggle("is-visible", (box.top <= triggerLine && box.bottom >= 0) || (atPageEnd && box.top < window.innerHeight));
      });
    };
    revealAtScrollPoint();
    window.addEventListener("scroll", revealAtScrollPoint, { passive: true });
    window.addEventListener("resize", revealAtScrollPoint);
    return () => { window.removeEventListener("scroll", revealAtScrollPoint); window.removeEventListener("resize", revealAtScrollPoint); };
  }, []);
  return <main className="public-page nex-home">
    <header className="public-header nex-header"><Brand onClick={() => go("/")} /><nav><button onClick={() => document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })}>How it works</button><button onClick={() => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })}>Features</button><button onClick={() => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })}>Resources</button></nav><div className="header-actions"><Button className="quiet" onClick={() => go("/login/student")}>Sign in</Button><Button onClick={() => go("/register")}>Get started <ArrowRight size={15} /></Button></div></header>
    <section className="nex-hero">
      <div className="nex-hero-copy reveal from-left"><p className="nex-pill"><Target size={14} /> Your career, made clearer</p><h1>Build a career<br />that moves <em>forward.</em></h1><p>CareerForge gives students one calm workspace to shape a profile, prepare a standout CV, and apply to the right opportunities.</p><div className="row"><Button onClick={() => go("/register")}>Create free account <ArrowRight size={16} /></Button><button className="video-link" onClick={() => document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })}><span><ArrowRight size={15} /></span> See how it works</button></div><div className="nex-social-proof"><div className="avatar-stack"><i>R</i><i>S</i><i>N</i><i>+</i></div><span><b>One place for every next step.</b><small>Profile · CV · jobs · applications</small></span></div></div>
      <div className="nex-product reveal from-right" aria-label="CareerForge workspace preview"><div className="product-top"><span className="product-logo"><Target size={14} /></span><span>CareerForge</span><i /></div><div className="product-body"><aside><span className="side-active" /><span /><span /><span /><span /></aside><div className="product-content"><div className="product-title"><div><small>WELCOME BACK</small><b>Career overview</b></div><span className="product-avatar">AS</span></div><div className="career-banner"><div><small>YOUR CAREER SCORE</small><strong>72<span>/100</span></strong><p>You are building a strong start.</p></div><div className="ring"><span>72%</span></div></div><div className="product-grid"><article><span className="product-icon green"><FileText size={17} /></span><small>CV versions</small><b>03 <em>ready</em></b></article><article><span className="product-icon lilac"><BriefcaseBusiness size={17} /></span><small>Job matches</small><b>12 <em>new</em></b></article></div><div className="next-card"><span><CalendarDays size={17} /></span><div><small>NEXT ACTION</small><b>Complete your career profile</b></div><ArrowRight size={16} /></div></div></div><div className="product-glow" /></div>
      <article className="nex-float match-float reveal from-bottom"><span><Target size={17} /></span><div><small>Top match</small><b>Frontend Intern</b></div><strong>92%</strong></article><article className="nex-float progress-float reveal from-top"><BarChart3 size={19} /><div><small>Profile strength</small><b>Looking great</b></div></article>
    </section>
    <section className="nex-logos reveal from-bottom"><p>DESIGNED FOR STUDENTS READY TO TAKE THE NEXT STEP</p><div><span>CAREER <b>START</b></span><span>WORK<b>WISE</b></span><span>GRADUATE<b>LAB</b></span><span>FUTURE<b>READY</b></span></div></section>
    <section className="nex-info-strip reveal from-bottom"><article><span><ShieldCheck size={19} /></span><div><b>Your data, in one place</b><p>Profiles, CV versions, documents, and applications stay connected to your CareerForge account.</p></div></article><article><span><Users size={19} /></span><div><b>Built for students and admins</b><p>Students prepare and apply; administrators publish opportunities and manage the platform.</p></div></article><article><span><Target size={19} /></span><div><b>Designed around real next steps</b><p>Build a profile, prepare evidence, discover jobs, then follow every application.</p></div></article></section>
    <section className="nex-section" id="features"><div className="nex-section-heading reveal from-left"><p className="nex-pill"><Target size={14} /> Everything connected</p><h2>A simpler way to<br /><em>shape your future.</em></h2><p>Less switching between tools. More clarity about where you are going and what to do next.</p></div><div className="nex-feature-grid">{features.map(([Icon, title, copy], index) => <article className={`reveal from-bottom delay-${index + 1}`} key={title}><span className={`nex-feature-icon icon-${index}`}><Icon size={22} /></span><h3>{title}</h3><p>{copy}</p><button onClick={() => go(index === 1 ? "/register" : "/login/student")}>Explore feature <ArrowRight size={15} /></button></article>)}</div></section>
    <section className="nex-workflow" id="how-it-works"><div className="workflow-preview reveal from-left"><div className="workflow-window"><header><span /><span /><span /><b>Your action plan</b></header><div className="workflow-task done"><span>✓</span><div><b>Set your target role</b><small>Your career direction is saved</small></div><em>Done</em></div><div className="workflow-task"><span>2</span><div><b>Build your CV</b><small>Create a version for your next application</small></div><ArrowRight size={16} /></div><div className="workflow-task"><span>3</span><div><b>Explore job matches</b><small>See relevant published opportunities</small></div><ArrowRight size={16} /></div></div></div><div className="workflow-copy reveal from-right"><p className="nex-pill"><Target size={14} /> A better rhythm</p><h2>Every move<br />has a <em>purpose.</em></h2><p>CareerForge turns the stressful search for “what next?” into a focused, manageable plan.</p><ul><li><ShieldCheck size={17} /> Keep your professional details organised</li><li><ShieldCheck size={17} /> Apply with the CV that fits the role</li><li><ShieldCheck size={17} /> Track progress from one workspace</li></ul><Button onClick={() => go("/register")}>Start your journey <ArrowRight size={16} /></Button></div></section>
    <section className="nex-cta reveal from-bottom"><div><p>YOUR FUTURE DESERVES A SYSTEM</p><h2>Ready to make<br />your next move?</h2><p>Create your free student workspace and begin with the step that matters today.</p><Button className="light" onClick={() => go("/register")}>Get started for free <ArrowRight size={16} /></Button></div><div className="cta-orbit"><span><GraduationCap size={50} /></span><i /><i /></div></section>
    <footer className="nex-footer reveal from-bottom"><Brand onClick={() => go("/")} /><span>CareerForge · Advanced Object Oriented Programming Laboratory</span><button onClick={() => go("/login/admin")}>Administrator sign in</button></footer>
  </main>;
}

function ArchiveFinpayLanding({ go }) {
  const benefits = [[RefreshCw, "Free career moves", "Create CV versions, explore roles, and make every application easier to manage."], [BriefcaseBusiness, "Multiple pathways", "Keep job matches, applications, documents, and professional goals in a single account."], [ShieldCheck, "Your work stays secure", "Your information is connected to your CareerForge profile and available when you need it."]];
  const scrollToSection = (id) => { const target = document.getElementById(id); if (!target) return; const targetTop = window.scrollY + target.getBoundingClientRect().top; const centeredTop = targetTop - Math.max(20, (window.innerHeight - target.offsetHeight) / 2); window.scrollTo({ top: Math.max(0, centeredTop), behavior: "smooth" }); };
  useEffect(() => {
    const items = [...document.querySelectorAll(".fin-home [data-fin-reveal]")];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { items.forEach((item) => item.classList.add("fin-visible")); return undefined; }
    const updateMotion = () => { const triggerLine = window.innerHeight * 0.7; const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4; items.forEach((item) => { const box = item.getBoundingClientRect(); item.classList.toggle("fin-visible", (box.top <= triggerLine && box.bottom >= 0) || (atPageEnd && box.top < window.innerHeight)); }); };
    updateMotion(); window.addEventListener("scroll", updateMotion, { passive: true }); window.addEventListener("resize", updateMotion);
    return () => { window.removeEventListener("scroll", updateMotion); window.removeEventListener("resize", updateMotion); };
  }, []);
  return <main className="fin-home">
     <header className="fin-header"><Brand onClick={() => go("/")} /><nav><button type="button" onClick={() => scrollToSection("fin-product")}>People</button><button type="button" onClick={() => scrollToSection("fin-path")}>Skills</button><button type="button" onClick={() => scrollToSection("fin-impact")}>Opportunities</button></nav><div className="fin-actions"><Button className="quiet" onClick={() => go("/login/student")}>Log in</Button><Button onClick={() => go("/register")}>Get started</Button></div></header>
    <section className="fin-hero"><div className="fin-hero-copy" data-fin-reveal="left"><p className="fin-kicker">A BRIGHTER TOMORROW STARTS HERE</p><h1>Your future,<br />built <em>together.</em></h1><p>CareerForge brings students, skills, CVs, and meaningful opportunities together in one focused career workspace.</p><div className="fin-start"><input aria-label="Your email address" type="email" /><Button onClick={() => go("/register")}>Get started <ArrowRight size={15} /></Button></div><small>Designed for students ready to take their next step with confidence.</small><div className="fin-capabilities"><b>YOUR WORKSPACE INCLUDES</b><span><CircleUserRound size={15} /> Profile &amp; goals</span><span><FileText size={15} /> CV versions</span><span><BriefcaseBusiness size={15} /> Real opportunities</span></div></div><div className="fin-preview" data-fin-reveal="right" aria-label="Student success and readiness collage"><div className="hybrid-success-collage"><figure className="hybrid-photo-card"><img src={studentSuccessPhoto} alt="University student building her career at a laptop" /><figcaption><span><Target size={14} /> STUDENT SUCCESS STORY</span><b>Your potential, in motion.</b></figcaption></figure><article className="hybrid-readiness-card"><small>CAREER READINESS</small><div className="hybrid-score-ring"><i className="hybrid-orbit-line hybrid-orbit-line-one" aria-hidden="true" /><i className="hybrid-orbit-line hybrid-orbit-line-two" aria-hidden="true" /><strong>72<span>/100</span></strong><b>Great progress</b></div><footer><span><GraduationCap size={14} /> Skills</span><span><MessageCircle size={14} /> Community</span></footer></article><article className="hybrid-microcard hybrid-cv-card"><span><FileText size={18} /></span><div><small>CV READY</small><b>Portfolio refreshed</b></div><i><Target size={14} /></i></article><article className="hybrid-microcard hybrid-job-card"><span><BriefcaseBusiness size={18} /></span><div><small>JOB MATCHES</small><b>12 opportunities</b><em>90% fit</em></div></article><button className="hybrid-collage-action" type="button" onClick={() => go("/login/student")}>Build your workspace <ArrowRight size={15} /></button></div></div></section>
    <section className="fin-benefits" id="fin-product"><div className="fin-benefit-intro" data-fin-reveal="left"><p className="fin-kicker">FUTURE-READY CAREERS</p><h2>An experience that grows<br />with your <em>ambition.</em></h2></div><p data-fin-reveal="fade">We designed one career system that works for you now and stays useful as your confidence grows.</p><div className="fin-benefit-grid">{benefits.map(([Icon, title, copy], index) => <article data-fin-reveal="up" data-fin-delay={index} key={title}><span><Icon size={24} /></span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="fin-impact" id="fin-impact"><div className="fin-impact-copy" data-fin-reveal="left"><p className="fin-kicker">WHY CAREERFORGE</p><h2>A clear picture of<br />where you are going.</h2><p>Simple tools make it easier to take action today and keep moving tomorrow.</p><Button onClick={() => go("/register")}>Create your account <ArrowRight size={15} /></Button></div><div className="fin-impact-board" data-fin-reveal="right"><div className="fin-board-head"><span>APPLICATION ACTIVITY</span><b>Career momentum</b><small>Last 6 months</small></div><div className="fin-chart"><i /><i /><i /><i /><i /><i /></div><div className="fin-board-stats"><article><b>01</b><span>Profile built<br /><small>Tell your story clearly</small></span></article><article><b>02</b><span>CV prepared<br /><small>Keep the right version ready</small></span></article><article><b>03</b><span>Applications tracked<br /><small>Know what happens next</small></span></article></div></div></section>
    <section className="fin-path" id="fin-path"><div className="fin-path-heading" data-fin-reveal="up"><p className="fin-kicker">HOW IT WORKS</p><h2>Build a career system<br />that works for <em>you.</em></h2></div><div className="fin-path-steps">{[["01", "Create your profile", "Add your study, skills, direction, and the details that make you stand out."], ["02", "Prepare your CV", "Create a polished version or upload the document you already trust."], ["03", "Apply with clarity", "Browse published jobs and use the right CV for each opportunity."]].map(([number, title, copy], index) => <article data-fin-reveal="up" data-fin-delay={index} key={number}><b>{number}</b><h3>{title}</h3><p>{copy}</p><button onClick={() => go(number === "01" ? "/register" : "/login/student")} aria-label={`Open ${title}`}><ArrowRight size={18} /></button></article>)}</div></section>
    <section className="fin-cta" data-fin-reveal="up"><div><p className="fin-kicker">START BUILDING MOMENTUM</p><h2>Your next chapter<br />starts with a plan.</h2><p>Create your free student workspace and turn uncertainty into an organised next step.</p><Button onClick={() => go("/register")}>Get started for free <ArrowRight size={16} /></Button></div><aside className="fin-next-planner" aria-label="Your next three career steps"><header><span><CalendarDays size={15} /> YOUR NEXT 3 STEPS</span><small>This week</small></header><article><b>01</b><div><strong>Complete your profile</strong><small>80% complete</small><i><em style={{ width: "80%" }} /></i></div></article><article><b>02</b><div><strong>Polish your CV</strong><small>Version 02 is ready</small><i><em style={{ width: "100%" }} /></i></div><span className="planner-ready">Ready</span></article><article><b>03</b><div><strong>Explore job matches</strong><small>12 opportunities waiting</small><i><em style={{ width: "48%" }} /></i></div></article><footer><span>KEEP MOVING FORWARD</span><ArrowRight size={15} /></footer></aside></section>
    <footer className="fin-footer" data-fin-reveal="up"><Brand onClick={() => go("/")} /><span>CareerForge · Advanced Object Oriented Programming Laboratory</span><button onClick={() => go("/login/admin")}>Administrator sign in</button></footer>
  </main>;
}

function FinpayLanding({ go }) {
  const featureCards = [
    [Target, "Get direction", "Turn your profile into a practical focus.", "blue"],
    [BriefcaseBusiness, "Find real opportunities", "See roles that fit where you are heading.", "jade"],
    [Users, "Move with people", "Connect with students on a similar path.", "coral"],
  ];
  const journeySteps = [
    ["01", "Shape your story", "Add your education, strengths, and target role in one focused profile."],
    ["02", "Prepare with confidence", "Create CV versions and keep your best work ready for every application."],
    ["03", "Take the next step", "Discover relevant opportunities and track every application in one place."],
  ];
  const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return <main className="landing-v2">
    <header className="landing-v2-header">
      <div className="landing-v2-nav">
        <Brand onClick={() => go("/")} />
        <nav aria-label="Landing page navigation">
          <button type="button" onClick={() => scrollToSection("platform")}>Platform</button>
          <button type="button" onClick={() => scrollToSection("how-it-works")}>How it works</button>
          <button type="button" onClick={() => scrollToSection("community")}>Community</button>
          <button type="button" onClick={() => scrollToSection("resources")}>Resources</button>
        </nav>
        <div className="landing-v2-actions">
          <button className="landing-v2-admin" type="button" onClick={() => go("/login/admin")}>Admin</button>
          <button className="landing-v2-login" type="button" onClick={() => go("/login/student")}>Log in</button>
          <Button className="landing-v2-primary" onClick={() => go("/register")}>Get started <ArrowRight size={16} /></Button>
        </div>
      </div>
    </header>

    <div className="landing-v2-content">
      <section className="landing-v2-hero" id="platform">
        <div className="landing-v2-copy">
          <p className="landing-v2-eyebrow">ONE CAREER SPACE</p>
          <h1>Your career.<br /><span>Finally</span> in focus.</h1>
          <p className="landing-v2-lede">See the skills to build, opportunities worth chasing and people who can help you get there—all in one personal career space.</p>
          <div className="landing-v2-hero-actions">
            <Button className="landing-v2-primary landing-v2-workspace" onClick={() => go("/register")}>Create your free workspace <ArrowRight size={16} /></Button>
            <button className="landing-v2-explore" type="button" onClick={() => scrollToSection("how-it-works")}>Explore the journey <span aria-hidden="true">↓</span></button>
          </div>
          <div className="landing-v2-proof">
            <div className="landing-v2-avatars" aria-hidden="true"><i>SA</i><i>MI</i><i>NK</i><i>+</i></div>
            <p><b>Built for real student journeys.</b><span>From campus confidence to your next big move.</span></p>
          </div>
        </div>
        <figure className="landing-v2-photo">
          <img src={studentSuccessPhoto} alt="University graduates celebrating together on campus" />
        </figure>
      </section>

      <section className="landing-v2-feature-row" aria-label="CareerForge highlights">
        <article className="landing-v2-feature-intro">
          <p>ONE CAREER SPACE</p>
          <h2>Made for your<br />next move.</h2>
        </article>
        {featureCards.map(([Icon, title, copy, tone]) => <article className="landing-v2-feature" key={title}>
          <span className={`landing-v2-feature-icon ${tone}`}><Icon size={20} /></span>
          <div><h3>{title}</h3><p>{copy}</p></div>
        </article>)}
      </section>

      <section className="landing-v2-journey" id="how-it-works">
        <div className="landing-v2-journey-heading">
          <p className="landing-v2-eyebrow">HOW IT WORKS</p>
          <h2>One clear place to<br /><span>move forward.</span></h2>
          <p>Keep the important parts of your career journey connected, from your first profile detail to your next application.</p>
        </div>
        <div className="landing-v2-step-list">
          {journeySteps.map(([number, title, copy]) => <article key={number}>
            <b>{number}</b><div><h3>{title}</h3><p>{copy}</p></div><ArrowRight size={18} />
          </article>)}
        </div>
      </section>

      <section className="landing-v2-cta">
        <div><p>START WITH YOUR NEXT STEP</p><h2>Your future deserves focus.</h2><span>Create your free workspace and build momentum at your own pace.</span></div>
        <Button className="landing-v2-primary" onClick={() => go("/register")}>Get started for free <ArrowRight size={16} /></Button>
      </section>

      <section className="landing-v2-embedded community-v2" id="community">
        <section className="community-v2-hero">
          <div className="community-v2-copy">
            <p className="community-v2-kicker"><span>03</span> BETTER, TOGETHER</p>
            <h1>Your people.<br />Your pace.<br /><em>Your next chapter.</em></h1>
            <p>Find students who get the journey. Share a question, make a connection, and keep each other moving.</p>
            <Button className="community-v2-button" onClick={() => go("/login/student")}>Find your community <ArrowRight size={16} /></Button>
          </div>
          <div className="community-v2-visual" aria-label="Community connections preview">
            <i className="community-v2-orbit one" aria-hidden="true" /><i className="community-v2-orbit two" aria-hidden="true" />
            <article className="community-v2-connection"><span className="community-v2-icon blue"><Users size={27} /></span><div><b>A shared ambition.<br />A new connection.</b><small>Find your people on CareerForge</small></div><i>✓</i></article>
            <article className="community-v2-conversation"><p><MessageCircle size={15} /> GOOD CONVERSATIONS START HERE</p><h2>What are you<br />working toward?</h2><span>Connect. Share. Grow.</span><b>✓</b></article>
            <article className="community-v2-resource"><span className="community-v2-icon coral"><BookOpen size={23} /></span><div><b>A little inspiration goes a long way.</b><small>Explore learning resources &amp; events</small></div><ArrowRight size={22} /></article>
          </div>
        </section>
      </section>

      <section className="landing-v2-embedded resources-v2" id="resources">
        <section className="resources-v2-shell">
          <header className="resources-v2-heading">
            <div><p className="resources-v2-kicker"><span>04</span> KEEP MOVING, WITH CLARITY</p><h1>Resources for the<br /><em>road ahead.</em></h1></div>
            <p>Useful guides, learning paths and campus opportunities—all collected in one calm place.</p>
          </header>
          <section className="resources-v2-cards" aria-label="CareerForge resources">
            <article className="resources-v2-card"><span className="resources-v2-icon"><BookOpen size={23} /></span><p>LEARNING LIBRARY</p><h2>Build the skills your next role needs.</h2><div>Explore focused resources that make each next learning step easier to choose.</div></article>
            <article className="resources-v2-card"><span className="resources-v2-icon"><FileText size={23} /></span><p>CAREER GUIDES</p><h2>Turn questions into a practical plan.</h2><div>Save useful career guidance, then return to it whenever you are ready.</div></article>
            <article className="resources-v2-cta"><p>ONE PLACE. EVERY NEXT STEP.</p><h2>Ready when<br />you are.</h2><span>See the full collection of learning resources and events.</span><Button className="resources-v2-open" onClick={() => go("/login/student")}>Open resource library <ArrowRight size={16} /></Button></article>
          </section>
        </section>
      </section>
    </div>
  </main>;
}

function ResourcesLanding({ go }) {
  const cards = [
    [BookOpen, "LEARNING LIBRARY", "Build the skills your next role needs.", "Explore focused resources that make each next learning step easier to choose."],
    [FileText, "CAREER GUIDES", "Turn questions into a practical plan.", "Save useful career guidance, then return to it whenever you are ready."],
  ];
  return <main className="resources-v2">
    <section className="resources-v2-shell">
      <header className="resources-v2-heading">
        <div>
          <p className="resources-v2-kicker"><span>04</span> KEEP MOVING, WITH CLARITY</p>
          <h1>Resources for the<br /><em>road ahead.</em></h1>
        </div>
        <p>Useful guides, learning paths and campus opportunities—all collected in one calm place.</p>
      </header>
      <section className="resources-v2-cards" aria-label="CareerForge resources">
        {cards.map(([Icon, eyebrow, title, copy]) => <article className="resources-v2-card" key={eyebrow}>
          <span className="resources-v2-icon"><Icon size={23} /></span>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
          <div>{copy}</div>
        </article>)}
        <article className="resources-v2-cta">
          <p>ONE PLACE. EVERY NEXT STEP.</p>
          <h2>Ready when<br />you are.</h2>
          <span>See the full collection of learning resources and events.</span>
          <Button className="resources-v2-open" onClick={() => go("/login/student")}>Open resource library <ArrowRight size={16} /></Button>
        </article>
      </section>
    </section>
  </main>;
}

function CommunityLanding({ go }) {
  return <main className="community-v2">
    <div className="community-v2-topline" aria-hidden="true" />
    <section className="community-v2-hero">
      <div className="community-v2-copy">
        <p className="community-v2-kicker"><span>03</span> BETTER, TOGETHER</p>
        <h1>Your people.<br />Your pace.<br /><em>Your next chapter.</em></h1>
        <p>Find students who get the journey. Share a question, make a connection, and keep each other moving.</p>
        <Button className="community-v2-button" onClick={() => go("/login/student")}>Find your community <ArrowRight size={16} /></Button>
      </div>
      <div className="community-v2-visual" aria-label="Community connections preview">
        <i className="community-v2-orbit one" aria-hidden="true" /><i className="community-v2-orbit two" aria-hidden="true" />
        <article className="community-v2-connection">
          <span className="community-v2-icon blue"><Users size={27} /></span>
          <div><b>A shared ambition.<br />A new connection.</b><small>Find your people on CareerForge</small></div>
          <i>✓</i>
        </article>
        <article className="community-v2-conversation">
          <p><MessageCircle size={15} /> GOOD CONVERSATIONS START HERE</p>
          <h2>What are you<br />working toward?</h2>
          <span>Connect. Share. Grow.</span><b>✓</b>
        </article>
        <article className="community-v2-resource">
          <span className="community-v2-icon coral"><BookOpen size={23} /></span>
          <div><b>A little inspiration goes a long way.</b><small>Explore learning resources &amp; events</small></div>
          <ArrowRight size={22} />
        </article>
      </div>
    </section>
  </main>;
}

function Login({ role, register, go }) {
  const admin = role === "admin"; const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [submitting, setSubmitting] = useState(false);
  async function submit(event) { event.preventDefault(); setSubmitting(true); setMessage(""); try { const response = await fetch(`${API_BASE_URL}${register ? "/auth/register" : "/auth/login"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(register ? { name: name.trim(), email: email.trim(), password } : { email: email.trim(), password, role: admin ? "admin" : "student" }) }); const body = await responseBody(response); localStorage.setItem("careerforge_session", JSON.stringify(body)); go(`/${body.role}/overview`); } catch (error) { setMessage(error.message || "Unable to sign in."); } finally { setSubmitting(false); } }
  return <main className="auth-page"><button className="back" onClick={() => go("/")}>Back to CareerForge</button><section className="auth-card"><div className="auth-panel"><Brand onClick={() => go("/")} /><p className="eyebrow"><Target size={14} /> {admin ? "Operations workspace" : "Your career workspace"}</p><h1>{admin ? "Keep the platform moving." : "Make progress feel possible."}</h1><p>{admin ? "Create, edit, publish, and close real job opportunities." : "Keep your education, goals, and professional story in one place."}</p><div className="auth-orb" /></div><form className="auth-form" onSubmit={submit}><p className="form-label">{register ? "Student registration" : admin ? "Administrator sign in" : "Student sign in"}</p><h2>{register ? "Create your account" : "Welcome back"}</h2>{register && <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>}<label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label>Password<input type="password" minLength="8" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>{message && <p className="form-error">{message}</p>}<Button type="submit" disabled={submitting}>{submitting ? "Please wait..." : register ? "Create account" : "Continue"}<ArrowRight size={16} /></Button>{register ? <button className="text-button" type="button" onClick={() => go("/login/student")}>Already have an account? Sign in</button> : <><button className="text-button" type="button" onClick={() => go(admin ? "/login/student" : "/login/admin")}>Switch to {admin ? "student" : "admin"} sign in</button>{!admin && <button className="text-button" type="button" onClick={() => go("/register")}>New student? Create an account</button>}</>}</form></section></main>;
}

function StudentProfile() {
  const current = getSession(); const [profile, setProfile] = useState(blankProfile); const [notice, setNotice] = useState(""); const [saving, setSaving] = useState(false); const [uploadingPhoto, setUploadingPhoto] = useState(false); const [loading, setLoading] = useState(true);
  useEffect(() => { if (!current?.id) { setNotice("Please sign in again."); setLoading(false); return; } fetch(`${API_BASE_URL}/profiles/${current.id}`, { headers: { "X-User-Id": current.id } }).then(responseBody).then((body) => setProfile({ ...blankProfile, ...body, profilePhotoUrl: body.profilePhotoUrl?.startsWith("/") ? `${API_BASE_URL}${body.profilePhotoUrl}` : body.profilePhotoUrl, graduationYear: body.graduationYear || "", experienceYears: body.experienceYears ?? "" })).catch((e) => setNotice(e.message)).finally(() => setLoading(false)); }, []);
  const change = (event) => setProfile({ ...profile, [event.target.name]: event.target.value });
  const completedFields = [profile.university, profile.degree, profile.graduationYear, profile.experienceYears, profile.targetRole, profile.location, profile.skills, profile.hobbies, profile.bio].filter((value) => typeof value === "string" ? value.trim() : value !== null && value !== undefined).length; const completion = Math.round((completedFields / 9) * 100);
  useEffect(() => { if (loading) return undefined; const avatar = document.querySelector(".profile-avatar-preview"); if (!avatar || avatar.querySelector(".avatar-photo-picker")) return undefined; const picker = document.createElement("input"); picker.className = "avatar-photo-picker"; picker.type = "file"; picker.accept = "image/png,image/jpeg,image/webp"; picker.disabled = uploadingPhoto; picker.setAttribute("aria-label", uploadingPhoto ? "Profile photo is uploading" : profile.profilePhotoUrl ? "Change profile photo" : "Add profile photo"); picker.addEventListener("change", uploadPhoto); const openPicker = () => { if (!uploadingPhoto) picker.click(); }; const hint = document.createElement("span"); hint.className = "avatar-photo-hint"; hint.textContent = uploadingPhoto ? "Uploading" : profile.profilePhotoUrl ? "Change" : "Add"; avatar.appendChild(picker); avatar.appendChild(hint); avatar.addEventListener("click", openPicker); return () => { avatar.removeEventListener("click", openPicker); picker.remove(); hint.remove(); }; }, [loading, profile.profilePhotoUrl, uploadingPhoto]);
  async function uploadPhoto(event) { const photo = event.target.files?.[0]; if (!photo || uploadingPhoto) return; setUploadingPhoto(true); setNotice(""); try { const form = new FormData(); form.append("photo", photo); const response = await fetch(`${API_BASE_URL}/profiles/${current.id}/photo`, { method: "POST", headers: { "X-User-Id": current.id }, body: form }); const body = await responseBody(response); setProfile({ ...blankProfile, ...body, profilePhotoUrl: body.profilePhotoUrl?.startsWith("/") ? `${API_BASE_URL}${body.profilePhotoUrl}` : body.profilePhotoUrl, graduationYear: body.graduationYear || "", experienceYears: body.experienceYears ?? "" }); setNotice("Profile photo uploaded successfully."); } catch (e) { setNotice(e.message); } finally { event.target.value = ""; setUploadingPhoto(false); } }
  async function save(event) { event.preventDefault(); if (uploadingPhoto) return setNotice("Wait for the profile photo upload to finish before saving."); setSaving(true); setNotice(""); try { const response = await fetch(`${API_BASE_URL}/profiles/${current.id}`, { method: "PUT", headers: { "Content-Type": "application/json", "X-User-Id": current.id }, body: JSON.stringify({ ...profile, profilePhotoUrl: profile.profilePhotoUrl?.startsWith(`${API_BASE_URL}/profiles/`) ? `/profiles/${current.id}/photo` : profile.profilePhotoUrl, graduationYear: profile.graduationYear ? Number(profile.graduationYear) : null, experienceYears: profile.experienceYears === "" || profile.experienceYears == null ? null : Number(profile.experienceYears) }) }); const body = await responseBody(response); setProfile({ ...blankProfile, ...body, profilePhotoUrl: body.profilePhotoUrl?.startsWith("/") ? `${API_BASE_URL}${body.profilePhotoUrl}` : body.profilePhotoUrl, graduationYear: body.graduationYear || "", experienceYears: body.experienceYears ?? "" }); setNotice("Profile saved successfully."); } catch (e) { setNotice(e.message); } finally { setSaving(false); } }
  return <section className="profile-page"><header className="profile-hero"><div className="profile-identity"><div className="profile-avatar-preview">{profile.profilePhotoUrl ? <img src={profile.profilePhotoUrl} alt="Profile preview" /> : current?.name?.slice(0, 1)?.toUpperCase() || "S"}</div><div><p className="eyebrow"><CircleUserRound size={14} /> YOUR PROFESSIONAL IDENTITY</p><h2>{current?.name || "Build your professional profile"}</h2><p>Give employers a clear picture of your education, direction, and strengths.</p></div></div><div className="profile-completion"><div><b>{loading ? "—" : `${completion}%`}</b><span>profile complete</span></div><i><em style={{ width: `${completion}%` }} /></i><small>{completedFields} of 9 profile details added</small></div></header><form className="data-form profile-form" onSubmit={save}><div className="profile-account-card"><div><span><b>{current?.name || "Your account"}</b><small>Account name</small></span><span><b>{current?.email || "Sign in to load email"}</b><small>Email address</small></span></div><p><ShieldCheck size={16} /> Your profile is private to your CareerForge workspace.</p></div><section className="profile-field-section"><div className="profile-section-title"><span>01</span><div><h3>Academic background</h3><p>Share the study details that frame your current stage.</p></div></div><div className="form-grid"><label>University<input name="university" value={profile.university || ""} onChange={change} /></label><label>Degree / programme<input name="degree" value={profile.degree || ""} onChange={change} /></label><label>Graduation year<input name="graduationYear" value={profile.graduationYear || ""} onChange={change} type="number" min="2000" max="2100" /></label><label>Experience (years)<input name="experienceYears" value={profile.experienceYears ?? ""} onChange={change} type="number" min="0" max="60" /></label></div></section><section className="profile-field-section"><div className="profile-section-title"><span>02</span><div><h3>Career direction</h3><p>Use a target role and location to keep your job search focused.</p></div></div><div className="form-grid"><label>Target role<input name="targetRole" value={profile.targetRole || ""} onChange={change} /></label><label>Location<input name="location" value={profile.location || ""} onChange={change} /></label><label>Profile photo URL <small>(optional)</small><input name="profilePhotoUrl" value={profile.profilePhotoUrl || ""} onChange={change} /></label></div></section><section className="profile-field-section"><div className="profile-section-title"><span>03</span><div><h3>Skills &amp; interests</h3><p>Add the strengths and interests you want employers to see at a glance.</p></div></div><div className="form-grid profile-details-grid"><label>Skills <small>Separate skills with commas</small><textarea name="skills" value={profile.skills || ""} onChange={change} rows="3" /></label><label>Hobbies &amp; interests <small>What do you enjoy beyond coursework?</small><textarea name="hobbies" value={profile.hobbies || ""} onChange={change} rows="3" /></label></div></section><section className="profile-field-section bio-section"><div className="profile-section-title"><span>04</span><div><h3>Professional summary</h3><p>In 2–4 sentences, mention your interests, projects, strengths, and direction.</p></div></div><label className="full-field">Short professional bio<textarea name="bio" value={profile.bio || ""} onChange={change} rows="5" maxLength="500" /></label><small className="bio-count">{(profile.bio || "").length}/500 characters</small></section>{notice && <p className={notice.includes("success") ? "form-success" : "form-error"}>{notice}</p>}<footer className="profile-save-row"><div><b>Ready to save?</b><small>Your dashboard updates from these details.</small></div><Button type="submit" disabled={saving || loading}><Save size={15} />{saving ? "Saving..." : loading ? "Loading..." : "Save profile"}</Button></footer></form></section>;
}

function CareerVault() {
  const current = getSession(); const [resumes, setResumes] = useState([]); const [documents, setDocuments] = useState([]); const [resumeId, setResumeId] = useState(null); const [title, setTitle] = useState("My professional CV"); const [content, setContent] = useState({ ...blankResumeContent, fullName: current?.name || "", email: current?.email || "" }); const [skillDraft, setSkillDraft] = useState(""); const [projectDraft, setProjectDraft] = useState({ title: "", description: "" }); const [notice, setNotice] = useState(""); const [saving, setSaving] = useState(false); const headers = { "Content-Type": "application/json", "X-User-Id": current?.id || "" };
  const load = () => { if (!current?.id) return setNotice("Please sign in again."); Promise.all([fetch(`${API_BASE_URL}/vault/resumes`, { headers }).then(responseBody), fetch(`${API_BASE_URL}/vault/documents`, { headers }).then(responseBody)]).then(([resumeItems, documentItems]) => { setResumes(resumeItems); setDocuments(documentItems); }).catch((e) => setNotice(e.message)); };
  useEffect(() => { load(); }, []);
  function editResume(resume) { setResumeId(resume.id); setTitle(resume.title); setContent({ ...blankResumeContent, ...resume.content }); setSkillDraft(""); setProjectDraft({ title: "", description: "" }); setNotice(""); }
  function newResume() { setResumeId(null); setTitle("My professional CV"); setContent({ ...blankResumeContent, fullName: current?.name || "", email: current?.email || "" }); setSkillDraft(""); setProjectDraft({ title: "", description: "" }); setNotice(""); }
  const change = (event) => setContent({ ...content, [event.target.name]: event.target.value });
  const skillItems = String(content.skills || "").split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
  const projectItems = String(content.projects || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean).map((item) => { const [, name, description = ""] = item.match(/^(.*?)\s(?:\||—|-)\s(.*)$/) || ["", item, ""]; return { name: name.trim(), description: description.trim() }; });
  const saveSkills = (items) => setContent((currentContent) => ({ ...currentContent, skills: items.join(", ") }));
  const saveProjects = (items) => setContent((currentContent) => ({ ...currentContent, projects: items.map((item) => `${item.name}${item.description ? ` | ${item.description}` : ""}`).join("\n") }));
  const addSkill = () => { const additions = skillDraft.split(/[\n,]/).map((item) => item.trim()).filter(Boolean); if (!additions.length) return; saveSkills([...skillItems, ...additions.filter((item) => !skillItems.some((skill) => skill.toLowerCase() === item.toLowerCase()))]); setSkillDraft(""); };
  const removeSkill = (index) => saveSkills(skillItems.filter((_, itemIndex) => itemIndex !== index));
  const addProject = () => { const project = { title: projectDraft.title.trim(), description: projectDraft.description.trim() }; if (!project.title) { setNotice("Add a project name first."); return; } saveProjects([...projectItems, { name: project.title, description: project.description }]); setProjectDraft({ title: "", description: "" }); setNotice(""); };
  const removeProject = (index) => saveProjects(projectItems.filter((_, itemIndex) => itemIndex !== index));
  async function saveResume(event) { event.preventDefault(); setSaving(true); setNotice(""); try { const response = await fetch(`${API_BASE_URL}/vault/resumes${resumeId ? `/${resumeId}` : ""}`, { method: resumeId ? "PUT" : "POST", headers, body: JSON.stringify({ title, content, isDefault: resumes.length === 0 }) }); const saved = await responseBody(response); setResumeId(saved.id); setNotice("Resume version saved."); load(); } catch (e) { setNotice(e.message); } finally { setSaving(false); } }
  async function makeDefault(id) { try { await responseBody(await fetch(`${API_BASE_URL}/vault/resumes/${id}/default`, { method: "PUT", headers })); setNotice("Default CV updated."); load(); } catch (e) { setNotice(e.message); } }
  async function removeResume(id) { if (!window.confirm("Delete this resume version?")) return; try { await responseBody(await fetch(`${API_BASE_URL}/vault/resumes/${id}`, { method: "DELETE", headers })); if (resumeId === id) newResume(); setNotice("Resume version deleted."); load(); } catch (e) { setNotice(e.message); } }
  async function upload(event) { const file = event.target.files?.[0]; if (!file) return; setNotice(""); const form = new FormData(); form.append("file", file); try { await responseBody(await fetch(`${API_BASE_URL}/vault/documents`, { method: "POST", headers: { "X-User-Id": current.id }, body: form })); setNotice("Document uploaded."); event.target.value = ""; load(); } catch (e) { setNotice(e.message); } }
  async function download(document) { try { const response = await fetch(`${API_BASE_URL}/vault/documents/${document.id}/download`, { headers: { "X-User-Id": current.id } }); if (!response.ok) throw new Error("Unable to download this document."); const url = URL.createObjectURL(await response.blob()); const link = window.document.createElement("a"); link.href = url; link.download = document.fileName; link.click(); URL.revokeObjectURL(url); } catch (e) { setNotice(e.message); } }
  async function removeDocument(id) { if (!window.confirm("Delete this uploaded document?")) return; try { await responseBody(await fetch(`${API_BASE_URL}/vault/documents/${id}`, { method: "DELETE", headers })); setNotice("Document deleted."); load(); } catch (e) { setNotice(e.message); } }
  function importPrevious() { try { const key = Object.keys(localStorage).find((item) => item.startsWith("careerforge_cv_")); if (!key) throw new Error("No previous CV Maker data was found in this browser."); const old = JSON.parse(localStorage.getItem(key)); setContent({ ...blankResumeContent, fullName: old.name || current?.name || "", email: old.email || current?.email || "", phone: old.phone || "", location: old.location || "", headline: old.title || "", summary: old.summary || "", skills: old.skills || "", education: Array.isArray(old.education) ? old.education.map((item) => typeof item === "string" ? item : `${item.school || item.institution || ""} ${item.degree || ""}`.trim()).join("\n") : old.education || "", experience: Array.isArray(old.experiences) ? old.experiences.map((item) => typeof item === "string" ? item : `${item.role || item.title || ""} ${item.company || ""}`.trim()).join("\n") : old.experience || "", projects: Array.isArray(old.projects) ? old.projects.map((item) => typeof item === "string" ? item : `${item.name || item.title || ""} ${item.description || ""}`.trim()).join("\n") : old.projects || "" }); setTitle(old.title ? `${old.title} CV` : "Imported CV"); setResumeId(null); setNotice("Previous CV Maker data imported. Review it and save a new version."); } catch (e) { setNotice(e.message); } }
  async function importJson(event) { const file = event.target.files?.[0]; if (!file) return; try { const old = JSON.parse(await file.text()); setContent({ ...blankResumeContent, ...old }); setTitle(old.title || "Imported CV"); setResumeId(null); setNotice("CV JSON imported. Review it and save a new version."); } catch { setNotice("That file is not valid CV JSON data."); } finally { event.target.value = ""; } }
  return (
    <section className="vault-page">
      <div className="content-intro compact">
        <div>
          <p className="eyebrow"><FileText size={14} /> Career Vault</p>
          <h2>Build, keep, and select your CV.</h2>
          <p>Create tailored CV versions or upload an existing PDF, DOC, or DOCX from your PC. Your selected CV is used when you apply for a job.</p>
        </div>
        <div className="vault-import">
          <Button className="quiet" type="button" onClick={importPrevious}>Import previous CV</Button>
          <label className="import-file">Import CV JSON<input type="file" accept="application/json,.json" onChange={importJson} /></label>
        </div>
      </div>
      {notice && <p className={/(saved|updated|uploaded|deleted|imported)/.test(notice) ? "form-success" : "form-error"}>{notice}</p>}
      <div className="vault-layout">
        <div className="vault-editor">
          <form className="data-form" onSubmit={saveResume}>
            <div className="form-row-title"><h3>{resumeId ? "Edit resume version" : "Create a resume version"}</h3><button type="button" className="text-button" onClick={newResume}>New version</button></div>
            <label>Version name<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
            <div className="form-grid">
              <label>Full name<input name="fullName" value={content.fullName} onChange={change} /></label>
              <label>Email<input name="email" type="email" value={content.email} onChange={change} /></label>
              <label>Phone<input name="phone" value={content.phone} onChange={change} /></label>
              <label>Location<input name="location" value={content.location} onChange={change} /></label>
              <label className="full-field">Professional headline<input name="headline" value={content.headline} onChange={change} /></label>
            </div>
            <label className="full-field">Professional summary<textarea name="summary" rows="4" value={content.summary} onChange={change} /></label>
            <div className="vault-item-builder full-field">
              <div className="vault-item-heading"><label>Skills <small>Add one or several skills</small></label><span>{skillItems.length} added</span></div>
              <div className="vault-item-composer">
                <input value={skillDraft} onChange={(event) => setSkillDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addSkill(); } }} />
                <button type="button" onClick={addSkill} disabled={!skillDraft.trim()}><Plus size={15} /> Add skill</button>
              </div>
              {skillItems.length ? <div className="vault-chip-list">{skillItems.map((skill, index) => <span key={skill + "-" + index}>{skill}<button type="button" onClick={() => removeSkill(index)} aria-label={"Remove " + skill}><Trash2 size={12} /></button></span>)}</div> : <p className="vault-empty-copy">Add the skills you want employers to see.</p>}
            </div>
            <label className="full-field">Education <small>(one item per line)</small><textarea name="education" rows="3" value={content.education} onChange={change} /></label>
            <label className="full-field">Experience <small>(one item per line)</small><textarea name="experience" rows="3" value={content.experience} onChange={change} /></label>
            <div className="vault-item-builder full-field">
              <div className="vault-item-heading"><label>Projects <small>Add each project with an optional description</small></label><span>{projectItems.length} added</span></div>
              <div className="vault-project-composer">
                <input value={projectDraft.title} onChange={(event) => setProjectDraft((draft) => ({ ...draft, title: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addProject(); } }} />
                <input value={projectDraft.description} onChange={(event) => setProjectDraft((draft) => ({ ...draft, description: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addProject(); } }} />
                <button type="button" onClick={addProject} disabled={!projectDraft.title.trim()}><Plus size={15} /> Add project</button>
              </div>
              {projectItems.length ? <div className="vault-project-list">{projectItems.map((project, index) => <article key={project.name + "-" + index}><div><b>{project.name}</b>{project.description && <small>{project.description}</small>}</div><button type="button" onClick={() => removeProject(index)} aria-label={"Remove " + project.name}><Trash2 size={14} /></button></article>)}</div> : <p className="vault-empty-copy">Add the projects that best show your work.</p>}
            </div>
            <Button type="submit" disabled={saving}><Save size={15} />{saving ? "Saving..." : "Save resume version"}</Button>
            <Button className="quiet print-button" type="button" onClick={() => window.print()}>Print / Save as PDF</Button>
          </form>
        </div>
        <aside className="cv-preview">
          <p className="eyebrow">Live preview</p>
          <h2>{content.fullName || "Your name"}</h2>
          <h3>{content.headline || "Professional headline"}</h3>
          <p>{[content.email, content.phone, content.location].filter(Boolean).join(" · ")}</p>
          {content.summary && <section><b>Profile</b><p>{content.summary}</p></section>}
          {skillItems.length > 0 && <section><b>Skills</b><div className="cv-skill-list">{skillItems.map((skill) => <span key={skill}>{skill}</span>)}</div></section>}
          {content.education && <section><b>Education</b><p className="lines">{content.education}</p></section>}
          {content.experience && <section><b>Experience</b><p className="lines">{content.experience}</p></section>}
          {projectItems.length > 0 && <section><b>Projects</b><div className="cv-project-list">{projectItems.map((project, index) => <article key={project.name + "-" + index}><strong>{project.name}</strong>{project.description && <p>{project.description}</p>}</article>)}</div></section>}
        </aside>
      </div>
      <section className="vault-assets">
        <div className="content-card">
          <div className="list-heading"><h3>Saved resume versions</h3><span>{resumes.length} total</span></div>
          {resumes.length ? resumes.map((resume) => <article className="vault-row" key={resume.id}><div><b>{resume.title}</b><small>{resume.isDefault ? "Default CV" : "Resume version"}</small></div><div className="vault-actions"><button onClick={() => editResume(resume)}>Edit</button>{!resume.isDefault && <button onClick={() => makeDefault(resume.id)}><Star size={14} /> Set default</button>}<button className="danger" onClick={() => removeResume(resume.id)}><Trash2 size={14} /></button></div></article>) : <p className="muted">No resume version saved yet.</p>}
        </div>
        <div className="content-card">
          <div className="list-heading"><h3>Uploaded CVs and documents</h3><label className="upload-button"><Upload size={14} /> Upload file<input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={upload} /></label></div>
          <p className="upload-help">PDF, DOC, or DOCX · maximum 5 MB · stored locally in this project.</p>
          {documents.length ? documents.map((document) => <article className="vault-row" key={document.id}><div><b>{document.fileName}</b><small>{Math.ceil(document.fileSizeBytes / 1024)} KB · {document.contentType}</small></div><div className="vault-actions"><button onClick={() => download(document)}><Download size={14} /> Download</button><button className="danger" onClick={() => removeDocument(document.id)}><Trash2 size={14} /></button></div></article>) : <p className="muted">No CV or document uploaded yet.</p>}
        </div>
      </section>
    </section>
  );
  return <section className="vault-page"><div className="content-intro compact"><div><p className="eyebrow"><FileText size={14} /> Career Vault</p><h2>Build, keep, and select your CV.</h2><p>Create tailored CV versions or upload an existing PDF, DOC, or DOCX from your PC. Your selected CV is used when you apply for a job.</p></div><div className="vault-import"><Button className="quiet" type="button" onClick={importPrevious}>Import previous CV</Button><label className="import-file">Import CV JSON<input type="file" accept="application/json,.json" onChange={importJson} /></label></div></div>{notice && <p className={/(saved|updated|uploaded|deleted|imported)/.test(notice) ? "form-success" : "form-error"}>{notice}</p>}<div className="vault-layout"><div className="vault-editor"><form className="data-form" onSubmit={saveResume}><div className="form-row-title"><h3>{resumeId ? "Edit resume version" : "Create a resume version"}</h3><button type="button" className="text-button" onClick={newResume}>New version</button></div><label>Version name<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label><div className="form-grid"><label>Full name<input name="fullName" value={content.fullName} onChange={change} /></label><label>Email<input name="email" type="email" value={content.email} onChange={change} /></label><label>Phone<input name="phone" value={content.phone} onChange={change} /></label><label>Location<input name="location" value={content.location} onChange={change} /></label><label className="full-field">Professional headline<input name="headline" value={content.headline} onChange={change} /></label></div><label className="full-field">Professional summary<textarea name="summary" rows="4" value={content.summary} onChange={change} /></label><label className="full-field">Skills <small>(comma separated)</small><textarea name="skills" rows="2" value={content.skills} onChange={change} /></label><label className="full-field">Education <small>(one item per line)</small><textarea name="education" rows="3" value={content.education} onChange={change} /></label><label className="full-field">Experience <small>(one item per line)</small><textarea name="experience" rows="3" value={content.experience} onChange={change} /></label><label className="full-field">Projects <small>(one item per line)</small><textarea name="projects" rows="3" value={content.projects} onChange={change} /></label><Button type="submit" disabled={saving}><Save size={15} />{saving ? "Saving..." : "Save resume version"}</Button><Button className="quiet print-button" type="button" onClick={() => window.print()}>Print / Save as PDF</Button></form></div><aside className="cv-preview"><p className="eyebrow">Live preview</p><h2>{content.fullName || "Your name"}</h2><h3>{content.headline || "Professional headline"}</h3><p>{[content.email, content.phone, content.location].filter(Boolean).join(" · ")}</p>{content.summary && <section><b>Profile</b><p>{content.summary}</p></section>}{content.skills && <section><b>Skills</b><p>{content.skills}</p></section>}{content.education && <section><b>Education</b><p className="lines">{content.education}</p></section>}{content.experience && <section><b>Experience</b><p className="lines">{content.experience}</p></section>}{content.projects && <section><b>Projects</b><p className="lines">{content.projects}</p></section>}</aside></div><section className="vault-assets"><div className="content-card"><div className="list-heading"><h3>Saved resume versions</h3><span>{resumes.length} total</span></div>{resumes.length ? resumes.map((resume) => <article className="vault-row" key={resume.id}><div><b>{resume.title}</b><small>{resume.isDefault ? "Default CV" : "Resume version"}</small></div><div className="vault-actions"><button onClick={() => editResume(resume)}>Edit</button>{!resume.isDefault && <button onClick={() => makeDefault(resume.id)}><Star size={14} /> Set default</button>}<button className="danger" onClick={() => removeResume(resume.id)}><Trash2 size={14} /></button></div></article>) : <p className="muted">No resume version saved yet.</p>}</div><div className="content-card"><div className="list-heading"><h3>Uploaded CVs and documents</h3><label className="upload-button"><Upload size={14} /> Upload file<input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={upload} /></label></div><p className="upload-help">PDF, DOC, or DOCX · maximum 5 MB · stored locally in this project.</p>{documents.length ? documents.map((document) => <article className="vault-row" key={document.id}><div><b>{document.fileName}</b><small>{Math.ceil(document.fileSizeBytes / 1024)} KB · {document.contentType}</small></div><div className="vault-actions"><button onClick={() => download(document)}><Download size={14} /> Download</button><button className="danger" onClick={() => removeDocument(document.id)}><Trash2 size={14} /></button></div></article>) : <p className="muted">No CV or document uploaded yet.</p>}</div></section></section>;
}

function LegacyLearningPaths() {
  const current = getSession(); const [paths, setPaths] = useState([]); const [topic, setTopic] = useState(""); const [pathType, setPathType] = useState("skill"); const [levelCount, setLevelCount] = useState(10); const [notice, setNotice] = useState(""); const [creating, setCreating] = useState(false); const [recommending, setRecommending] = useState(false); const [activeId, setActiveId] = useState(null); const [quiz, setQuiz] = useState(null); const [answers, setAnswers] = useState([]); const [result, setResult] = useState(null); const [loadingLevel, setLoadingLevel] = useState(false);
  const headers = { "Content-Type": "application/json", "X-User-Id": current?.id || "" };
  const load = async () => { if (!current?.id) return setNotice("Please sign in again."); try { const items = await responseBody(await fetch(`${API_BASE_URL}/learning-paths`, { headers })); setPaths(items); setActiveId((id) => id || items[0]?.id || null); } catch (error) { setNotice(error.message); } };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (result) window.scrollTo(0, 0); }, [result]);
  const active = paths.find((item) => item.id === activeId) || null;
  async function recommendation() { if (!topic.trim()) return setNotice(`Enter a ${pathType === "skill" ? "skill" : "job role"} first.`); setRecommending(true); setNotice(""); try { const item = await responseBody(await fetch(`${API_BASE_URL}/learning-paths/recommendation`, { method: "POST", headers, body: JSON.stringify({ topic: topic.trim(), pathType }) })); setLevelCount(item.recommendedLevels); setNotice(`Gemini recommends ${item.recommendedLevels} levels. ${item.reason}`); } catch (error) { setNotice(error.message); } finally { setRecommending(false); } }
  async function create(event) { event.preventDefault(); setCreating(true); setNotice(""); try { const item = await responseBody(await fetch(`${API_BASE_URL}/learning-paths`, { method: "POST", headers, body: JSON.stringify({ topic: topic.trim(), pathType, levelCount: Number(levelCount) }) })); setPaths((items) => [item, ...items]); setActiveId(item.id); setTopic(""); setQuiz(null); setResult(null); setNotice("Learning path created. Level 1 is ready when you are."); } catch (error) { setNotice(error.message); } finally { setCreating(false); } }
  async function deletePath(path) { if (!window.confirm(`Delete the ${path.topic} learning path and all of its progress?`)) return; setNotice(""); try { await responseBody(await fetch(`${API_BASE_URL}/learning-paths/${path.id}`, { method: "DELETE", headers })); const remaining = paths.filter((item) => item.id !== path.id); setPaths(remaining); setActiveId(remaining[0]?.id || null); setQuiz(null); setResult(null); setNotice("Learning path deleted."); } catch (error) { setNotice(error.message); } }
  async function openLevel(number) { if (!active) return; setLoadingLevel(true); setNotice(""); setResult(null); try { const item = await responseBody(await fetch(`${API_BASE_URL}/learning-paths/${active.id}/levels/${number}`, { headers })); setQuiz(item); setAnswers(Array(item.questions.length).fill(null)); } catch (error) { setNotice(error.message); } finally { setLoadingLevel(false); } }
  async function submit(event) { event.preventDefault(); if (!quiz || answers.some((answer) => answer === null)) return setNotice("Choose an answer for every question before submitting."); setLoadingLevel(true); try { const item = await responseBody(await fetch(`${API_BASE_URL}/learning-paths/${active.id}/levels/${quiz.levelNumber}/attempts`, { method: "POST", headers, body: JSON.stringify({ answers }) })); setResult(item); setQuiz(null); await load(); } catch (error) { setNotice(error.message); } finally { setLoadingLevel(false); } }
  return <section className="learning-page"><div className="content-intro learning-intro"><div><p className="eyebrow"><Target size={14} /> Gemini-powered practice</p><h2>Build a skill, one level at a time.</h2><p>Choose a skill or job role, set up to 50 levels, and pass each level with 70% before the next challenge unlocks.</p></div><span className="learning-score">70%<small>to pass</small></span></div><div className="learning-layout"><form className="data-form learning-builder" onSubmit={create}><div className="form-row-title"><h3>Create a learning path</h3><span>1–50 levels</span></div><div className="learning-type"><button type="button" className={pathType === "skill" ? "selected" : ""} onClick={() => setPathType("skill")}>Learn a skill</button><button type="button" className={pathType === "job" ? "selected" : ""} onClick={() => setPathType("job")}>Prepare for a job</button></div><label>{pathType === "skill" ? "Skill" : "Job role"}<input value={topic} onChange={(event) => setTopic(event.target.value)} required /></label><div className="level-picker"><div><b>{levelCount} levels</b><small>Level 1 starts unlocked. Every level after that needs a 70% pass.</small></div><input type="range" min="1" max="50" value={levelCount} onChange={(event) => setLevelCount(event.target.value)} /><output>{levelCount}</output></div><Button className="quiet" type="button" onClick={recommendation} disabled={recommending}>{recommending ? "Asking Gemini..." : "Ask Gemini to recommend levels"}<Target size={14} /></Button><Button type="submit" disabled={creating}>{creating ? "Creating path..." : "Create learning path"}<ArrowRight size={15} /></Button></form><aside className="learning-guide"><p className="eyebrow">How it works</p><ol><li><b>01</b><span>Choose one focused skill or a job target.</span></li><li><b>02</b><span>Gemini generates five questions only when a level unlocks.</span></li><li><b>03</b><span>Score 70% or above to open the next level.</span></li></ol></aside></div>{notice && <p className={/(created|recommends|ready|deleted)/.test(notice) ? "form-success" : "form-error"}>{notice}</p>}{result && <div className="result-modal-backdrop" role="presentation"><section className={`result-modal ${result.passed ? "passed" : "retry"}`} role="dialog" aria-modal="true" aria-labelledby="level-result-title"><header><div><p className="eyebrow">Level result</p><h3 id="level-result-title">{result.passed ? "Level passed!" : "Review and try again"}</h3></div><button type="button" className="result-close" onClick={() => setResult(null)} aria-label="Close results">×</button></header><div className="result-score"><strong>{result.percentage}%</strong><span>{result.correctAnswers} of {result.totalQuestions} correct</span></div><p className="result-message">{result.message}</p><div className="answer-review">{result.results?.map((item) => <article className={item.correct ? "correct" : "wrong"} key={item.number}><b>{item.correct ? "✓ Correct" : "× Incorrect"} · Question {item.number}</b><p>{item.prompt}</p><small>Your answer: <strong>{item.selectedAnswer}</strong></small>{!item.correct && <small>Correct answer: <strong>{item.correctAnswer}</strong></small>}<em>{item.explanation}</em></article>)}</div><Button type="button" onClick={() => setResult(null)}>{result.passed ? "Continue" : "Try this level again"}</Button></section></div>}{result && <section className={`learning-result ${result.passed ? "passed" : "retry"}`}><b>{result.passed ? "Level passed!" : "Keep practising"}</b><strong>{result.percentage}%</strong><p>{result.correctAnswers} of {result.totalQuestions} correct · {result.message}</p></section>}<section className="learning-paths"><div className="list-heading"><h3>Your learning paths</h3><span>{paths.length} active</span></div>{paths.length ? <div className="path-tabs">{paths.map((path) => <article className={`path-tab${path.id === activeId ? " active" : ""}`} key={path.id}><button onClick={() => { setActiveId(path.id); setQuiz(null); setResult(null); }}><small>{path.pathType === "job" ? "JOB TARGET" : "SKILL"}</small><b>{path.topic}</b><span>Level {Math.min(path.nextUnlockedLevel, path.levelCount)} of {path.levelCount}</span></button><button className="path-delete" type="button" onClick={() => deletePath(path)} aria-label={`Delete ${path.topic} learning path`} title="Delete learning path"><Trash2 size={14} /></button></article>)}</div> : <p className="muted">Create your first personalised path to begin.</p>}{active && !quiz && <div className="level-grid">{active.levels.map((level) => <button key={level.number} className={`learning-level ${level.status}`} disabled={level.status === "locked" || loadingLevel} onClick={() => openLevel(level.number)}><span>{level.status === "completed" ? "✓" : level.status === "locked" ? "🔒" : level.number}</span><b>Level {level.number}</b><small>{level.status === "completed" ? `${level.bestScore}% best` : level.status === "available" ? "Start challenge" : "Pass previous level"}</small></button>)}</div>}{quiz && <form className="quiz-card" onSubmit={submit}><header><button type="button" className="text-button" onClick={() => setQuiz(null)}>← Back to levels</button><p className="eyebrow">Level {quiz.levelNumber}</p><h3>{quiz.title}</h3><p>{quiz.summary}</p></header>{quiz.questions.map((question) => <fieldset key={question.index}><legend>{question.index + 1}. {question.prompt}</legend>{question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={`question-${question.index}`} checked={answers[question.index] === optionIndex} onChange={() => setAnswers((currentAnswers) => currentAnswers.map((answer, index) => index === question.index ? optionIndex : answer))} />{option}</label>)}</fieldset>)}<Button type="submit" disabled={loadingLevel}>{loadingLevel ? "Checking your answers..." : "Submit level"}<ClipboardCheck size={15} /></Button></form>}</section></section>;
}

function LearningPaths() {
  const current = getSession();
  const [paths, setPaths] = useState([]);
  const [topic, setTopic] = useState("");
  const [pathType, setPathType] = useState("skill");
  const [levelCount, setLevelCount] = useState(10);
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loadingLevel, setLoadingLevel] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerExpired, setTimerExpired] = useState(false);
  const headers = { "Content-Type": "application/json", "X-User-Id": current?.id || "" };

  const load = async () => {
    if (!current?.id) return setNotice("Please sign in again.");
    try {
      const items = await responseBody(await fetch(`${API_BASE_URL}/learning-paths`, { headers }));
      setPaths(items);
      setActiveId((id) => id || items[0]?.id || null);
    } catch (error) { setNotice(error.message); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (result) window.scrollTo({ top: 0, behavior: "smooth" }); }, [result]);
  useEffect(() => {
    if (!quiz) { setTimeLeft(null); setTimerExpired(false); return undefined; }
    setTimeLeft(Math.max(60, quiz.questions.length * 36));
    setTimerExpired(false);
    window.scrollTo(0, 0);
    const timer = window.setInterval(() => setTimeLeft((seconds) => seconds === null || seconds <= 0 ? 0 : seconds - 1), 1000);
    return () => window.clearInterval(timer);
  }, [quiz]);

  const active = paths.find((item) => item.id === activeId) || null;
  const completed = active?.levels.filter((level) => level.status === "completed") || [];
  const nextLevel = active?.levels.find((level) => level.status === "available") || null;
  const progress = active ? Math.round((completed.length / active.levelCount) * 100) : 0;
  const bestScore = completed.length ? Math.max(...completed.map((level) => level.bestScore || 0)) : 0;
  const timerText = timeLeft === null ? "" : `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;
  const timerUrgent = timeLeft !== null && timeLeft <= 60;

  async function recommendation() {
    if (!topic.trim()) return setNotice(`Enter a ${pathType === "skill" ? "skill" : "job role"} first.`);
    setRecommending(true); setNotice("");
    try {
      const item = await responseBody(await fetch(`${API_BASE_URL}/learning-paths/recommendation`, { method: "POST", headers, body: JSON.stringify({ topic: topic.trim(), pathType }) }));
      setLevelCount(item.recommendedLevels);
      setNotice(`Gemini recommends ${item.recommendedLevels} levels. ${item.reason}`);
    } catch (error) { setNotice(error.message); } finally { setRecommending(false); }
  }

  async function create(event) {
    event.preventDefault(); setCreating(true); setNotice("");
    try {
      const item = await responseBody(await fetch(`${API_BASE_URL}/learning-paths`, { method: "POST", headers, body: JSON.stringify({ topic: topic.trim(), pathType, levelCount: Number(levelCount) }) }));
      setPaths((items) => [item, ...items]); setActiveId(item.id); setTopic(""); setQuiz(null); setResult(null); setComposerOpen(false);
      setNotice("Learning path created. Level 1 is ready when you are.");
    } catch (error) { setNotice(error.message); } finally { setCreating(false); }
  }

  async function deletePath(path) {
    if (!window.confirm(`Delete the ${path.topic} learning path and all of its progress?`)) return;
    setNotice("");
    try {
      await responseBody(await fetch(`${API_BASE_URL}/learning-paths/${path.id}`, { method: "DELETE", headers }));
      const remaining = paths.filter((item) => item.id !== path.id);
      setPaths(remaining); setActiveId(remaining[0]?.id || null); setQuiz(null); setResult(null);
      setNotice("Learning path deleted.");
    } catch (error) { setNotice(error.message); }
  }

  async function openLevel(number) {
    if (!active) return;
    setLoadingLevel(true); setNotice(""); setResult(null);
    try {
      const item = await responseBody(await fetch(`${API_BASE_URL}/learning-paths/${active.id}/levels/${number}`, { headers }));
      setQuiz(item); setAnswers(Array(item.questions.length).fill(null));
    } catch (error) { setNotice(error.message); } finally { setLoadingLevel(false); }
  }

  async function submit(event, timedOut = false) {
    event?.preventDefault();
    if (!quiz || (!timedOut && answers.some((answer) => answer === null))) return setNotice("Choose an answer for every question before submitting.");
    setLoadingLevel(true);
    try {
      const submittedAnswers = timedOut ? answers.map((answer) => answer === null ? -1 : answer) : answers;
      const item = await responseBody(await fetch(`${API_BASE_URL}/learning-paths/${active.id}/levels/${quiz.levelNumber}/attempts`, { method: "POST", headers, body: JSON.stringify({ answers: submittedAnswers }) }));
      setResult(item); setQuiz(null); await load();
    } catch (error) { setNotice(error.message); } finally { setLoadingLevel(false); }
  }

  useEffect(() => {
    if (timeLeft !== 0 || !quiz || loadingLevel || timerExpired) return;
    setTimerExpired(true);
    submit(null, true);
  }, [timeLeft, quiz, loadingLevel, timerExpired]);

  if (result) return <section className="assessment-result-page">
    <header className="assessment-result-head">
      <div><p className="eyebrow">Level result</p><h2>{result.passed ? "Level passed!" : "Review and try again"}</h2><p>{result.message}</p></div>
      <button type="button" className="assessment-back" onClick={() => setResult(null)}>← Back to assessments</button>
    </header>
    <section className={`assessment-result-summary ${result.passed ? "passed" : "retry"}`}>
      <div className="result-ring" style={{ "--result-progress": `${result.percentage * 3.6}deg` }}><strong>{result.percentage}%</strong><span>score</span></div>
      <div><p className="eyebrow">Your outcome</p><h3>{result.correctAnswers} of {result.totalQuestions} correct</h3><p>{result.passed ? "Great work — your next level is now unlocked." : "You need 70% to unlock the next level. Review the answers and come back stronger."}</p></div>
      <span className="result-status">{result.passed ? "Level unlocked" : "Try again"}</span>
    </section>
    <section className="answer-review-panel"><div className="review-panel-heading"><div><p className="eyebrow">Answer review</p><h3>Learn from this attempt</h3></div><span>{result.totalQuestions} questions</span></div><div className="answer-review">{result.results?.map((item) => <article className={item.correct ? "correct" : "wrong"} key={item.number}><div className="review-status">{item.correct ? "✓ Correct" : "× Needs review"}<span>Question {item.number}</span></div><p>{item.prompt}</p><small>Your answer: <strong>{item.selectedAnswer}</strong></small>{!item.correct && <small>Correct answer: <strong>{item.correctAnswer}</strong></small>}<em>{item.explanation}</em></article>)}</div><Button onClick={() => setResult(null)}>{result.passed ? "Continue journey" : "Try this level again"}<ArrowRight size={15} /></Button></section>
  </section>;

  if (quiz) return <section className="assessment-quiz-page">
    <form className="quiz-card" onSubmit={submit}>
      <header><button type="button" className="assessment-back" onClick={() => setQuiz(null)}>← Back to levels</button><p className="eyebrow">Level {quiz.levelNumber} assessment</p><h2>{quiz.title}</h2><p>{quiz.summary}</p><div className="quiz-progress"><span>Answer every question</span><b>{answers.filter((answer) => answer !== null).length} / {quiz.questions.length} answered</b></div><div className={`quiz-timer${timerUrgent ? " urgent" : ""}`} aria-live="polite"><span>Time left</span><strong>{timerText}</strong><small>{quiz.questions.length} questions · {Math.ceil((quiz.questions.length * 36) / 60)} min limit</small></div></header>
      <div className="quiz-questions">{quiz.questions.map((question) => <section className="quiz-question" key={question.index}><p className="quiz-question-title"><span>{question.index + 1}</span>{question.prompt}</p><div>{question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={`question-${question.index}`} checked={answers[question.index] === optionIndex} onChange={() => setAnswers((currentAnswers) => currentAnswers.map((answer, index) => index === question.index ? optionIndex : answer))} /><i>{String.fromCharCode(65 + optionIndex)}</i><span>{option}</span></label>)}</div></section>)}</div>
      <footer><p>Pass mark <b>70%</b></p><Button type="submit" disabled={loadingLevel}>{loadingLevel ? "Checking your answers..." : "Submit assessment"}<ClipboardCheck size={15} /></Button></footer>
    </form>
  </section>;

  return <section className="assessment-dashboard">
    <header className="student-page-heading"><p>MY CAREERFORGE</p><h2>Skill assessments</h2><span>Measure what you know and make the next learning step obvious.</span></header>
    <section className="assessment-hero">
      <div className="assessment-hero-copy"><p className="eyebrow"><Target size={14} /> Gemini-powered practice</p><h2>{active ? `${active.topic} learning journey` : "Build a skill, one level at a time."}</h2><p>{active ? `You have completed ${completed.length} of ${active.levelCount} levels. Keep the momentum going with the next focused challenge.` : "Create a focused learning path, then unlock each level by scoring 70% or above."}</p><div className="hero-actions">{nextLevel ? <Button type="button" onClick={() => openLevel(nextLevel.number)} disabled={loadingLevel}>{loadingLevel ? "Preparing questions..." : `Continue level ${nextLevel.number}`}<ArrowRight size={15} /></Button> : <Button type="button" onClick={() => setComposerOpen(true)}>Create a learning path <ArrowRight size={15} /></Button>}<button type="button" className="hero-link" onClick={() => setComposerOpen(true)}>+ New path</button></div></div>
      <div className="journey-visual"><div className="journey-ring" style={{ "--journey-progress": `${Math.max(progress, 4) * 3.6}deg` }}><div><strong>{progress}%</strong><span>complete</span></div></div><div className="journey-stats"><span><b>{active ? `Level ${nextLevel?.number || active.levelCount}` : "Ready"}</b><small>{active ? `of ${active.levelCount} levels` : "to start"}</small></span><span><b>{bestScore || "—"}{bestScore ? "%" : ""}</b><small>best score</small></span></div></div>
      <div className="journey-chart" aria-label="Learning progress chart"><div className="chart-heading"><span>Growth trend</span><b>{completed.length ? "+1 level" : "Start here"}</b></div><svg viewBox="0 0 250 88" role="img"><defs><linearGradient id="journeyFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b8ef80" stopOpacity=".52"/><stop offset="1" stopColor="#b8ef80" stopOpacity="0"/></linearGradient></defs><path d="M0 73 C24 67, 35 69, 56 58 S89 64, 108 43 S143 53, 164 31 S201 40, 250 9 L250 88 L0 88 Z" fill="url(#journeyFill)"/><path d="M0 73 C24 67, 35 69, 56 58 S89 64, 108 43 S143 53, 164 31 S201 40, 250 9" fill="none" stroke="#b8ef80" strokeWidth="4" strokeLinecap="round"/><circle cx="164" cy="31" r="5" fill="#fff" stroke="#b8ef80" strokeWidth="3"/></svg><div className="chart-axis"><span>Start</span><span>Today</span></div></div>
    </section>

    {notice && <p className={/(created|recommends|ready|deleted)/.test(notice) ? "form-success" : "form-error"}>{notice}</p>}

    {composerOpen && <section className="assessment-composer"><div className="composer-heading"><div><p className="eyebrow">New learning path</p><h3>Choose what you want to master</h3></div><button type="button" aria-label="Close learning path form" onClick={() => setComposerOpen(false)}>×</button></div><div className="learning-layout"><form className="data-form learning-builder" onSubmit={create}><div className="learning-type"><button type="button" className={pathType === "skill" ? "selected" : ""} onClick={() => setPathType("skill")}>Learn a skill</button><button type="button" className={pathType === "job" ? "selected" : ""} onClick={() => setPathType("job")}>Prepare for a job</button></div><label>{pathType === "skill" ? "Skill" : "Job role"}<input value={topic} onChange={(event) => setTopic(event.target.value)} required /></label><div className="level-picker"><div><b>{levelCount} levels</b><small>One level unlocks at a time. You need 70% to continue.</small></div><input type="range" min="1" max="50" value={levelCount} onChange={(event) => setLevelCount(event.target.value)} /><output>{levelCount}</output></div><div className="composer-actions"><Button className="quiet" type="button" onClick={recommendation} disabled={recommending}>{recommending ? "Asking Gemini..." : "Recommend levels"}<Target size={14} /></Button><Button type="submit" disabled={creating}>{creating ? "Creating path..." : "Create path"}<ArrowRight size={15} /></Button></div></form><aside className="learning-guide"><p className="eyebrow">A focused rhythm</p><ol><li><b>01</b><span>Pick one skill or role that matters now.</span></li><li><b>02</b><span>Get five Gemini-generated questions per level.</span></li><li><b>03</b><span>Pass at 70% and keep moving forward.</span></li></ol></aside></div></section>}

    <section className="assessment-roadmap"><div className="roadmap-heading"><div><p className="eyebrow">Your roadmap</p><h3>{active ? active.topic : "No path selected"}</h3></div>{paths.length > 0 && <span>{paths.length} active {paths.length === 1 ? "path" : "paths"}</span>}</div>
      {paths.length ? <div className="path-tabs">{paths.map((path) => <article className={`path-tab${path.id === activeId ? " active" : ""}`} key={path.id}><button type="button" onClick={() => { setActiveId(path.id); setResult(null); }}><small>{path.pathType === "job" ? "JOB TARGET" : "SKILL"}</small><b>{path.topic}</b><span>Level {Math.min(path.nextUnlockedLevel, path.levelCount)} of {path.levelCount}</span></button><button className="path-delete" type="button" onClick={() => deletePath(path)} aria-label={`Delete ${path.topic} learning path`} title="Delete learning path"><Trash2 size={14} /></button></article>)}</div> : <div className="roadmap-empty"><span><Target size={20} /></span><div><b>Your first learning path is waiting.</b><p>Set a topic, choose your number of levels, and let Gemini prepare the practice.</p></div><Button type="button" onClick={() => setComposerOpen(true)}>Create path <ArrowRight size={14} /></Button></div>}
      {active && <div className="level-grid">{active.levels.map((level) => <button key={level.number} type="button" className={`learning-level ${level.status}`} disabled={level.status === "locked" || loadingLevel} onClick={() => openLevel(level.number)}><span>{level.status === "completed" ? "✓" : level.status === "locked" ? "🔒" : level.number}</span><b>Level {level.number}</b><small>{level.status === "completed" ? `${level.bestScore}% best score` : level.status === "available" ? loadingLevel ? "Generating questions..." : "Start challenge" : "Pass previous level"}</small>{level.status === "available" && <em>Current</em>}</button>)}</div>}
    </section>
  </section>;
}

function LegacyStudentJobs() {
  const current = getSession(); const [jobs, setJobs] = useState([]); const [applications, setApplications] = useState([]); const [resumes, setResumes] = useState([]); const [documents, setDocuments] = useState([]); const [selectedJob, setSelectedJob] = useState(null); const [selectedCv, setSelectedCv] = useState(""); const [notice, setNotice] = useState(""); const [submitting, setSubmitting] = useState(false);
  const headers = { "Content-Type": "application/json", "X-User-Id": current?.id || "" };
  const load = () => { fetch(`${API_BASE_URL}/jobs`).then(responseBody).then(setJobs).catch((e) => setNotice(e.message)); if (current?.id) Promise.all([fetch(`${API_BASE_URL}/applications`, { headers }).then(responseBody), fetch(`${API_BASE_URL}/vault/resumes`, { headers }).then(responseBody), fetch(`${API_BASE_URL}/vault/documents`, { headers }).then(responseBody)]).then(([applicationItems, resumeItems, documentItems]) => { setApplications(applicationItems); setResumes(resumeItems); setDocuments(documentItems); const defaultResume = resumeItems.find((item) => item.isDefault); if (defaultResume) setSelectedCv((existing) => existing || `resume:${defaultResume.id}`); }).catch((e) => setNotice(e.message)); };
  useEffect(() => { load(); }, []);
  async function apply(event) { event.preventDefault(); if (!selectedJob || !selectedCv) return setNotice("Select a resume version or uploaded document first."); setSubmitting(true); setNotice(""); try { const [cvSourceType, cvSourceId] = selectedCv.split(":"); const response = await fetch(`${API_BASE_URL}/jobs/${selectedJob.id}/applications`, { method: "POST", headers, body: JSON.stringify({ cvSourceType, cvSourceId: Number(cvSourceId) }) }); const application = await responseBody(response); setApplications([application, ...applications]); setSelectedJob(null); setNotice("Application submitted successfully with your selected CV."); } catch (e) { setNotice(e.message); } finally { setSubmitting(false); } }
  return <section><div className="content-intro compact"><div><p className="eyebrow"><BriefcaseBusiness size={14} /> Live opportunities</p><h2>Jobs published by CareerForge.</h2><p>Choose a role, then select a Career Vault CV to submit with your application.</p></div></div>{selectedJob && <form className="apply-panel" onSubmit={apply}><div><p className="eyebrow"><FileText size={14} /> CV selection</p><h3>Apply for {selectedJob.title}</h3><p>{selectedJob.companyName} · Deadline {selectedJob.expiryDate}</p></div><label>Select the CV to submit<select value={selectedCv} onChange={(e) => setSelectedCv(e.target.value)} required><option value="">Choose a CV or document</option>{resumes.length > 0 && <optgroup label="Resume versions">{resumes.map((resume) => <option key={`resume:${resume.id}`} value={`resume:${resume.id}`}>{resume.title}{resume.isDefault ? " (default)" : ""}</option>)}</optgroup>}{documents.length > 0 && <optgroup label="Uploaded documents">{documents.map((document) => <option key={`document:${document.id}`} value={`document:${document.id}`}>{document.fileName}</option>)}</optgroup>}</select></label>{resumes.length === 0 && documents.length === 0 && <p className="form-error">Create a resume version or upload a CV in Career Vault before applying.</p>}<div className="row"><Button type="submit" disabled={submitting || !selectedCv}>{submitting ? "Submitting..." : "Submit selected CV"}<ArrowRight size={15} /></Button><Button className="quiet" type="button" onClick={() => setSelectedJob(null)}>Cancel</Button></div></form>}{notice && <p className={notice.includes("success") ? "form-success" : "form-error"}>{notice}</p>}<div className="job-card-grid">{jobs.length ? jobs.map((job) => { const application = applications.find((item) => item.jobId === job.id); return <article className="job-card" key={job.id}><div className="job-company"><span><Building2 size={18} /></span><div><small>{job.companyName}</small><h3>{job.title}</h3></div></div><p>{job.description}</p><div className="job-meta"><span><MapPin size={14} /> {job.location || "Location flexible"}</span><span>{job.workMode}</span><span>{job.employmentType.replace("_", " ")}</span></div><footer><span>Apply by {job.expiryDate}</span>{application ? <b className="application-state">{application.status}</b> : <Button type="button" onClick={() => { setSelectedJob(job); setNotice(""); }}>Select CV <ArrowRight size={14} /></Button>}</footer></article>; }) : <EmptyPanel title="No published jobs yet" copy="When an administrator publishes a job, it will appear here." />}</div>{applications.length > 0 && <section className="content-card application-list"><div className="list-heading"><h3>Your submitted applications</h3><span>{applications.length} total</span></div>{applications.map((application) => <article key={application.id}><div><b>{application.jobTitle}</b><small>{application.companyName} · {application.cvTitle} · Submitted {new Date(application.appliedAt).toLocaleDateString()}</small></div><span className="status submitted">{application.status}</span></article>)}</section>}</section>;
}

function JobMatchCards({ matches, applications, onSelect, showProfileMatch = true }) {
  return <div className="job-card-grid">{matches.map((match) => { const job = match.job; const breakdown = match.scoreBreakdown; const application = applications.find((item) => item.jobId === job.id); return <article className="job-card matched-job" key={job.id}><div className="job-company"><span><Building2 size={18} /></span><div><small>{job.companyName}</small><h3>{job.title}</h3></div>{showProfileMatch && <b className="match-score">{match.matchPercentage}% match</b>}</div><p>{job.description}</p>{showProfileMatch && match.matchedSkills?.length > 0 && <div className="matched-skills">{match.matchedSkills.map((skill) => <span key={skill}>{skill}</span>)}</div>}{showProfileMatch && <small className="match-summary">{match.matchSummary}</small>}{showProfileMatch && breakdown && <small className="match-breakdown">Role {breakdown.role}/40 · Experience {breakdown.experience}/25 · Skills {breakdown.skills}/20 · Location {breakdown.location}/10 · Freshness {breakdown.freshness}/5</small>}<div className="job-meta"><span><MapPin size={14} /> {job.location || "Location flexible"}</span><span>{job.workMode}</span><span>{job.employmentType.replace("_", " ")}</span></div><footer><span>Apply by {job.expiryDate}</span><div>{job.sourceUrl && <a className="job-source-link" href={job.sourceUrl} target="_blank" rel="noreferrer">View source</a>}{application ? <b className="application-state">{application.status}</b> : <Button type="button" onClick={() => onSelect(job)}>Select CV <ArrowRight size={14} /></Button>}</div></footer></article>; })}</div>;
}

function MatchPagination({ page, totalPages, onChange, label }) {
  if (totalPages <= 1) return null;
  const numbers = [...new Set([1, 2, 3, page - 1, page, page + 1, totalPages])].filter((number) => number >= 1 && number <= totalPages).sort((a, b) => a - b);
  const items = numbers.flatMap((number, index) => index > 0 && number - numbers[index - 1] > 1 ? [`ellipsis-${number}`, number] : [number]);
  return <nav className="job-pagination match-pagination" aria-label={label}><button type="button" disabled={page === 1} onClick={() => onChange(Math.max(1, page - 1))}>Previous</button>{items.map((item) => typeof item === "number" ? <button type="button" aria-label={`Go to page ${item}`} className={item === page ? "active" : ""} key={`${label}-${item}`} onClick={() => onChange(item)}>{item}</button> : <span className="page-ellipsis" aria-hidden="true" key={`${label}-${item}`}>…</span>)}<button type="button" disabled={page === totalPages} onClick={() => onChange(Math.min(totalPages, page + 1))}>Next</button><small>Page {page} of {totalPages}</small></nav>;
}

function StudentJobs() {
  const current = getSession();
  const [matches, setMatches] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [allSearchResults, setAllSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [recommendationPage, setRecommendationPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCv, setSelectedCv] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ query: "", location: "", skills: "", workMode: "", employmentType: "" });
  const headers = { "Content-Type": "application/json", "X-User-Id": current?.id || "" };

  const load = async (activeFilters = filters, searchMode = false) => {
    if (!current?.id) { setLoading(false); setNotice("Please sign in again to view job matches."); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams(Object.entries(activeFilters).filter(([, value]) => value));
      const [jobMatches, filteredMatches, applicationItems, resumeItems, documentItems] = await Promise.all([
        fetch(`${API_BASE_URL}/jobs/matches`, { headers }).then(responseBody),
        searchMode ? fetch(`${API_BASE_URL}/jobs/matches?${params}`, { headers }).then(responseBody) : Promise.resolve([]),
        fetch(`${API_BASE_URL}/applications`, { headers }).then(responseBody),
        fetch(`${API_BASE_URL}/vault/resumes`, { headers }).then(responseBody),
        fetch(`${API_BASE_URL}/vault/documents`, { headers }).then(responseBody),
      ]);
      setAllMatches(jobMatches); setMatches(jobMatches.slice(0, 10)); setRecommendationPage(1); if (searchMode) { setAllSearchResults(filteredMatches); setSearchResults(filteredMatches.slice(0, 10)); setSearchPage(1); } setApplications(applicationItems); setResumes(resumeItems); setDocuments(documentItems);
      const defaultResume = resumeItems.find((item) => item.isDefault);
      if (defaultResume) setSelectedCv((value) => value || `resume:${defaultResume.id}`);
    } catch (error) { setNotice(error.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load({}, false); const refresh = window.setTimeout(() => load({}, false), 5000); return () => window.clearTimeout(refresh); }, []);

  const changeFilter = (event) => setFilters({ ...filters, [event.target.name]: event.target.value });
  const search = (event) => { event.preventDefault(); setNotice(""); setHasSearched(true); setSearchResults([]); load(filters, true); };
  const clearFilters = () => { const empty = { query: "", location: "", skills: "", workMode: "", employmentType: "" }; setFilters(empty); setHasSearched(false); setSearchResults([]); setAllSearchResults([]); setNotice(""); load(empty, false); };
  const changeRecommendationPage = (page) => { setRecommendationPage(page); setMatches(allMatches.slice((page - 1) * 10, page * 10)); window.setTimeout(() => document.querySelector(".profile-match-heading")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); };
  const changeSearchPage = (page) => { setSearchPage(page); setSearchResults(allSearchResults.slice((page - 1) * 10, page * 10)); window.setTimeout(() => document.querySelector(".search-results-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); };
  async function apply(event) {
    event.preventDefault();
    if (!selectedJob || !selectedCv) return setNotice("Select a resume version or uploaded document first.");
    setSubmitting(true); setNotice("");
    try {
      const [cvSourceType, cvSourceId] = selectedCv.split(":");
      const application = await responseBody(await fetch(`${API_BASE_URL}/jobs/${selectedJob.id}/applications`, { method: "POST", headers, body: JSON.stringify({ cvSourceType, cvSourceId: Number(cvSourceId) }) }));
      setApplications([application, ...applications]); setSelectedJob(null); setNotice("Application submitted successfully with your selected CV.");
    } catch (error) { setNotice(error.message); }
    finally { setSubmitting(false); }
  }

  return <section className="student-jobs-page">
    <div className="content-intro compact"><div><p className="eyebrow"><BriefcaseBusiness size={14} /> Personalized job matches</p><h2>Find jobs that fit your skills.</h2><p>Matches use the skills and target role saved in your profile. Search further by title, location, skills, work mode, or type.</p></div></div>
    <form className="job-search-panel" onSubmit={search}>
      <label className="job-search-main"><Search size={17} /><input name="query" value={filters.query} onChange={changeFilter} /></label>
      <input name="location" value={filters.location} onChange={changeFilter} />
      <input name="skills" value={filters.skills} onChange={changeFilter} />
      <select name="workMode" value={filters.workMode} onChange={changeFilter}><option value="">Any work mode</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">Onsite</option></select>
      <select name="employmentType" value={filters.employmentType} onChange={changeFilter}><option value="">Any job type</option><option value="internship">Internship</option><option value="part_time">Part time</option><option value="full_time">Full time</option><option value="contract">Contract</option></select>
      <Button type="submit"><Search size={15} /> Search</Button><button className="text-button" type="button" onClick={clearFilters}>Clear</button>
    </form>
    {hasSearched && <section className="content-card search-results-section"><div className="job-results-heading"><div><p className="eyebrow"><Search size={14} /> Search results</p><h3>{loading ? "Searching jobs..." : `${allSearchResults.length} jobs match your filters`}</h3><p>These listings are matched only against your search criteria—not your profile or CV.</p></div></div>{searchResults.length ? <JobMatchCards matches={searchResults} applications={applications} showProfileMatch={false} onSelect={(job) => { setSelectedJob(job); setNotice(""); }} /> : !loading && <EmptyPanel title="No jobs match these filters" copy="Try a broader title, location, skill, or job type." />}<MatchPagination page={searchPage} totalPages={Math.ceil(allSearchResults.length / 10)} onChange={changeSearchPage} label="Search results pagination" /></section>}
    {selectedJob && <form className="apply-panel" onSubmit={apply}><div><p className="eyebrow"><FileText size={14} /> CV selection</p><h3>Apply for {selectedJob.title}</h3><p>{selectedJob.companyName} · Deadline {selectedJob.expiryDate}</p></div><label>Select the CV to submit<select value={selectedCv} onChange={(event) => setSelectedCv(event.target.value)} required><option value="">Choose a CV or document</option>{resumes.length > 0 && <optgroup label="Resume versions">{resumes.map((resume) => <option key={`resume:${resume.id}`} value={`resume:${resume.id}`}>{resume.title}{resume.isDefault ? " (default)" : ""}</option>)}</optgroup>}{documents.length > 0 && <optgroup label="Uploaded documents">{documents.map((document) => <option key={`document:${document.id}`} value={`document:${document.id}`}>{document.fileName}</option>)}</optgroup>}</select></label>{resumes.length === 0 && documents.length === 0 && <p className="form-error">Create a resume version or upload a CV in Career Vault before applying.</p>}<div className="row"><Button type="submit" disabled={submitting || !selectedCv}>{submitting ? "Submitting..." : "Submit selected CV"}<ArrowRight size={15} /></Button><Button className="quiet" type="button" onClick={() => setSelectedJob(null)}>Cancel</Button></div></form>}
    {notice && <p className={notice.includes("success") ? "form-success" : "form-error"}>{notice}</p>}
    {!hasSearched && <><div className="job-results-heading profile-match-heading"><div><p className="eyebrow"><Target size={14} /> Recommended for you</p><h3>{loading ? "Finding your matches..." : `${allMatches.length} profile-matched opportunities`}</h3><p>Ranked by your target role, skills, experience, location, and listing freshness. Showing 10 per page.</p></div></div>
    <div className="job-card-grid">{matches.map((match) => { const job = match.job; const breakdown = match.scoreBreakdown; const application = applications.find((item) => item.jobId === job.id); return <article className="job-card matched-job" key={job.id}><div className="job-company"><span><Building2 size={18} /></span><div><small>{job.companyName}</small><h3>{job.title}</h3></div><b className="match-score">{match.matchPercentage}% match</b></div><p>{job.description}</p>{match.matchedSkills?.length > 0 && <div className="matched-skills">{match.matchedSkills.map((skill) => <span key={skill}>{skill}</span>)}</div>}<small className="match-summary">{match.matchSummary}</small>{breakdown && <small className="match-breakdown">Role {breakdown.role}/40 · Experience {breakdown.experience}/25 · Skills {breakdown.skills}/20 · Location {breakdown.location}/10 · Freshness {breakdown.freshness}/5</small>}<div className="job-meta"><span><MapPin size={14} /> {job.location || "Location flexible"}</span><span>{job.workMode}</span><span>{job.employmentType.replace("_", " ")}</span></div><footer><span>Apply by {job.expiryDate}</span><div>{job.sourceUrl && <a className="job-source-link" href={job.sourceUrl} target="_blank" rel="noreferrer">View source</a>}{application ? <b className="application-state">{application.status}</b> : <Button type="button" onClick={() => { setSelectedJob(job); setNotice(""); }}>Select CV <ArrowRight size={14} /></Button>}</div></footer></article>; })}</div>
    {allMatches.length > 0 && <div className="match-section-actions"><MatchPagination page={recommendationPage} totalPages={Math.ceil(allMatches.length / 10)} onChange={changeRecommendationPage} label="Profile recommendations pagination" /></div>}
    {!loading && matches.length === 0 && <EmptyPanel title="No matching jobs found" copy="Try a broader search, or add skills and a target role in My profile to improve recommendations." />}</>}
  </section>;
}

function StudentApplications() {
  const current = getSession();
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const headers = { "X-User-Id": current?.id || "" };
  const load = () => {
    if (!current?.id) { setNotice("Please sign in again."); setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE_URL}/applications`, { headers }).then(responseBody).then(setApplications).catch((error) => setNotice(error.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  const statusOf = (item) => String(item.status || "applied").toLowerCase();
  const reviewCount = applications.filter((item) => ["review", "reviewing", "in_review"].includes(statusOf(item))).length;
  const nextStageCount = applications.filter((item) => ["assessment", "interview", "shortlisted"].includes(statusOf(item))).length;
  const interviewCount = applications.filter((item) => statusOf(item) === "interview").length;
  const activeCount = applications.filter((item) => !["cancelled", "rejected", "withdrawn"].includes(statusOf(item))).length;
  const interviewRate = activeCount ? Math.round((interviewCount / activeCount) * 100) : 0;
  const visible = filter === "all" ? applications : applications.filter((item) => statusOf(item) === filter || (filter === "review" && ["reviewing", "in_review"].includes(statusOf(item))));
  const filters = [["all", "All"], ["applied", "Applied"], ["review", "In review"], ["assessment", "Assessment"], ["interview", "Interview"], ["cancelled", "Cancelled"]];
  return <section className="student-applications-page">
    <header className="student-page-heading"><p>MY CAREERFORGE</p><h2>Application tracker</h2><span>Stay on top of every opportunity and follow-up.</span></header>
    <section className="application-metrics">
      <article className="tone-blue"><span><BriefcaseBusiness size={20} /></span><strong>{activeCount}</strong><b>Active applications</b><small>{applications.filter((item) => statusOf(item) === "cancelled").length} cancelled</small></article>
      <article className="tone-purple"><span><CircleUserRound size={20} /></span><strong>{reviewCount}</strong><b>In review</b><small>Live application data</small></article>
      <article className="tone-coral"><span><ClipboardCheck size={20} /></span><strong>{nextStageCount}</strong><b>Next stage</b><small>Assessment or interview</small></article>
      <article className="tone-green"><span><Target size={20} /></span><strong>{interviewRate}%</strong><b>Interview rate</b><small>{activeCount} active applications</small></article>
    </section>
    <section className="application-tracker-panel">
      <header><nav>{filters.map(([value, label]) => <button type="button" className={filter === value ? "active" : ""} onClick={() => setFilter(value)} key={value}>{label}</button>)}</nav><Button className="quiet" type="button" onClick={load}><RefreshCw size={15} /> Refresh</Button></header>
      {notice && <p className="form-error">{notice}</p>}
      {loading ? <div className="application-empty"><RefreshCw className="spin" size={28} /><b>Loading applications...</b></div> : visible.length ? <div className="application-tracker-list">{visible.map((application) => <article key={application.id}><span><BriefcaseBusiness size={18} /></span><div><h3>{application.jobTitle}</h3><p>{application.companyName} · {application.cvTitle || "Submitted CV"}</p><small>Submitted {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : "recently"}</small></div><b className={`status ${statusOf(application)}`}>{application.status || "Applied"}</b></article>)}</div> : <div className="application-empty"><ClipboardCheck size={33} /><b>No applications yet</b><p>Applications submitted to administrator-published jobs will appear here.</p></div>}
    </section>
  </section>;
}

function AdminJobs() {
  const current = getSession(); const [jobs, setJobs] = useState([]); const [job, setJob] = useState(blankJob); const [editingId, setEditingId] = useState(null); const [notice, setNotice] = useState(""); const [saving, setSaving] = useState(false); const [syncing, setSyncing] = useState(false); const [loadingJobs, setLoadingJobs] = useState(true); const [syncStatus, setSyncStatus] = useState(null); const [groupPages, setGroupPages] = useState({}); const [embeddingStatus, setEmbeddingStatus] = useState(null); const [embeddingBusy, setEmbeddingBusy] = useState(false);
  const headers = { "Content-Type": "application/json", "X-User-Id": current?.id || "" };
  const load = () => { if (!current?.id) { setLoadingJobs(false); setNotice("Please sign in again as an administrator."); return; } setLoadingJobs(true); fetch(`${API_BASE_URL}/admin/jobs`, { headers }).then(responseBody).then((items) => { setJobs(items); setGroupPages({}); }).catch((e) => setNotice(e.message)).finally(() => setLoadingJobs(false)); };
  useEffect(() => { load(); if (current?.id) { fetch(`${API_BASE_URL}/admin/jobs/sync/status?source=bdjobs`, { headers }).then(responseBody).then((status) => { setSyncStatus(status); if (status.status === "success") setNotice(`BDJobs sync updated: ${status.newJobs ?? 0} new, ${status.publishedJobs ?? 0} published, ${status.needsReviewJobs ?? 0} flagged. Scheduler ${status.schedulerEnabled ? "enabled" : "manual only"}; interval ${Math.round((status.intervalMs || 0) / 3600000)}h.`); }).catch(() => {}); fetch(`${API_BASE_URL}/admin/jobs/embeddings/status`, { headers }).then(responseBody).then((status) => { setEmbeddingStatus(status); setNotice((previous) => previous || `AI matching: ${status.ready ?? 0} jobs ready, ${status.processing ?? 0} processing, ${status.failed ?? 0} failed.`); }).catch(() => {}); } }, []);
  const change = (event) => setJob({ ...job, [event.target.name]: event.target.value });
  async function save(event) { event.preventDefault(); setSaving(true); setNotice(""); try { const payload = { ...job, minExperienceYears: job.minExperienceYears === "" || job.minExperienceYears == null ? null : Number(job.minExperienceYears), maxExperienceYears: job.maxExperienceYears === "" || job.maxExperienceYears == null ? null : Number(job.maxExperienceYears) }; const response = await fetch(`${API_BASE_URL}/admin/jobs${editingId ? `/${editingId}` : ""}`, { method: editingId ? "PUT" : "POST", headers, body: JSON.stringify(payload) }); await responseBody(response); setNotice(editingId ? "Job updated." : "Job created."); setEditingId(null); setJob(blankJob); load(); } catch (e) { setNotice(e.message); } finally { setSaving(false); } }
  function edit(item) { setJob({ ...blankJob, ...item, companyWebsite: item.companyWebsite || "", companyLocation: item.companyLocation || "" }); setEditingId(item.id); setNotice(`Editing job #${item.id} | Source: ${item.source || "Manual"} | Validation: ${item.validationStatus || "unknown"}${item.sourceUrl ? ` | ${item.sourceUrl}` : ""}`); window.scrollTo({ top: 0, behavior: "smooth" }); }
  async function remove(id) { if (!window.confirm("Delete this job permanently?")) return; try { const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, { method: "DELETE", headers }); await responseBody(response); setNotice("Job deleted."); load(); } catch (e) { setNotice(e.message); } }
  async function importJobs() { setSyncing(true); setNotice("Importing jobs and validating listings…"); try { const response = await fetch(`${API_BASE_URL}/admin/jobs/import`, { method: "POST", headers }); const body = await responseBody(response); setNotice(`${body.imported} jobs imported.`); load(); } catch (e) { setNotice(e.message); } finally { setSyncing(false); } }
  async function syncSource(source) { setSyncing(true); setNotice(`Syncing and validating ${source} jobs…`); try { const response = await fetch(`${API_BASE_URL}/admin/jobs/sync?source=${source}`, { method: "POST", headers }); const body = await responseBody(response); setSyncStatus(body); setNotice(`${source} sync complete: ${body.newJobs ?? body.imported ?? 0} new, ${body.publishedJobs ?? 0} published, ${body.needsReviewJobs ?? 0} flagged, ${body.totalJobs ?? 0} total. Valid listings publish automatically; flagged listings stay in draft for review.`); load(); } catch (e) { setNotice(e.message); } finally { setSyncing(false); } }
  async function processEmbeddings() { setEmbeddingBusy(true); setNotice("Preparing the next 20-job AI matching batch…"); try { const body = await responseBody(await fetch(`${API_BASE_URL}/admin/jobs/embeddings/rebuild?limit=20`, { method: "POST", headers })); setNotice(`${body.queued ?? 0} jobs queued for AI matching. Processing continues in the background.`); const status = await responseBody(await fetch(`${API_BASE_URL}/admin/jobs/embeddings/status`, { headers })); setEmbeddingStatus(status); window.setTimeout(() => fetch(`${API_BASE_URL}/admin/jobs/embeddings/status`, { headers }).then(responseBody).then(setEmbeddingStatus).catch(() => {}), 2500); } catch (e) { setNotice(e.message); } finally { setEmbeddingBusy(false); } }
  const field = (label, name, type = "text", placeholder = "") => <label>{label}<input name={name} type={type} value={job[name] ?? ""} onChange={change} required={["title", "companyName", "expiryDate"].includes(name)} /></label>;
  const changeGroupPage = (key, nextPage) => { setGroupPages((currentPages) => ({ ...currentPages, [key]: nextPage })); window.setTimeout(() => { const section = document.querySelector(`.job-list-${key}`); if (section) window.scrollTo({ top: Math.max(0, section.getBoundingClientRect().top + window.scrollY - 24), behavior: "smooth" }); }, 0); };
  if (syncing) return <section className="admin-jobs"><section className="content-card sync-progress" aria-live="polite"><RefreshCw size={22} className="spin" /><h3>Import/sync in progress…</h3><p>Fetching new listings, checking deadlines and duplicates, then publishing valid jobs automatically.</p></section></section>;
  if (loadingJobs) return <section className="admin-jobs"><section className="content-card sync-progress" aria-live="polite"><RefreshCw size={22} className="spin" /><h3>Loading jobs…</h3><p>Fetching the latest listings and preparing the admin review queue.</p></section></section>;
  const jobGroups = (() => { const groups = [
    { key: "published", title: "Published jobs", description: "Validated listings visible to students.", jobs: jobs.filter((item) => item.status === "published") },
    { key: "review", title: "Draft / needs review", description: "Incomplete or flagged listings waiting for admin review.", jobs: jobs.filter((item) => item.status === "draft") },
    { key: "closed", title: "Closed / expired", description: "Listings no longer shown in recommendations.", jobs: jobs.filter((item) => item.status === "closed") }
  ]; const pageSize = 10; groups.forEach((group) => { const allJobs = group.jobs; const totalPages = Math.max(1, Math.ceil(allJobs.length / pageSize)); const page = Math.min(groupPages[group.key] || 1, totalPages); const visibleJobs = allJobs.slice((page - 1) * pageSize, page * pageSize); const pageNumbers = [...new Set([1, 2, 3, page - 1, page, page + 1, totalPages])].filter((number) => number >= 1 && number <= totalPages).sort((a, b) => a - b); const paginationItems = pageNumbers.flatMap((number, index) => index > 0 && number - pageNumbers[index - 1] > 1 ? [`ellipsis-${number}`, number] : [number]); Object.defineProperty(group, "jobs", { value: { length: allJobs.length, map: () => [...visibleJobs.map((item) => renderJob(item)), ...(totalPages > 1 ? [<nav className="job-pagination" aria-label={`${group.title} pagination`} key={`${group.key}-pagination`}><button type="button" disabled={page === 1} onClick={() => changeGroupPage(group.key, Math.max(1, page - 1))}>Previous</button>{paginationItems.map((item) => typeof item === "number" ? <button type="button" aria-label={`Go to page ${item}`} className={item === page ? "active" : ""} key={`${group.key}-page-${item}`} onClick={() => changeGroupPage(group.key, item)}>{item}</button> : <span className="page-ellipsis" aria-hidden="true" key={`${group.key}-${item}`}>…</span>)}<button type="button" disabled={page === totalPages} onClick={() => changeGroupPage(group.key, Math.min(totalPages, page + 1))}>Next</button><small>Page {page} of {totalPages}</small></nav>] : [])] } }); }); return groups; })();
  const renderJob = (item) => <article key={item.id}><div><b>{item.title}</b><small>{item.companyName} · {item.location || "No location"}</small><small className="job-source-meta">Source: {item.source || "Manual"} · Validation: {item.validationStatus || "unknown"}</small></div><span className={`status ${item.status}`}>{item.status}</span><span>{item.expiryDate || "—"}</span><div className="table-actions"><button type="button" onClick={() => edit(item)} title="Edit"><Pencil size={15} /></button><button type="button" onClick={() => remove(item.id)} title="Delete"><Trash2 size={15} /></button></div></article>;
  return <section className="admin-jobs"><div className="content-intro compact"><div><p className="eyebrow"><BriefcaseBusiness size={14} /> Opportunity management</p><h2>Publish and manage jobs.</h2><p>Sync all upcoming BDJobs listings, then review flagged records before publishing.</p></div><div className="row"><Button className="quiet" type="button" onClick={importJobs}><RefreshCw size={15} /> Import from API</Button><Button className="quiet" type="button" onClick={() => syncSource("bdjobs")}><RefreshCw size={15} /> Sync BDJobs</Button></div></div>{embeddingStatus && <section className="content-card ai-processing-panel"><div><p className="eyebrow"><Target size={14} /> AI matching pipeline</p><h3>{embeddingStatus.ready ?? 0} jobs ready for semantic matching</h3><p>{embeddingStatus.processing ?? 0} processing · {embeddingStatus.failed ?? 0} failed · model {embeddingStatus.model || "not configured"}</p></div><div className="row"><span className={`ai-config-status ${embeddingStatus.configured ? "ready" : "missing"}`}>{embeddingStatus.configured ? "Gemini connected" : "Gemini key missing"}</span><Button className="quiet" type="button" onClick={processEmbeddings} disabled={embeddingBusy || !embeddingStatus.configured}><RefreshCw size={15} className={embeddingBusy ? "spin" : ""} />{embeddingBusy ? "Queueing…" : "Process next 20"}</Button></div></section>}<form className="data-form job-form" onSubmit={save}><div className="form-row-title"><h3>{editingId ? "Edit job" : "Add a new job"}</h3>{editingId && <button className="text-button" type="button" onClick={() => { setEditingId(null); setJob(blankJob); setNotice(""); }}>Cancel editing</button>}</div><div className="form-grid three">{field("Job title", "title", "text", "Software Engineer Intern")}{field("Company name", "companyName", "text", "Company Ltd.")}{field("Job location", "location", "text", "Dhaka")}<label>Employment type<select name="employmentType" value={job.employmentType} onChange={change}><option value="internship">Internship</option><option value="part_time">Part time</option><option value="full_time">Full time</option><option value="contract">Contract</option></select></label><label>Work mode<select name="workMode" value={job.workMode} onChange={change}><option value="onsite">Onsite</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select></label><label>Status<select name="status" value={job.status} onChange={change}><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option></select></label>{field("Deadline", "expiryDate", "date")}{field("Min experience (years)", "minExperienceYears", "number", "0")}{field("Max experience (years)", "maxExperienceYears", "number", "5")}{field("Salary text", "salaryText", "text", "BDT 20,000/month")}{field("Company website", "companyWebsite", "url", "https://company.com")}</div><label className="full-field">Job description<textarea name="description" value={job.description} onChange={change} required rows="5" /></label>{notice && <p className={/(created|updated|deleted|imported|complete|Importing|Syncing)/.test(notice) ? "form-success" : "form-error"}>{notice}</p>}<Button type="submit" disabled={saving}><Plus size={16} />{saving ? "Saving..." : editingId ? "Update job" : "Create job"}</Button></form>{jobGroups.map((group) => <section className={`content-card job-list job-list-${group.key}`} key={group.key}><div className="list-heading"><div><h3>{group.title}</h3><small>{group.description}</small></div><span>{group.jobs.length}</span></div>{group.jobs.length ? <div className="job-table">{group.jobs.map(renderJob)}</div> : <p className="muted">No {group.title.toLowerCase()} right now.</p>}</section>)}</section>;
  return <section className="admin-jobs"><div className="content-intro compact"><div><p className="eyebrow"><BriefcaseBusiness size={14} /> Opportunity management</p><h2>Publish and manage jobs.</h2><p>Import from the existing provider or sync public BDJobs listings into drafts for validation and approval.</p></div><div className="row"><Button className="quiet" type="button" onClick={importJobs}><RefreshCw size={15} /> Import from API</Button><Button className="quiet" type="button" onClick={() => syncSource("bdjobs")}><RefreshCw size={15} /> Sync BDJobs</Button></div></div><form className="data-form job-form" onSubmit={save}><div className="form-row-title"><h3>{editingId ? "Edit job" : "Add a new job"}</h3>{editingId && <button className="text-button" type="button" onClick={() => { setEditingId(null); setJob(blankJob); setNotice(""); }}>Cancel editing</button>}</div><div className="form-grid three">{field("Job title", "title", "text", "Software Engineer Intern")}{field("Company name", "companyName", "text", "Company Ltd.")}{field("Job location", "location", "text", "Dhaka")}<label>Employment type<select name="employmentType" value={job.employmentType} onChange={change}><option value="internship">Internship</option><option value="part_time">Part time</option><option value="full_time">Full time</option><option value="contract">Contract</option></select></label><label>Work mode<select name="workMode" value={job.workMode} onChange={change}><option value="onsite">Onsite</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select></label><label>Status<select name="status" value={job.status} onChange={change}><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option></select></label>{field("Deadline", "expiryDate", "date")}{field("Min experience (years)", "minExperienceYears", "number", "0")}{field("Max experience (years)", "maxExperienceYears", "number", "5")}{field("Salary text", "salaryText", "text", "BDT 20,000/month")}{field("Company website", "companyWebsite", "url", "https://company.com")}</div><label className="full-field">Job description<textarea name="description" value={job.description} onChange={change} required rows="5" /></label>{notice && <p className={/(created|updated|deleted|imported|Syncing)/.test(notice) ? "form-success" : "form-error"}>{notice}</p>}<Button type="submit" disabled={saving}><Plus size={16} />{saving ? "Saving..." : editingId ? "Update job" : "Create job"}</Button></form><section className="content-card job-list"><div className="list-heading"><h3>All jobs</h3><span>{jobs.length} total</span></div>{jobs.length ? <div className="job-table">{jobs.map((item) => <article key={item.id}><div><b>{item.title}</b><small>{item.companyName} · {item.location || "No location"}</small></div><span className={`status ${item.status}`}>{item.status}</span><span>{item.expiryDate}</span><div className="table-actions"><button onClick={() => edit(item)} title="Edit"><Pencil size={15} /></button><button onClick={() => remove(item.id)} title="Delete"><Trash2 size={15} /></button></div></article>)}</div> : <p className="muted">No jobs yet. Use the form above to create the first one.</p>}</section></section>;
}

function LegacyStudentOverview({ go }) {
  const current = getSession(); const [snapshot, setSnapshot] = useState({ profile: blankProfile, applications: [], resumes: [], documents: [], jobs: [] }); const [loading, setLoading] = useState(true);
  useEffect(() => { const headers = { "X-User-Id": current?.id || "" }; if (!current?.id) { setLoading(false); return; } Promise.all([fetch(`${API_BASE_URL}/profiles/${current.id}`, { headers }).then(responseBody).catch(() => blankProfile), fetch(`${API_BASE_URL}/applications`, { headers }).then(responseBody).catch(() => []), fetch(`${API_BASE_URL}/vault/resumes`, { headers }).then(responseBody).catch(() => []), fetch(`${API_BASE_URL}/vault/documents`, { headers }).then(responseBody).catch(() => []), fetch(`${API_BASE_URL}/jobs`).then(responseBody).catch(() => [])]).then(([profile, applications, resumes, documents, jobs]) => setSnapshot({ profile: { ...blankProfile, ...profile }, applications, resumes, documents, jobs })).finally(() => setLoading(false)); }, []);
  const profileFields = [snapshot.profile.university, snapshot.profile.degree, snapshot.profile.graduationYear, snapshot.profile.experienceYears, snapshot.profile.targetRole, snapshot.profile.location, snapshot.profile.skills, snapshot.profile.hobbies, snapshot.profile.bio].filter((value) => value !== null && value !== undefined && value !== "").length; const readiness = Math.round((profileFields / 9) * 100); const documents = snapshot.resumes.length + snapshot.documents.length; const nextAction = !snapshot.profile.targetRole ? ["Add a target role", "Tell CareerForge what direction you want to explore.", "/student/profile", Target] : documents === 0 ? ["Create your first CV", "Save a CV version before you start applying.", "/student/vault", FileText] : ["Explore job matches", "Find published opportunities that fit your direction.", "/student/jobs", BriefcaseBusiness];
  const [nextTitle, nextCopy, nextRoute, NextIcon] = nextAction;
  return <section className="student-overview"><header className="student-overview-head"><div><p className="eyebrow"><Target size={14} /> YOUR CAREER COMMAND CENTER</p><h2>Welcome back, {current?.name?.split(" ")[0] || "Student"}.</h2><p>Here is a clear view of the work that moves your career forward.</p></div><Button className="quiet" onClick={() => go("/student/profile")}>View profile <ArrowRight size={15} /></Button></header><div className="student-dashboard-grid"><article className="readiness-card"><div><p>CAREER READINESS</p><h3>{loading ? "—" : `${readiness}%`}</h3><span>{profileFields}/8 profile details added</span></div><div className="readiness-ring" style={{ "--progress": `${readiness * 3.6}deg` }}><i><Target size={24} /></i></div><footer><span>Complete your profile to improve your next-step recommendations.</span><button onClick={() => go("/student/profile")}>Improve profile <ArrowRight size={14} /></button></footer></article><article className="workspace-summary"><div className="summary-head"><div><p>YOUR WORKSPACE</p><h3>Progress at a glance</h3></div><span>{loading ? "…" : "Live"}</span></div><div className="summary-stats"><button onClick={() => go("/student/vault")}><FileText size={18} /><b>{loading ? "—" : documents}</b><small>CVs &amp; files</small></button><button onClick={() => go("/student/jobs")}><BriefcaseBusiness size={18} /><b>{loading ? "—" : snapshot.jobs.length}</b><small>Open jobs</small></button><button onClick={() => go("/student/jobs")}><ClipboardCheck size={18} /><b>{loading ? "—" : snapshot.applications.length}</b><small>Applications</small></button></div></article><article className="next-step-card"><span><NextIcon size={20} /></span><div><p>NEXT BEST STEP</p><h3>{nextTitle}</h3><small>{nextCopy}</small></div><button onClick={() => go(nextRoute)} aria-label={nextTitle}><ArrowRight size={17} /></button></article><article className="career-path-card"><div className="summary-head"><div><p>CAREER PATH</p><h3>Your application rhythm</h3></div><button onClick={() => go("/student/jobs")}>View jobs</button></div><div className="path-track"><span className={profileFields ? "done" : ""}><i>1</i><b>Profile</b><small>{profileFields ? "In progress" : "Start here"}</small></span><span className={documents ? "done" : ""}><i>2</i><b>CV</b><small>{documents ? "Ready" : "Prepare"}</small></span><span className={snapshot.applications.length ? "done" : ""}><i>3</i><b>Apply</b><small>{snapshot.applications.length ? "Active" : "Discover"}</small></span></div></article></div></section>;
}

function StudentOverview({ go }) {
  const current = getSession();
  const [snapshot, setSnapshot] = useState({ profile: blankProfile, applications: [], resumes: [], documents: [], jobs: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const headers = { "X-User-Id": current?.id || "" };
    if (!current?.id) { setLoading(false); return; }
    Promise.all([
      fetch(`${API_BASE_URL}/profiles/${current.id}`, { headers }).then(responseBody).catch(() => blankProfile),
      fetch(`${API_BASE_URL}/applications`, { headers }).then(responseBody).catch(() => []),
      fetch(`${API_BASE_URL}/vault/resumes`, { headers }).then(responseBody).catch(() => []),
      fetch(`${API_BASE_URL}/vault/documents`, { headers }).then(responseBody).catch(() => []),
      fetch(`${API_BASE_URL}/jobs`).then(responseBody).catch(() => []),
    ]).then(([profile, applications, resumes, documents, jobs]) => setSnapshot({ profile: { ...blankProfile, ...profile }, applications, resumes, documents, jobs })).finally(() => setLoading(false));
  }, []);
  const profileFields = [snapshot.profile.university, snapshot.profile.degree, snapshot.profile.graduationYear, snapshot.profile.experienceYears, snapshot.profile.targetRole, snapshot.profile.location, snapshot.profile.skills, snapshot.profile.hobbies, snapshot.profile.bio].filter((value) => value !== null && value !== undefined && value !== "").length;
  const readiness = Math.round((profileFields / 9) * 100);
  const cvCount = snapshot.resumes.length + snapshot.documents.length;
  const opportunities = snapshot.jobs.slice(0, 3);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const metrics = [
    [Target, `${readiness}%`, "Readiness score", `${profileFields}/9 profile details`, "blue"],
    [ClipboardCheck, snapshot.applications.length, "Applications", "Live submissions", "green"],
    [FileText, cvCount ? "100%" : "0%", "CV built", cvCount ? `${cvCount} version${cvCount === 1 ? "" : "s"} ready` : "Create your first CV", "coral"],
    [CircleUserRound, `${readiness}%`, "Profile completion", `${9 - profileFields} fields remaining`, "soft"],
    [BriefcaseBusiness, snapshot.jobs.length, "Available jobs", `${opportunities.length} highlighted below`, "blue"],
  ];
  return <section className="student-overview portal-overview">
    <header className="student-page-heading"><p>MY CAREERFORGE</p><h2>{greeting}, {current?.name?.split(" ")[0] || "Student"}</h2><span>Here’s what is moving your career forward today.</span></header>
    <section className="live-opportunities-panel">
      <header><div><p><BriefcaseBusiness size={14} /> LIVE OPPORTUNITIES</p><h3>Top {opportunities.length || 0} live opportunities</h3><span>Ranked from currently published listings</span></div><button type="button" onClick={() => go("/student/jobs")}>View all <ArrowRight size={15} /></button></header>
      {opportunities.length ? <div>{opportunities.map((job, index) => <button type="button" onClick={() => go("/student/jobs")} key={job.id}><i>{job.companyName?.slice(0, 1)?.toUpperCase() || "J"}</i><span><b>{job.title}</b><small>{job.companyName} · {job.location || "Location flexible"}</small></span><em>{Math.max(11, readiness - index * 7)}% match</em></button>)}</div> : <div className="opportunity-empty">{loading ? "Loading live opportunities..." : "No published opportunities are available yet."}</div>}
    </section>
    <section className="overview-metric-row">{metrics.map(([Icon, value, label, detail, tone]) => <article className={`tone-${tone}`} key={label}><header><span><Icon size={19} /></span><b>•••</b></header><strong>{loading ? "—" : value}</strong><h3>{label}</h3><p>{detail}</p></article>)}</section>
    <section className="degree-guide-card"><header><div><p><Target size={14} /> DEGREE-AWARE CAREER GUIDE</p><h3>Next skills for {snapshot.profile.degree || "your career direction"}</h3></div><span>Degree-based guidance</span></header><p>These priorities are selected from your profile and target role in {snapshot.profile.targetRole || "your chosen field"}. Build them through one practical project at a time.</p><Button className="quiet" type="button" onClick={() => go("/student/assessments")}>Open skill assessments <ArrowRight size={15} /></Button></section>
  </section>;
}

function StudentEvents({ go }) {
  const current = getSession();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [view, setView] = useState("list");
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const load = async () => {
    setLoading(true); setNotice("");
    try {
      setEvents(await responseBody(await fetch(`${API_BASE_URL}/events`, { headers: { "X-User-Id": current?.id || "" } })));
    } catch (error) {
      setEvents([]);
      if (!/not found/i.test(error.message)) setNotice("Events could not load right now. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const day = (value) => new Date(value).toLocaleDateString("en-US", { day: "2-digit" });
  const month = (value) => new Date(value).toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const schedule = (item) => {
    const start = new Date(item.startsAt); const end = new Date(item.endsAt);
    const date = start.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
    return `${date} · ${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  };
  const dateKey = (value) => { const date = new Date(value); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };
  const calendarYear = calendarDate.getFullYear(); const calendarMonth = calendarDate.getMonth();
  const monthLabel = calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const calendarStart = new Date(calendarYear, calendarMonth, 1);
  const calendarGridStart = new Date(calendarYear, calendarMonth, 1 - calendarStart.getDay());
  const calendarDays = Array.from({ length: 42 }, (_, index) => { const date = new Date(calendarGridStart); date.setDate(calendarGridStart.getDate() + index); return date; });
  const eventsByDay = events.reduce((grouped, item) => { const key = dateKey(item.startsAt); grouped[key] = [...(grouped[key] || []), item]; return grouped; }, {});
  const moveMonth = (amount) => setCalendarDate((currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1));
  return <section className="student-events-page">
    <header className="student-page-heading events-page-heading"><div><p>MY CAREERFORGE</p><h2>Events &amp; Workshops</h2><span>Meet recruiters, mentors and students building alongside you.</span></div><Button className="quiet" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? "spinning" : ""} /> Refresh events</Button></header>
    {notice && <p className="form-error">{notice}</p>}
    <div className="events-toolbar"><nav><button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>List</button><button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}>Calendar</button></nav><span>{events.length} published upcoming event{events.length === 1 ? "" : "s"}</span></div>
    {loading ? <section className="events-loading"><RefreshCw size={25} className="spinning" /><b>Loading upcoming events...</b></section> : view === "calendar" ? <section className="event-calendar" aria-label={`Events calendar for ${monthLabel}`}>
      <header className="event-calendar-header"><div><small>EVENT CALENDAR</small><h3>{monthLabel}</h3></div><div><button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month"><ChevronLeft size={17} /></button><button type="button" onClick={() => moveMonth(1)} aria-label="Next month"><ChevronRight size={17} /></button></div></header>
      <div className="event-calendar-weekdays">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => <span key={dayName}>{dayName}</span>)}</div>
      <div className="event-calendar-grid">{calendarDays.map((date) => { const key = dateKey(date); const dayEvents = eventsByDay[key] || []; const inCurrentMonth = date.getMonth() === calendarMonth; const today = dateKey(new Date()) === key; return <article className={`event-calendar-day${inCurrentMonth ? "" : " outside"}${today ? " today" : ""}`} key={key}><time dateTime={key}>{date.getDate()}</time><div>{dayEvents.slice(0, 3).map((item) => <button type="button" className="calendar-event" key={item.id} title={item.title} onClick={() => setView("list")}><span>{new Date(item.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>{item.title}</button>)}{dayEvents.length > 3 && <small>+{dayEvents.length - 3} more</small>}</div></article>; })}</div>
      {!events.length && <p className="event-calendar-empty">No published events this month. New events will appear on their scheduled date.</p>}
    </section> : events.length ? <section className={`student-event-grid ${view}`}>
      {events.map((item) => <article className="student-event-card" key={item.id}>
        <time dateTime={item.startsAt}><b>{day(item.startsAt)}</b><small>{month(item.startsAt)}</small></time>
        <div className="student-event-copy"><span>{item.category || "Event"}</span><h3>{item.title}</h3><p>{item.description || "Join this CareerForge event and keep your career moving."}</p><small><CalendarDays size={14} /> {schedule(item)}</small><small><MapPin size={14} /> {item.location || "Online"}</small>
          <footer>{item.eventUrl ? <><a className="event-primary-action" href={item.eventUrl} target="_blank" rel="noreferrer">Reserve a seat</a><a className="event-secondary-action" href={item.eventUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Event link</a></> : <button className="event-primary-action" type="button" disabled>Registration unavailable</button>}<em>{item.capacity ? `${item.capacity} seats available` : "Open capacity"}</em></footer>
        </div>
      </article>)}
    </section> : <section className="events-empty-state content-card"><span className="events-empty-icon"><CalendarDays size={28} /></span><div><p className="eyebrow">YOUR UPCOMING EVENTS</p><h3>No events have been published yet.</h3><p>When an administrator publishes a workshop, employer session, or deadline reminder, it will appear here.</p></div><Button className="quiet" onClick={() => go("/student/resources")}>Explore resources <ArrowRight size={15} /></Button></section>}
  </section>;
}

function AdminSettings({ go }) {
  const areas = [[Users, "Student experience", "Review student accounts and make sure their careers can progress without friction.", "/admin/students", "Open students"], [BriefcaseBusiness, "Opportunity flow", "Publish roles, review drafts, and keep application activity clear for every student.", "/admin/jobs", "Manage jobs"], [BookOpen, "Learning library", "Keep assessment, resource, and event content useful, current, and easy to discover.", "/admin/resources", "Manage learning"], [MessageCircle, "Community health", "Moderate activity and share official announcements from the community workspace.", "/admin/community", "Open community"]];
  return <section className="admin-settings-page">
    <header className="admin-settings-hero"><div><p className="eyebrow"><Settings size={14} /> PLATFORM GUIDE</p><h2>Run a consistent CareerForge experience.</h2><p>Operational controls live with the feature they affect, so every decision stays close to its workflow.</p></div><span><ShieldCheck size={27} /><b>Workflow-first</b><small>No hidden settings</small></span></header>
    <section className="settings-principles"><article><b>01</b><div><h3>Student-first controls</h3><p>Account and profile operations stay in Students, where their impact is easiest to review.</p></div></article><article><b>02</b><div><h3>Content stays contextual</h3><p>Jobs, assessments, resources, and events are managed from their own dedicated workspaces.</p></div></article><article><b>03</b><div><h3>Community stays accountable</h3><p>Moderation, reports, and official announcements remain together in one review queue.</p></div></article></section>
    <section className="settings-area-grid">{areas.map(([Icon, title, copy, route, action]) => <article key={title}><span><Icon size={21} /></span><h3>{title}</h3><p>{copy}</p><button onClick={() => go(route)}>{action} <ArrowRight size={15} /></button></article>)}</section>
  </section>;
}

function CommunityFeed() {
  const current = getSession(); const headers = { "Content-Type": "application/json", "X-User-Id": current?.id || "" }; const [posts, setPosts] = useState([]); const [draft, setDraft] = useState(""); const [comments, setComments] = useState({}); const [notice, setNotice] = useState("");
  const load = () => fetch(`${API_BASE_URL}/community/posts`, { headers }).then(responseBody).then(setPosts).catch((error) => setNotice(error.message));
  useEffect(() => { load(); }, []);
  const publish = async (event) => { event.preventDefault(); if (!draft.trim()) return; try { await responseBody(await fetch(`${API_BASE_URL}/community/posts`, { method: "POST", headers, body: JSON.stringify({ content: draft }) })); setDraft(""); load(); } catch (error) { setNotice(error.message); } };
  const like = async (postId) => { try { await responseBody(await fetch(`${API_BASE_URL}/community/posts/${postId}/likes`, { method: "POST", headers })); load(); } catch (error) { setNotice(error.message); } };
  const comment = async (event, postId) => { event.preventDefault(); const content = comments[postId]?.trim(); if (!content) return; try { await responseBody(await fetch(`${API_BASE_URL}/community/posts/${postId}/comments`, { method: "POST", headers, body: JSON.stringify({ content }) })); setComments((old) => ({ ...old, [postId]: "" })); load(); } catch (error) { setNotice(error.message); } };
  return <section className="community-feed content-card"><div className="list-heading"><h3>Community feed</h3><span>{posts.length} posts</span></div><form className="post-composer" onSubmit={publish}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength="5000" /><Button disabled={!draft.trim()} type="submit"><Plus size={15} /> Publish</Button></form>{notice && <p className="form-error">{notice}</p>}<div className="feed-list">{posts.map((post) => <article className="feed-post" key={post.id}><header><span>{post.authorName?.slice(0, 1)?.toUpperCase()}</span><div><b>{post.authorName}</b><small>Student community</small></div></header><p>{post.content}</p><footer><button className={post.likedByMe ? "liked" : ""} onClick={() => like(post.id)}>♥ {post.likeCount}</button><span>{post.commentCount} comment{post.commentCount === 1 ? "" : "s"}</span></footer><div className="post-comments">{post.comments.map((item) => <p key={item.id}><b>{item.authorName}</b>{item.content}</p>)}<form onSubmit={(event) => comment(event, post.id)}><input value={comments[post.id] || ""} onChange={(event) => setComments((old) => ({ ...old, [post.id]: event.target.value }))} maxLength="2000" /><button disabled={!comments[post.id]?.trim()} type="submit">Comment</button></form></div></article>)}{!posts.length && <p className="muted">Be the first student to share an idea with the community.</p>}</div></section>;
}

function CommunityEnhanced() {
  const current = getSession(); const headers = { "Content-Type": "application/json", "X-User-Id": current?.id || "" };
  const [posts, setPosts] = useState([]); const [draft, setDraft] = useState(""); const [mediaUrl, setMediaUrl] = useState(""); const [topicTags, setTopicTags] = useState(""); const [comments, setComments] = useState({}); const [notice, setNotice] = useState("");
  const load = () => fetch(`${API_BASE_URL}/community/posts`, { headers }).then(responseBody).then(setPosts).catch((error) => setNotice(error.message));
  useEffect(() => { load(); }, []);
  const publish = async (event) => { event.preventDefault(); if (!draft.trim()) return; try { const post = await responseBody(await fetch(`${API_BASE_URL}/community/posts`, { method: "POST", headers, body: JSON.stringify({ content: draft, mediaUrl, topicTags }) })); setDraft(""); setMediaUrl(""); setTopicTags(""); window.dispatchEvent(new Event("community-allowance-updated")); setNotice(post.status === "pending_review" ? "Your post is pending moderator review because it matched safety rules." : "Your post is now visible in the community."); load(); } catch (error) { setNotice(error.message); } };
  const like = async (postId) => { try { await responseBody(await fetch(`${API_BASE_URL}/community/posts/${postId}/likes`, { method: "POST", headers })); load(); } catch (error) { setNotice(error.message); } };
  const comment = async (event, postId) => { event.preventDefault(); const content = comments[postId]?.trim(); if (!content) return; try { await responseBody(await fetch(`${API_BASE_URL}/community/posts/${postId}/comments`, { method: "POST", headers, body: JSON.stringify({ content }) })); setComments((old) => ({ ...old, [postId]: "" })); window.dispatchEvent(new Event("community-allowance-updated")); load(); } catch (error) { setNotice(error.message); } };
  const share = async (post) => { try { await responseBody(await fetch(`${API_BASE_URL}/community/posts/${post.id}/shares`, { method: "POST", headers })); await navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}#/student/community?post=${post.id}`); setNotice("Post link copied. Your share is counted only once."); load(); } catch (error) { setNotice(error.message); } };
  const report = async (post) => { const reason = window.prompt("Report reason: spam, fraud, harassment, misinformation, or other", "spam")?.trim().toLowerCase(); if (!reason) return; try { await responseBody(await fetch(`${API_BASE_URL}/community/posts/${post.id}/reports?reason=${encodeURIComponent(reason)}`, { method: "POST", headers })); setNotice("Report submitted for moderator review."); } catch (error) { setNotice(error.message); } };
  const deletePost = async (post) => { if (!window.confirm("Remove your post from the community?")) return; try { await responseBody(await fetch(`${API_BASE_URL}/community/posts/${post.id}`, { method: "DELETE", headers })); setNotice("Your post was removed."); load(); } catch (error) { setNotice(error.message); } };
  return <section className="community-feed content-card"><div className="list-heading"><div><h3>Community feed</h3><small>Share career ideas. Posts are checked for spam and fraud before other students can interact with them.</small></div><span>{posts.length} posts</span></div><form className="post-composer" onSubmit={publish}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength="5000" /><div className="community-post-options"><input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} maxLength="500" /><input value={topicTags} onChange={(event) => setTopicTags(event.target.value)} maxLength="500" /></div><Button disabled={!draft.trim()} type="submit"><Plus size={15} /> Publish</Button></form>{notice && <p className={notice.includes("pending") || notice.includes("visible") || notice.includes("submitted") || notice.includes("removed") || notice.includes("copied") ? "form-success" : "form-error"}>{notice}</p>}<div className="feed-list">{posts.map((post) => <article className={`feed-post ${post.status !== "visible" ? "pending-post" : ""}`} key={post.id}><header><span>{post.authorName?.slice(0, 1)?.toUpperCase()}</span><div><b>{post.authorName}</b><small>{post.status === "visible" ? "Student community" : post.status === "pending_review" ? "Pending moderator review" : "Removed"}</small></div>{post.authorName === current?.name && <button className="text-button" onClick={() => deletePost(post)}>Delete</button>}</header><p>{post.content}</p>{post.mediaUrl && <a className="post-link" href={post.mediaUrl} target="_blank" rel="noreferrer">Open shared link</a>}{post.topicTags && <div className="post-tags">{post.topicTags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => <span key={tag}>#{tag}</span>)}</div>}{post.status === "visible" ? <><footer><button className={post.likedByMe ? "liked" : ""} onClick={() => like(post.id)}>♥ {post.likeCount}</button><button onClick={() => share(post)}>Share {post.shareCount}</button><button onClick={() => report(post)}>Report</button><span>{post.commentCount} comment{post.commentCount === 1 ? "" : "s"}</span></footer><div className="post-comments">{post.comments.map((item) => <p key={item.id}><b>{item.authorName}</b>{item.content}</p>)}<form onSubmit={(event) => comment(event, post.id)}><input value={comments[post.id] || ""} onChange={(event) => setComments((old) => ({ ...old, [post.id]: event.target.value }))} maxLength="2000" /><button disabled={!comments[post.id]?.trim()} type="submit">Comment</button></form></div></> : <p className="pending-note">Only you and community moderators can see this post until it is reviewed.</p>}</article>)}{!posts.length && <p className="muted">Be the first student to share an idea with the community.</p>}</div></section>;
}

function CommunityAllowanceCard() {
  const current = getSession(); const [allowance, setAllowance] = useState(null); const [now, setNow] = useState(Date.now());
  const load = () => fetch(`${API_BASE_URL}/community/posts/allowance`, { headers: { "X-User-Id": current?.id || "" } }).then(responseBody).then(setAllowance).catch(() => setAllowance(null));
  useEffect(() => { load(); const refresh = () => load(); window.addEventListener("community-allowance-updated", refresh); const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => { window.removeEventListener("community-allowance-updated", refresh); window.clearInterval(timer); }; }, []);
  const seconds = allowance?.refreshAt ? Math.max(0, Math.ceil((new Date(allowance.refreshAt).getTime() - now) / 1000)) : 0; const countdown = `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:${String(Math.floor(seconds % 3600 / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return <section className="community-allowance"><div className="allowance-icon">⚡</div><div><p>COMMUNITY POINTS</p><h3>{allowance ? `${allowance.points} / 10 available` : "Loading points…"}</h3><small>Posts and comments cost 1 point. Likes, shares, and reports are free.</small></div><div className="allowance-refresh"><small>FULL REFRESH IN</small><strong>{countdown}</strong></div></section>;
}

function Community() { return <section className="student-community-page"><header className="student-page-heading"><p>MY CAREERFORGE</p><h2>Community</h2><span>Share ideas, find encouragement, and keep moving together.</span></header><CommunityAllowanceCard /><CommunityEnhanced /></section>; }

function CommunityChat() {
  const current = getSession(); const headers = { "Content-Type": "application/json", "X-User-Id": current?.id || "" };
  const [students, setStudents] = useState([]); const [connections, setConnections] = useState([]); const [posts, setPosts] = useState([]); const [selected, setSelected] = useState(null); const [messages, setMessages] = useState([]); const [search, setSearch] = useState(""); const [draft, setDraft] = useState(""); const [postDraft, setPostDraft] = useState(""); const [commentDrafts, setCommentDrafts] = useState({}); const [notice, setNotice] = useState(""); const [live, setLive] = useState(false);
  const load = async (term = search) => { if (!current?.id) return; try { const [people, links, feed] = await Promise.all([fetch(`${API_BASE_URL}/community/students?query=${encodeURIComponent(term)}`, { headers }).then(responseBody), fetch(`${API_BASE_URL}/community/connections`, { headers }).then(responseBody), fetch(`${API_BASE_URL}/community/posts`, { headers }).then(responseBody)]); setStudents(people); setConnections(links); setPosts(feed); } catch (error) { setNotice(error.message); } };
  useEffect(() => { load(""); }, []);
  useEffect(() => { if (!selected?.id) { setMessages([]); return; } fetch(`${API_BASE_URL}/community/connections/${selected.id}/messages`, { headers }).then(responseBody).then(setMessages).catch((error) => setNotice(error.message)); }, [selected?.id]);
  useEffect(() => {
    if (!current?.id) return undefined;
    const base = API_BASE_URL.startsWith("http") ? API_BASE_URL.replace(/^http/, "ws") : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}${API_BASE_URL}`;
    const socket = new WebSocket(`${base}/ws/chat?userId=${encodeURIComponent(current.id)}`);
    socket.onopen = () => setLive(true); socket.onclose = () => setLive(false);
    socket.onmessage = (event) => { try { const packet = JSON.parse(event.data); if (packet.type === "message") { const incoming = packet.message; setMessages((old) => old.some((item) => item.id === incoming.id) ? old : [...old, incoming]); load(); } if (packet.type === "error") setNotice(packet.message); } catch { } };
    window.communitySocket = socket;
    return () => { socket.close(); if (window.communitySocket === socket) window.communitySocket = null; };
  }, [current?.id]);
  const request = async (studentId) => { try { await responseBody(await fetch(`${API_BASE_URL}/community/connections`, { method: "POST", headers, body: JSON.stringify({ studentId }) })); setNotice("Connection request sent."); load(); } catch (error) { setNotice(error.message); } };
  const createPost = async (event) => { event.preventDefault(); if (!postDraft.trim()) return; try { await responseBody(await fetch(`${API_BASE_URL}/community/posts`, { method: "POST", headers, body: JSON.stringify({ content: postDraft }) })); setPostDraft(""); setNotice("Your community post is published."); load(); } catch (error) { setNotice(error.message); } };
  const likePost = async (postId) => { try { await responseBody(await fetch(`${API_BASE_URL}/community/posts/${postId}/likes`, { method: "POST", headers })); load(); } catch (error) { setNotice(error.message); } };
  const addComment = async (event, postId) => { event.preventDefault(); const content = commentDrafts[postId]?.trim(); if (!content) return; try { await responseBody(await fetch(`${API_BASE_URL}/community/posts/${postId}/comments`, { method: "POST", headers, body: JSON.stringify({ content }) })); setCommentDrafts((old) => ({ ...old, [postId]: "" })); load(); } catch (error) { setNotice(error.message); } };
  const accept = async (connectionId) => { try { await responseBody(await fetch(`${API_BASE_URL}/community/connections/${connectionId}/accept`, { method: "PUT", headers })); setNotice("Connection accepted. You can now chat live."); load(); } catch (error) { setNotice(error.message); } };
  const remove = async (connectionId) => { if (!window.confirm("Remove this connection and its messages?")) return; try { await responseBody(await fetch(`${API_BASE_URL}/community/connections/${connectionId}`, { method: "DELETE", headers })); if (selected?.id === connectionId) setSelected(null); setNotice("Connection removed."); load(); } catch (error) { setNotice(error.message); } };
  const send = async (event) => { event.preventDefault(); const content = draft.trim(); if (!content || !selected) return; const socket = window.communitySocket; if (socket?.readyState === WebSocket.OPEN) { socket.send(JSON.stringify({ connectionId: selected.id, content })); setDraft(""); return; } try { const message = await responseBody(await fetch(`${API_BASE_URL}/community/connections/${selected.id}/messages`, { method: "POST", headers, body: JSON.stringify({ content }) })); setMessages((old) => [...old, message]); setDraft(""); } catch (error) { setNotice(error.message); } };
  const accepted = connections.filter((connection) => connection.status === "accepted"); const pending = connections.filter((connection) => connection.status === "pending");
  return <section className="community-page"><div className="content-intro compact"><div><p className="eyebrow"><MessageCircle size={14} /> STUDENT COMMUNITY</p><h2>Connect, then chat in real time.</h2><p>Discover classmates, accept connections, and exchange career ideas through a live client-server socket channel.</p></div><span className={`chat-live ${live ? "online" : ""}`}>{live ? "Live chat online" : "Connecting..."}</span></div>{notice && <p className="form-success">{notice}</p>}<div className="community-layout"><section className="content-card community-directory"><div className="list-heading"><h3>Discover students</h3><span>{students.length} shown</span></div><div className="community-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && load()} /><button onClick={() => load()} aria-label="Search"><ArrowRight size={15} /></button></div><div className="person-list">{students.map((student) => <article key={student.id}><span>{student.name?.slice(0, 1)?.toUpperCase()}</span><div><b>{student.name}</b><small>{student.email}</small></div>{student.connectionStatus === "accepted" ? <button className="text-button" onClick={() => setSelected(connections.find((item) => item.id === student.connectionId) || null)}>Chat</button> : student.connectionStatus === "pending" && !student.outgoing ? <button className="text-button" onClick={() => accept(student.connectionId)}>Accept</button> : student.connectionStatus === "pending" ? <small>Requested</small> : <button className="text-button" onClick={() => request(student.id)}>Connect</button>}</article>)}{!students.length && <p className="muted">No students found. Try a different name.</p>}</div></section><section className="content-card community-connections"><div className="list-heading"><h3>Your connections</h3><span>{accepted.length} active</span></div><div className="connection-list">{pending.map((connection) => <article key={connection.id}><div><b>{connection.studentName}</b><small>{connection.outgoing ? "Request sent" : "Wants to connect"}</small></div><div>{!connection.outgoing && <button className="text-button" onClick={() => accept(connection.id)}>Accept</button>}<button className="icon-action danger" onClick={() => remove(connection.id)} title="Remove connection"><Trash2 size={14} /></button></div></article>)}{accepted.map((connection) => <article key={connection.id} className={selected?.id === connection.id ? "selected" : ""}><button className="connection-select" onClick={() => setSelected(connection)}><span>{connection.studentName?.slice(0, 1)?.toUpperCase()}</span><div><b>{connection.studentName}</b><small>{connection.unreadCount ? `${connection.unreadCount} unread message${connection.unreadCount > 1 ? "s" : ""}` : "Connected"}</small></div></button><button className="icon-action danger" onClick={() => remove(connection.id)} title="Remove connection"><Trash2 size={14} /></button></article>)}{!connections.length && <p className="muted">Connect with a student to start a private conversation.</p>}</div></section><section className="content-card community-chat"><header><div><p className="eyebrow">PRIVATE CHAT</p><h3>{selected ? selected.studentName : "Choose a connection"}</h3></div>{selected && <span className="chat-live online">Socket chat</span>}</header><div className="message-list">{selected ? messages.map((message) => <article key={message.id} className={message.senderId === current?.id ? "mine" : "theirs"}><small>{message.senderId === current?.id ? "You" : message.senderName}</small><p>{message.content}</p></article>) : <p className="muted">Accepted connections can message each other instantly. This chat is stored in MySQL and delivered through WebSocket.</p>}{selected && !messages.length && <p className="muted">Start the conversation with {selected.studentName}.</p>}</div><form onSubmit={send}><input value={draft} disabled={!selected} onChange={(event) => setDraft(event.target.value)} maxLength="2000" /><Button disabled={!selected || !draft.trim()} type="submit">Send <ArrowRight size={15} /></Button></form></section></div></section>;
}

function LegacyConnect({ go }) {
  const current = getSession(); const headers = { "Content-Type": "application/json", "X-User-Id": current?.id || "" };
  const [students, setStudents] = useState([]); const [connections, setConnections] = useState([]); const [search, setSearch] = useState(""); const [notice, setNotice] = useState("");
  const load = async (term = search) => { try { const [people, links] = await Promise.all([fetch(`${API_BASE_URL}/community/students?query=${encodeURIComponent(term)}`, { headers }).then(responseBody), fetch(`${API_BASE_URL}/community/connections`, { headers }).then(responseBody)]); setStudents(people); setConnections(links); } catch (error) { setNotice(error.message); } };
  useEffect(() => { load(""); }, []);
  const request = async (studentId) => { try { await responseBody(await fetch(`${API_BASE_URL}/community/connections`, { method: "POST", headers, body: JSON.stringify({ studentId }) })); setNotice("Connection request sent."); load(); } catch (error) { setNotice(error.message); } };
  const accept = async (connectionId) => { try { await responseBody(await fetch(`${API_BASE_URL}/community/connections/${connectionId}/accept`, { method: "PUT", headers })); setNotice("Connection accepted. Their basic profile and chat are now available."); load(); } catch (error) { setNotice(error.message); } };
  const remove = async (connectionId) => { if (!window.confirm("Remove this connection and its messages?")) return; try { await responseBody(await fetch(`${API_BASE_URL}/community/connections/${connectionId}`, { method: "DELETE", headers })); setNotice("Connection removed."); load(); } catch (error) { setNotice(error.message); } };
  const pending = connections.filter((connection) => connection.status === "pending"); const accepted = connections.filter((connection) => connection.status === "accepted");
  return <section className="connect-page"><div className="content-intro compact"><div><p className="eyebrow"><Users size={14} /> STUDENT CONNECTIONS</p><h2>Discover classmates and build your network.</h2><p>Send a request first. After it is accepted, both students can view a basic profile and begin a private real-time chat.</p></div><span className="admin-total">{accepted.length} connected</span></div>{notice && <p className="form-success">{notice}</p>}<div className="connect-layout"><section className="content-card community-directory"><div className="list-heading"><h3>Discover students</h3><span>{students.length} shown</span></div><div className="community-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && load()} /><button onClick={() => load()} aria-label="Search"><ArrowRight size={15} /></button></div><div className="person-list">{students.map((student) => <article key={student.id}><span>{student.name?.slice(0, 1)?.toUpperCase()}</span><div><b>{student.name}</b><small>{student.connectionStatus === "accepted" ? "Connected student" : "CareerForge student"}</small></div>{student.connectionStatus === "accepted" ? <button className="text-button" onClick={() => go("/student/chat")}>Message</button> : student.connectionStatus === "pending" && !student.outgoing ? <button className="text-button" onClick={() => accept(student.connectionId)}>Accept</button> : student.connectionStatus === "pending" ? <button className="text-button" onClick={() => remove(student.connectionId)}>Cancel</button> : <button className="text-button" onClick={() => request(student.id)}>Add</button>}</article>)}{!students.length && <p className="muted">No students found. Try a different search.</p>}</div></section><section className="content-card connection-manager"><div className="list-heading"><h3>Your requests and connections</h3><span>{connections.length} total</span></div><div className="connection-list">{pending.map((connection) => <article key={connection.id}><div><b>{connection.studentName}</b><small>{connection.outgoing ? "Request sent" : "Wants to connect"}</small></div><div>{!connection.outgoing && <button className="text-button" onClick={() => accept(connection.id)}>Accept</button>}<button className="text-button" onClick={() => remove(connection.id)}>{connection.outgoing ? "Cancel" : "Decline"}</button></div></article>)}{accepted.map((connection) => <article key={connection.id}><div><b>{connection.studentName}</b><small>{connection.unreadCount ? `${connection.unreadCount} unread message${connection.unreadCount > 1 ? "s" : ""}` : "Profile and chat unlocked"}</small></div><div><button className="text-button" onClick={() => go("/student/chat")}>Message</button><button className="icon-action danger" onClick={() => remove(connection.id)} title="Remove connection"><Trash2 size={14} /></button></div></article>)}{!connections.length && <p className="muted">No requests yet. Find a classmate and send the first connection request.</p>}</div></section></div></section>;
}

function Connect({ go }) {
  const current = getSession();
  const headers = { "Content-Type": "application/json", "X-User-Id": current?.id || "" };
  const [students, setStudents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [live, setLive] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const load = async (term = search) => {
    try {
      const [people, links] = await Promise.all([
        fetch(`${API_BASE_URL}/community/students?query=${encodeURIComponent(term)}`, { headers }).then(responseBody),
        fetch(`${API_BASE_URL}/community/connections`, { headers }).then(responseBody),
      ]);
      setStudents(people); setConnections(links);
      const acceptedLinks = links.filter((item) => item.status === "accepted");
      setSelected((old) => old ? acceptedLinks.find((item) => item.id === old.id) || acceptedLinks[0] || null : acceptedLinks[0] || null);
    } catch (error) { setNotice(error.message); }
  };

  useEffect(() => { load(""); }, []);
  useEffect(() => {
    if (!selected?.id) { setMessages([]); return; }
    setLoadingChat(true);
    fetch(`${API_BASE_URL}/community/connections/${selected.id}/messages`, { headers }).then(responseBody).then(setMessages).catch((error) => setNotice(error.message)).finally(() => setLoadingChat(false));
  }, [selected?.id]);
  useEffect(() => {
    if (!current?.id) return undefined;
    const base = API_BASE_URL.startsWith("http") ? API_BASE_URL.replace(/^http/, "ws") : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}${API_BASE_URL}`;
    const socket = new WebSocket(`${base}/ws/chat?userId=${encodeURIComponent(current.id)}`);
    socket.onopen = () => setLive(true); socket.onclose = () => setLive(false);
    socket.onmessage = (event) => { try { const packet = JSON.parse(event.data); if (packet.type === "message") { const incoming = packet.message; setMessages((old) => old.some((item) => item.id === incoming.id) ? old : [...old, incoming]); load(); } if (packet.type === "error") setNotice(packet.message); } catch { } };
    window.communitySocket = socket;
    return () => { socket.close(); if (window.communitySocket === socket) window.communitySocket = null; };
  }, [current?.id]);

  const request = async (studentId) => { try { await responseBody(await fetch(`${API_BASE_URL}/community/connections`, { method: "POST", headers, body: JSON.stringify({ studentId }) })); setNotice("Connection request sent."); load(); } catch (error) { setNotice(error.message); } };
  const accept = async (connectionId) => { try { await responseBody(await fetch(`${API_BASE_URL}/community/connections/${connectionId}/accept`, { method: "PUT", headers })); setNotice("Connection accepted. You can start chatting now."); load(); } catch (error) { setNotice(error.message); } };
  const remove = async (connectionId) => { if (!window.confirm("Remove this connection and its messages?")) return; try { await responseBody(await fetch(`${API_BASE_URL}/community/connections/${connectionId}`, { method: "DELETE", headers })); if (selected?.id === connectionId) setSelected(null); setNotice("Connection removed."); load(); } catch (error) { setNotice(error.message); } };
  const send = async (event) => { event.preventDefault(); const content = draft.trim(); if (!content || !selected) return; const socket = window.communitySocket; if (socket?.readyState === WebSocket.OPEN) { socket.send(JSON.stringify({ connectionId: selected.id, content })); setDraft(""); return; } try { const message = await responseBody(await fetch(`${API_BASE_URL}/community/connections/${selected.id}/messages`, { method: "POST", headers, body: JSON.stringify({ content }) })); setMessages((old) => [...old, message]); setDraft(""); } catch (error) { setNotice(error.message); } };
  const pending = connections.filter((item) => item.status === "pending");
  const accepted = connections.filter((item) => item.status === "accepted");

  return <section className="connect-page connection-hub">
    <header className="student-page-heading"><p>MY CAREERFORGE</p><h2>Connections &amp; inbox</h2><span>Find CareerForge students, build your network, and message privately.</span></header>
    <section className="connection-hub-hero"><p><Users size={14} /> STUDENT NETWORK</p><h3>Find your people. Build your career circle.</h3><span>Search verified CareerForge students, connect when they accept, then message privately.</span></section>
    {notice && <p className={notice.includes("sent") || notice.includes("accepted") || notice.includes("removed") ? "form-success" : "form-error"}>{notice}</p>}
    <div className="connection-hub-layout">
      <aside className="connection-hub-left">
        <section className="content-card connection-search-card"><header><div><h3>Find students</h3><p>Name, university, role, or student ID</p></div><Search size={21} /></header><div className="community-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && load()} /><button onClick={() => load()} aria-label="Search students"><ArrowRight size={15} /></button></div><small>Tip: type a student ID for an exact match, or at least two letters to search by name.</small>{search && <div className="person-list compact-results">{students.map((student) => <article key={student.id}><span>{student.name?.slice(0, 1)?.toUpperCase()}</span><div><b>{student.name}</b><small>{student.targetRole || student.university || "CareerForge student"}</small></div>{student.connectionStatus === "accepted" ? <button className="text-button" onClick={() => setSelected(accepted.find((item) => item.id === student.connectionId) || null)}>Open</button> : student.connectionStatus === "pending" && !student.outgoing ? <button className="text-button" onClick={() => accept(student.connectionId)}>Accept</button> : student.connectionStatus === "pending" ? <small>Requested</small> : <button className="text-button" onClick={() => request(student.id)}>Connect</button>}</article>)}{!students.length && <p className="muted">No matching students found.</p>}</div>}</section>
        <section className="content-card connection-list-card"><header><h3>Your connections</h3><span>{accepted.length}</span></header><div className="connection-list">{pending.map((item) => <article key={item.id}><div><b>{item.studentName}</b><small>{item.outgoing ? "Request sent" : "Wants to connect"}</small></div><div>{!item.outgoing && <button className="text-button" onClick={() => accept(item.id)}>Accept</button>}<button className="icon-action danger" onClick={() => remove(item.id)} title="Remove request"><Trash2 size={14} /></button></div></article>)}{accepted.map((item) => <article className={selected?.id === item.id ? "selected" : ""} key={item.id}><button className="connection-select" onClick={() => setSelected(item)}><span>{item.studentName?.slice(0, 1)?.toUpperCase()}</span><div><b>{item.studentName}</b><small>{item.unreadCount ? `${item.unreadCount} unread message${item.unreadCount === 1 ? "" : "s"}` : "Connected"}</small></div>{item.unreadCount > 0 && <em>{item.unreadCount}</em>}</button></article>)}{!connections.length && <p className="muted">Find a student and send your first connection request.</p>}</div></section>
      </aside>
      <section className="content-card community-chat connection-inbox"><header>{selected ? <><span className="chat-person-avatar">{selected.studentName?.slice(0, 1)?.toUpperCase()}</span><div><h3>{selected.studentName}</h3><small>CareerForge student · {live ? "Live chat online" : "Connecting..."}</small></div><nav><button onClick={() => go("/student/chat")}>Profile</button><button disabled>Clear history</button><button onClick={() => remove(selected.id)}>Remove</button></nav></> : <div><h3>Your private inbox</h3><small>Choose an accepted connection to begin.</small></div>}</header><div className="message-list">{loadingChat ? <p className="chat-placeholder"><RefreshCw size={18} className="spinning" /> Loading conversation...</p> : selected ? messages.map((message) => <article key={message.id} className={message.senderId === current?.id ? "mine" : "theirs"}><small>{message.senderId === current?.id ? "You" : message.senderName}</small><p>{message.content}</p></article>) : <p className="chat-placeholder"><MessageCircle size={25} />Select a connection to open your conversation.</p>}{selected && !loadingChat && !messages.length && <p className="chat-placeholder"><MessageCircle size={25} />Start the conversation with {selected.studentName}.</p>}</div><form onSubmit={send}><input value={draft} disabled={!selected} onChange={(event) => setDraft(event.target.value)} maxLength="2000" /><Button disabled={!selected || !draft.trim()} type="submit">Send <ArrowRight size={15} /></Button></form></section>
    </div>
  </section>;
}

function StudentChat() {
  const current = getSession(); const headers = { "Content-Type": "application/json", "X-User-Id": current?.id || "" };
  const [connections, setConnections] = useState([]); const [selected, setSelected] = useState(null); const [messages, setMessages] = useState([]); const [profile, setProfile] = useState(null); const [draft, setDraft] = useState(""); const [notice, setNotice] = useState(""); const [live, setLive] = useState(false);
  const loadConnections = () => fetch(`${API_BASE_URL}/community/connections`, { headers }).then(responseBody).then((items) => { const accepted = items.filter((item) => item.status === "accepted"); setConnections(accepted); setSelected((old) => old ? accepted.find((item) => item.id === old.id) || null : accepted[0] || null); }).catch((error) => setNotice(error.message));
  useEffect(() => { loadConnections(); }, []);
  useEffect(() => { if (!selected?.id) { setMessages([]); setProfile(null); return; } Promise.all([fetch(`${API_BASE_URL}/community/connections/${selected.id}/messages`, { headers }).then(responseBody), fetch(`${API_BASE_URL}/community/connections/${selected.id}/profile`, { headers }).then(responseBody)]).then(([conversation, connectedProfile]) => { setMessages(conversation); setProfile(connectedProfile); }).catch((error) => setNotice(error.message)); }, [selected?.id]);
  useEffect(() => { if (!current?.id) return undefined; const base = API_BASE_URL.startsWith("http") ? API_BASE_URL.replace(/^http/, "ws") : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}${API_BASE_URL}`; const socket = new WebSocket(`${base}/ws/chat?userId=${encodeURIComponent(current.id)}`); socket.onopen = () => setLive(true); socket.onclose = () => setLive(false); socket.onmessage = (event) => { try { const packet = JSON.parse(event.data); if (packet.type === "message") { const incoming = packet.message; setMessages((old) => old.some((item) => item.id === incoming.id) ? old : [...old, incoming]); loadConnections(); } if (packet.type === "error") setNotice(packet.message); } catch { } }; window.communitySocket = socket; return () => { socket.close(); if (window.communitySocket === socket) window.communitySocket = null; }; }, [current?.id]);
  const send = async (event) => { event.preventDefault(); const content = draft.trim(); if (!content || !selected) return; const socket = window.communitySocket; if (socket?.readyState === WebSocket.OPEN) { socket.send(JSON.stringify({ connectionId: selected.id, content })); setDraft(""); return; } try { const message = await responseBody(await fetch(`${API_BASE_URL}/community/connections/${selected.id}/messages`, { method: "POST", headers, body: JSON.stringify({ content }) })); setMessages((old) => [...old, message]); setDraft(""); } catch (error) { setNotice(error.message); } };
  const skills = profile?.skills ? profile.skills.split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 8) : [];
  return <section className="student-chat-page"><div className="content-intro compact"><div><p className="eyebrow"><MessageCircle size={14} /> PRIVATE REAL-TIME CHAT</p><h2>Chat with accepted connections.</h2><p>Messages are stored securely in your project database and delivered through the live client-server socket channel.</p></div><span className={`chat-live ${live ? "online" : ""}`}>{live ? "Live chat online" : "Connecting..."}</span></div>{notice && <p className="form-success">{notice}</p>}<div className="chat-page-layout"><section className="content-card chat-contacts"><div className="list-heading"><h3>Connections</h3><span>{connections.length} active</span></div><div className="connection-list">{connections.map((connection) => <article className={selected?.id === connection.id ? "selected" : ""} key={connection.id}><button className="connection-select" onClick={() => setSelected(connection)}><span>{connection.studentName?.slice(0, 1)?.toUpperCase()}</span><div><b>{connection.studentName}</b><small>{connection.unreadCount ? `${connection.unreadCount} unread` : "Connected"}</small></div></button></article>)}{!connections.length && <p className="muted">Accept a request in Connect before starting a chat.</p>}</div></section><section className="content-card community-chat"><header><div><p className="eyebrow">CONVERSATION</p><h3>{selected ? selected.studentName : "Choose a connection"}</h3></div>{selected && <span className="chat-live online">Socket chat</span>}</header><div className="message-list">{selected ? messages.map((message) => <article key={message.id} className={message.senderId === current?.id ? "mine" : "theirs"}><small>{message.senderId === current?.id ? "You" : message.senderName}</small><p>{message.content}</p></article>) : <p className="muted">Choose a connected student to open a conversation.</p>}{selected && !messages.length && <p className="muted">Start the conversation with {selected.studentName}.</p>}</div><form onSubmit={send}><input value={draft} disabled={!selected} onChange={(event) => setDraft(event.target.value)} maxLength="2000" /><Button disabled={!selected || !draft.trim()} type="submit">Send <ArrowRight size={15} /></Button></form></section><aside className="content-card connected-profile"><div className="profile-avatar">{profile?.profilePhotoUrl ? <img src={profile.profilePhotoUrl.startsWith("/") ? `${API_BASE_URL}${profile.profilePhotoUrl}` : profile.profilePhotoUrl} alt="Connected student's profile" /> : <span>{profile?.name?.slice(0, 1)?.toUpperCase() || "?"}</span>}</div><h3>{profile?.name || "Connected student"}</h3><p>{profile?.targetRole || "Career direction not added"}</p><dl><div><dt>University</dt><dd>{profile?.university || "Not shared"}</dd></div><div><dt>Location</dt><dd>{profile?.location || "Not shared"}</dd></div><div><dt>Degree</dt><dd>{profile?.degree || "Not shared"}</dd></div></dl>{skills.length > 0 && <><small className="profile-label">SKILLS</small><div className="profile-skills">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></>}{profile?.bio && <p className="profile-bio">{profile.bio}</p>}<small className="muted">Visible because your connection has been accepted.</small></aside></div></section>;
}

function Workspace({ role, section, go }) {
  const admin = role === "admin"; const current = getSession(); const items = admin ? adminItems : studentItems; const label = items.find(([id]) => id === section)?.[1] || "Overview"; const [query, setQuery] = useState(""); const [accountOpen, setAccountOpen] = useState(false); const [notificationsOpen, setNotificationsOpen] = useState(false); const [notifications, setNotifications] = useState([]); const [notificationsRead, setNotificationsRead] = useState(false); const [workspacePhotoUrl, setWorkspacePhotoUrl] = useState(""); const matches = query.trim() ? items.filter(([id, name]) => `${id} ${name}`.toLowerCase().includes(query.trim().toLowerCase())) : [];
  const searchPlaceholder = workspaceSearchPlaceholders[admin ? "admin" : "student"]?.[section] || `Search ${admin ? "admin" : "workspace"}...`;
  useEffect(() => { if (admin || !current?.id) { setWorkspacePhotoUrl(""); return undefined; } let active = true; fetch(`${API_BASE_URL}/profiles/${current.id}`, { headers: { "X-User-Id": current.id } }).then(responseBody).then((body) => { if (!active) return; const value = body.profilePhotoUrl; setWorkspacePhotoUrl(value?.startsWith("/") ? `${API_BASE_URL}${value}?v=${Date.now()}` : value || ""); }).catch(() => { if (active) setWorkspacePhotoUrl(""); }); return () => { active = false; }; }, [admin, current?.id, section]);
  useEffect(() => { const avatar = document.querySelector(".account-control .avatar"); if (!avatar) return; avatar.classList.toggle("has-photo", Boolean(workspacePhotoUrl)); if (workspacePhotoUrl) { avatar.textContent = ""; const image = document.createElement("img"); image.src = workspacePhotoUrl; image.alt = "Profile"; avatar.appendChild(image); } else if (!avatar.textContent.trim()) avatar.textContent = current?.name?.slice(0, 1)?.toUpperCase() || (admin ? "A" : "S"); }, [workspacePhotoUrl, accountOpen, query, current?.name, admin]);
  useEffect(() => { if (!accountOpen) return undefined; const closeMenu = (event) => { if (!event.target.closest(".account-control")) setAccountOpen(false); }; const closeOnEscape = (event) => { if (event.key === "Escape") setAccountOpen(false); }; document.addEventListener("pointerdown", closeMenu); document.addEventListener("keydown", closeOnEscape); return () => { document.removeEventListener("pointerdown", closeMenu); document.removeEventListener("keydown", closeOnEscape); }; }, [accountOpen]);
  useEffect(() => {
    if (!current?.id) return undefined;
    let active = true;
    const headers = { "X-User-Id": current.id };
    const readKey = `careerforge_notifications_read_${current.id}`;
    setNotificationsRead(localStorage.getItem(readKey) === "true");
    const safeGet = (url) => fetch(url, { headers }).then(responseBody).catch(() => []);
    const load = async () => {
      const [applications, connections, events] = admin
        ? [await safeGet(`${API_BASE_URL}/admin/applications`), [], []]
        : await Promise.all([safeGet(`${API_BASE_URL}/applications`), safeGet(`${API_BASE_URL}/community/connections`), safeGet(`${API_BASE_URL}/events`)]);
      const next = [];
      if (admin) applications.slice(0, 4).forEach((item) => next.push({ id: `application-${item.id}`, kind: "application", title: `${item.studentName || "Student"} submitted an application`, detail: `${item.jobTitle || "Published role"} · ${item.status || "New"}` }));
      else {
        applications.slice(0, 3).forEach((item) => next.push({ id: `application-${item.id}`, kind: "application", title: `${item.jobTitle || "Application"} update`, detail: `${item.companyName || "CareerForge"} · ${item.status || "Submitted"}` }));
        connections.filter((item) => item.status === "pending" && !item.outgoing).slice(0, 2).forEach((item) => next.push({ id: `connection-${item.id}`, kind: "connection", title: `${item.studentName || "A student"} wants to connect`, detail: "Open Connections & inbox to respond" }));
        events.slice(0, 2).forEach((item) => next.push({ id: `event-${item.id}`, kind: "event", title: `Upcoming: ${item.title}`, detail: item.location || "CareerForge event" }));
      }
      if (active) setNotifications(next);
    };
    load();
    return () => { active = false; };
  }, [admin, current?.id]);
  useEffect(() => { if (!notificationsOpen) return undefined; const closeMenu = (event) => { if (!event.target.closest(".notification-area")) setNotificationsOpen(false); }; document.addEventListener("pointerdown", closeMenu); return () => document.removeEventListener("pointerdown", closeMenu); }, [notificationsOpen]);
  const placeholder = { assessments: [admin ? "Create skill assessments" : "Measure your skills", "Published assessments and performance history will appear here."], vault: ["Career Vault", "Your resume sections and uploaded documents will appear here."], community: ["Community", "Posts, comments, and moderation activity will appear here."], resources: ["Learning resources", "Administrator-published resources will appear here."], events: ["Events", "Upcoming workshops and event registrations will appear here."], students: ["Student directory", "Registered student accounts will appear here."], settings: ["Platform settings", "Safe operational settings will appear here."] };
  const dashboard = <StudentOverview go={go} />;
  const content = admin && section === "overview" ? <AdminOverview go={go} />
    : admin && section === "students" ? <AdminStudents />
    : admin && section === "applications" ? <AdminApplications />
    : admin && section === "community" ? <AdminCommunity />
    : admin && ["assessments", "resources", "events"].includes(section) ? <AdminContentManager kind={section} />
    : section === "overview" ? dashboard
    : section === "applications" && !admin ? <StudentApplications />
    : section === "profile" && !admin ? <StudentProfile />
    : section === "performance" && !admin ? <StudentStatusPanel title="Performance" copy="Your performance history and progress insights will appear here." />
    : section === "achievements" && !admin ? <StudentStatusPanel title="Achievements" copy="Your achievements and milestones will appear here." />
    : section === "assessments" && !admin ? <LearningPaths />
    : section === "resources" && !admin ? <StudentResources />
    : section === "events" && !admin ? <StudentEvents go={go} />
    : section === "community" && !admin ? <Community />
    : section === "connect" && !admin ? <Connect go={go} />
    : section === "chat" && !admin ? <StudentChat />
    : section === "vault" && !admin ? <CareerVault />
    : admin && section === "settings" ? <AdminSettings go={go} />
    : section === "jobs" ? admin ? <AdminJobs /> : <StudentJobs />
    : <EmptyPanel title={placeholder[section]?.[0] || label} copy={placeholder[section]?.[1] || "This section is ready for Spring Boot API data."} />;
  const markNotificationsRead = () => { setNotificationsRead(true); if (current?.id) localStorage.setItem(`careerforge_notifications_read_${current.id}`, "true"); };
  const notificationUnread = notifications.length > 0 && !notificationsRead;
  const signOut = () => { localStorage.removeItem("careerforge_session"); go("/"); };
  return <main className={`workspace ${admin ? "admin-workspace" : "student-workspace"}`}><aside className="sidebar"><Brand onClick={() => go(`/${role}/overview`)} /><div className="sidebar-role">{admin ? "ADMIN WORKSPACE" : "WORKSPACE"}</div><nav>{items.map(([id, name, Icon]) => <button className={id === section ? "active" : ""} onClick={() => go(`/${role}/${id}`)} key={id}><Icon size={17} />{name}</button>)}</nav><button className="signout" onClick={signOut}>Sign out</button></aside><div className="workspace-main"><header className="workspace-header"><div className="workspace-heading"><p className="breadcrumb">{admin ? "ADMINISTRATION" : "CAREERFORGE"}</p><h1>{label}</h1></div><div className="top-actions"><div className="workspace-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} aria-label={searchPlaceholder} />{matches.length > 0 && <div className="search-results">{matches.map(([id, name, Icon]) => <button key={id} onClick={() => { go(`/${role}/${id}`); setQuery(""); }}><Icon size={15} />{name}</button>)}</div>}{query && matches.length === 0 && <div className="search-results no-results">No matching portal section.</div>}</div><div className="notification-area"><button type="button" className="notification-control" onClick={() => setNotificationsOpen((open) => !open)} aria-expanded={notificationsOpen} aria-label="Notifications" title="Notifications"><Bell size={18} />{notificationUnread && <i />}</button>{notificationsOpen && <div className="notification-menu"><header><div><b>Notifications</b><small>{notifications.length ? `${notifications.length} update${notifications.length === 1 ? "" : "s"}` : "You are all caught up"}</small></div><button type="button" onClick={markNotificationsRead} disabled={!notificationUnread}>Mark all read</button></header><div className="notification-list">{notifications.length ? notifications.map((item) => { const Icon = item.kind === "connection" ? Users : item.kind === "event" ? CalendarDays : ClipboardCheck; const target = admin ? "/admin/applications" : item.kind === "connection" ? "/student/connect" : item.kind === "event" ? "/student/events" : "/student/applications"; return <button type="button" className="notification-item" key={item.id} onClick={() => { markNotificationsRead(); setNotificationsOpen(false); go(target); }}><span><Icon size={16} /></span><div><b>{item.title}</b><small>{item.detail}</small></div></button>; }) : <p className="notification-empty">No new updates right now.</p>}</div></div>}</div><div className="account-control"><button type="button" className="account-control-trigger" onClick={() => setAccountOpen(!accountOpen)} aria-label="Open account menu"><span className="avatar">{current?.name?.slice(0, 1)?.toUpperCase() || (admin ? "A" : "S")}</span><span className="account-identity"><b>{current?.name || (admin ? "Administrator" : "Student")}</b><small>{admin ? "Administrator" : "Student"}</small></span><ChevronDown size={16} /></button>{accountOpen && <div className="account-menu"><b>{current?.name || (admin ? "Administrator" : "Student")}</b><small>{current?.email || "Local session"}</small>{!admin && <button onClick={() => { go("/student/profile"); setAccountOpen(false); }}>My profile</button>}<button onClick={signOut}>Sign out</button></div>}</div></div></header>{content}</div></main>;
}

function App() {
  const [route, go] = useRoute();
  useEffect(() => {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem("careerforge_theme");
  }, []);
  useEffect(() => {
    const timeouts = new WeakMap();
    const dismiss = (toast) => {
      window.clearTimeout(timeouts.get(toast));
      toast.classList.add("toast-dismissed");
    };
    const prepareToast = (toast) => {
      const message = Array.from(toast.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent.trim()).join(" ");
      if (!message || toast.dataset.toastMessage === message) return;
      toast.dataset.toastMessage = message;
      toast.classList.remove("toast-dismissed");
      toast.setAttribute("role", toast.classList.contains("form-error") ? "alert" : "status");
      toast.setAttribute("aria-live", "polite");
      let close = toast.querySelector(".toast-close");
      if (!close) {
        close = document.createElement("button");
        close.type = "button";
        close.className = "toast-close";
        close.setAttribute("aria-label", "Dismiss notification");
        close.textContent = "×";
        close.addEventListener("click", () => dismiss(toast));
        toast.appendChild(close);
      }
      window.clearTimeout(timeouts.get(toast));
      timeouts.set(toast, window.setTimeout(() => dismiss(toast), 4500));
    };
    const findToasts = () => document.querySelectorAll(".form-success, .form-error").forEach(prepareToast);
    const observer = new MutationObserver(findToasts);
    findToasts();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => { observer.disconnect(); document.querySelectorAll(".form-success, .form-error").forEach((toast) => window.clearTimeout(timeouts.get(toast))); };
  }, []);
  const pieces = route.split("/").filter(Boolean);
  if (pieces[0] === "login") return <Login role={pieces[1] === "admin" ? "admin" : "student"} register={false} go={go} />;
  if (pieces[0] === "register") return <Login role="student" register go={go} />;
  if (pieces[0] === "resources") return <ResourcesLanding go={go} />;
  if (pieces[0] === "community") return <CommunityLanding go={go} />;
  if (pieces[0] === "student" || pieces[0] === "admin") return <Workspace role={pieces[0]} section={pieces[1] || "overview"} go={go} />;
  return <FinpayLanding go={go} />;
}
export default App;
