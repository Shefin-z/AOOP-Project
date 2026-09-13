import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Download,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Star,
  Upload,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import {
  AdminApplications,
  AdminContentManager,
  AdminOverview,
  AdminStudents,
} from "./AdminDashboard";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const studentItems = [
  ["overview", "Overview", LayoutDashboard],
  ["profile", "My profile", CircleUserRound],
  ["jobs", "Job matches", BriefcaseBusiness],
  ["assessments", "Assessments", ClipboardCheck],
  ["vault", "Career Vault", FileText],
  ["community", "Community", MessageCircle],
  ["resources", "Resources", BookOpen],
  ["events", "Events", CalendarDays],
];
const adminItems = [
  ["overview", "Overview", LayoutDashboard],
  ["students", "Students", Users],
  ["jobs", "Jobs", BriefcaseBusiness],
  ["applications", "Applications", FileText],
  ["assessments", "Assessments", ClipboardCheck],
  ["community", "Community", MessageCircle],
  ["resources", "Resources", BookOpen],
  ["events", "Events", CalendarDays],
  ["settings", "Settings", Settings],
];
const blankProfile = {
  university: "",
  degree: "",
  graduationYear: "",
  targetRole: "",
  location: "",
  bio: "",
  skills: "",
  hobbies: "",
  profilePhotoUrl: "",
};
const blankJob = {
  companyName: "",
  companyWebsite: "",
  companyLocation: "",
  title: "",
  location: "",
  employmentType: "full_time",
  workMode: "hybrid",
  salaryText: "",
  description: "",
  expiryDate: "",
  status: "draft",
};
const blankResumeContent = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  headline: "",
  summary: "",
  skills: "",
  education: "",
  experience: "",
  projects: "",
};

function getSession() {
  try {
    return JSON.parse(localStorage.getItem("careerforge_session")) || null;
  } catch {
    return null;
  }
}
async function responseBody(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      body.message ||
        body.detail ||
        (response.status === 401
          ? "Email or password is incorrect."
          : response.status === 403
            ? "You do not have permission for this action."
            : response.status === 503
              ? "Gemini is not configured. Add GEMINI_API_KEY to the project's .env file, then restart the backend."
              : body.error || "Something went wrong."),
    );
  return body;
}

function useRoute() {
  const read = () => window.location.hash.replace("#", "") || "/";
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const update = () => setRoute(read());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return [
    route,
    (to) => {
      window.location.hash = to;
    },
  ];
}

function Brand({ onClick }) {
  return (
    <button className="brand" onClick={onClick}>
      <span className="brand-mark">
        <Sparkles size={16} />
      </span>
      <span>
        Career<span>Forge</span>
      </span>
    </button>
  );
}
function Button({ children, className = "", ...props }) {
  return (
    <button className={`button ${className}`} {...props}>
      {children}
    </button>
  );
}
function EmptyPanel({ title, copy }) {
  return (
    <section className="empty-panel">
      <span>
        <Sparkles size={21} />
      </span>
      <h3>{title}</h3>
      <p>{copy}</p>
    </section>
  );
}

function LegacyLanding({ go }) {
  const features = [
    [
      Target,
      "Find your fit",
      "Turn your goals and skills into focused, explainable job opportunities.",
    ],
    [
      FileText,
      "Build your CV",
      "Create resume versions, upload documents, and use the right CV for each job.",
    ],
    [
      BriefcaseBusiness,
      "Take the next move",
      "Apply to published roles and keep your application history together.",
    ],
  ];
  return (
    <main className="public-page">
      <header className="public-header">
        <Brand onClick={() => go("/")} />
        <nav>
          <button onClick={() => go("/community")}>Community</button>
          <button onClick={() => go("/resources")}>Resources</button>
        </nav>
        <div className="header-actions">
          <Button className="quiet" onClick={() => go("/login/admin")}>
            Admin sign in
          </Button>
          <Button onClick={() => go("/login/student")}>
            Get started <ArrowRight size={15} />
          </Button>
        </div>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkles size={14} /> Career growth, made tangible
          </p>
          <h1>
            Make your next <em>move feel real.</em>
          </h1>
          <p className="lede">
            One connected workspace for your student profile, meaningful job
            opportunities, and professional growth.
          </p>
          <div className="row">
            <Button onClick={() => go("/register")}>
              Create student account <ArrowRight size={16} />
            </Button>
            <Button className="quiet" onClick={() => go("/login/student")}>
              Student sign in
            </Button>
          </div>
          <div className="proof">
            <span>
              <ShieldCheck size={15} /> Local MySQL data
            </span>
            <span>
              <Target size={15} /> Career focused
            </span>
            <span>
              <Users size={15} /> Student and admin roles
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-card">
            <span className="icon-ball">
              <Target size={23} />
            </span>
            <small>Career profile</small>
            <strong>Build your professional signal</strong>
            <div className="progress">
              <i />
            </div>
          </div>
          <div className="floating one">
            <BarChart3 size={17} />
            <span>
              <small>Profile progress</small>
              <b>Ready for your details</b>
            </span>
          </div>
          <div className="floating two">
            <BriefcaseBusiness size={17} />
            <span>
              <small>Job opportunities</small>
              <b>Published by admins</b>
            </span>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <Sparkles size={14} /> Your work, connected
            </p>
            <h2>
              A career system that feels <em>human.</em>
            </h2>
          </div>
          <p className="section-copy">
            CareerForge keeps your profile, CV, job search, and progress
            together.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(([Icon, title, copy], index) => (
            <article className="feature-card" key={title}>
              <span className={`feature-icon tone-${index}`}>
                <Icon size={22} />
              </span>
              <small>0{index + 1}</small>
              <h3>{title}</h3>
              <p>{copy}</p>
              <ChevronRight size={17} />
            </article>
          ))}
        </div>
      </section>
      <section className="section journey">
        <div>
          <p className="eyebrow">
            <Target size={14} /> A clearer rhythm
          </p>
          <h2>
            No generic path.
            <br />
            <em>A path that reacts.</em>
          </h2>
        </div>
        <div className="journey-list">
          {[
            [
              "01",
              "Build your profile",
              "Add your education, direction, and professional information.",
            ],
            [
              "02",
              "Prepare your evidence",
              "Use Career Vault to create or upload the CV that represents you.",
            ],
            [
              "03",
              "Apply with confidence",
              "Choose a CV and submit it to relevant published opportunities.",
            ],
          ].map(([number, title, copy]) => (
            <article key={number}>
              <b>{number}</b>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
              <ArrowRight size={18} />
            </article>
          ))}
        </div>
      </section>
      <section className="cta">
        <div>
          <p>YOUR NEXT CHAPTER IS PRACTICAL</p>
          <h2>
            Turn direction into <em>movement.</em>
          </h2>
          <Button className="light" onClick={() => go("/register")}>
            Create student account <ArrowRight size={16} />
          </Button>
        </div>
        <Sparkles size={58} />
      </section>
      <footer>
        CareerForge · Advanced Object Oriented Programming Laboratory
      </footer>
    </main>
  );
}

function Landing({ go }) {
  const features = [
    [
      Target,
      "A career path with focus",
      "Capture your goals, education, and strengths in one polished profile.",
    ],
    [
      FileText,
      "Your CV, ready when you are",
      "Create tailored CV versions and choose the right one for every role.",
    ],
    [
      BriefcaseBusiness,
      "Applications without the chaos",
      "Discover roles, apply with confidence, and keep every next step visible.",
    ],
  ];
  useEffect(() => {
    const items = document.querySelectorAll(".nex-home .reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("is-visible"));
      return undefined;
    }
    const revealAtScrollPoint = () => {
      const triggerLine = window.innerHeight * 0.7;
      const atPageEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4;
      items.forEach((item) => {
        const box = item.getBoundingClientRect();
        item.classList.toggle(
          "is-visible",
          (box.top <= triggerLine && box.bottom >= 0) ||
            (atPageEnd && box.top < window.innerHeight),
        );
      });
    };
    revealAtScrollPoint();
    window.addEventListener("scroll", revealAtScrollPoint, { passive: true });
    window.addEventListener("resize", revealAtScrollPoint);
    return () => {
      window.removeEventListener("scroll", revealAtScrollPoint);
      window.removeEventListener("resize", revealAtScrollPoint);
    };
  }, []);
  return (
    <main className="public-page nex-home">
      <header className="public-header nex-header">
        <Brand onClick={() => go("/")} />
        <nav>
          <button
            onClick={() =>
              document
                .querySelector("#how-it-works")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            How it works
          </button>
          <button
            onClick={() =>
              document
                .querySelector("#features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Features
          </button>
          <button onClick={() => go("/resources")}>Resources</button>
        </nav>
        <div className="header-actions">
          <Button className="quiet" onClick={() => go("/login/student")}>
            Sign in
          </Button>
          <Button onClick={() => go("/register")}>
            Get started <ArrowRight size={15} />
          </Button>
        </div>
      </header>
      <section className="nex-hero">
        <div className="nex-hero-copy reveal from-left">
          <p className="nex-pill">
            <Sparkles size={14} /> Your career, made clearer
          </p>
          <h1>
            Build a career
            <br />
            that moves <em>forward.</em>
          </h1>
          <p>
            CareerForge gives students one calm workspace to shape a profile,
            prepare a standout CV, and apply to the right opportunities.
          </p>
          <div className="row">
            <Button onClick={() => go("/register")}>
              Create free account <ArrowRight size={16} />
            </Button>
            <button
              className="video-link"
              onClick={() =>
                document
                  .querySelector("#how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <span>
                <ArrowRight size={15} />
              </span>{" "}
              See how it works
            </button>
          </div>
          <div className="nex-social-proof">
            <div className="avatar-stack">
              <i>R</i>
              <i>S</i>
              <i>N</i>
              <i>+</i>
            </div>
            <span>
              <b>One place for every next step.</b>
              <small>Profile · CV · jobs · applications</small>
            </span>
          </div>
        </div>
        <div
          className="nex-product reveal from-right"
          aria-label="CareerForge workspace preview"
        >
          <div className="product-top">
            <span className="product-logo">
              <Sparkles size={14} />
            </span>
            <span>CareerForge</span>
            <i />
          </div>
          <div className="product-body">
            <aside>
              <span className="side-active" />
              <span />
              <span />
              <span />
              <span />
            </aside>
            <div className="product-content">
              <div className="product-title">
                <div>
                  <small>WELCOME BACK</small>
                  <b>Career overview</b>
                </div>
                <span className="product-avatar">AS</span>
              </div>
              <div className="career-banner">
                <div>
                  <small>YOUR CAREER SCORE</small>
                  <strong>
                    72<span>/100</span>
                  </strong>
                  <p>You are building a strong start.</p>
                </div>
                <div className="ring">
                  <span>72%</span>
                </div>
              </div>
              <div className="product-grid">
                <article>
                  <span className="product-icon green">
                    <FileText size={17} />
                  </span>
                  <small>CV versions</small>
                  <b>
                    03 <em>ready</em>
                  </b>
                </article>
                <article>
                  <span className="product-icon lilac">
                    <BriefcaseBusiness size={17} />
                  </span>
                  <small>Job matches</small>
                  <b>
                    12 <em>new</em>
                  </b>
                </article>
              </div>
              <div className="next-card">
                <span>
                  <CalendarDays size={17} />
                </span>
                <div>
                  <small>NEXT ACTION</small>
                  <b>Complete your career profile</b>
                </div>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
          <div className="product-glow" />
        </div>
        <article className="nex-float match-float reveal from-bottom">
          <span>
            <Target size={17} />
          </span>
          <div>
            <small>Top match</small>
            <b>Frontend Intern</b>
          </div>
          <strong>92%</strong>
        </article>
        <article className="nex-float progress-float reveal from-top">
          <BarChart3 size={19} />
          <div>
            <small>Profile strength</small>
            <b>Looking great</b>
          </div>
        </article>
      </section>
      <section className="nex-logos reveal from-bottom">
        <p>DESIGNED FOR STUDENTS READY TO TAKE THE NEXT STEP</p>
        <div>
          <span>
            CAREER <b>START</b>
          </span>
          <span>
            WORK<b>WISE</b>
          </span>
          <span>
            GRADUATE<b>LAB</b>
          </span>
          <span>
            FUTURE<b>READY</b>
          </span>
        </div>
      </section>
      <section className="nex-info-strip reveal from-bottom">
        <article>
          <span>
            <ShieldCheck size={19} />
          </span>
          <div>
            <b>Your data, in one place</b>
            <p>
              Profiles, CV versions, documents, and applications stay connected
              to your CareerForge account.
            </p>
          </div>
        </article>
        <article>
          <span>
            <Users size={19} />
          </span>
          <div>
            <b>Built for students and admins</b>
            <p>
              Students prepare and apply; administrators publish opportunities
              and manage the platform.
            </p>
          </div>
        </article>
        <article>
          <span>
            <Target size={19} />
          </span>
          <div>
            <b>Designed around real next steps</b>
            <p>
              Build a profile, prepare evidence, discover jobs, then follow
              every application.
            </p>
          </div>
        </article>
      </section>
      <section className="nex-section" id="features">
        <div className="nex-section-heading reveal from-left">
          <p className="nex-pill">
            <Sparkles size={14} /> Everything connected
          </p>
          <h2>
            A simpler way to
            <br />
            <em>shape your future.</em>
          </h2>
          <p>
            Less switching between tools. More clarity about where you are going
            and what to do next.
          </p>
        </div>
        <div className="nex-feature-grid">
          {features.map(([Icon, title, copy], index) => (
            <article
              className={`reveal from-bottom delay-${index + 1}`}
              key={title}
            >
              <span className={`nex-feature-icon icon-${index}`}>
                <Icon size={22} />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <button
                onClick={() => go(index === 1 ? "/register" : "/login/student")}
              >
                Explore feature <ArrowRight size={15} />
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="nex-workflow" id="how-it-works">
        <div className="workflow-preview reveal from-left">
          <div className="workflow-window">
            <header>
              <span />
              <span />
              <span />
              <b>Your action plan</b>
            </header>
            <div className="workflow-task done">
              <span>✓</span>
              <div>
                <b>Set your target role</b>
                <small>Your career direction is saved</small>
              </div>
              <em>Done</em>
            </div>
            <div className="workflow-task">
              <span>2</span>
              <div>
                <b>Build your CV</b>
                <small>Create a version for your next application</small>
              </div>
              <ArrowRight size={16} />
            </div>
            <div className="workflow-task">
              <span>3</span>
              <div>
                <b>Explore job matches</b>
                <small>See relevant published opportunities</small>
              </div>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
        <div className="workflow-copy reveal from-right">
          <p className="nex-pill">
            <Target size={14} /> A better rhythm
          </p>
          <h2>
            Every move
            <br />
            has a <em>purpose.</em>
          </h2>
          <p>
            CareerForge turns the stressful search for “what next?” into a
            focused, manageable plan.
          </p>
          <ul>
            <li>
              <ShieldCheck size={17} /> Keep your professional details organised
            </li>
            <li>
              <ShieldCheck size={17} /> Apply with the CV that fits the role
            </li>
            <li>
              <ShieldCheck size={17} /> Track progress from one workspace
            </li>
          </ul>
          <Button onClick={() => go("/register")}>
            Start your journey <ArrowRight size={16} />
          </Button>
        </div>
      </section>
      <section className="nex-cta reveal from-bottom">
        <div>
          <p>YOUR FUTURE DESERVES A SYSTEM</p>
          <h2>
            Ready to make
            <br />
            your next move?
          </h2>
          <p>
            Create your free student workspace and begin with the step that
            matters today.
          </p>
          <Button className="light" onClick={() => go("/register")}>
            Get started for free <ArrowRight size={16} />
          </Button>
        </div>
        <div className="cta-orbit">
          <span>
            <GraduationCap size={50} />
          </span>
          <i />
          <i />
        </div>
      </section>
      <footer className="nex-footer reveal from-bottom">
        <Brand onClick={() => go("/")} />
        <span>
          CareerForge · Advanced Object Oriented Programming Laboratory
        </span>
        <button onClick={() => go("/login/admin")}>
          Administrator sign in
        </button>
      </footer>
    </main>
  );
}

function Login({ role, register, go }) {
  const admin = role === "admin";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(
        `${API_BASE_URL}${register ? "/auth/register" : "/auth/login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            register
              ? { name: name.trim(), email: email.trim(), password }
              : {
                  email: email.trim(),
                  password,
                  role: admin ? "admin" : "student",
                },
          ),
        },
      );
      const body = await responseBody(response);
      localStorage.setItem("careerforge_session", JSON.stringify(body));
      go(`/${body.role}/overview`);
    } catch (error) {
      setMessage(error.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main className="auth-page">
      <button className="back" onClick={() => go("/")}>
        Back to CareerForge
      </button>
      <section className="auth-card">
        <div className="auth-panel">
          <Brand onClick={() => go("/")} />
          <p className="eyebrow">
            <Sparkles size={14} />{" "}
            {admin ? "Operations workspace" : "Your career workspace"}
          </p>
          <h1>
            {admin
              ? "Keep the platform moving."
              : "Make progress feel possible."}
          </h1>
          <p>
            {admin
              ? "Create, edit, publish, and close real job opportunities."
              : "Keep your education, goals, and professional story in one place."}
          </p>
          <div className="auth-orb" />
        </div>
        <form className="auth-form" onSubmit={submit}>
          <p className="form-label">
            {register
              ? "Student registration"
              : admin
                ? "Administrator sign in"
                : "Student sign in"}
          </p>
          <h2>{register ? "Create your account" : "Welcome back"}</h2>
          {register && (
            <label>
              Full name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              minLength="8"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 8 characters"
            />
          </label>
          {message && <p className="form-error">{message}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : register
                ? "Create account"
                : "Continue"}
            <ArrowRight size={16} />
          </Button>
          {register ? (
            <button
              className="text-button"
              type="button"
              onClick={() => go("/login/student")}
            >
              Already have an account? Sign in
            </button>
          ) : (
            <>
              <button
                className="text-button"
                type="button"
                onClick={() => go(admin ? "/login/student" : "/login/admin")}
              >
                Switch to {admin ? "student" : "admin"} sign in
              </button>
              {!admin && (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => go("/register")}
                >
                  New student? Create an account
                </button>
              )}
            </>
          )}
        </form>
      </section>
    </main>
  );
}

function StudentProfile() {
  const current = getSession();
  const [profile, setProfile] = useState(blankProfile);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!current?.id) {
      setNotice("Please sign in again.");
      setLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/profiles/${current.id}`, {
      headers: { "X-User-Id": current.id },
    })
      .then(responseBody)
      .then((body) =>
        setProfile({
          ...blankProfile,
          ...body,
          graduationYear: body.graduationYear || "",
        }),
      )
      .catch((e) => setNotice(e.message))
      .finally(() => setLoading(false));
  }, []);
  const change = (event) =>
    setProfile({ ...profile, [event.target.name]: event.target.value });
  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${current.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": current.id,
        },
        body: JSON.stringify({
          ...profile,
          graduationYear: profile.graduationYear
            ? Number(profile.graduationYear)
            : null,
        }),
      });
      const body = await responseBody(response);
      setProfile({
        ...blankProfile,
        ...body,
        graduationYear: body.graduationYear || "",
      });
      setNotice("Profile saved successfully.");
    } catch (e) {
      setNotice(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function uploadPhoto(event) {
    const photo = event.target.files?.[0];
    if (!photo) return;
    setUploadingPhoto(true);
    setNotice("");
    try {
      const form = new FormData();
      form.append("photo", photo);
      const response = await fetch(
        `${API_BASE_URL}/profiles/${current.id}/photo`,
        { method: "POST", headers: { "X-User-Id": current.id }, body: form },
      );
      const body = await responseBody(response);
      setProfile({
        ...blankProfile,
        ...body,
        graduationYear: body.graduationYear || "",
      });
      setNotice("Profile photo uploaded successfully.");
    } catch (e) {
      setNotice(e.message);
    } finally {
      event.target.value = "";
      setUploadingPhoto(false);
    }
  }
  const photoSrc = profile.profilePhotoUrl
    ? profile.profilePhotoUrl.startsWith("/")
      ? `${API_BASE_URL}${profile.profilePhotoUrl}`
      : profile.profilePhotoUrl
    : "";
  const tags = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  return (
    <section className="content-card profile-card">
      <div className="content-intro">
        <div>
          <p className="eyebrow">
            <CircleUserRound size={14} /> Your professional identity
          </p>
          <h2>Build a profile employers can understand.</h2>
          <p>
            Show your strengths, interests, and personality alongside your
            education and career direction.
          </p>
        </div>
        <div className={`profile-initial${photoSrc ? " has-photo" : ""}`}>
          {photoSrc && (
            <img
              src={photoSrc}
              alt="Your profile"
              onError={(event) =>
                event.currentTarget.parentElement.classList.remove("has-photo")
              }
            />
          )}
          <span>{current?.name?.slice(0, 1)?.toUpperCase() || "S"}</span>
        </div>
      </div>
      <form className="data-form" onSubmit={save}>
        <div className="account-strip">
          <span>
            <b>{current?.name}</b>
            <small>Account name</small>
          </span>
          <span>
            <b>{current?.email}</b>
            <small>Email address</small>
          </span>
        </div>
        <div className="form-grid">
          <label>
            University
            <input
              name="university"
              value={profile.university}
              onChange={change}
              placeholder="United International University"
            />
          </label>
          <label>
            Degree / programme
            <input
              name="degree"
              value={profile.degree}
              onChange={change}
              placeholder="BSc in Computer Science"
            />
          </label>
          <label>
            Graduation year
            <input
              name="graduationYear"
              value={profile.graduationYear}
              onChange={change}
              type="number"
              min="2000"
              max="2100"
              placeholder="2027"
            />
          </label>
          <label>
            Target role
            <input
              name="targetRole"
              value={profile.targetRole}
              onChange={change}
              placeholder="Junior Software Engineer"
            />
          </label>
          <label>
            Location
            <input
              name="location"
              value={profile.location}
              onChange={change}
              placeholder="Dhaka, Bangladesh"
            />
          </label>
          <label>
            Upload profile photo{" "}
            <span className="photo-upload">
              <Upload size={15} />
              {uploadingPhoto ? "Uploading..." : "Choose image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={uploadPhoto}
                disabled={uploadingPhoto || loading}
              />
            </span>
            <small>JPG, PNG, or WEBP · maximum 2 MB</small>
          </label>
        </div>
        <div className="form-grid profile-details">
          <label>
            Skills <small>Separate skills with commas</small>
            <textarea
              name="skills"
              value={profile.skills}
              onChange={change}
              rows="3"
              placeholder="Java, React, MySQL, Figma"
            />
          </label>
          <label>
            Hobbies & interests <small>Let employers see more of you</small>
            <textarea
              name="hobbies"
              value={profile.hobbies}
              onChange={change}
              rows="3"
              placeholder="Photography, volunteering, chess"
            />
          </label>
        </div>
        <label className="full-field">
          Short professional bio
          <textarea
            name="bio"
            value={profile.bio}
            onChange={change}
            rows="5"
            placeholder="Your interests, projects, and career direction..."
          />
        </label>
        <label className="full-field">
          Profile photo URL{" "}
          <small>Optional fallback if you host your image elsewhere</small>
          <input
            name="profilePhotoUrl"
            value={profile.profilePhotoUrl}
            onChange={change}
            placeholder="https://..."
          />
        </label>
        {(profile.skills || profile.hobbies) && (
          <div className="profile-highlights">
            {profile.skills && (
              <div>
                <small>Skills</small>
                <p>
                  {tags(profile.skills).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </p>
              </div>
            )}
            {profile.hobbies && (
              <div>
                <small>Beyond work</small>
                <p>
                  {tags(profile.hobbies).map((hobby) => (
                    <span key={hobby}>{hobby}</span>
                  ))}
                </p>
              </div>
            )}
          </div>
        )}
        {notice && (
          <p
            className={
              notice.includes("success") ? "form-success" : "form-error"
            }
          >
            {notice}
          </p>
        )}
        <Button type="submit" disabled={saving || loading}>
          <Save size={15} />
          {saving ? "Saving..." : loading ? "Loading..." : "Save profile"}
        </Button>
      </form>
    </section>
  );
}

function CareerVault() {
  const current = getSession();
  const [resumes, setResumes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [resumeId, setResumeId] = useState(null);
  const [title, setTitle] = useState("My professional CV");
  const [content, setContent] = useState({
    ...blankResumeContent,
    fullName: current?.name || "",
    email: current?.email || "",
  });
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": current?.id || "",
  };
  const load = () => {
    if (!current?.id) return setNotice("Please sign in again.");
    Promise.all([
      fetch(`${API_BASE_URL}/vault/resumes`, { headers }).then(responseBody),
      fetch(`${API_BASE_URL}/vault/documents`, { headers }).then(responseBody),
    ])
      .then(([resumeItems, documentItems]) => {
        setResumes(resumeItems);
        setDocuments(documentItems);
      })
      .catch((e) => setNotice(e.message));
  };
  useEffect(() => {
    load();
  }, []);
  function editResume(resume) {
    setResumeId(resume.id);
    setTitle(resume.title);
    setContent({ ...blankResumeContent, ...resume.content });
    setNotice("");
  }
  function newResume() {
    setResumeId(null);
    setTitle("My professional CV");
    setContent({
      ...blankResumeContent,
      fullName: current?.name || "",
      email: current?.email || "",
    });
    setNotice("");
  }
  const change = (event) =>
    setContent({ ...content, [event.target.name]: event.target.value });
  async function saveResume(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/vault/resumes${resumeId ? `/${resumeId}` : ""}`,
        {
          method: resumeId ? "PUT" : "POST",
          headers,
          body: JSON.stringify({
            title,
            content,
            isDefault: resumes.length === 0,
          }),
        },
      );
      const saved = await responseBody(response);
      setResumeId(saved.id);
      setNotice("Resume version saved.");
      load();
    } catch (e) {
      setNotice(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function makeDefault(id) {
    try {
      await responseBody(
        await fetch(`${API_BASE_URL}/vault/resumes/${id}/default`, {
          method: "PUT",
          headers,
        }),
      );
      setNotice("Default CV updated.");
      load();
    } catch (e) {
      setNotice(e.message);
    }
  }
  async function removeResume(id) {
    if (!window.confirm("Delete this resume version?")) return;
    try {
      await responseBody(
        await fetch(`${API_BASE_URL}/vault/resumes/${id}`, {
          method: "DELETE",
          headers,
        }),
      );
      if (resumeId === id) newResume();
      setNotice("Resume version deleted.");
      load();
    } catch (e) {
      setNotice(e.message);
    }
  }
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setNotice("");
    const form = new FormData();
    form.append("file", file);
    try {
      await responseBody(
        await fetch(`${API_BASE_URL}/vault/documents`, {
          method: "POST",
          headers: { "X-User-Id": current.id },
          body: form,
        }),
      );
      setNotice("Document uploaded.");
      event.target.value = "";
      load();
    } catch (e) {
      setNotice(e.message);
    }
  }
  async function download(document) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vault/documents/${document.id}/download`,
        { headers: { "X-User-Id": current.id } },
      );
      if (!response.ok) throw new Error("Unable to download this document.");
      const url = URL.createObjectURL(await response.blob());
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setNotice(e.message);
    }
  }
  async function removeDocument(id) {
    if (!window.confirm("Delete this uploaded document?")) return;
    try {
      await responseBody(
        await fetch(`${API_BASE_URL}/vault/documents/${id}`, {
          method: "DELETE",
          headers,
        }),
      );
      setNotice("Document deleted.");
      load();
    } catch (e) {
      setNotice(e.message);
    }
  }
  function importPrevious() {
    try {
      const key = Object.keys(localStorage).find((item) =>
        item.startsWith("careerforge_cv_"),
      );
      if (!key)
        throw new Error("No previous CV Maker data was found in this browser.");
      const old = JSON.parse(localStorage.getItem(key));
      setContent({
        ...blankResumeContent,
        fullName: old.name || current?.name || "",
        email: old.email || current?.email || "",
        phone: old.phone || "",
        location: old.location || "",
        headline: old.title || "",
        summary: old.summary || "",
        skills: old.skills || "",
        education: Array.isArray(old.education)
          ? old.education
              .map((item) =>
                typeof item === "string"
                  ? item
                  : `${item.school || item.institution || ""} ${item.degree || ""}`.trim(),
              )
              .join("\n")
          : old.education || "",
        experience: Array.isArray(old.experiences)
          ? old.experiences
              .map((item) =>
                typeof item === "string"
                  ? item
                  : `${item.role || item.title || ""} ${item.company || ""}`.trim(),
              )
              .join("\n")
          : old.experience || "",
        projects: Array.isArray(old.projects)
          ? old.projects
              .map((item) =>
                typeof item === "string"
                  ? item
                  : `${item.name || item.title || ""} ${item.description || ""}`.trim(),
              )
              .join("\n")
          : old.projects || "",
      });
      setTitle(old.title ? `${old.title} CV` : "Imported CV");
      setResumeId(null);
      setNotice(
        "Previous CV Maker data imported. Review it and save a new version.",
      );
    } catch (e) {
      setNotice(e.message);
    }
  }
  async function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const old = JSON.parse(await file.text());
      setContent({ ...blankResumeContent, ...old });
      setTitle(old.title || "Imported CV");
      setResumeId(null);
      setNotice("CV JSON imported. Review it and save a new version.");
    } catch {
      setNotice("That file is not valid CV JSON data.");
    } finally {
      event.target.value = "";
    }
  }
  return (
    <section className="vault-page">
      <div className="content-intro compact">
        <div>
          <p className="eyebrow">
            <FileText size={14} /> Career Vault
          </p>
          <h2>Build, keep, and select your CV.</h2>
          <p>
            Create tailored CV versions or upload an existing PDF, DOC, or DOCX
            from your PC. Your selected CV is used when you apply for a job.
          </p>
        </div>
        <div className="vault-import">
          <Button className="quiet" type="button" onClick={importPrevious}>
            Import previous CV
          </Button>
          <label className="import-file">
            Import CV JSON
            <input
              type="file"
              accept="application/json,.json"
              onChange={importJson}
            />
          </label>
        </div>
      </div>
      {notice && (
        <p
          className={
            /(saved|updated|uploaded|deleted|imported)/.test(notice)
              ? "form-success"
              : "form-error"
          }
        >
          {notice}
        </p>
      )}
      <div className="vault-layout">
        <div className="vault-editor">
          <form className="data-form" onSubmit={saveResume}>
            <div className="form-row-title">
              <h3>
                {resumeId ? "Edit resume version" : "Create a resume version"}
              </h3>
              <button type="button" className="text-button" onClick={newResume}>
                New version
              </button>
            </div>
            <label>
              Version name
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Software Engineer CV"
              />
            </label>
            <div className="form-grid">
              <label>
                Full name
                <input
                  name="fullName"
                  value={content.fullName}
                  onChange={change}
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={content.email}
                  onChange={change}
                />
              </label>
              <label>
                Phone
                <input
                  name="phone"
                  value={content.phone}
                  onChange={change}
                  placeholder="01XXXXXXXXX"
                />
              </label>
              <label>
                Location
                <input
                  name="location"
                  value={content.location}
                  onChange={change}
                  placeholder="Dhaka, Bangladesh"
                />
              </label>
              <label className="full-field">
                Professional headline
                <input
                  name="headline"
                  value={content.headline}
                  onChange={change}
                  placeholder="Junior Software Engineer"
                />
              </label>
            </div>
            <label className="full-field">
              Professional summary
              <textarea
                name="summary"
                rows="4"
                value={content.summary}
                onChange={change}
              />
            </label>
            <label className="full-field">
              Skills <small>(comma separated)</small>
              <textarea
                name="skills"
                rows="2"
                value={content.skills}
                onChange={change}
                placeholder="Java, Spring Boot, MySQL"
              />
            </label>
            <label className="full-field">
              Education <small>(one item per line)</small>
              <textarea
                name="education"
                rows="3"
                value={content.education}
                onChange={change}
                placeholder="BSc in CSE — United International University"
              />
            </label>
            <label className="full-field">
              Experience <small>(one item per line)</small>
              <textarea
                name="experience"
                rows="3"
                value={content.experience}
                onChange={change}
                placeholder="Intern — Company, 2026"
              />
            </label>
            <label className="full-field">
              Projects <small>(one item per line)</small>
              <textarea
                name="projects"
                rows="3"
                value={content.projects}
                onChange={change}
                placeholder="CareerForge — Spring Boot and React project"
              />
            </label>
            <Button type="submit" disabled={saving}>
              <Save size={15} />
              {saving ? "Saving..." : "Save resume version"}
            </Button>
            <Button
              className="quiet print-button"
              type="button"
              onClick={() => window.print()}
            >
              Print / Save as PDF
            </Button>
          </form>
        </div>
        <aside className="cv-preview">
          <p className="eyebrow">Live preview</p>
          <h2>{content.fullName || "Your name"}</h2>
          <h3>{content.headline || "Professional headline"}</h3>
          <p>
            {[content.email, content.phone, content.location]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {content.summary && (
            <section>
              <b>Profile</b>
              <p>{content.summary}</p>
            </section>
          )}
          {content.skills && (
            <section>
              <b>Skills</b>
              <p>{content.skills}</p>
            </section>
          )}
          {content.education && (
            <section>
              <b>Education</b>
              <p className="lines">{content.education}</p>
            </section>
          )}
          {content.experience && (
            <section>
              <b>Experience</b>
              <p className="lines">{content.experience}</p>
            </section>
          )}
          {content.projects && (
            <section>
              <b>Projects</b>
              <p className="lines">{content.projects}</p>
            </section>
          )}
        </aside>
      </div>
      <section className="vault-assets">
        <div className="content-card">
          <div className="list-heading">
            <h3>Saved resume versions</h3>
            <span>{resumes.length} total</span>
          </div>
          {resumes.length ? (
            resumes.map((resume) => (
              <article className="vault-row" key={resume.id}>
                <div>
                  <b>{resume.title}</b>
                  <small>
                    {resume.isDefault ? "Default CV" : "Resume version"}
                  </small>
                </div>
                <div className="vault-actions">
                  <button onClick={() => editResume(resume)}>Edit</button>
                  {!resume.isDefault && (
                    <button onClick={() => makeDefault(resume.id)}>
                      <Star size={14} /> Set default
                    </button>
                  )}
                  <button
                    className="danger"
                    onClick={() => removeResume(resume.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="muted">No resume version saved yet.</p>
          )}
        </div>
        <div className="content-card">
          <div className="list-heading">
            <h3>Uploaded CVs and documents</h3>
            <label className="upload-button">
              <Upload size={14} /> Upload file
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={upload}
              />
            </label>
          </div>
          <p className="upload-help">
            PDF, DOC, or DOCX · maximum 5 MB · stored locally in this project.
          </p>
          {documents.length ? (
            documents.map((document) => (
              <article className="vault-row" key={document.id}>
                <div>
                  <b>{document.fileName}</b>
                  <small>
                    {Math.ceil(document.fileSizeBytes / 1024)} KB ·{" "}
                    {document.contentType}
                  </small>
                </div>
                <div className="vault-actions">
                  <button onClick={() => download(document)}>
                    <Download size={14} /> Download
                  </button>
                  <button
                    className="danger"
                    onClick={() => removeDocument(document.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="muted">No CV or document uploaded yet.</p>
          )}
        </div>
      </section>
    </section>
  );
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
  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": current?.id || "",
  };
  const load = async () => {
    if (!current?.id) return setNotice("Please sign in again.");
    try {
      const items = await responseBody(
        await fetch(`${API_BASE_URL}/learning-paths`, { headers }),
      );
      setPaths(items);
      setActiveId((id) => id || items[0]?.id || null);
    } catch (error) {
      setNotice(error.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const active = paths.find((item) => item.id === activeId) || null;
  async function recommendation() {
    if (!topic.trim())
      return setNotice(
        `Enter a ${pathType === "skill" ? "skill" : "job role"} first.`,
      );
    setRecommending(true);
    setNotice("");
    try {
      const item = await responseBody(
        await fetch(`${API_BASE_URL}/learning-paths/recommendation`, {
          method: "POST",
          headers,
          body: JSON.stringify({ topic: topic.trim(), pathType }),
        }),
      );
      setLevelCount(item.recommendedLevels);
      setNotice(
        `Gemini recommends ${item.recommendedLevels} levels. ${item.reason}`,
      );
    } catch (error) {
      setNotice(error.message);
    } finally {
      setRecommending(false);
    }
  }
  async function create(event) {
    event.preventDefault();
    setCreating(true);
    setNotice("");
    try {
      const item = await responseBody(
        await fetch(`${API_BASE_URL}/learning-paths`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            topic: topic.trim(),
            pathType,
            levelCount: Number(levelCount),
          }),
        }),
      );
      setPaths((items) => [item, ...items]);
      setActiveId(item.id);
      setTopic("");
      setQuiz(null);
      setResult(null);
      setNotice("Learning path created. Level 1 is ready when you are.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setCreating(false);
    }
  }
  async function openLevel(number) {
    if (!active) return;
    setLoadingLevel(true);
    setNotice("");
    setResult(null);
    try {
      const item = await responseBody(
        await fetch(
          `${API_BASE_URL}/learning-paths/${active.id}/levels/${number}`,
          { headers },
        ),
      );
      setQuiz(item);
      setAnswers(Array(item.questions.length).fill(null));
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoadingLevel(false);
    }
  }
  async function deletePath(path) {
    if (
      !window.confirm(
        `Delete the ${path.topic} learning path and all of its progress?`,
      )
    )
      return;
    setNotice("");
    try {
      await responseBody(
        await fetch(`${API_BASE_URL}/learning-paths/${path.id}`, {
          method: "DELETE",
          headers,
        }),
      );
      const remaining = paths.filter((item) => item.id !== path.id);
      setPaths(remaining);
      setActiveId(remaining[0]?.id || null);
      setQuiz(null);
      setResult(null);
      setNotice("Learning path deleted.");
    } catch (error) {
      setNotice(error.message);
    }
  }
  async function submit(event) {
    event.preventDefault();
    if (!quiz || answers.some((answer) => answer === null))
      return setNotice(
        "Choose an answer for every question before submitting.",
      );
    setLoadingLevel(true);
    try {
      const item = await responseBody(
        await fetch(
          `${API_BASE_URL}/learning-paths/${active.id}/levels/${quiz.levelNumber}/attempts`,
          { method: "POST", headers, body: JSON.stringify({ answers }) },
        ),
      );
      setResult(item);
      setQuiz(null);
      await load();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoadingLevel(false);
    }
  }
  return (
    <section className="learning-page">
      <div className="content-intro learning-intro">
        <div>
          <p className="eyebrow">
            <Sparkles size={14} /> Gemini-powered practice
          </p>
          <h2>Build a skill, one level at a time.</h2>
          <p>
            Choose a skill or job role, set up to 50 levels, and pass each level
            with 70% before the next challenge unlocks.
          </p>
        </div>
        <span className="learning-score">
          70%<small>to pass</small>
        </span>
      </div>
      <div className="learning-layout">
        <form className="data-form learning-builder" onSubmit={create}>
          <div className="form-row-title">
            <h3>Create a learning path</h3>
            <span>1–50 levels</span>
          </div>
          <div className="learning-type">
            <button
              type="button"
              className={pathType === "skill" ? "selected" : ""}
              onClick={() => setPathType("skill")}
            >
              Learn a skill
            </button>
            <button
              type="button"
              className={pathType === "job" ? "selected" : ""}
              onClick={() => setPathType("job")}
            >
              Prepare for a job
            </button>
          </div>
          <label>
            {pathType === "skill" ? "Skill" : "Job role"}
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder={
                pathType === "skill"
                  ? "e.g. Java, React, UI/UX"
                  : "e.g. Junior Software Engineer"
              }
              required
            />
          </label>
          <div className="level-picker">
            <div>
              <b>{levelCount} levels</b>
              <small>
                Level 1 starts unlocked. Every level after that needs a 70%
                pass.
              </small>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={levelCount}
              onChange={(event) => setLevelCount(event.target.value)}
            />
            <output>{levelCount}</output>
          </div>
          <Button
            className="quiet"
            type="button"
            onClick={recommendation}
            disabled={recommending}
          >
            {recommending
              ? "Asking Gemini..."
              : "Ask Gemini to recommend levels"}
            <Sparkles size={14} />
          </Button>
          <Button type="submit" disabled={creating}>
            {creating ? "Creating path..." : "Create learning path"}
            <ArrowRight size={15} />
          </Button>
        </form>
        <aside className="learning-guide">
          <p className="eyebrow">How it works</p>
          <ol>
            <li>
              <b>01</b>
              <span>Choose one focused skill or a job target.</span>
            </li>
            <li>
              <b>02</b>
              <span>
                Gemini generates five questions only when a level unlocks.
              </span>
            </li>
            <li>
              <b>03</b>
              <span>Score 70% or above to open the next level.</span>
            </li>
          </ol>
        </aside>
      </div>
      {notice && (
        <p
          className={
            /(created|recommends|ready|deleted)/.test(notice)
              ? "form-success"
              : "form-error"
          }
        >
          {notice}
        </p>
      )}
      {result && (
        <section
          className={`learning-result ${result.passed ? "passed" : "retry"}`}
        >
          <b>{result.passed ? "Level passed!" : "Keep practising"}</b>
          <strong>{result.percentage}%</strong>
          <p>
            {result.correctAnswers} of {result.totalQuestions} correct ·{" "}
            {result.message}
          </p>
        </section>
      )}
      <section className="learning-paths">
        <div className="list-heading">
          <h3>Your learning paths</h3>
          <span>{paths.length} active</span>
        </div>
        {paths.length ? (
          <div className="path-tabs">
            {paths.map((path) => (
              <article className={`path-tab${path.id === activeId ? " active" : ""}`} key={path.id}>
                <button onClick={() => { setActiveId(path.id); setQuiz(null); setResult(null); }}>
                  <small>{path.pathType === "job" ? "JOB TARGET" : "SKILL"}</small>
                  <b>{path.topic}</b>
                  <span>Level {Math.min(path.nextUnlockedLevel, path.levelCount)} of {path.levelCount}</span>
                </button>
                <button className="path-delete" type="button" onClick={() => deletePath(path)} aria-label={`Delete ${path.topic} learning path`} title="Delete learning path"><Trash2 size={14} /></button>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">Create your first personalised path to begin.</p>
        )}
        {active && !quiz && (
          <div className="level-grid">
            {active.levels.map((level) => (
              <button
                key={level.number}
                className={`learning-level ${level.status}`}
                disabled={level.status === "locked" || loadingLevel}
                onClick={() => openLevel(level.number)}
              >
                <span>
                  {level.status === "completed"
                    ? "✓"
                    : level.status === "locked"
                      ? "🔒"
                      : level.number}
                </span>
                <b>Level {level.number}</b>
                <small>
                  {level.status === "completed"
                    ? `${level.bestScore}% best`
                    : level.status === "available"
                      ? "Start challenge"
                      : "Pass previous level"}
                </small>
              </button>
            ))}
          </div>
        )}
        {quiz && (
          <form className="quiz-card" onSubmit={submit}>
            <header>
              <button
                type="button"
                className="text-button"
                onClick={() => setQuiz(null)}
              >
                ← Back to levels
              </button>
              <p className="eyebrow">Level {quiz.levelNumber}</p>
              <h3>{quiz.title}</h3>
              <p>{quiz.summary}</p>
            </header>
            {quiz.questions.map((question) => (
              <fieldset key={question.index}>
                <legend>
                  {question.index + 1}. {question.prompt}
                </legend>
                {question.options.map((option, optionIndex) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name={`question-${question.index}`}
                      checked={answers[question.index] === optionIndex}
                      onChange={() =>
                        setAnswers((currentAnswers) =>
                          currentAnswers.map((answer, index) =>
                            index === question.index ? optionIndex : answer,
                          ),
                        )
                      }
                    />
                    {option}
                  </label>
                ))}
              </fieldset>
            ))}
            <Button type="submit" disabled={loadingLevel}>
              {loadingLevel ? "Checking your answers..." : "Submit level"}
              <ClipboardCheck size={15} />
            </Button>
          </form>
        )}
      </section>
    </section>
  );
}

function StudentJobs() {
  const current = getSession();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCv, setSelectedCv] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": current?.id || "",
  };
  const load = () => {
    fetch(`${API_BASE_URL}/jobs`)
      .then(responseBody)
      .then(setJobs)
      .catch((e) => setNotice(e.message));
    if (current?.id)
      Promise.all([
        fetch(`${API_BASE_URL}/applications`, { headers }).then(responseBody),
        fetch(`${API_BASE_URL}/vault/resumes`, { headers }).then(responseBody),
        fetch(`${API_BASE_URL}/vault/documents`, { headers }).then(
          responseBody,
        ),
      ])
        .then(([applicationItems, resumeItems, documentItems]) => {
          setApplications(applicationItems);
          setResumes(resumeItems);
          setDocuments(documentItems);
          const defaultResume = resumeItems.find((item) => item.isDefault);
          if (defaultResume)
            setSelectedCv(
              (existing) => existing || `resume:${defaultResume.id}`,
            );
        })
        .catch((e) => setNotice(e.message));
  };
  useEffect(() => {
    load();
  }, []);
  async function apply(event) {
    event.preventDefault();
    if (!selectedJob || !selectedCv)
      return setNotice("Select a resume version or uploaded document first.");
    setSubmitting(true);
    setNotice("");
    try {
      const [cvSourceType, cvSourceId] = selectedCv.split(":");
      const response = await fetch(
        `${API_BASE_URL}/jobs/${selectedJob.id}/applications`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            cvSourceType,
            cvSourceId: Number(cvSourceId),
          }),
        },
      );
      const application = await responseBody(response);
      setApplications([application, ...applications]);
      setSelectedJob(null);
      setNotice("Application submitted successfully with your selected CV.");
    } catch (e) {
      setNotice(e.message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <section>
      <div className="content-intro compact">
        <div>
          <p className="eyebrow">
            <BriefcaseBusiness size={14} /> Live opportunities
          </p>
          <h2>Jobs published by CareerForge.</h2>
          <p>
            Choose a role, then select a Career Vault CV to submit with your
            application.
          </p>
        </div>
      </div>
      {selectedJob && (
        <form className="apply-panel" onSubmit={apply}>
          <div>
            <p className="eyebrow">
              <FileText size={14} /> CV selection
            </p>
            <h3>Apply for {selectedJob.title}</h3>
            <p>
              {selectedJob.companyName} · Deadline {selectedJob.expiryDate}
            </p>
          </div>
          <label>
            Select the CV to submit
            <select
              value={selectedCv}
              onChange={(e) => setSelectedCv(e.target.value)}
              required
            >
              <option value="">Choose a CV or document</option>
              {resumes.length > 0 && (
                <optgroup label="Resume versions">
                  {resumes.map((resume) => (
                    <option
                      key={`resume:${resume.id}`}
                      value={`resume:${resume.id}`}
                    >
                      {resume.title}
                      {resume.isDefault ? " (default)" : ""}
                    </option>
                  ))}
                </optgroup>
              )}
              {documents.length > 0 && (
                <optgroup label="Uploaded documents">
                  {documents.map((document) => (
                    <option
                      key={`document:${document.id}`}
                      value={`document:${document.id}`}
                    >
                      {document.fileName}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </label>
          {resumes.length === 0 && documents.length === 0 && (
            <p className="form-error">
              Create a resume version or upload a CV in Career Vault before
              applying.
            </p>
          )}
          <div className="row">
            <Button type="submit" disabled={submitting || !selectedCv}>
              {submitting ? "Submitting..." : "Submit selected CV"}
              <ArrowRight size={15} />
            </Button>
            <Button
              className="quiet"
              type="button"
              onClick={() => setSelectedJob(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      {notice && (
        <p
          className={notice.includes("success") ? "form-success" : "form-error"}
        >
          {notice}
        </p>
      )}
      <div className="job-card-grid">
        {jobs.length ? (
          jobs.map((job) => {
            const application = applications.find(
              (item) => item.jobId === job.id,
            );
            return (
              <article className="job-card" key={job.id}>
                <div className="job-company">
                  <span>
                    <Building2 size={18} />
                  </span>
                  <div>
                    <small>{job.companyName}</small>
                    <h3>{job.title}</h3>
                  </div>
                </div>
                <p>{job.description}</p>
                <div className="job-meta">
                  <span>
                    <MapPin size={14} /> {job.location || "Location flexible"}
                  </span>
                  <span>{job.workMode}</span>
                  <span>{job.employmentType.replace("_", " ")}</span>
                </div>
                <footer>
                  <span>Apply by {job.expiryDate}</span>
                  {application ? (
                    <b className="application-state">{application.status}</b>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedJob(job);
                        setNotice("");
                      }}
                    >
                      Select CV <ArrowRight size={14} />
                    </Button>
                  )}
                </footer>
              </article>
            );
          })
        ) : (
          <EmptyPanel
            title="No published jobs yet"
            copy="When an administrator publishes a job, it will appear here."
          />
        )}
      </div>
      {applications.length > 0 && (
        <section className="content-card application-list">
          <div className="list-heading">
            <h3>Your submitted applications</h3>
            <span>{applications.length} total</span>
          </div>
          {applications.map((application) => (
            <article key={application.id}>
              <div>
                <b>{application.jobTitle}</b>
                <small>
                  {application.companyName} · {application.cvTitle} · Submitted{" "}
                  {new Date(application.appliedAt).toLocaleDateString()}
                </small>
              </div>
              <span className="status submitted">{application.status}</span>
            </article>
          ))}
        </section>
      )}
    </section>
  );
}

function AdminJobs() {
  const current = getSession();
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(blankJob);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": current?.id || "",
  };
  const load = () => {
    if (!current?.id) {
      setNotice("Please sign in again as an administrator.");
      return;
    }
    fetch(`${API_BASE_URL}/admin/jobs`, { headers })
      .then(responseBody)
      .then(setJobs)
      .catch((e) => setNotice(e.message));
  };
  useEffect(() => {
    load();
  }, []);
  const change = (event) =>
    setJob({ ...job, [event.target.name]: event.target.value });
  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/jobs${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PUT" : "POST",
          headers,
          body: JSON.stringify(job),
        },
      );
      await responseBody(response);
      setNotice(editingId ? "Job updated." : "Job created.");
      setEditingId(null);
      setJob(blankJob);
      load();
    } catch (e) {
      setNotice(e.message);
    } finally {
      setSaving(false);
    }
  }
  function edit(item) {
    setJob({
      ...blankJob,
      ...item,
      companyWebsite: item.companyWebsite || "",
      companyLocation: item.companyLocation || "",
    });
    setEditingId(item.id);
    setNotice(`Editing job #${item.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function remove(id) {
    if (!window.confirm("Delete this job permanently?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
        method: "DELETE",
        headers,
      });
      await responseBody(response);
      setNotice("Job deleted.");
      load();
    } catch (e) {
      setNotice(e.message);
    }
  }
  async function importJobs() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/jobs/import`, {
        method: "POST",
        headers,
      });
      const body = await responseBody(response);
      setNotice(`${body.imported} jobs imported.`);
      load();
    } catch (e) {
      setNotice(e.message);
    }
  }
  const field = (label, name, type = "text", placeholder = "") => (
    <label>
      {label}
      <input
        name={name}
        type={type}
        value={job[name]}
        onChange={change}
        placeholder={placeholder}
        required={["title", "companyName", "expiryDate"].includes(name)}
      />
    </label>
  );
  return (
    <section className="admin-jobs">
      <div className="content-intro compact">
        <div>
          <p className="eyebrow">
            <BriefcaseBusiness size={14} /> Opportunity management
          </p>
          <h2>Publish and manage jobs.</h2>
          <p>
            Create local jobs now. The import option is ready for the external
            API you select later.
          </p>
        </div>
        <Button className="quiet" type="button" onClick={importJobs}>
          <RefreshCw size={15} /> Import from API
        </Button>
      </div>
      <form className="data-form job-form" onSubmit={save}>
        <div className="form-row-title">
          <h3>{editingId ? "Edit job" : "Add a new job"}</h3>
          {editingId && (
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setEditingId(null);
                setJob(blankJob);
                setNotice("");
              }}
            >
              Cancel editing
            </button>
          )}
        </div>
        <div className="form-grid three">
          {field("Job title", "title", "text", "Software Engineer Intern")}
          {field("Company name", "companyName", "text", "Company Ltd.")}
          {field("Job location", "location", "text", "Dhaka")}
          <label>
            Employment type
            <select
              name="employmentType"
              value={job.employmentType}
              onChange={change}
            >
              <option value="internship">Internship</option>
              <option value="part_time">Part time</option>
              <option value="full_time">Full time</option>
              <option value="contract">Contract</option>
            </select>
          </label>
          <label>
            Work mode
            <select name="workMode" value={job.workMode} onChange={change}>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>
          </label>
          <label>
            Status
            <select name="status" value={job.status} onChange={change}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          {field("Deadline", "expiryDate", "date")}
          {field("Salary text", "salaryText", "text", "BDT 20,000/month")}
          {field(
            "Company website",
            "companyWebsite",
            "url",
            "https://company.com",
          )}
        </div>
        <label className="full-field">
          Job description
          <textarea
            name="description"
            value={job.description}
            onChange={change}
            required
            rows="5"
            placeholder="Responsibilities, requirements, and application instructions..."
          />
        </label>
        {notice && (
          <p
            className={
              /(created|updated|deleted)/.test(notice)
                ? "form-success"
                : "form-error"
            }
          >
            {notice}
          </p>
        )}
        <Button type="submit" disabled={saving}>
          <Plus size={16} />
          {saving ? "Saving..." : editingId ? "Update job" : "Create job"}
        </Button>
      </form>
      <section className="content-card job-list">
        <div className="list-heading">
          <h3>All jobs</h3>
          <span>{jobs.length} total</span>
        </div>
        {jobs.length ? (
          <div className="job-table">
            {jobs.map((item) => (
              <article key={item.id}>
                <div>
                  <b>{item.title}</b>
                  <small>
                    {item.companyName} · {item.location || "No location"}
                  </small>
                </div>
                <span className={`status ${item.status}`}>{item.status}</span>
                <span>{item.expiryDate}</span>
                <div className="table-actions">
                  <button onClick={() => edit(item)} title="Edit">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => remove(item.id)} title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">
            No jobs yet. Use the form above to create the first one.
          </p>
        )}
      </section>
    </section>
  );
}

function Workspace({ role, section, go }) {
  const admin = role === "admin";
  const current = getSession();
  const items = admin ? adminItems : studentItems;
  const label = items.find(([id]) => id === section)?.[1] || "Overview";
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const matches = query.trim()
    ? items.filter(([id, name]) =>
        `${id} ${name}`.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : [];
  const placeholder = {
    assessments: [
      admin ? "Create skill assessments" : "Measure your skills",
      "Published assessments and performance history will appear here.",
    ],
    vault: [
      "Career Vault",
      "Your resume sections and uploaded documents will appear here.",
    ],
    community: [
      "Community",
      "Posts, comments, and moderation activity will appear here.",
    ],
    resources: [
      "Learning resources",
      "Administrator-published resources will appear here.",
    ],
    events: [
      "Events",
      "Upcoming workshops and event registrations will appear here.",
    ],
    students: [
      "Student directory",
      "Registered student accounts will appear here.",
    ],
    settings: [
      "Platform settings",
      "Safe operational settings will appear here.",
    ],
  };
  const dashboard = (
    <>
      <section className="welcome">
        <div>
          <p className="eyebrow">
            <Sparkles size={14} />{" "}
            {admin ? "Platform control" : "Your next step"}
          </p>
          <h2>
            {admin ? "Your operational overview" : "Your career workspace"}
          </h2>
          <p>
            {admin
              ? "Create opportunities and keep platform data useful for every student."
              : "Build a useful picture of your skills, goals, and next career move."}
          </p>
        </div>
        <span>
          <GraduationCap size={44} />
        </span>
      </section>
      <section className="metric-grid">
        {(admin
          ? [
              ["Registered students", "—", Users],
              ["Published jobs", "—", BriefcaseBusiness],
              ["Assessment attempts", "0", ClipboardCheck],
              ["Community posts", "0", MessageCircle],
            ]
          : [
              ["Career readiness", "—", Target],
              ["Active applications", "0", BriefcaseBusiness],
              ["Completed assessments", "0", ClipboardCheck],
              ["Resources saved", "0", BookOpen],
            ]
        ).map(([name, value, Icon]) => (
          <article key={name}>
            <span>
              <Icon size={19} />
            </span>
            <p>{name}</p>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
    </>
  );
  const content =
    admin && section === "overview" ? (
      <AdminOverview go={go} />
    ) : admin && section === "students" ? (
      <AdminStudents />
    ) : admin && section === "applications" ? (
      <AdminApplications />
    ) : admin && ["assessments", "resources", "events"].includes(section) ? (
      <AdminContentManager kind={section} />
    ) : section === "overview" ? (
      dashboard
    ) : section === "profile" && !admin ? (
      <StudentProfile />
    ) : section === "assessments" && !admin ? (
      <LearningPaths />
    ) : section === "vault" && !admin ? (
      <CareerVault />
    ) : section === "jobs" ? (
      admin ? (
        <AdminJobs />
      ) : (
        <StudentJobs />
      )
    ) : (
      <EmptyPanel
        title={placeholder[section]?.[0] || label}
        copy={
          placeholder[section]?.[1] ||
          "This section is ready for Spring Boot API data."
        }
      />
    );
  const signOut = () => {
    localStorage.removeItem("careerforge_session");
    go("/");
  };
  return (
    <main className="workspace">
      <aside className="sidebar">
        <Brand onClick={() => go("/")} />
        <div className="sidebar-role">
          {admin ? "ADMIN WORKSPACE" : "STUDENT WORKSPACE"}
        </div>
        <nav>
          {items.map(([id, name, Icon]) => (
            <button
              className={id === section ? "active" : ""}
              onClick={() => go(`/${role}/${id}`)}
              key={id}
            >
              <Icon size={17} />
              {name}
            </button>
          ))}
        </nav>
        <button className="signout" onClick={signOut}>
          Sign out
        </button>
      </aside>
      <div className="workspace-main">
        <header className="workspace-header">
          <div>
            <p className="breadcrumb">
              {admin ? "ADMINISTRATION" : "CAREERFORGE"}
            </p>
            <h1>{label}</h1>
          </div>
          <div className="top-actions">
            <div className="workspace-search">
              <Search size={17} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search workspace"
                aria-label="Search workspace"
              />
              {matches.length > 0 && (
                <div className="search-results">
                  {matches.map(([id, name, Icon]) => (
                    <button
                      key={id}
                      onClick={() => {
                        go(`/${role}/${id}`);
                        setQuery("");
                      }}
                    >
                      <Icon size={15} />
                      {name}
                    </button>
                  ))}
                </div>
              )}
              {query && matches.length === 0 && (
                <div className="search-results no-results">
                  No matching workspace section.
                </div>
              )}
            </div>
            <div className="account-control">
              <button
                className="avatar"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-label="Open account menu"
              >
                {current?.name?.slice(0, 1)?.toUpperCase() ||
                  (admin ? "A" : "S")}
              </button>
              {accountOpen && (
                <div className="account-menu">
                  <b>
                    {current?.name || (admin ? "Administrator" : "Student")}
                  </b>
                  <small>{current?.email || "Local session"}</small>
                  {!admin && (
                    <button
                      onClick={() => {
                        go("/student/profile");
                        setAccountOpen(false);
                      }}
                    >
                      My profile
                    </button>
                  )}
                  <button onClick={signOut}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        {content}
      </div>
    </main>
  );
}

function App() {
  const [route, go] = useRoute();
  const pieces = route.split("/").filter(Boolean);
  if (pieces[0] === "login")
    return (
      <Login
        role={pieces[1] === "admin" ? "admin" : "student"}
        register={false}
        go={go}
      />
    );
  if (pieces[0] === "register")
    return <Login role="student" register go={go} />;
  if (pieces[0] === "student" || pieces[0] === "admin")
    return (
      <Workspace role={pieces[0]} section={pieces[1] || "overview"} go={go} />
    );
  return <Landing go={go} />;
}
export default App;
