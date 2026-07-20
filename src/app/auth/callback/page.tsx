"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/auth";

type Role = "student" | "teacher" | "admin";

function safeSetSessionStorage(role: Role) {
  try {
    window.sessionStorage.setItem("testora_access_ok", "true");

    if (role === "admin" || role === "teacher") {
      window.sessionStorage.setItem("testora_admin_ok", "true");
    } else {
      window.sessionStorage.removeItem("testora_admin_ok");
    }
  } catch {
    // Storage blocked bo‘lsa ham redirect ishlaydi.
  }
}

async function waitForSession() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.id) return session;

    await new Promise((resolve) => setTimeout(resolve, 180));
  }

  return null;
}

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Google hisob tekshirilmoqda...");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function finishGoogleAuth() {
      try {
        const url = new URL(window.location.href);
        const providerError =
          url.searchParams.get("error_description") || url.searchParams.get("error");

        if (providerError) {
          throw new Error(providerError);
        }

        const code = url.searchParams.get("code");

        if (code) {
          setStatus("Google sessiya yaratilmoqda...");

          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }

          window.history.replaceState({}, document.title, "/auth/callback");
        }

        const session = await waitForSession();

        if (!session?.user?.id) {
          throw new Error("Session topilmadi. Iltimos, qayta login qiling.");
        }

        const user = session.user;

        setStatus("Profil tekshirilmoqda...");

        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        let profile = existingProfile;

        if (!profile) {
          profile = await ensureUserProfile(user, {
            full_name:
              String(user.user_metadata?.full_name || user.user_metadata?.name || "").trim() ||
              String(user.email || "").split("@")[0] ||
              "Student",
            role: "student",
            exam_type: "IELTS",
            target_score: "8.0",
            current_level: "B2",
          });
        }

        const role = (profile?.role === "admin" || profile?.role === "teacher"
          ? profile.role
          : "student") as Role;

        safeSetSessionStorage(role);

        setStatus("Kirish muvaffaqiyatli. Yo‘naltirilmoqda...");

        window.location.replace(role === "admin" || role === "teacher" ? "/admin" : "/dashboard");
      } catch (error) {
        if (!mounted) return;

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Google orqali kirishda xatolik yuz berdi."
        );
        setStatus("");
      }
    }

    finishGoogleAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-[#F5F7FC] px-5 text-[#071A52]">
      <div className="w-full max-w-[460px] rounded-[30px] border border-[#DDE4F3] bg-white p-8 text-center shadow-[0_24px_70px_rgba(7,26,82,.10)]">
        <img src="/brand/englishpeak-logo.png" alt="EnglishPeak" className="mx-auto mb-7 h-11 w-auto" />
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#FFF0EC] text-[#FF4D32]">
          {errorMessage ? <ShieldCheck size={28} /> : <Loader2 size={28} className="animate-spin" />}
        </div>

        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#FF4D32]">
          GOOGLE AUTH
        </p>

        <h1 className="text-2xl font-black tracking-[-0.02em]">
          {errorMessage ? "Kirish yakunlanmadi" : "EnglishPeak hisobingiz ochilmoqda"}
        </h1>

        {status && <p className="mt-3 text-sm font-semibold leading-6 text-[#4A4A4A]">{status}</p>}

        {errorMessage && (
          <>
            <div className="mt-5 rounded-2xl border border-[rgba(226,75,74,0.20)] bg-[#FFF0EE] p-4 text-sm font-bold text-[#E17055]">
              {errorMessage}
            </div>

            <Link
              href="/login"
              className="mt-5 flex w-full items-center justify-center rounded-2xl bg-[#FF4D32] px-5 py-3.5 text-sm font-black text-white shadow-[0_10px_26px_rgba(255,77,50,.25)] transition hover:-translate-y-px hover:bg-[#E93F27]"
            >
              Login sahifasiga qaytish
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
