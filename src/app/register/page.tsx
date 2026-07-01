"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/auth";
import { signInWithGoogle } from "@/lib/googleAuth";

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
    return "rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] p-4 text-sm font-bold text-[#5B4FCF]";
  }

  return "rounded-2xl border border-[#E2DEFF] bg-[#FFF0EE] p-4 text-sm font-bold text-[#E24B4A]";
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [examType, setExamType] = useState("IELTS");
  const [targetScore, setTargetScore] = useState("8.0");
  const [currentLevel, setCurrentLevel] = useState("B2");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<MessageTone>("error");
  const [created, setCreated] = useState(false);

  function showMessage(text: string, tone: MessageTone = "error") {
    setMessage(text);
    setMessageTone(tone);
  }

  async function handleGoogleRegister() {
    if (loading || googleLoading) return;

    setCreated(false);
    setGoogleLoading(true);
    showMessage("Google orqali ro‘yxatdan o‘tish oynasi ochilmoqda...", "info");

    const started = await signInWithGoogle((text) => showMessage(text, "info"));

    if (!started) {
      showMessage("Google orqali ro‘yxatdan o‘tishda xatolik yuz berdi. Qayta urinib ko‘ring.");
      setGoogleLoading(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setCreated(false);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      showMessage("Please fill in full name, email and password.");
      return;
    }

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            role: "student",
            exam_type: examType,
            target_score: targetScore,
            current_level: currentLevel,
          },
        },
      });

      if (error) {
        showMessage(error.message);
        return;
      }

      if (!data.session || !data.user) {
        setCreated(true);
        showMessage("Account created successfully. Please check your email or sign in.", "success");
        return;
      }

      await ensureUserProfile(data.user, {
        full_name: cleanName,
        role: "student",
        exam_type: examType,
        target_score: targetScore,
        current_level: currentLevel,
      });

      try {
        window.sessionStorage.setItem("testora_access_ok", "true");
      } catch {
        // Storage blocked bo'lsa ham redirect ishlaydi.
      }

      window.location.href = "/dashboard";
    } catch {
      showMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F3FF] text-[#13102B]">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1fr]">
        <section className="flex items-center justify-center p-5 md:p-10">
          <div className="w-full max-w-[540px]">
            <div className="mb-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-col items-center justify-center gap-[3px] rounded-xl bg-[#5B4FCF]">
                  <div className="h-[2.5px] w-[18px] rounded bg-white" />
                  <div className="h-[12px] w-1 rounded bg-white" />
                </div>

                <span className="text-xl font-extrabold tracking-[2px]">
                  TEST<span className="text-[#5B4FCF]">ORA</span>
                </span>
              </Link>
            </div>

            <div className="rounded-[30px] border border-[#E2DEFF] bg-white p-6 shadow-[0_20px_60px_rgba(91,79,207,.10)] md:p-8">
              <div className="mb-8">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#EEF0FF] text-[#5B4FCF]">
                  <User size={26} />
                </div>

                <p className="mb-2 text-xs font-extrabold tracking-[0.18em] text-[#5B4FCF]">
                  CREATE ACCOUNT
                </p>

                <h1 className="text-3xl font-extrabold text-[#13102B]">
                  Start your Testora journey
                </h1>

                <p className="mt-2 text-sm leading-6 text-[#6B6880]">
                  Create your student account. Admin and teacher roles are assigned only from Supabase/Admin Panel.
                </p>
              </div>

              {created ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <p className="text-sm font-extrabold text-emerald-700">
                      Account created successfully.
                    </p>

                    <p className="mt-2 text-sm font-semibold leading-6 text-[#6B6880]">
                      If your project requires email confirmation, check your inbox. Otherwise, you can sign in now.
                    </p>
                  </div>

                  <Link
                    href="/login"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5B4FCF] px-5 py-4 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8]"
                  >
                    Go to sign in <ArrowRight size={18} />
                  </Link>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={loading || googleLoading}
                    onClick={handleGoogleRegister}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border-[1.5px] border-[#E2DEFF] bg-white px-5 py-3 text-sm font-extrabold text-[#13102B] outline-none transition-all duration-200 hover:-translate-y-px hover:border-[#5B4FCF] hover:bg-[#F7F6FF] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <GoogleIcon />
                    {googleLoading ? "Opening Google..." : "Continue with Google"}
                  </button>

                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[#E2DEFF]" />
                    <span className="text-xs font-bold text-[#9A96B2]">or create with email</span>
                    <div className="h-px flex-1 bg-[#E2DEFF]" />
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                        Full name
                      </span>

                      <div className="flex items-center gap-3 rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] px-4 py-3 transition hover:border-[#5B4FCF]">
                        <User size={19} className="text-[#5B4FCF]" />

                        <input
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          placeholder="Rustam Usmonov"
                          className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-[#9A96B2]"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                        Email
                      </span>

                      <div className="flex items-center gap-3 rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] px-4 py-3 transition hover:border-[#5B4FCF]">
                        <Mail size={19} className="text-[#5B4FCF]" />

                        <input
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          type="email"
                          placeholder="you@testora.uz"
                          className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-[#9A96B2]"
                        />
                      </div>
                    </label>

                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                          Exam
                        </span>

                        <select
                          value={examType}
                          onChange={(event) => setExamType(event.target.value)}
                          className="w-full rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] px-4 py-3 text-sm font-bold outline-none transition hover:border-[#5B4FCF]"
                        >
                          <option>IELTS</option>
                          <option>CEFR</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                          Target
                        </span>

                        <select
                          value={targetScore}
                          onChange={(event) => setTargetScore(event.target.value)}
                          className="w-full rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] px-4 py-3 text-sm font-bold outline-none transition hover:border-[#5B4FCF]"
                        >
                          <option>5.5</option>
                          <option>6.0</option>
                          <option>6.5</option>
                          <option>7.0</option>
                          <option>7.5</option>
                          <option>8.0</option>
                          <option>8.5</option>
                          <option>9.0</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                          Level
                        </span>

                        <select
                          value={currentLevel}
                          onChange={(event) => setCurrentLevel(event.target.value)}
                          className="w-full rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] px-4 py-3 text-sm font-bold outline-none transition hover:border-[#5B4FCF]"
                        >
                          <option>A1</option>
                          <option>A2</option>
                          <option>B1</option>
                          <option>B2</option>
                          <option>C1</option>
                        </select>
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                        Password
                      </span>

                      <div className="flex items-center gap-3 rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] px-4 py-3 transition hover:border-[#5B4FCF]">
                        <LockKeyhole size={19} className="text-[#5B4FCF]" />

                        <input
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimum 6 characters"
                          className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-[#9A96B2]"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[#6B6880] transition hover:text-[#5B4FCF]"
                        >
                          {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                      </div>
                    </label>

                    {message && <div className={messageClass(messageTone)}>{message}</div>}

                    <button
                      disabled={loading || googleLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5B4FCF] px-5 py-4 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Creating account..." : "Sign up for free"}
                      {!loading && <ArrowRight size={18} />}
                    </button>
                  </form>
                </>
              )}

              {!created && (
                <p className="mt-6 text-center text-sm font-semibold text-[#6B6880]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-extrabold text-[#5B4FCF] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-[#5B4FCF] p-10 text-white lg:block">
          <div className="absolute left-[-120px] top-[-120px] h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-[-160px] right-[-120px] h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 mt-24 max-w-xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold">
              <Sparkles size={16} /> Professional IELTS platform
            </p>

            <h1 className="text-5xl font-extrabold leading-tight">
              Build your route, practise daily and track every band.
            </h1>

            <p className="mt-5 text-lg leading-8 text-white/75">
              Registration is public. If email confirmation is OFF, the dashboard opens automatically after signup.
            </p>
          </div>

          <div className="relative z-10 mt-12 grid max-w-xl gap-4">
            {[
              ["Student by default", "Every new account starts safely as student"],
              ["Role protected", "Admin / Teacher roles are assigned manually"],
              ["RLS safe", "No frontend insert into profiles table"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
                  <Target size={22} />
                </div>

                <div>
                  <p className="font-extrabold">{title}</p>
                  <p className="text-sm text-white/70">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
