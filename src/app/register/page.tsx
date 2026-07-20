"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Sparkles, Target, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/auth";
import { signInWithGoogle } from "@/lib/googleAuth";

type Tone = "error" | "info" | "success";

function GoogleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09A6.3 6.3 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;
}

function friendlyError(message: string) {
  const value = message.toLowerCase();
  if (value.includes("already registered") || value.includes("already been registered")) return "Bu email bilan hisob allaqachon mavjud. Login sahifasidan kiring.";
  if (value.includes("password")) return "Parol xavfsizlik talablariga mos kelmadi. Kuchliroq parol kiriting.";
  if (value.includes("rate limit")) return "Juda ko‘p urinish bo‘ldi. Biroz kutib, qayta urinib ko‘ring.";
  return "Hisob yaratishda xatolik yuz berdi. Ma’lumotlarni tekshirib, qayta urinib ko‘ring.";
}

const noticeStyle: Record<Tone, string> = {
  error: "border-[#FFD4CC] bg-[#FFF3F0] text-[#C53B26]",
  info: "border-[#D9E1F7] bg-[#F4F7FF] text-[#071A52]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [examType, setExamType] = useState("IELTS");
  const [targetScore, setTargetScore] = useState("7.0");
  const [currentLevel, setCurrentLevel] = useState("B2");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: Tone } | null>(null);

  const busy = loading || googleLoading;
  const passwordReady = useMemo(() => password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password), [password]);
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

  async function handleGoogle() {
    if (busy) return;
    setGoogleLoading(true);
    showNotice("Google oynasi ochilmoqda...", "info");
    const started = await signInWithGoogle((text) => showNotice(text, "info"));
    if (!started) {
      setGoogleLoading(false);
      showNotice("Google orqali ro‘yxatdan o‘tishni boshlab bo‘lmadi.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = fullName.trim().replace(/\s+/g, " ");
    const cleanEmail = email.trim().toLowerCase();
    setNotice(null);

    if (name.length < 3) return showNotice("Ism va familiyangizni to‘liq kiriting.");
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) return showNotice("To‘g‘ri email manzil kiriting.");
    if (!passwordReady) return showNotice("Parol kamida 8 ta belgi, bitta harf va bitta raqamdan iborat bo‘lsin.");
    if (password !== confirmPassword) return showNotice("Parollar bir-biriga mos emas.");

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: name, role: "student", exam_type: examType, target_score: targetScore, current_level: currentLevel },
        },
      });

      if (error) return showNotice(friendlyError(error.message));
      if (!data.user) return showNotice("Hisob yaratilmadi. Qayta urinib ko‘ring.");

      if (!data.session) {
        setCreated(true);
        return showNotice("Hisob yaratildi. Emailingizdagi tasdiqlash havolasini bosing.", "success");
      }

      const profile = await ensureUserProfile(data.user, { full_name: name, role: "student", exam_type: examType, target_score: targetScore, current_level: currentLevel });
      if (!profile) return showNotice("Hisob yaratildi, ammo profilni tayyorlab bo‘lmadi. Qayta login qilib ko‘ring.");

      try { sessionStorage.setItem("testora_access_ok", "true"); } catch {}
      window.location.replace("/dashboard");
    } catch {
      showNotice("Internet aloqasini tekshirib, qayta urinib ko‘ring.");
    } finally {
      setLoading(false);
    }
  }

  const fieldShell = "flex items-center gap-3 rounded-2xl border border-[#DDE4F3] bg-[#F7F9FD] px-4 py-3.5 transition focus-within:border-[#FF6B52] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#FF4D32]/10";
  const inputStyle = "min-w-0 flex-1 bg-transparent text-sm font-bold text-[#071A52] outline-none placeholder:font-medium placeholder:text-[#9AA4B8]";
  const selectStyle = "w-full rounded-2xl border border-[#DDE4F3] bg-[#F7F9FD] px-3 py-3.5 text-sm font-extrabold text-[#071A52] outline-none transition focus:border-[#FF6B52] focus:ring-4 focus:ring-[#FF4D32]/10";

  return (
    <main className="min-h-screen bg-[#F5F7FC] text-[#071A52] lg:grid lg:grid-cols-[.98fr_1.02fr]">
      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-[550px]">
          <Link href="/" className="mb-6 inline-flex" aria-label="EnglishPeak home"><img src="/brand/englishpeak-logo.png" alt="EnglishPeak" className="h-11 w-auto" /></Link>
          <div className="rounded-[30px] border border-[#DDE4F3] bg-white p-6 shadow-[0_24px_70px_rgba(7,26,82,.10)] sm:p-8">
            {created ? (
              <div className="py-4 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={30}/></div>
                <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[.18em] text-emerald-600">Account created</p>
                <h1 className="mt-2 text-3xl font-black tracking-[-.035em]">Check your email</h1>
                <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-[#5B6785]">We sent a confirmation link to <strong className="text-[#071A52]">{email.trim().toLowerCase()}</strong>. Open it to activate your account.</p>
                <Link href="/login" className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF4D32] px-5 py-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(255,77,50,.25)]">Go to sign in <ArrowRight size={18}/></Link>
              </div>
            ) : (
              <>
                <div className="mb-6"><div className="mb-4 grid h-13 w-13 place-items-center rounded-2xl bg-[#FFF0EC] text-[#FF4D32]" style={{height:52,width:52}}><User size={25}/></div><p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#FF4D32]">Free student account</p><h1 className="mt-2 text-3xl font-black tracking-[-.035em]">Join EnglishPeak</h1><p className="mt-2 text-sm font-medium leading-6 text-[#5B6785]">Set your target and start practising in minutes.</p></div>
                <button type="button" onClick={handleGoogle} disabled={busy} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#DDE4F3] bg-white px-5 py-3.5 text-sm font-extrabold transition hover:-translate-y-px hover:border-[#AEBBD7] hover:bg-[#F8FAFE] disabled:opacity-60"><GoogleIcon/>{googleLoading ? "Opening Google..." : "Continue with Google"}</button>
                <div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-[#E5EAF4]"/><span className="text-xs font-bold text-[#8993AA]">or create with email</span><span className="h-px flex-1 bg-[#E5EAF4]"/></div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label><span className="mb-2 block text-xs font-extrabold text-[#45516F]">Full name</span><div className={fieldShell}><User size={18} className="text-[#FF4D32]"/><input autoComplete="name" value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Your full name" className={inputStyle}/></div></label>
                    <label><span className="mb-2 block text-xs font-extrabold text-[#45516F]">Email address</span><div className={fieldShell}><Mail size={18} className="text-[#FF4D32]"/><input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className={inputStyle}/></div></label>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <label><span className="mb-2 block text-xs font-extrabold text-[#45516F]">Exam</span><select value={examType} onChange={(e)=>setExamType(e.target.value)} className={selectStyle}><option>IELTS</option><option>CEFR</option></select></label>
                    <label><span className="mb-2 block text-xs font-extrabold text-[#45516F]">Target</span><select value={targetScore} onChange={(e)=>setTargetScore(e.target.value)} className={selectStyle}>{["5.5","6.0","6.5","7.0","7.5","8.0","8.5","9.0"].map(v=><option key={v}>{v}</option>)}</select></label>
                    <label><span className="mb-2 block text-xs font-extrabold text-[#45516F]">Level</span><select value={currentLevel} onChange={(e)=>setCurrentLevel(e.target.value)} className={selectStyle}>{["A1","A2","B1","B2","C1","C2"].map(v=><option key={v}>{v}</option>)}</select></label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label><span className="mb-2 block text-xs font-extrabold text-[#45516F]">Password</span><div className={fieldShell}><LockKeyhole size={18} className="text-[#FF4D32]"/><input type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="8+ characters" className={inputStyle}/><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={()=>setShowPassword(!showPassword)} className="text-[#7E899F] hover:text-[#071A52]">{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div></label>
                    <label><span className="mb-2 block text-xs font-extrabold text-[#45516F]">Confirm password</span><div className={fieldShell}><LockKeyhole size={18} className="text-[#FF4D32]"/><input type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Repeat password" className={inputStyle}/></div></label>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] font-bold text-[#6D7891]"><span className={`flex items-center gap-1 ${password.length >= 8 ? "text-emerald-600" : ""}`}><Check size={13}/>8+ characters</span><span className={`flex items-center gap-1 ${/[A-Za-z]/.test(password) ? "text-emerald-600" : ""}`}><Check size={13}/>one letter</span><span className={`flex items-center gap-1 ${/\d/.test(password) ? "text-emerald-600" : ""}`}><Check size={13}/>one number</span></div>
                  {notice && <div role="status" className={`rounded-2xl border p-3.5 text-sm font-bold leading-5 ${noticeStyle[notice.tone]}`}>{notice.text}</div>}
                  <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF4D32] px-5 py-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(255,77,50,.25)] transition hover:-translate-y-px hover:bg-[#E93F27] disabled:opacity-60">{loading ? "Creating account..." : "Create free account"}{!loading && <ArrowRight size={18}/>}</button>
                </form>
                <p className="mt-6 text-center text-sm font-semibold text-[#5B6785]">Already have an account? <Link href="/login" className="font-black text-[#FF4D32] hover:underline">Sign in</Link></p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="relative hidden min-h-screen overflow-hidden bg-[#071A52] px-12 py-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(255,77,50,.30),transparent_24%),radial-gradient(circle_at_20%_82%,rgba(255,255,255,.10),transparent_30%)]"/>
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:28px_28px]"/>
        <div className="relative z-10 my-auto max-w-[620px] py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur"><Sparkles size={16} className="text-[#FF6B52]"/>Built for serious progress</div>
          <h2 className="mt-7 text-5xl font-black leading-[1.08] tracking-[-.045em] xl:text-6xl">Turn your target score into a clear plan.</h2>
          <p className="mt-5 text-lg font-medium leading-8 text-white/70">EnglishPeak brings realistic practice, skill insights and focused preparation into one calm workspace.</p>
          <div className="mt-9 space-y-3">{[["Choose your route","IELTS or CEFR, matched to your level"],["Practise every skill","Reading, Listening, Writing and Speaking"],["See real progress","Track results and focus on weak areas"]].map(([title,desc])=><div key={title} className="flex items-center gap-4 rounded-2xl border border-white/12 bg-white/[.08] p-4 backdrop-blur"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#FF4D32] text-white"><Target size={20}/></div><div><p className="font-black">{title}</p><p className="mt-1 text-sm font-medium text-white/60">{desc}</p></div></div>)}</div>
        </div>
        <p className="relative z-10 text-xs font-semibold text-white/40">Secure registration • Student role by default</p>
      </section>
    </main>
  );
}
