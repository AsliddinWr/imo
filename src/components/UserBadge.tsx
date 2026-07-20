"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ChevronDown,
  ShieldCheck,
  User,
} from "lucide-react";
import { getCachedProfile, getCurrentUserProfile } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

type Profile = {
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  exam_type?: string | null;
};

type AuthUser = {
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
    name?: string | null;
  } | null;
};

type UserBadgeProps = {
  variant?: "pill" | "sidebar" | "simple";
  showMenu?: boolean;
};

function getName(profile: Profile | null, user: AuthUser | null) {
  return (
    profile?.full_name?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.user_metadata?.name?.trim() ||
    profile?.email?.trim() ||
    user?.email?.trim() ||
    "Student"
  );
}

function getEmail(profile: Profile | null, user: AuthUser | null) {
  return profile?.email?.trim() || user?.email?.trim() || "";
}

function getInitials(name: string, email: string) {
  const source = name && name !== "Student" ? name : email || "Student";
  const clean = source.trim();
  const parts = clean.split(" ").filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  if (clean.includes("@")) {
    const beforeAt = clean.split("@")[0] || clean;
    return beforeAt.slice(0, 2).toUpperCase();
  }

  return clean.slice(0, 2).toUpperCase();
}

function getRoleLabel(profile: Profile | null) {
  if (profile?.role === "admin") return "Admin";
  if (profile?.role === "teacher") return "Teacher";
  return profile?.exam_type ? `${profile.exam_type} Learner` : "Student";
}

function canOpenAdmin(profile: Profile | null) {
  return profile?.role === "admin" || profile?.role === "teacher";
}

export default function UserBadge({
  variant = "pill",
  showMenu = true,
}: UserBadgeProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [profile, setProfile] = useState<Profile | null>(() => getCachedProfile());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const { user, profile } = await getCurrentUserProfile();

      if (!mounted) return;

      setUser(user);
      setProfile(profile);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;

      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const email = getEmail(profile, user);
  const name = getName(profile, user);
  const role = getRoleLabel(profile);
  const initials = useMemo(() => getInitials(name, email), [name, email]);

  if (variant === "simple") {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#071A52] text-xs font-extrabold text-white">
          {initials}
        </div>
        <span className="truncate text-sm font-extrabold text-[#13102B]">
          {name}
        </span>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => showMenu && setOpen((value) => !value)}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-[#FFF0EC]"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#071A52] text-xs font-extrabold text-white">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-[#13102B]">
              {name}
            </p>
            <p className="truncate text-xs font-semibold text-[#6B6880]">
              {role}
            </p>
          </div>

          {showMenu && (
            <ChevronDown
              size={15}
              className={`text-[#6B6880] transition ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {open && showMenu && (
          <div className="mt-2 rounded-2xl border border-[#DDE4F3] bg-white p-2 shadow-[0_16px_40px_rgba(7,26,82,.12)]">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
            >
              <User size={17} /> My Profile
            </Link>

            <Link
              href="/results"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
            >
              <BarChart3 size={17} /> My Results
            </Link>

            {canOpenAdmin(profile) && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
              >
                <ShieldCheck size={17} /> Admin Panel
              </Link>
            )}

            <LogoutButton variant="sidebar" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => showMenu && setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-[#DDE4F3] bg-white py-1 pl-1 pr-3 transition hover:-translate-y-0.5 hover:border-[#071A52]"
      >
        <div className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-[#071A52] text-xs font-extrabold text-white">
          {initials}
        </div>

        <span className="hidden max-w-[150px] truncate text-sm font-extrabold text-[#13102B] md:block">
          {name}
        </span>

        {showMenu && (
          <ChevronDown
            size={14}
            className={`text-[#6B6880] transition ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && showMenu && (
        <div className="absolute right-0 top-12 z-[999] w-[240px] rounded-2xl border border-[#DDE4F3] bg-white p-2 shadow-[0_16px_40px_rgba(7,26,82,.18)]">
          <div className="mb-2 flex items-center gap-3 border-b border-[#DDE4F3] px-3 py-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#071A52] text-xs font-extrabold text-white">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-[#13102B]">
                {name}
              </p>
              <p className="truncate text-xs font-semibold text-[#6B6880]">
                {role}
              </p>
            </div>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
          >
            <User size={17} /> My Profile
          </Link>

          <Link
            href="/results"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
          >
            <BarChart3 size={17} /> My Results
          </Link>

          {canOpenAdmin(profile) && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
            >
              <ShieldCheck size={17} /> Admin Panel
            </Link>
          )}

          <LogoutButton />
        </div>
      )}
    </div>
  );
}
