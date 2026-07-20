"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Download,
  FileQuestion,
  FileText,
  Filter,
  GraduationCap,
  Home,
  Layers,
  LockKeyhole,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

const payments = [
  {
    id: "PAY-1001",
    student: "Rustam Usmonov",
    email: "rustam@englishpeak.uz",
    plan: "IELTS Premium",
    amount: "$29",
    method: "Click",
    status: "Paid",
    start: "May 31, 2026",
    end: "Jun 30, 2026",
  },
  {
    id: "PAY-1002",
    student: "Madina Karimova",
    email: "madina@englishpeak.uz",
    plan: "CEFR Pro",
    amount: "$19",
    method: "Payme",
    status: "Paid",
    start: "May 30, 2026",
    end: "Jun 30, 2026",
  },
  {
    id: "PAY-1003",
    student: "Sardor Aliyev",
    email: "sardor@englishpeak.uz",
    plan: "IELTS Starter",
    amount: "$9",
    method: "Card",
    status: "Pending",
    start: "May 29, 2026",
    end: "Jun 29, 2026",
  },
  {
    id: "PAY-1004",
    student: "Nilufar Sobirova",
    email: "nilufar@englishpeak.uz",
    plan: "IELTS Premium",
    amount: "$29",
    method: "Click",
    status: "Paid",
    start: "May 28, 2026",
    end: "Jun 28, 2026",
  },
  {
    id: "PAY-1005",
    student: "Azizbek Tursunov",
    email: "azizbek@englishpeak.uz",
    plan: "Free Trial",
    amount: "$0",
    method: "None",
    status: "Expired",
    start: "May 15, 2026",
    end: "May 29, 2026",
  },
  {
    id: "PAY-1006",
    student: "Shahnoza Ergasheva",
    email: "shahnoza@englishpeak.uz",
    plan: "IELTS Premium",
    amount: "$29",
    method: "Payme",
    status: "Refunded",
    start: "May 12, 2026",
    end: "Jun 12, 2026",
  },
];

function statusBadge(status: string) {
  if (status === "Paid") return "bg-emerald-50 text-emerald-600";
  if (status === "Pending") return "bg-amber-50 text-amber-600";
  if (status === "Expired") return "bg-rose-50 text-rose-600";
  if (status === "Refunded") return "bg-slate-100 text-slate-600";
  return "bg-purple-50 text-purple-600";
}

function planBadge(plan: string) {
  if (plan.includes("Premium")) return "bg-purple-50 text-purple-600";
  if (plan.includes("Pro")) return "bg-blue-50 text-blue-600";
  if (plan.includes("Starter")) return "bg-amber-50 text-amber-600";
  return "bg-slate-100 text-slate-600";
}

function statusIcon(status: string) {
  if (status === "Paid") return CheckCircle2;
  if (status === "Pending") return CalendarDays;
  return XCircle;
}

export default function AdminPaymentsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const matchesQuery =
        item.student.toLowerCase().includes(query.toLowerCase()) ||
        item.email.toLowerCase().includes(query.toLowerCase()) ||
        item.plan.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        item.status === filter ||
        item.method === filter ||
        item.plan.includes(filter);

      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

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
            { label: "Payments", icon: CreditCard, href: "/admin/payments", active: true },
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
              <p className="mb-2 text-xs font-extrabold tracking-[0.18em] text-[#071A52]">PAYMENT CENTER</p>
              <h1 className="text-3xl font-extrabold text-[#13102B]">Manage payments & subscriptions</h1>
              <p className="mt-2 text-sm text-[#6B6880]">
                Track revenue, paid users, pending payments, expired plans and subscription access.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-[#DDE4F3] bg-white px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:-translate-y-0.5 hover:border-[#071A52] hover:text-[#071A52]">
                <CalendarDays size={17} /> This month
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(7,26,82,.22)] transition hover:-translate-y-0.5 hover:bg-[#0D2A6B]">
                <Plus size={17} /> Add payment
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total revenue", value: "$8.9k", sub: "+18% this month", icon: Wallet, bg: "#FFF0EC", color: "#071A52" },
              { label: "Paid users", value: "328", sub: "Active subscribers", icon: CheckCircle2, bg: "#E1F5EE", color: "#1D9E75" },
              { label: "Pending", value: "42", sub: "Need follow-up", icon: CalendarDays, bg: "#FAEEDA", color: "#F5A623" },
              { label: "Expired", value: "76", sub: "Plans ended", icon: XCircle, bg: "#FFF0EE", color: "#E24B4A" },
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

          <div className="mt-5 grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
              <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">REVENUE BREAKDOWN</p>
              <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">Subscription plans</h2>

              <div className="mt-5 space-y-4">
                {[
                  { plan: "IELTS Premium", revenue: "$5,420", users: "187 users", progress: 88, color: "#071A52", bg: "#FFF0EC" },
                  { plan: "CEFR Pro", revenue: "$2,160", users: "96 users", progress: 64, color: "#378ADD", bg: "#EBF5FF" },
                  { plan: "IELTS Starter", revenue: "$920", users: "72 users", progress: 42, color: "#F5A623", bg: "#FAEEDA" },
                  { plan: "Trial / Free", revenue: "$0", users: "310 users", progress: 35, color: "#6B6880", bg: "#F8FAFE" },
                ].map((item) => (
                  <div key={item.plan} className="rounded-2xl border border-[#DDE4F3] p-4 transition hover:-translate-y-1 hover:border-[#071A52]">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="font-extrabold text-[#13102B]">{item.plan}</p>
                        <p className="text-xs text-[#6B6880]">{item.users}</p>
                      </div>
                      <p className="text-xl font-extrabold" style={{ color: item.color }}>{item.revenue}</p>
                    </div>
                    <div className="h-2 rounded-full bg-[#DDE4F3]">
                      <div className="h-2 rounded-full" style={{ width: `${item.progress}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-[#FFF0EC] p-5">
                <div className="mb-2 flex items-center gap-2 font-extrabold text-[#13102B]">
                  <TrendingUp size={18} className="text-[#071A52]" /> Revenue insight
                </div>
                <p className="text-sm leading-7 text-[#6B6880]">
                  Premium users are the main revenue source. Later this card will use real Supabase payment data.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">PAYMENT LIST</p>
                  <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">Recent transactions</h2>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex items-center gap-2 rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-3 py-2">
                    <Search size={16} className="text-[#6B6880]" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="w-56 bg-transparent text-sm outline-none placeholder:text-[#6B6880]"
                      placeholder="Search student, plan, ID"
                    />
                  </div>

                  <button className="flex items-center justify-center gap-2 rounded-xl border border-[#DDE4F3] bg-white px-4 py-2 text-sm font-bold text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]">
                    <Filter size={16} /> Filter
                  </button>
                </div>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {["All", "Paid", "Pending", "Expired", "Refunded", "Click", "Payme", "Card", "Premium", "Pro", "Starter"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold transition hover:-translate-y-0.5 ${
                      filter === item
                        ? "border-[#071A52] bg-[#071A52] text-white"
                        : "border-[#DDE4F3] bg-white text-[#6B6880] hover:border-[#071A52] hover:text-[#071A52]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredPayments.map((item) => {
                  const StatusIcon = statusIcon(item.status);

                  return (
                    <div key={item.id} className="rounded-2xl border border-[#DDE4F3] bg-white p-4 transition hover:-translate-y-1 hover:border-[#071A52] hover:bg-[#F8FAFE]">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                        <div className="flex flex-1 gap-4">
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#FFF0EC] text-[#071A52]">
                            <StatusIcon size={21} />
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <h3 className="font-extrabold text-[#13102B]">{item.student}</h3>
                              <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${statusBadge(item.status)}`}>{item.status}</span>
                              <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${planBadge(item.plan)}`}>{item.plan}</span>
                            </div>
                            <p className="text-xs font-semibold text-[#6B6880]">{item.email}</p>
                            <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-[#6B6880]">
                              <span>{item.id}</span>
                              <span>·</span>
                              <span>{item.method}</span>
                              <span>·</span>
                              <span>{item.start} → {item.end}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 xl:flex-col xl:items-end">
                          <div className="rounded-2xl bg-[#FFF0EC] px-5 py-3 text-center">
                            <p className="text-[10px] font-extrabold tracking-wider text-[#6B6880]">AMOUNT</p>
                            <p className="text-2xl font-extrabold text-[#071A52]">{item.amount}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]">
                              <Mail size={16} />
                            </button>
                            <button className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredPayments.length === 0 && (
                <div className="mt-5 rounded-2xl border border-dashed border-[#DDE4F3] p-8 text-center">
                  <CreditCard className="mx-auto mb-3 text-[#6B6880]" />
                  <p className="font-bold text-[#13102B]">No payments found</p>
                  <p className="text-sm text-[#6B6880]">Try another search keyword or filter.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
