import { useEffect, useState } from "react";
import { Link, useLocation } from "../lib/router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import Brand from "./Brand";
import { registerStudent, signIn } from "../lib/api";

export default function AuthExperience({ role = "student" }) {
  const { search } = useLocation();
  const isAdmin = role === "admin";
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const workspacePath = isAdmin ? "/admin" : "/student";

  const enterWorkspace = (session, token) => {
    if (token) localStorage.setItem("careerforge_token", token);
    localStorage.setItem("careerforge_session", JSON.stringify(session));
    window.location.assign(workspacePath);
  };

  useEffect(() => {
    if (!isAdmin) {
      setMode(new URLSearchParams(search).get("mode") === "register" ? "register" : "login");
    }
  }, [isAdmin, search]);

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");

    if (!email || !password || (mode === "register" && !name)) {
      setError("Please enter your email and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "register") {
        await registerStudent({ name, email, password });
        form.reset();
        setShowPassword(false);
        setMode("login");
        setSuccess("Account created successfully. Sign in with your new email and password.");
        window.history.replaceState({}, "", "/login/student");
        return;
      }

      const result = await signIn({ email, password, role });
      enterWorkspace(result.user, result.token);
    } catch (requestError) {
      setError(requestError.message || "Authentication is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-canvas p-3 sm:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-[30px] border border-white/75 bg-white/55 shadow-lift backdrop-blur-xl sm:min-h-[calc(100vh-40px)] lg:grid-cols-[.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-[#DED2BE] p-8 lg:block">
          <img
            src="/careerforge-hero.png"
            alt="CareerForge career journey"
            className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
          />
          <div className="absolute inset-0 bg-ink/10" />
          <div className="absolute left-8 top-8 glass-strong rounded-2xl px-4 py-3">
            <Brand />
          </div>
          <div className="absolute bottom-8 left-8 right-8 rounded-[28px] border border-white/60 bg-white/75 p-7 shadow-glass backdrop-blur-2xl">
            <div className="eyebrow mb-4 !text-ink">
              {isAdmin ? <ShieldCheck size={14} /> : <Sparkles size={14} />}
              {isAdmin ? "Secure operations portal" : "Your guided career workspace"}
            </div>
            <h1 className="font-display text-4xl leading-[1.03] tracking-[-0.045em]">
              {isAdmin ? "Steer the platform with total clarity." : "One sign-in. Every career move connected."}
            </h1>
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-muted">
              {(isAdmin
                ? ["Role-based access", "Live moderation", "Actionable reporting"]
                : ["AI job matches", "Skill progress", "Resume builder"]
              ).map((item) => (
                <span className="flex items-center gap-1.5" key={item}>
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-jade text-white"><Check size={11} /></span>{item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-full flex-col p-5 sm:p-8 lg:p-12 xl:p-16">
          <div className="flex items-center justify-between">
            <div className="lg:hidden"><Brand /></div>
            <Link to="/" className="btn-ghost ml-auto"><ArrowLeft size={16} /> Back home</Link>
          </div>

          <div className="mx-auto my-auto w-full max-w-[470px] py-10">
            <div className="mb-8">
              <span className={`mb-5 grid h-12 w-12 place-items-center rounded-[18px] text-white ${isAdmin ? "bg-plum" : "bg-cobalt"}`}>
                {isAdmin ? <LockKeyhole size={21} /> : <User size={21} />}
              </span>
              <h2 className="font-display text-4xl leading-none tracking-[-0.045em] sm:text-5xl">
                {mode === "register" ? "Start your journey." : isAdmin ? "Admin access." : "Welcome back."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {mode === "register"
                  ? "Create your student profile and get your first readiness score."
                  : isAdmin
                    ? "Use your authorized administrator credentials."
                    : "Continue building the career you want."}
              </p>
            </div>

            {!isAdmin && (
              <div className="mb-7 grid grid-cols-2 rounded-2xl bg-ink/[0.055] p-1">
                {["login", "register"].map((item) => (
                  <button
                    key={item}
                    onClick={() => { setMode(item); setError(""); setSuccess(""); setShowPassword(false); }}
                    className={`min-h-10 rounded-xl text-sm font-bold transition ${mode === item ? "bg-white text-ink shadow-sm" : "text-muted"}`}
                  >
                    {item === "login" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>
            )}

            <form key={`${role}-${mode}`} onSubmit={submit} className="space-y-4">
              {mode === "register" && (
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-ink">Full name</span>
                  <span className="relative block">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
                    <input name="name" autoComplete="name" className="input pl-11" placeholder="Your full name" />
                  </span>
                </label>
              )}
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-ink">{isAdmin ? "Work email" : "Email address"}</span>
                <span className="relative block">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
                  <input
                    name="email"
                    type="email"
                    autoComplete="username"
                    className="input pl-11"
                    placeholder={isAdmin ? "Your private admin email" : "you@example.com"}
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 flex items-center justify-between text-xs font-bold text-ink">
                  Password
                  {mode === "login" && <button type="button" className="font-semibold text-cobalt">Forgot password?</button>}
                </span>
                <span className="relative block">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    className="input pl-11 pr-11"
                    placeholder="Minimum 8 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>
              {mode === "register" && (
                <label className="flex items-start gap-3 text-xs leading-5 text-muted">
                  <input type="checkbox" required className="mt-1 accent-cobalt" />
                  I agree to the Terms of Service and understand how CareerForge uses profile data to personalize recommendations.
                </label>
              )}
              {error && <p className="rounded-xl bg-coral/10 px-3 py-2 text-xs font-semibold text-coral">{error}</p>}
              {success && <p className="rounded-xl bg-jade/10 px-3 py-2 text-xs font-semibold text-jade">{success}</p>}
              <button disabled={loading} className={`w-full ${isAdmin ? "btn-primary !bg-plum hover:!bg-[#64465b]" : "btn-accent"}`}>
                {loading ? "Preparing your workspace..." : mode === "register" ? "Create student account" : `Enter ${isAdmin ? "admin portal" : "workspace"}`}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <p className="mt-7 text-center text-xs text-muted">
              {isAdmin ? "Student trying to sign in?" : "Platform administrator?"}{" "}
              <Link className="font-bold text-cobalt hover:underline" to={isAdmin ? "/login/student" : "/login/admin"}>
                Go to {isAdmin ? "student login" : "admin portal"}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
