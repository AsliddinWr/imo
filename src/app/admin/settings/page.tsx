"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileQuestion,
  FileText,
  GraduationCap,
  Home,
  Layers,
  LockKeyhole,
  Mail,
  MessageSquare,
  Moon,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  User,
  Users,
} from "lucide-react";

type RoleKey = "admin" | "teacher" | "student";

const rolePermissions = {
  admin: [
    "Manage students",
    "Create tests",
    "Edit questions",
    "View all results",
    "Manage payments",
    "Change platform settings",
  ],
  teacher: [
    "View assigned students",
    "Create practice tasks",
    "Review writing",
    "Review speaking",
    "View assigned results",
  ],
  student: [
    "Take practice tests",
    "View own results",
    "Use study tools",
    "Edit own profile",
  ],
};

export default function AdminSettingsPage() {
  const [examIELTS, setExamIELTS] = useState(true);
  const [examCEFR, setExamCEFR] = useState(true);
  const [freeTests, setFreeTests] = useState(true);
  const [proAccess, setProAccess] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [activeRole, setActiveRole] = useState<RoleKey>("admin");

  return (
    <main className="min-h-screen bg-[#F5F7FC] text-[#1A1729]">
      <nav className="sticky top-0 z-50 flex h-[62px] items-center justify-between border-b border-[#DDE4F3] bg-white px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-[34px] w-[34px] flex-col items-center justify-center gap-[3px] rounded-[9px] bg-[#071A52]">
            <div className="h-[2.5px] w-[17px] rounded bg-white" />
            <div className="h-[11px] w-1 rounded bg-white" />
          </div>
          <span className="text-lg font-extrabold tracking-[2px] text-[#13102B]">
            ENGLISH<span className="text-[#071A52]">PEAK</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          <Link href="/dashboard" className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]">
            Student Panel
          </Link>
          <Link href="/practice" className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]">
            Practice
          </Link>
          <Link href="/studytools" className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]">
            Study tools
          </Link>
          <Link href="/admin" className="rounded-[10px] bg-[#071A52] px-4 py-2 text-sm font-semibold text-white">
            Admin
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden items-center gap-2 rounded-full bg-[#071A52] px-5 py-2 text-sm font-bold text-white shadow-[0_8px_24px_rgba(7,26,82,.22)] transition hover:-translate-y-0.5 hover:bg-[#0D2A6B] md:flex">
            <Sparkles size={16} /> Upgrade Plan
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full border border-[#DDE4F3] bg-white text-[#6B6880] transition hover:-translate-y-0.5 hover:bg-[#FFF0EC] hover:text-[#071A52]">
            <Bell size={18} />
          </button>
          <Link href="/profile" className="flex items-center gap-2 rounded-full border border-[#DDE4F3] bg-white py-1 pl-1 pr-3 transition hover:-translate-y-0.5 hover:border-[#071A52]">
            <div className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#071A52] text-xs font-bold text-white">AD</div>
            <span className="hidden text-sm font-bold text-[#13102B] md:block">Admin Rustam</span>
            <ChevronDown size={14} className="text-[#6B6880]" />
          </Link>
        </div>
      </nav>

      <div className="flex">
        <aside className="hidden min-h-[calc(100vh-62px)] w-[240px] shrink-0 flex-col gap-1 border-r border-[#DDE4F3] bg-white p-3 lg:flex">
          <p className="mt-2 px-3 py-1 text-[10px] font-bold tracking-wider text-[#6B6880]">ADMIN MAIN</p>

          {[
            { label: "Overview", icon: Home, href: "/admin" },
            { label: "Students", icon: Users, href: "/admin/students" },
            { label: "Teachers", icon: GraduationCap, href: "/admin/teachers" },
            { label: "Courses", icon: Layers, href: "/admin/courses" },
            { label: "Tests", icon: FileText, href: "/admin/tests" },
            { label: "Questions", icon: FileQuestion, href: "/admin/questions" },
            { label: "Results", icon: BarChart3, href: "/admin/results" },
            { label: "Payments", icon: CreditCard, href: "/admin/payments" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
              >
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}

          <div className="my-3 h-px bg-[#DDE4F3]" />

          <p className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#6B6880]">SYSTEM</p>
          <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl border border-[#DDE4F3] bg-[#FFF0EC] px-4 py-3 text-sm font-bold text-[#071A52]">
            <Settings size={18} /> Settings
          </Link>
          <button className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]">
            <LockKeyhole size={18} /> Roles & Access
          </button>

          <div className="mt-auto rounded-2xl border border-[#DDE4F3] bg-[#F8FAFE] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-[#13102B]">
              <ShieldCheck size={17} className="text-[#071A52]" /> Admin Status
            </div>
            <p className="text-2xl font-extrabold text-[#071A52]">Owner</p>
            <p className="mt-1 text-xs text-[#6B6880]">Full platform access</p>
          </div>
        </aside>

        <section className="flex-1 p-5 md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <p className="mb-2 text-xs font-extrabold tracking-[0.18em] text-[#071A52]">SYSTEM SETTINGS</p>
              <h1 className="text-3xl font-extrabold text-[#13102B]">Platform settings</h1>
              <p className="mt-2 text-sm text-[#6B6880]">
                Control exam access, notifications, security, roles and platform behaviour.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-[#DDE4F3] bg-white px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:-translate-y-0.5 hover:border-[#071A52] hover:text-[#071A52]">
                Reset changes
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(7,26,82,.22)] transition hover:-translate-y-0.5 hover:bg-[#0D2A6B]">
                <Save size={17} /> Save settings
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Platform status", value: "Online", sub: "Students can access", icon: CheckCircle2, bg: "#E1F5EE", color: "#1D9E75" },
              { label: "Exam types", value: "2", sub: "IELTS + CEFR", icon: BookOpen, bg: "#FFF0EC", color: "#071A52" },
              { label: "Active roles", value: "3", sub: "Admin / Teacher / Student", icon: Users, bg: "#FAEEDA", color: "#F5A623" },
              { label: "Security level", value: "High", sub: "Protected routes ready", icon: LockKeyhole, bg: "#FFF0EE", color: "#E24B4A" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-[#DDE4F3] bg-white p-5 transition hover:-translate-y-1 hover:border-[#071A52] hover:shadow-[0_10px_30px_rgba(7,26,82,.10)]">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl" style={{ background: item.bg }}>
                    <Icon size={20} color={item.color} />
                  </div>
                  <p className="text-xs font-semibold text-[#6B6880]">{item.label}</p>
                  <h3 className="mt-1 text-3xl font-extrabold text-[#13102B]">{item.value}</h3>
                  <p className="mt-1 text-xs text-[#6B6880]">{item.sub}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
                <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">EXAM SETTINGS</p>
                <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">Exam access</h2>

                <div className="mt-5 space-y-3">
                  <SettingSwitch
                    title="IELTS practice"
                    description="Enable IELTS Reading, Listening, Writing, Speaking and Full Mock tests."
                    checked={examIELTS}
                    onClick={() => setExamIELTS(!examIELTS)}
                  />
                  <SettingSwitch
                    title="CEFR practice"
                    description="Enable CEFR grammar, vocabulary and level-based tests."
                    checked={examCEFR}
                    onClick={() => setExamCEFR(!examCEFR)}
                  />
                  <SettingSwitch
                    title="Free tests"
                    description="Allow students to access selected free practice tests."
                    checked={freeTests}
                    onClick={() => setFreeTests(!freeTests)}
                  />
                  <SettingSwitch
                    title="Pro access"
                    description="Enable premium tests, full mocks and advanced feedback."
                    checked={proAccess}
                    onClick={() => setProAccess(!proAccess)}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
                <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">NOTIFICATIONS</p>
                <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">Message settings</h2>

                <div className="mt-5 space-y-3">
                  <SettingSwitch
                    title="Email notifications"
                    description="Send payment, result and account updates to email."
                    checked={emailNotifications}
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    icon="mail"
                  />
                  <SettingSwitch
                    title="Telegram notifications"
                    description="Send lesson, test and payment updates to Telegram later."
                    checked={telegramNotifications}
                    onClick={() => setTelegramNotifications(!telegramNotifications)}
                    icon="message"
                  />
                  <SettingSwitch
                    title="Maintenance mode"
                    description="Temporarily block student access while updating the platform."
                    checked={maintenanceMode}
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    danger
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
                <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">ADMIN PROFILE</p>
                <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">Owner information</h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#6B6880]">Full name</span>
                    <input
                      defaultValue="Admin Rustam"
                      className="w-full rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#6B6880]">Role</span>
                    <input
                      defaultValue="Owner"
                      className="w-full rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#6B6880]">Email</span>
                    <input
                      defaultValue="admin@englishpeak.uz"
                      className="w-full rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#6B6880]">Telegram</span>
                    <input
                      defaultValue="@rustam_usmon0v"
                      className="w-full rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
                <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">ROLE PERMISSIONS</p>
                <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">Access control</h2>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    { key: "admin", label: "Admin" },
                    { key: "teacher", label: "Teacher" },
                    { key: "student", label: "Student" },
                  ].map((role) => (
                    <button
                      key={role.key}
                      onClick={() => setActiveRole(role.key as RoleKey)}
                      className={`rounded-full border px-4 py-2 text-xs font-bold transition hover:-translate-y-0.5 ${
                        activeRole === role.key
                          ? "border-[#071A52] bg-[#071A52] text-white"
                          : "border-[#DDE4F3] bg-white text-[#6B6880] hover:border-[#071A52] hover:text-[#071A52]"
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {rolePermissions[activeRole].map((permission) => (
                    <div key={permission} className="flex items-center gap-3 rounded-2xl border border-[#DDE4F3] bg-[#F8FAFE] p-4 transition hover:-translate-y-0.5 hover:border-[#071A52] hover:bg-[#FFF0EC]">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#071A52]">
                        <CheckCircle2 size={18} />
                      </div>
                      <p className="font-bold text-[#13102B]">{permission}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#DDE4F3] bg-[#FFF0EC] p-5">
                <div className="mb-2 flex items-center gap-2 font-extrabold text-[#13102B]">
                  <ShieldCheck size={18} className="text-[#071A52]" /> Supabase ready
                </div>
                <p className="text-sm leading-7 text-[#6B6880]">
                  Later these settings will be saved in Supabase tables and connected to real Auth roles.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SettingSwitch({
  title,
  description,
  checked,
  onClick,
  icon,
  danger,
}: {
  title: string;
  description: string;
  checked: boolean;
  onClick: () => void;
  icon?: "mail" | "message";
  danger?: boolean;
}) {
  const Icon = icon === "mail" ? Mail : icon === "message" ? MessageSquare : checked ? ToggleRight : ToggleLeft;

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-[#DDE4F3] bg-[#F8FAFE] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#071A52] hover:bg-[#FFF0EC]"
    >
      <div
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white ${
          danger && checked ? "text-[#E24B4A]" : checked ? "text-[#071A52]" : "text-[#6B6880]"
        }`}
      >
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <p className="font-extrabold text-[#13102B]">{title}</p>
        <p className="mt-1 text-sm text-[#6B6880]">{description}</p>
      </div>
      <div
        className={`relative h-7 w-12 rounded-full transition ${
          checked ? (danger ? "bg-[#E24B4A]" : "bg-[#071A52]") : "bg-[#D9D6EF]"
        }`}
      >
        <div
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </div>
    </button>
  );
}
