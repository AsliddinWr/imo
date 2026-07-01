"use client";

import { supabase } from "@/lib/supabase";

type NoticeSetter = (message: string) => void;

export function getGoogleRedirectUrl() {
  if (typeof window === "undefined") return "/auth/callback";

  return `${window.location.origin}/auth/callback`;
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

    if (data?.url && typeof window !== "undefined") {
      window.location.href = data.url;
    }

    return true;
  } catch {
    setNotice?.("Google orqali kirishda xatolik yuz berdi. Qayta urinib ko‘ring.");
    return false;
  }
}
