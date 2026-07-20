"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { signInWithGoogle } from "@/lib/googleAuth";

type Tone = "error" | "info" | "success";
type Role = "student" | "teacher" | "admin";

function GoogleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09A6.3 6.3 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;
}

function friendlyError(message: string) {
  const value = message.toLowerCase();
  if (value.includes("invalid login credentials")) return "Email yoki parol noto‘g‘ri.";
  if (value.includes("email not confirmed")) return "Email hali tasdiqlanmagan. Inbox yoki Spam papkasini tekshiring.";
  if (value.includes("rate limit")) return "Juda ko‘p urinish bo‘ldi. Biroz kutib, qayta urinib ko‘ring.";
  return "Kirishda xatolik yuz berdi. Ma’lumotlarni tekshirib, qayta urinib ko‘ring.";
}

const noticeStyle: Record<Tone, string> = {
  error: "border-[#FFD4CC] bg-[#FFF3F0] text-[#C53B26]",
  info: "border-[#D9E1F7] bg-[#F4F7FF] text-[#071A52]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: Tone } | null>(null);

  const busy = loading || googleLoading;
  const showNotice = (text: string, tone: Tone = "error") => setNotice({ text, tone });

  useEffect(() => {
    let mounted = true;

    async function restorePageState() {
      if (!mounted) return;
      setLoading(false);
      setGoogleLoading(false);

      const { data } = await supabase.auth.getSession();
      if (mounted && data.session?.user) window.location.replace("/dashboard");
    }

    restorePageState();
    window.addEventListener("pageshow", restorePageState);
    return () => {
      mounted = false;
      window.removeEventListener("pageshow", restorePageState);
    };
  }, []);

  async function roleFor(userId: string): Promise<Role> {
    const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
    return data?.role === "admin" || data?.role === "teacher" ? data.role : "student";
  }

  async function handleGoogle() {
    if (busy) return;
    setGoogleLoading(true);
    showNotice("Google oynasi ochilmoqda...", "info");
    const started = await signInWithGoogle((text) => showNotice(text, "info"));
    if (!started) {
      setGoogleLoading(false);
      showNotice("Google orqali kirishni boshlab bo‘lmadi. Qayta urinib ko‘ring.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    setNotice(null);

    if (!cleanEmail) return showNotice("Email manzilingizni kiriting.");

    if (resetMode) {
      setLoading(true);
      const redirectTo = `${window.location.origin}/login`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo });
      setLoading(false);
      if (error) return showNotice(friendlyError(error.message));
      return showNotice("Parolni tiklash havolasi emailingizga yuborildi.", "success");
    }

    if (!password) return showNotice("Parolingizni kiriting.");

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) return showNotice(friendlyError(error.message));
      if (!data.user?.id || !data.session) return showNotice("Sessiya yaratilmadi. Qayta urinib ko‘ring.");

      const role = await roleFor(data.user.id);
      try {
        sessionStorage.setItem("testora_access_ok", "true");
        role === "student" ? sessionStorage.removeItem("testora_admin_ok") : sessionStorage.setItem("testora_admin_ok", "true");
      } catch {}

      window.location.replace(role === "student" ? "/dashboard" : "/admin");
    } catch {
      showNotice("Internet aloqasini tekshirib, qayta urinib ko‘ring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7FC] text-[#071A52] lg:grid lg:grid-cols-[1.02fr_.98fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#071A52] px-12 py-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,77,50,.28),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(255,255,255,.10),transparent_30%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:28px_28px]" />
        <Link href="/" className="relative z-10 inline-flex w-fit items-center" aria-label="EnglishPeak home">
          <img src="/brand/englishpeak-logo.png" alt="EnglishPeak" className="h-12 w-auto brightness-0 invert" />
        </Link>
        <div className="relative z-10 my-auto max-w-[620px] py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur"><Sparkles size={16} className="text-[#FF6B52]" /> Real IELTS & CEFR practice</div>
          <h1 className="mt-7 text-5xl font-black leading-[1.08] tracking-[-.045em] xl:text-6xl">Your next English peak starts here.</h1>
          <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-white/70">Practice with realistic exams, understand every result and move towards your target score with confidence.</p>
          <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
            {[['120+','exam materials'],['24/7','access anywhere'],['4 skills','one platform']].map(([value,label]) => <div key={value} className="rounded-2xl border border-white/12 bg-white/[.08] p-4 backdrop-blur"><p className="text-xl font-black">{value}</p><p className="mt-1 text-xs font-semibold text-white/55">{label}</p></div>)}
          </div>
        </div>
        <p className="relative z-10 text-xs font-semibold text-white/40">© 2026 EnglishPeak. IELTS & CEFR preparation platform.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-[470px]">
          <Link href="/" className="mb-7 inline-flex lg:hidden" aria-label="EnglishPeak home"><img src="/brand/englishpeak-logo.png" alt="EnglishPeak" className="h-11 w-auto" /></Link>
          <div className="rounded-[30px] border border-[#DDE4F3] bg-white p-6 shadow-[0_24px_70px_rgba(7,26,82,.10)] sm:p-8">
            <div className="mb-6 grid h-13 w-13 place-items-center rounded-2xl bg-[#FFF0EC] text-[#FF4D32]" style={{height:52,width:52}}>{resetMode ? <Mail size={24}/> : <ShieldCheck size={25}/>}</div>
            <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#FF4D32]">{resetMode ? "Password recovery" : "Welcome back"}</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.035em] text-[#071A52]">{resetMode ? "Reset your password" : "Sign in to EnglishPeak"}</h1>
            <p className="mt-2 text-sm font-medium leading-6 text-[#5B6785]">{resetMode ? "We’ll email you a secure reset link." : "Continue your IELTS and CEFR progress."}</p>

            {!resetMode && <><button type="button" onClick={handleGoogle} disabled={busy} className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-[#DDE4F3] bg-white px-5 py-3.5 text-sm font-extrabold text-[#071A52] transition hover:-translate-y-px hover:border-[#AEBBD7] hover:bg-[#F8FAFE] disabled:cursor-not-allowed disabled:opacity-60"><GoogleIcon />{googleLoading ? "Opening Google..." : "Continue with Google"}</button><div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-[#E5EAF4]"/><span className="text-xs font-bold text-[#8993AA]">or use email</span><span className="h-px flex-1 bg-[#E5EAF4]"/></div></>}

            <form onSubmit={handleSubmit} className={resetMode ? "mt-6 space-y-4" : "space-y-4"} noValidate>
              <label className="block"><span className="mb-2 block text-xs font-extrabold text-[#45516F]">Email address</span><div className="flex items-center gap-3 rounded-2xl border border-[#DDE4F3] bg-[#F7F9FD] px-4 py-3.5 transition focus-within:border-[#FF6B52] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#FF4D32]/10"><Mail size={18} className="shrink-0 text-[#FF4D32]"/><input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#071A52] outline-none placeholder:font-medium placeholder:text-[#9AA4B8]"/></div></label>
              {!resetMode && <label className="block"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-extrabold text-[#45516F]">Password</span><button type="button" onClick={()=>{setResetMode(true);setNotice(null)}} className="text-xs font-extrabold text-[#FF4D32] hover:underline">Forgot password?</button></div><div className="flex items-center gap-3 rounded-2xl border border-[#DDE4F3] bg-[#F7F9FD] px-4 py-3.5 transition focus-within:border-[#FF6B52] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#FF4D32]/10"><LockKeyhole size={18} className="shrink-0 text-[#FF4D32]"/><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter your password" className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#071A52] outline-none placeholder:font-medium placeholder:text-[#9AA4B8]"/><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={()=>setShowPassword(!showPassword)} className="text-[#7E899F] hover:text-[#071A52]">{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div></label>}
              {notice && <div role="status" className={`flex items-start gap-2 rounded-2xl border p-3.5 text-sm font-bold leading-5 ${noticeStyle[notice.tone]}`}>{notice.tone === "success" && <CheckCircle2 size={18} className="mt-px shrink-0"/>}{notice.text}</div>}
              <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF4D32] px-5 py-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(255,77,50,.25)] transition hover:-translate-y-px hover:bg-[#E93F27] hover:shadow-[0_16px_34px_rgba(255,77,50,.30)] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Please wait..." : resetMode ? "Send reset link" : "Sign in"}{!loading && <ArrowRight size={18}/>}</button>
            </form>

            {resetMode ? <button type="button" onClick={()=>{setResetMode(false);setNotice(null)}} className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-extrabold text-[#071A52] hover:text-[#FF4D32]"><ArrowLeft size={17}/>Back to sign in</button> : <p className="mt-6 text-center text-sm font-semibold text-[#5B6785]">New to EnglishPeak? <Link href="/register" className="font-black text-[#FF4D32] hover:underline">Create free account</Link></p>}
          </div>
        </div>
      </section>
    </main>
  );
}
