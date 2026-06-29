"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  CreditCard,
  Download,
  Filter,
  GraduationCap,
  Home,
  Layers,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Users,
  FileText,
  FileQuestion,
  BarChart3,
  LockKeyhole,
} from "lucide-react";

const students = [
  {
    id: 1,
    name: "Rustam Usmonov",
    email: "rustam@testora.uz",
    phone: "+998 90 123 45 67",
    course: "IELTS Premium",
    exam: "IELTS",
    target: "8.0",
    current: "7.5",
    status: "Active",
    plan: "Pro",
    joined: "May 31, 2026",
  },
  {
    id: 2,
    name: "Madina Karimova",
    email: "madina@testora.uz",
    phone: "+998 91 222 33 44",
    course: "CEFR B2",
    exam: "CEFR",
    target: "B2",
    current: "B1+",
    status: "Active",
    plan: "Free",
    joined: "May 30, 2026",
  },
  {
    id: 3,
    name: "Sardor Aliyev",
    email: "sardor@testora.uz",
    phone: "+998 93 555 66 77",
    course: "IELTS Starter",
    exam: "IELTS",
    target: "7.0",
    current: "6.0",
    status: "Trial",
    plan: "Free",
    joined: "May 29, 2026",
  },
  {
    id: 4,
    name: "Nilufar Sobirova",
    email: "nilufar@testora.uz",
    phone: "+998 94 777 88 99",
    course: "IELTS Premium",
    exam: "IELTS",
    target: "8.5",
    current: "8.0",
    status: "Active",
    plan: "Pro",
    joined: "May 28, 2026",
  },
  {
    id: 5,
    name: "Azizbek Tursunov",
    email: "azizbek@testora.uz",
    phone: "+998 99 111 22 33",
    course: "IELTS Reading",
    exam: "IELTS",
    target: "7.5",
    current: "6.5",
    status: "Inactive",
    plan: "Free",
    joined: "May 26, 2026",
  },
];

function badgeClass(value: string) {
  if (value === "Active" || value === "Pro") return "bg-emerald-50 text-emerald-600";
  if (value === "Trial") return "bg-amber-50 text-amber-600";
  if (value === "Inactive") return "bg-rose-50 text-rose-600";
  return "bg-purple-50 text-purple-600";
}

export default function AdminStudentsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesQuery =
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.email.toLowerCase().includes(query.toLowerCase()) ||
        student.course.toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        student.status === filter ||
        student.plan === filter ||
        student.exam === filter;

      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  return (
    <main className="min-h-screen bg-[#F4F3FF] text-[#1A1729]">
      <nav className="sticky top-0 z-50 flex h-[62px] items-center justify-between border-b border-[#E2DEFF] bg-white px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-[34px] w-[34px] flex-col items-center justify-center gap-[3px] rounded-[9px] bg-[#5B4FCF]">
            <div className="h-[2.5px] w-[17px] rounded bg-white" />
            <div className="h-[11px] w-1 rounded bg-white" />
          </div>
          <span className="text-lg font-extrabold tracking-[2px] text-[#13102B]">
            TEST<span className="text-[#5B4FCF]">ORA</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          <Link href="/dashboard" className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]">
            Student Panel
          </Link>
          <Link href="/practice" className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]">
            Practice
          </Link>
          <Link href="/studytools" className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]">
            Study tools
          </Link>
          <Link href="/admin" className="rounded-[10px] bg-[#5B4FCF] px-4 py-2 text-sm font-semibold text-white">
            Admin
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden items-center gap-2 rounded-full bg-[#5B4FCF] px-5 py-2 text-sm font-bold text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8] md:flex">
            <Sparkles size={16} /> Upgrade Plan
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full border border-[#E2DEFF] bg-white text-[#6B6880] transition hover:-translate-y-0.5 hover:bg-[#EEF0FF] hover:text-[#5B4FCF]">
            <Bell size={18} />
          </button>
          <Link href="/profile" className="flex items-center gap-2 rounded-full border border-[#E2DEFF] bg-white py-1 pl-1 pr-3 transition hover:-translate-y-0.5 hover:border-[#5B4FCF]">
            <div className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#5B4FCF] text-xs font-bold text-white">AD</div>
            <span className="hidden text-sm font-bold text-[#13102B] md:block">Admin Rustam</span>
            <ChevronDown size={14} className="text-[#6B6880]" />
          </Link>
        </div>
      </nav>

      <div className="flex">
        <aside className="hidden min-h-[calc(100vh-62px)] w-[240px] shrink-0 flex-col gap-1 border-r border-[#E2DEFF] bg-white p-3 lg:flex">
          <p className="mt-2 px-3 py-1 text-[10px] font-bold tracking-wider text-[#6B6880]">ADMIN MAIN</p>

          {[
            { label: "Overview", icon: Home, href: "/admin" },
            { label: "Students", icon: Users, href: "/admin/students", active: true },
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
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF] ${
                  item.active
                    ? "border border-[#E2DEFF] bg-[#EEF0FF] font-bold text-[#5B4FCF]"
                    : "font-semibold text-[#6B6880]"
                }`}
              >
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}

          <div className="my-3 h-px bg-[#E2DEFF]" />
          <p className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#6B6880]">SYSTEM</p>

          <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]">
            <Settings size={18} /> Settings
          </Link>
          <button className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]">
            <LockKeyhole size={18} /> Roles & Access
          </button>

          <div className="mt-auto rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-[#13102B]">
              <ShieldCheck size={17} className="text-[#5B4FCF]" /> Admin Status
            </div>
            <p className="text-2xl font-extrabold text-[#5B4FCF]">Owner</p>
            <p className="mt-1 text-xs text-[#6B6880]">Full platform access</p>
          </div>
        </aside>

        <section className="flex-1 p-5 md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <p className="mb-2 text-xs font-extrabold tracking-[0.18em] text-[#5B4FCF]">STUDENT MANAGEMENT</p>
              <h1 className="text-3xl font-extrabold text-[#13102B]">Manage students</h1>
              <p className="mt-2 text-sm text-[#6B6880]">
                View student profiles, plans, progress, exam targets and account status.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:-translate-y-0.5 hover:border-[#5B4FCF] hover:text-[#5B4FCF]">
                <Download size={17} /> Export
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-[#5B4FCF] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8]">
                <Plus size={17} /> Add Student
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "All students", value: "1,248", sub: "Total accounts", icon: Users, bg: "#EEF0FF", color: "#5B4FCF" },
              { label: "Active students", value: "946", sub: "Currently learning", icon: Trophy, bg: "#E1F5EE", color: "#1D9E75" },
              { label: "Pro users", value: "328", sub: "Paid members", icon: CreditCard, bg: "#FAEEDA", color: "#F5A623" },
              { label: "Trial users", value: "174", sub: "Need follow-up", icon: User, bg: "#FFF0EE", color: "#E24B4A" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-[#E2DEFF] bg-white p-5 transition hover:-translate-y-1 hover:border-[#5B4FCF] hover:shadow-[0_10px_30px_rgba(91,79,207,.10)]">
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

          <div className="mt-5 rounded-2xl border border-[#E2DEFF] bg-white p-5">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">STUDENT LIST</p>
                <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">Registered learners</h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-2 rounded-xl border border-[#E2DEFF] bg-[#F7F6FF] px-3 py-2">
                  <Search size={16} className="text-[#6B6880]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-52 bg-transparent text-sm outline-none placeholder:text-[#6B6880]"
                    placeholder="Search name, email, course"
                  />
                </div>

                <button className="flex items-center justify-center gap-2 rounded-xl border border-[#E2DEFF] bg-white px-4 py-2 text-sm font-bold text-[#6B6880] transition hover:border-[#5B4FCF] hover:text-[#5B4FCF]">
                  <Filter size={16} /> Filter
                </button>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {["All", "Active", "Trial", "Inactive", "Pro", "IELTS", "CEFR"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-full border px-4 py-2 text-xs font-bold transition hover:-translate-y-0.5 ${
                    filter === item
                      ? "border-[#5B4FCF] bg-[#5B4FCF] text-white"
                      : "border-[#E2DEFF] bg-white text-[#6B6880] hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E2DEFF]">
              <div className="hidden grid-cols-[1.3fr_1fr_0.7fr_0.7fr_0.7fr_0.6fr] gap-4 bg-[#F7F6FF] px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-[#6B6880] xl:grid">
                <span>Student</span>
                <span>Course</span>
                <span>Exam</span>
                <span>Band</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              <div className="divide-y divide-[#E2DEFF]">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="grid gap-4 bg-white px-5 py-4 transition hover:bg-[#F7F6FF] xl:grid-cols-[1.3fr_1fr_0.7fr_0.7fr_0.7fr_0.6fr] xl:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#5B4FCF] text-sm font-bold text-white">
                        {student.name
                          .split(" ")
                          .map((item) => item[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-extrabold text-[#13102B]">{student.name}</p>
                        <p className="text-xs text-[#6B6880]">{student.email}</p>
                        <p className="mt-1 text-xs text-[#6B6880]">{student.phone}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-[#13102B]">{student.course}</p>
                      <p className="text-xs text-[#6B6880]">Joined: {student.joined}</p>
                    </div>

                    <span className="w-fit rounded-full bg-[#EEF0FF] px-3 py-1 text-xs font-extrabold text-[#5B4FCF]">
                      {student.exam}
                    </span>

                    <div>
                      <p className="text-lg font-extrabold text-[#5B4FCF]">{student.current}</p>
                      <p className="text-xs text-[#6B6880]">Target {student.target}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${badgeClass(student.status)}`}>
                        {student.status}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${badgeClass(student.plan)}`}>
                        {student.plan}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button className="grid h-9 w-9 place-items-center rounded-xl border border-[#E2DEFF] text-[#6B6880] transition hover:border-[#5B4FCF] hover:text-[#5B4FCF]">
                        <Mail size={16} />
                      </button>
                      <button className="grid h-9 w-9 place-items-center rounded-xl border border-[#E2DEFF] text-[#6B6880] transition hover:border-[#5B4FCF] hover:text-[#5B4FCF]">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {filteredStudents.length === 0 && (
              <div className="mt-5 rounded-2xl border border-dashed border-[#E2DEFF] p-8 text-center">
                <Users className="mx-auto mb-3 text-[#6B6880]" />
                <p className="font-bold text-[#13102B]">No students found</p>
                <p className="text-sm text-[#6B6880]">Try another search keyword or filter.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
