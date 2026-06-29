"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronDown,
  Download,
  Flame,
  Headphones,
  Lock,
  Mail,
  Pencil,
  Save,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
  User,
} from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import LogoutButton from "@/components/LogoutButton";
import { getCurrentUserProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type ProfileData = {
  id?: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  exam_type?: string | null;
  target_score?: string | null;
  current_level?: string | null;
  avatar_url?: string | null;
  exam_date?: string | null;
};

function splitName(fullName?: string | null) {
  const clean = fullName?.trim() || "";
  const parts = clean.split(" ").filter(Boolean);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}

function initialsFrom(name?: string | null, email?: string | null) {
  const cleanName = name?.trim();
  const cleanEmail = email?.trim();

  if (cleanName) {
    const parts = cleanName.split(" ").filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return cleanName.slice(0, 2).toUpperCase();
  }

  if (cleanEmail) {
    return cleanEmail.split("@")[0].slice(0, 2).toUpperCase();
  }

  return "ST";
}

function roleLabel(profile: ProfileData | null) {
  if (profile?.role === "admin") return "Admin";
  if (profile?.role === "teacher") return "Teacher";
  return `${profile?.exam_type || "IELTS"} Learner`;
}

function safeDate(value?: string | null) {
  if (!value) return "2026-06-14";
  return value.slice(0, 10);
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [examType, setExamType] = useState("IELTS");
  const [targetScore, setTargetScore] = useState("8.0");
  const [currentLevel, setCurrentLevel] = useState("B2");
  const [telegram, setTelegram] = useState("");
  const [examDate, setExamDate] = useState("2026-06-14");
  const [studyGoal, setStudyGoal] = useState(
    "Reach IELTS Band 8.0 with strong Reading and Listening performance."
  );

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);

      const { user, profile } = await getCurrentUserProfile();

      if (!mounted) return;

      const safeProfile: ProfileData = {
        id: user?.id,
        full_name:
          profile?.full_name ||
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          "",
        email: profile?.email || user?.email || "",
        role: profile?.role || "student",
        exam_type: profile?.exam_type || "IELTS",
        target_score: profile?.target_score || "8.0",
        current_level: profile?.current_level || "B2",
        avatar_url: profile?.avatar_url || "",
        exam_date: safeDate(profile?.exam_date),
      };

      const names = splitName(safeProfile.full_name);

      setProfile(safeProfile);
      setFirstName(names.firstName);
      setLastName(names.lastName);
      setExamType(safeProfile.exam_type || "IELTS");
      setTargetScore(safeProfile.target_score || "8.0");
      setCurrentLevel(safeProfile.current_level || "B2");
      setExamDate(safeProfile.exam_date || "2026-06-14");
      setLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const displayName = useMemo(() => {
    const full = `${firstName} ${lastName}`.trim();
    return full || profile?.full_name || profile?.email || "Student";
  }, [firstName, lastName, profile]);

  const initials = initialsFrom(displayName, profile?.email);
  const role = roleLabel({
    ...profile,
    exam_type: examType,
  });

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function handleSave() {
    if (!profile?.id) {
      showToast("Profile not found. Please sign in again.");
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    if (!fullName) {
      showToast("Please enter your full name.");
      return;
    }

    if (!examDate) {
      showToast("Please choose your exam date.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          exam_type: examType,
          target_score: targetScore,
          current_level: currentLevel,
          exam_date: examDate,
        })
        .eq("id", profile.id);

      if (error) {
        showToast(error.message);
        return;
      }

      setProfile((prev) => ({
        ...prev,
        full_name: fullName,
        exam_type: examType,
        target_score: targetScore,
        current_level: currentLevel,
        exam_date: examDate,
      }));

      showToast("Profile updated successfully.");
    } catch {
      showToast("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const miniStats = [
    ["Target band", targetScore],
    ["Exam type", examType],
    ["Level", currentLevel],
    ["Exam date", examDate],
  ];

  const skillCards = [
    {
      title: "Strong skill",
      desc: "Listening and Reading analytics update from your submitted results.",
      icon: Headphones,
      color: "#6C5CE7",
      bg: "#EDE9FF",
    },
    {
      title: "Weak area",
      desc: "Check Results page to identify your weakest IELTS skill accurately.",
      icon: Pencil,
      color: "#E17055",
      bg: "#FFE8E0",
    },
    {
      title: "Daily target",
      desc: "Complete 1 practice test and review 20 vocabulary cards today.",
      icon: Flame,
      color: "#FDCB6E",
      bg: "#FFF8E0",
    },
  ];

  const securityItems = [
    {
      title: "Change password",
      desc: "Password reset flow will be connected in the next update.",
      icon: Lock,
    },
    {
      title: "Notifications",
      desc: "Control daily reminders, test results and progress updates.",
      icon: Bell,
    },
    {
      title: "Privacy mode",
      desc: "Manage your profile visibility in rankings and class reports.",
      icon: ShieldCheck,
    },
  ];

  return (
    <ProtectedPage>
      <main className="min-h-screen bg-[#F0EEFF] text-[#0A0A0A]">
        <nav className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-[rgba(108,92,231,0.15)] bg-white px-8">
          <Link
            href="/"
            aria-label="Go to Testora home"
            className="flex items-center gap-3 rounded-2xl outline-none transition focus:ring-2 focus:ring-[#6C5CE7]/25"
          >
            <div className="flex h-[34px] w-[34px] flex-col items-center justify-center gap-[3px] rounded-xl bg-[#6C5CE7] shadow-[0_4px_12px_rgba(108,92,231,0.25)]">
              <div className="h-[2.5px] w-[17px] rounded bg-white" />
              <div className="h-[11px] w-1 rounded bg-white" />
            </div>

            <span className="text-lg font-black tracking-[2px] text-[#0A0A0A]">
              TEST<span className="text-[#6C5CE7]">ORA</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/practice", label: "Practice" },
              { href: "/studytools", label: "Study tools" },
              { href: "/profile", label: "Profile", active: true },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`Go to ${item.label}`}
                className={`rounded-xl px-5 py-2 text-sm outline-none transition-colors duration-150 focus:ring-2 focus:ring-[#6C5CE7]/25 ${
                  item.active
                    ? "rounded-2xl bg-[#6C5CE7] font-bold text-white shadow-[0_4px_12px_rgba(108,92,231,0.30)]"
                    : "font-semibold text-[#4A4A4A] hover:bg-[#F0EEFF] hover:text-[#0A0A0A]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Upgrade plan"
              onClick={() =>
                showToast("Upgrade Plan bo‘limi keyingi update’da qo‘shiladi.")
              }
              className="hidden items-center gap-2 rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(108,92,231,0.35)] outline-none transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(108,92,231,0.42)] focus:ring-2 focus:ring-[#6C5CE7]/25 md:flex"
            >
              <Trophy size={16} /> Upgrade Plan
            </button>

            <button
              type="button"
              aria-label="Open notifications"
              onClick={() => showToast("Hozircha yangi notification yo‘q.")}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[rgba(108,92,231,0.15)] bg-white text-[#4A4A4A] outline-none transition-colors duration-150 hover:bg-[#F0EEFF] hover:text-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/25"
            >
              <Bell size={18} />
            </button>

            <div className="flex items-center gap-2 rounded-2xl border border-[rgba(108,92,231,0.18)] bg-white py-1 pl-1 pr-3">
              <div className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#6C5CE7] text-xs font-black text-white">
                {initials}
              </div>

              <span className="hidden max-w-[150px] truncate text-sm font-bold text-[#0A0A0A] md:block">
                {displayName}
              </span>

              <ChevronDown size={14} className="text-[#8A8A8A]" />
            </div>
          </div>
        </nav>

        <div className="flex">
          <aside className="hidden min-h-[calc(100vh-60px)] w-[220px] shrink-0 flex-col gap-1 border-r border-[rgba(108,92,231,0.15)] bg-white p-3 lg:flex">
            <p className="mb-1 mt-3 px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A8A8A]">
              MAIN
            </p>

            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-[#4A4A4A] transition-all duration-150 hover:bg-[#F0EEFF] hover:text-[#6C5CE7]"
            >
              <BookOpen size={18} /> Dashboard
            </Link>

            <Link
              href="/practice"
              className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-[#4A4A4A] transition-all duration-150 hover:bg-[#F0EEFF] hover:text-[#6C5CE7]"
            >
              <Target size={18} /> Practice
            </Link>

            <Link
              href="/studytools"
              className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-[#4A4A4A] transition-all duration-150 hover:bg-[#F0EEFF] hover:text-[#6C5CE7]"
            >
              <Settings size={18} /> Study Tools
            </Link>

            <div className="my-2 h-px bg-[rgba(108,92,231,0.10)]" />

            <p className="mb-1 mt-3 px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A8A8A]">
              ACCOUNT
            </p>

            <Link
              href="/profile"
              className="relative flex items-center gap-3 rounded-xl border border-[rgba(108,92,231,0.25)] bg-gradient-to-br from-[#EDE9FF] to-[#E4E0FF] px-4 py-3 text-sm font-bold text-[#6C5CE7] shadow-[0_2px_8px_rgba(108,92,231,0.08)]"
            >
              <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#6C5CE7]" />
              <User size={18} /> Profile
            </Link>

            <LogoutButton variant="sidebar" />

            <div className="mt-auto rounded-2xl border border-[rgba(108,92,231,0.15)] bg-gradient-to-br from-[#EDE9FF] to-[#E4E0FF] p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#6C5CE7] text-xs font-black text-white">
                  {initials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#0A0A0A]">
                    {displayName}
                  </p>

                  <p className="truncate text-xs font-medium text-[#8A8A8A]">
                    {role}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex-1 bg-[#F0EEFF] p-6 md:p-8">
            <div className="mb-6 flex animate-fade-up flex-col justify-between gap-4 xl:flex-row xl:items-end">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6C5CE7]">
                  STUDENT PROFILE
                </p>

                <h1 className="text-2xl font-black tracking-[-0.02em] text-[#0A0A0A]">
                  Account profile
                </h1>

                <p className="mt-1 text-sm font-medium text-[#4A4A4A]">
                  Manage your real Supabase profile, exam target and learning
                  preferences.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    showToast("Export report keyingi update’da ulanadi.")
                  }
                  className="flex items-center gap-2 rounded-xl border border-[rgba(108,92,231,0.18)] bg-white px-4 py-2.5 text-sm font-bold text-[#4A4A4A] outline-none transition-all duration-200 hover:-translate-y-px hover:border-[#6C5CE7] hover:text-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/25"
                >
                  <Download size={17} /> Export report
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#8B7CF8] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(108,92,231,0.35)] outline-none transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(108,92,231,0.42)] focus:ring-2 focus:ring-[#6C5CE7]/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} /> {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
              <div
                className="animate-fade-up rounded-[24px] border border-[rgba(108,92,231,0.15)] bg-white p-6 text-center shadow-[0_8px_32px_rgba(108,92,231,0.08)]"
                style={{ animationDelay: "60ms" }}
              >
                <div className="relative mx-auto mt-2 grid h-[112px] w-[112px] place-items-center rounded-full border-[6px] border-white bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] text-4xl font-black text-white shadow-[0_12px_30px_rgba(108,92,231,0.25)]">
                  {initials}

                  <button
                    type="button"
                    aria-label="Upload avatar"
                    onClick={() =>
                      showToast("Avatar upload keyingi update’da ulanadi.")
                    }
                    className="absolute bottom-1 right-0 grid h-9 w-9 place-items-center rounded-full bg-[#6C5CE7] text-white shadow-[0_4px_12px_rgba(108,92,231,0.35)] transition hover:scale-105"
                  >
                    <Camera size={17} />
                  </button>
                </div>

                <h2 className="mt-4 text-xl font-black text-[#0A0A0A]">
                  {displayName}
                </h2>

                <p className="mt-1 text-sm font-medium text-[#4A4A4A]">
                  {profile?.email || "No email"}
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EDE9FF] px-4 py-1.5 text-xs font-bold text-[#6C5CE7]">
                  <ShieldCheck size={15} /> {role}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {miniStats.map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-[rgba(108,92,231,0.12)] bg-[#F0EEFF] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                    >
                      <p className="text-lg font-black text-[#0A0A0A]">
                        {value}
                      </p>

                      <p className="mt-1 text-xs font-medium text-[#8A8A8A]">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#1E1B3A] to-[#3D3580] p-5 text-left">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-white">
                      Learning Plan
                    </p>

                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                      Active
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-white/75">
                    Full IELTS & CEFR mock tests, writing samples, shadowing and
                    analytics.
                  </p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-[65%] rounded-full bg-white" />
                  </div>

                  <p className="mt-2 text-xs text-white/70">
                    65% of monthly study limit used
                  </p>
                </div>
              </div>

              <div>
                <div
                  className="animate-fade-up rounded-[24px] border border-[rgba(108,92,231,0.15)] bg-white p-6 shadow-[0_8px_32px_rgba(108,92,231,0.08)]"
                  style={{ animationDelay: "120ms" }}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-[#0A0A0A]">
                        Personal information
                      </h2>

                      <p className="mt-1 text-sm text-[#4A4A4A]">
                        These fields are loaded from Supabase profiles table.
                      </p>
                    </div>

                    <span className="rounded-full bg-[#E0F7F0] px-4 py-1.5 text-xs font-bold text-[#00A878]">
                      Verified
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">
                        First name
                      </span>

                      <div className="flex items-center gap-3 rounded-2xl border border-[rgba(108,92,231,0.18)] bg-white px-4 py-3 transition-all duration-150 focus-within:border-[#6C5CE7] focus-within:shadow-[0_0_0_3px_rgba(108,92,231,0.08)]">
                        <User size={17} color="#8A8A8A" />

                        <input
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          className="w-full bg-transparent text-sm font-bold text-[#0A0A0A] outline-none"
                          placeholder="First name"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">
                        Last name
                      </span>

                      <div className="flex items-center gap-3 rounded-2xl border border-[rgba(108,92,231,0.18)] bg-white px-4 py-3 transition-all duration-150 focus-within:border-[#6C5CE7] focus-within:shadow-[0_0_0_3px_rgba(108,92,231,0.08)]">
                        <User size={17} color="#8A8A8A" />

                        <input
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                          className="w-full bg-transparent text-sm font-bold text-[#0A0A0A] outline-none"
                          placeholder="Last name"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">
                        Email address
                      </span>

                      <div className="flex items-center gap-3 rounded-2xl border border-[rgba(108,92,231,0.12)] bg-[#F5F3FF] px-4 py-3">
                        <Mail size={17} color="#8A8A8A" />

                        <input
                          value={profile?.email || ""}
                          readOnly
                          className="w-full bg-transparent text-sm font-bold text-[#8A8A8A] outline-none"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">
                        Telegram username
                      </span>

                      <div className="flex items-center gap-3 rounded-2xl border border-[rgba(108,92,231,0.18)] bg-white px-4 py-3 transition-all duration-150 focus-within:border-[#6C5CE7] focus-within:shadow-[0_0_0_3px_rgba(108,92,231,0.08)]">
                        <Mail size={17} color="#8A8A8A" />

                        <input
                          value={telegram}
                          onChange={(event) => setTelegram(event.target.value)}
                          className="w-full bg-transparent text-sm font-bold text-[#0A0A0A] outline-none"
                          placeholder="@username"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">
                        Exam type
                      </span>

                      <select
                        value={examType}
                        onChange={(event) => setExamType(event.target.value)}
                        className="w-full rounded-2xl border border-[rgba(108,92,231,0.18)] bg-white px-4 py-3 text-sm font-bold text-[#0A0A0A] outline-none transition-all duration-150 focus:border-[#6C5CE7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.08)]"
                      >
                        <option>IELTS</option>
                        <option>CEFR</option>
                        <option>Multi-Level</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">
                        Target score
                      </span>

                      <select
                        value={targetScore}
                        onChange={(event) => setTargetScore(event.target.value)}
                        className="w-full rounded-2xl border border-[rgba(108,92,231,0.18)] bg-white px-4 py-3 text-sm font-bold text-[#0A0A0A] outline-none transition-all duration-150 focus:border-[#6C5CE7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.08)]"
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
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">
                        Current level
                      </span>

                      <select
                        value={currentLevel}
                        onChange={(event) => setCurrentLevel(event.target.value)}
                        className="w-full rounded-2xl border border-[rgba(108,92,231,0.18)] bg-white px-4 py-3 text-sm font-bold text-[#0A0A0A] outline-none transition-all duration-150 focus:border-[#6C5CE7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.08)]"
                      >
                        <option>A1</option>
                        <option>A2</option>
                        <option>B1</option>
                        <option>B2</option>
                        <option>C1</option>
                        <option>C2</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">
                        Exam date
                      </span>

                      <input
                        type="date"
                        value={examDate}
                        onChange={(event) => setExamDate(event.target.value)}
                        className="w-full rounded-2xl border border-[rgba(108,92,231,0.18)] bg-white px-4 py-3 text-sm font-bold text-[#0A0A0A] outline-none transition-all duration-150 focus:border-[#6C5CE7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.08)]"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">
                        Study goal
                      </span>

                      <div className="flex items-center gap-3 rounded-2xl border border-[rgba(108,92,231,0.18)] bg-white px-4 py-3 transition-all duration-150 focus-within:border-[#6C5CE7] focus-within:shadow-[0_0_0_3px_rgba(108,92,231,0.08)]">
                        <Pencil size={17} color="#8A8A8A" />

                        <input
                          value={studyGoal}
                          onChange={(event) => setStudyGoal(event.target.value)}
                          className="w-full bg-transparent text-sm font-bold text-[#0A0A0A] outline-none"
                        />
                      </div>

                      <p className="mt-2 text-xs text-[#4A4A4A]">
                        Saved fields: full name, exam type, target score,
                        current level and exam date.
                      </p>
                    </label>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {skillCards.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="animate-fade-up rounded-[20px] border border-[rgba(108,92,231,0.15)] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(108,92,231,0.35)] hover:shadow-[0_8px_24px_rgba(108,92,231,0.10)]"
                        style={{ animationDelay: `${index * 60}ms` }}
                      >
                        <div
                          className="mb-3 grid h-11 w-11 place-items-center rounded-xl"
                          style={{ background: item.bg }}
                        >
                          <Icon size={20} color={item.color} />
                        </div>

                        <p className="text-sm font-bold text-[#0A0A0A]">
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#4A4A4A]">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-[24px] border border-[rgba(108,92,231,0.15)] bg-white p-6">
                  <h2 className="text-xl font-black text-[#0A0A0A]">
                    Security & preferences
                  </h2>

                  <p className="mt-1 text-sm text-[#4A4A4A]">
                    Control login, notifications and privacy settings.
                  </p>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {securityItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() =>
                            showToast(`${item.title} keyingi update’da ulanadi.`)
                          }
                          className="flex gap-3 rounded-[20px] border border-[rgba(108,92,231,0.15)] bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(108,92,231,0.35)] hover:bg-[#F8F7FF]"
                        >
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EDE9FF] text-[#6C5CE7]">
                            <Icon size={19} />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-[#0A0A0A]">
                              {item.title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#4A4A4A]">
                              {item.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {toast && (
          <div className="animate-slide-in-right fixed bottom-7 right-7 z-[999] flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#1E1B3A] to-[#3D3580] px-5 py-4 text-sm font-bold text-white shadow-[0_16px_40px_rgba(108,92,231,0.25)]">
            <CheckCircle2 size={18} color="#A29BFE" />
            {toast}
          </div>
        )}
      </main>
    </ProtectedPage>
  );
}