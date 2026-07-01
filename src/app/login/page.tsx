"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { signInWithGoogle } from "@/lib/googleAuth";

type UserRole = "student" | "teacher" | "admin";
type MessageTone = "error" | "info" | "success";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function messageClass(tone: MessageTone) {
  if (tone === "success") {
    return "rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700";
  }

  if (tone === "info") {
    return "rounded-2xl border border-[rgba(108,92,231,0.20)] bg-[#F8F7FF] p-4 text-sm font-bold text-[#6C5CE7]";
  }

  return "rounded-2xl border border-[rgba(226,75,74,0.20)] bg-[#FFF0EE] p-4 text-sm font-bold text-[#E17055]";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<MessageTone>("error");

  function showMessage(text: string, tone: MessageTone = "error") {
    setMessage(text);
    setMessageTone(tone);
  }

  async function waitForSession() {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.id) return session;

      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    return null;
  }

  async function getUserRole(userId: string): Promise<UserRole> {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error || !profile?.role) return "student";
    if (profile.role === "admin") return "admin";
    if (profile.role === "teacher") return "teacher";

    return "student";
  }

  async function handleGoogleLogin() {
    if (loading || googleLoading) return;

    setGoogleLoading(true);
    showMessage("Google orqali kirish oynasi ochilmoqda...", "info");

    const started = await signInWithGoogle((text) => showMessage(text, "info"));

    if (!started) {
      showMessage("Google orqali kirishda xatolik yuz berdi. Qayta urinib ko‘ring.");
      setGoogleLoading(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      showMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        showMessage(error.message);
        return;
      }

      const session = data.session || (await waitForSession());

      if (!session?.user?.id) {
        showMessage("Session was not created. Please try again.");
        return;
      }

      const role = await getUserRole(session.user.id);

      try {
        window.sessionStorage.setItem("testora_access_ok", "true");

        if (role === "admin" || role === "teacher") {
          window.sessionStorage.setItem("testora_admin_ok", "true");
        } else {
          window.sessionStorage.removeItem("testora_admin_ok");
        }
      } catch {
        // Storage blocked bo'lsa ham redirect ishlaydi.
      }

      if (role === "admin" || role === "teacher") {
        window.location.href = "/admin";
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      showMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#F0EEFF] text-[#0A0A0A] lg:grid-cols-[1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#5B4FCF_0%,#7C6FE8_50%,#4A3FB5_100%)] p-10 text-white lg:block">
        <div className="absolute left-[-90px] top-[-90px] h-[350px] w-[350px] rounded-full bg-white/8 blur-[80px]" />
        <div className="absolute bottom-[-130px] right-[-140px] h-[400px] w-[400px] rounded-full bg-white/8 blur-[80px]" />
        <div className="absolute left-[42%] top-[38%] h-[200px] w-[200px] rounded-full bg-[#A29BFE]/20 blur-[60px]" />

        <Link
          href="/"
          aria-label="Go to Testora home"
          className="relative z-10 flex items-center gap-3 rounded-2xl outline-none transition focus:ring-2 focus:ring-white/30"
        >
          <div className="flex h-10 w-10 flex-col items-center justify-center gap-[3px] rounded-xl bg-white/20 shadow-[0_8px_24px_rgba(255,255,255,0.10)]">
            <div className="h-[2.5px] w-[18px] rounded bg-white" />
            <div className="h-[12px] w-1 rounded bg-white" />
          </div>

          <span className="text-xl font-black tracking-[2px] text-white">
            TEST<span className="text-white/70">ORA</span>
          </span>
        </Link>

        <div className="relative z-10 mt-24 max-w-xl">
          <div
            className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm"
            style={{ animationDelay: "0ms" }}
          >
            <Sparkles size={16} />
            IELTS & CEFR exam platform
          </div>

          <h1
            className="animate-fade-up mt-6 text-4xl font-black leading-tight tracking-[-0.03em] text-white"
            style={{ animationDelay: "100ms" }}
          >
            The smartest way to prepare for IELTS.
          </h1>

          <p
            className="animate-fade-up mt-4 text-base font-medium leading-7 text-white/75"
            style={{ animationDelay: "200ms" }}
          >
            Join 100,000+ students already improving their band score.
          </p>

          <div
            className="animate-fade-up mt-8 flex gap-6"
            style={{ animationDelay: "300ms" }}
          >
            {[
              ["100,000+", "Users"],
              ["4.8 ⭐", "Rating"],
              ["Band", "7.5 avg"],
            ].map(([value, label], index) => (
              <div
                key={label}
                className={index === 2 ? "pr-0" : "border-r border-white/20 pr-6"}
              >
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="mt-0.5 text-xs font-medium text-white/60">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div
            className="animate-fade-up mt-10 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
            style={{ animationDelay: "400ms" }}
          >
            <div className="text-sm text-[#FDCB6E]">⭐⭐⭐⭐⭐</div>
            <p className="mt-2 text-sm font-medium leading-6 text-white/90">
              “Testora helped me go from Band 5.5 to Band 7.5 in just 3 months.
              The practice tests are incredible!”
            </p>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,#A29BFE,#6C5CE7)] text-xs font-black text-white">
                  AK
                </div>

                <div>
                  <p className="text-sm font-bold text-white">Aziz Karimov</p>
                  <p className="text-xs font-medium text-white/60">
                    IELTS student
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                Band 7.5 ✓
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#F0EEFF] p-5 md:p-10">
        <div className="w-full max-w-[480px]">
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              aria-label="Go to Testora home"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 flex-col items-center justify-center gap-[3px] rounded-xl bg-[#6C5CE7] shadow-[0_4px_12px_rgba(108,92,231,0.25)]">
                <div className="h-[2.5px] w-[18px] rounded bg-white" />
                <div className="h-[12px] w-1 rounded bg-white" />
              </div>

              <span className="text-xl font-black tracking-[2px] text-[#0A0A0A]">
                TEST<span className="text-[#6C5CE7]">ORA</span>
              </span>
            </Link>
          </div>

          <div className="animate-fade-up w-full rounded-[30px] border border-[rgba(108,92,231,0.15)] bg-white p-8 shadow-[0_20px_60px_rgba(108,92,231,0.10)]">
            <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,#EDE9FF,#E4E0FF)] text-[#6C5CE7]">
              <ShieldCheck size={26} />
            </div>

            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6C5CE7]">
              SIGN IN
            </p>

            <h1 className="text-2xl font-black tracking-[-0.02em] text-[#0A0A0A]">
              Login to Testora
            </h1>

            <p className="mt-1 text-sm font-medium leading-6 text-[#4A4A4A]">
              Welcome back. Continue your IELTS and CEFR preparation with your
              personal dashboard.
            </p>

            <button
              type="button"
              disabled={loading || googleLoading}
              onClick={handleGoogleLogin}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border-[1.5px] border-[rgba(108,92,231,0.20)] bg-white px-5 py-3 text-sm font-bold text-[#0A0A0A] outline-none transition-all duration-200 hover:-translate-y-px hover:border-[#6C5CE7] hover:bg-[#F8F7FF] focus:ring-2 focus:ring-[#6C5CE7]/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleIcon />
              {googleLoading ? "Opening Google..." : "Continue with Google"}
            </button>

            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[rgba(108,92,231,0.15)]" />
              <span className="text-xs font-semibold text-[#8A8A8A]">or</span>
              <div className="h-px flex-1 bg-[rgba(108,92,231,0.15)]" />
            </div>

            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">
                  Email
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-[rgba(108,92,231,0.18)] bg-[#F8F7FF] px-4 py-3 transition-all duration-150 focus-within:border-[#6C5CE7] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(108,92,231,0.08)]">
                  <Mail size={18} className="text-[#6C5CE7]" />

                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="you@testora.uz"
                    className="w-full bg-transparent text-sm font-semibold text-[#0A0A0A] outline-none placeholder:text-[#8A8A8A]"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">
                  Password
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-[rgba(108,92,231,0.18)] bg-[#F8F7FF] px-4 py-3 transition-all duration-150 focus-within:border-[#6C5CE7] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(108,92,231,0.08)]">
                  <LockKeyhole size={18} className="text-[#6C5CE7]" />

                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="w-full bg-transparent text-sm font-semibold text-[#0A0A0A] outline-none placeholder:text-[#8A8A8A]"
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-[#8A8A8A] outline-none transition hover:text-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/25"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </label>

              <div className="mt-2 text-right">
                <Link
                  href="/login"
                  className="text-xs font-bold text-[#6C5CE7] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {message && <div className={messageClass(messageTone)}>{message}</div>}

              <button
                disabled={loading || googleLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#6C5CE7,#8B7CF8)] px-5 py-3.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(108,92,231,0.30)] outline-none transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-px hover:shadow-[0_12px_32px_rgba(108,92,231,0.40)] focus:ring-2 focus:ring-[#6C5CE7]/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-medium text-[#4A4A4A]">
              Don&apos;t have account?{" "}
              <Link
                href="/register"
                className="font-black text-[#6C5CE7] hover:underline"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
