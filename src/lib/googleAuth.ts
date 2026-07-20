"use client";

import { supabase } from "@/lib/supabase";

type NoticeSetter = (message: string) => void;

export function getGoogleRedirectUrl() {
  if (typeof window === "undefined") return "/auth/callback";

  // Local development stays local. Vercel preview deployments must always
  // return to the permanent production domain, otherwise an old preview URL
  // can later produce DEPLOYMENT_NOT_FOUND after Google authentication.
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return `${window.location.origin}/auth/callback`;
  }

  const productionUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://englishpeak.vercel.app"
  ).replace(/\/$/, "");

  return `${productionUrl}/auth/callback`;
}

export async function signInWithGoogle(setNotice?: NoticeSetter) {
  try {
    setNotice?.("Google orqali kirish oynasi ochilmoqda...");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getGoogleRedirectUrl(),
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setNotice?.(error.message);
      return false;
    }

    if (!data?.url || typeof window === "undefined") {
      setNotice?.("Google kirish manzili yaratilmadi. Qayta urinib ko‘ring.");
      return false;
    }

    window.location.assign(data.url);
    return true;
  } catch {
    setNotice?.("Google orqali kirishda xatolik yuz berdi. Qayta urinib ko‘ring.");
    return false;
  }
}
