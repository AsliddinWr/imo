"use client";

import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { clearAuthCache } from "@/lib/auth";

type LogoutButtonProps = {
  variant?: "default" | "sidebar";
};

export default function LogoutButton({ variant = "default" }: LogoutButtonProps) {
  async function handleLogout() {
    clearAuthCache();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#E24B4A] transition hover:bg-rose-50"
      >
        <LogOut size={17} /> Logout
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#E24B4A] transition hover:bg-rose-50"
    >
      <LogOut size={17} /> Logout
    </button>
  );
}
