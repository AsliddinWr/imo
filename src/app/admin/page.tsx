"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  CreditCard,
  FileQuestion,
  FileText,
  GraduationCap,
  Home,
  Layers,
  LockKeyhole,
  Megaphone,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  SquarePen,
  Trophy,
  User,
  Users,
} from "lucide-react";

const stats = [
  {
    label: "Total students",
    value: "1,248",
    sub: "+82 this month",
    icon: Users,
    bg: "#FFF0EC",
    color: "#071A52",
  },
  {
    label: "Active tests",
    value: "186",
    sub: "IELTS & CEFR",
    icon: FileText,
    bg: "#E1F5EE",
    color: "#1D9E75",
  },
  {
    label: "Completed mocks",
    value: "3,420",
    sub: "+14% growth",
    icon: Trophy,
    bg: "#FAEEDA",
    color: "#F5A623",
  },
  {
    label: "Revenue",
    value: "$2.8k",
    sub: "This month",
    icon: CreditCard,
    bg: "#FFF0EE",
    color: "#E24B4A",
  },
];

const students = [
  {
    name: "Rustam Usmonov",
    email: "rustam@englishpeak.uz",
    course: "IELTS Premium",
    band: "7.5",
    status: "Active",
  },
  {
    name: "Madina Karimova",
    email: "madina@englishpeak.uz",
    course: "CEFR B2",
    band: "B2",
    status: "Active",
  },
  {
    name: "Sardor Aliyev",
    email: "sardor@englishpeak.uz",
    course: "IELTS Starter",
    band: "6.0",
    status: "Trial",
  },
  {
    name: "Nilufar Sobirova",
    email: "nilufar@englishpeak.uz",
    course: "IELTS Premium",
    band: "8.0",
    status: "Active",
  },
];

const tests = [
  {
    title: "Listening Section 3 — Dissertation",
    type: "Listening",
    questions: "10 questions",
    access: "Free",
  },
  {
    title: "Reading Passage — Climate Change",
    type: "Reading",
    questions: "13 questions",
    access: "Pro",
  },
  {
    title: "Writing Task 2 — Education",
    type: "Writing",
    questions: "1 essay",
    access: "Free",
  },
  {
    title: "Full Mock Test — Academic 01",
    type: "Full Mock",
    questions: "All sections",
    access: "Pro",
  },
];

const activities = [
  "New student registered: Madina Karimova",
  "IELTS Academic Full Mock — Test 1 published",
  "Rustam Usmonov completed Listening Section 3",
  "Payment received for IELTS Premium plan",
  "Teacher account created: Teacher Rustam",
];

function statusClass(status: string) {
  if (status === "Active") return "bg-emerald-50 text-emerald-600";
  if (status === "Trial") return "bg-amber-50 text-amber-600";
  return "bg-slate-50 text-slate-600";
}

function typeClass(type: string) {
  if (type === "Listening") return "bg-indigo-50 text-indigo-600";
  if (type === "Reading") return "bg-blue-50 text-blue-600";
  if (type === "Writing") return "bg-rose-50 text-rose-600";
  return "bg-purple-50 text-purple-600";
}

export default function AdminPage() {
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
            { label: "Overview", icon: Home, href: "/admin", active: true },
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
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition hover:bg-[#FFF0EC] hover:text-[#071A52] ${
                  item.active
                    ? "border border-[#DDE4F3] bg-[#FFF0EC] font-bold text-[#071A52]"
                    : "font-semibold text-[#6B6880]"
                }`}
              >
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}

          <div className="my-3 h-px bg-[#DDE4F3]" />

          <p className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#6B6880]">SYSTEM</p>
          <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]">
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
              <p className="mb-2 text-xs font-extrabold tracking-[0.18em] text-[#071A52]">ADMIN CONTROL CENTER</p>
              <h1 className="text-3xl font-extrabold text-[#13102B]">Manage EnglishPeak professionally</h1>
              <p className="mt-2 text-sm text-[#6B6880]">
                Students, tests, questions, results and payments — all in one clean admin dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-[#DDE4F3] bg-white px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:-translate-y-0.5 hover:border-[#071A52] hover:text-[#071A52]">
                <Megaphone size={17} /> Announcement
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(7,26,82,.22)] transition hover:-translate-y-0.5 hover:bg-[#0D2A6B]">
                <Plus size={17} /> Create Test
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
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

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(7,26,82,.08)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">PLATFORM GROWTH</p>
                  <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">Monthly activity</h2>
                </div>
                <Activity size={21} className="text-[#071A52]" />
              </div>

              <div className="flex h-[260px] items-end gap-4 rounded-2xl bg-[#FFF0EC] p-5">
                {[
                  { month: "Jan", value: 44 },
                  { month: "Feb", value: 56 },
                  { month: "Mar", value: 72 },
                  { month: "Apr", value: 84 },
                  { month: "May", value: 93 },
                  { month: "Jun", value: 100 },
                ].map((item) => (
                  <div key={item.month} className="flex flex-1 flex-col items-center justify-end gap-2">
                    <div className="text-xs font-extrabold text-[#071A52]">{item.value}%</div>
                    <div
                      className="w-full rounded-t-xl bg-[#071A52] shadow-[0_8px_18px_rgba(7,26,82,.18)] transition hover:bg-[#0D2A6B]"
                      style={{ height: `${item.value * 1.8}px` }}
                    />
                    <div className="text-xs font-bold text-[#6B6880]">{item.month}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
              <div className="mb-5">
                <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">QUICK ACTIONS</p>
                <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">Admin shortcuts</h2>
              </div>

              <div className="space-y-3">
                {[
                  { title: "Add new student", desc: "Create student account manually", icon: User, href: "/admin/students" },
                  { title: "Create IELTS test", desc: "Reading, Listening, Writing or Speaking", icon: FileText, href: "/admin/tests" },
                  { title: "Add questions", desc: "MCQ, gap-fill, TFNG, headings", icon: FileQuestion, href: "/admin/questions" },
                  { title: "View reports", desc: "Student bands and progress", icon: BarChart3, href: "/admin/results" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="flex items-center gap-4 rounded-2xl border border-[#DDE4F3] bg-[#F8FAFE] p-4 transition hover:-translate-y-0.5 hover:border-[#071A52] hover:bg-[#FFF0EC]"
                    >
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#071A52]">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#13102B]">{item.title}</p>
                        <p className="text-sm text-[#6B6880]">{item.desc}</p>
                      </div>
                      <ArrowRight size={18} className="text-[#6B6880]" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">RECENT STUDENTS</p>
                  <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">Student management</h2>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-3 py-2">
                  <Search size={16} className="text-[#6B6880]" />
                  <input className="w-36 bg-transparent text-sm outline-none placeholder:text-[#6B6880]" placeholder="Search student" />
                </div>
              </div>

              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.email} className="flex flex-col gap-3 rounded-2xl border border-[#DDE4F3] bg-white p-4 transition hover:-translate-y-1 hover:border-[#071A52] hover:bg-[#F8FAFE] md:flex-row md:items-center">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#071A52] text-sm font-bold text-white">
                      {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-[#13102B]">{student.name}</h3>
                      <p className="text-xs text-[#6B6880]">{student.email} · {student.course}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-[#FFF0EC] px-3 py-1 text-xs font-extrabold text-[#071A52]">{student.band}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${statusClass(student.status)}`}>{student.status}</span>
                      <button className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
              <div className="mb-5">
                <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">TEST LIBRARY</p>
                <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">Latest tests</h2>
              </div>

              <div className="space-y-3">
                {tests.map((test) => (
                  <div key={test.title} className="rounded-2xl border border-[#DDE4F3] bg-white p-4 transition hover:-translate-y-1 hover:border-[#071A52] hover:bg-[#F8FAFE]">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-[#13102B]">{test.title}</h3>
                        <p className="mt-1 text-xs text-[#6B6880]">{test.questions}</p>
                      </div>
                      <button className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]">
                        <SquarePen size={17} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${typeClass(test.type)}`}>{test.type}</span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${test.access === "Free" ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600"}`}>
                        {test.access}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#DDE4F3] bg-white p-5">
            <div className="mb-5">
              <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">LIVE ACTIVITY</p>
              <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">Recent platform actions</h2>
            </div>

            <div className="grid gap-3 lg:grid-cols-5">
              {activities.map((item, index) => (
                <div key={item} className="rounded-2xl border border-[#DDE4F3] bg-[#F8FAFE] p-4 transition hover:-translate-y-1 hover:border-[#071A52] hover:bg-[#FFF0EC]">
                  <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-white text-[#071A52]">
                    <Activity size={17} />
                  </div>
                  <p className="text-sm font-bold text-[#13102B]">{item}</p>
                  <p className="mt-2 text-xs text-[#6B6880]">{index + 1} min ago</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
