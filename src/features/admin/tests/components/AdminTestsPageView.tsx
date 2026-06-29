"use client";

import Link from "next/link";
import UserBadge from "@/components/UserBadge";
import {
  BarChart3,
  Bell,
  CreditCard,
  Download,
  FileQuestion,
  FileText,
  Home,
  LockKeyhole,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useAdminTests } from "../hooks/useAdminTests";
import AdminTestFormModal from "./AdminTestFormModal";
import AdminTestsList from "./AdminTestsList";
import AdminTestsNotice from "./AdminTestsNotice";
import AdminTestsQuickCreate from "./AdminTestsQuickCreate";
import AdminTestsStats from "./AdminTestsStats";

export default function AdminTestsPageView() {
  const {
    pageMounted,

    query,
    setQuery,
    filter,
    setFilter,

    filteredTests,
    stats,
    loading,
    errorMessage,

    notice,
    setNotice,
    showNotice,

    showForm,
    editingId,
    form,
    setForm,
    saving,

    openCreateForm,
    openEditForm,
    closeForm,
    handleSaveTest,
    handleDuplicateTest,
    handleToggleActive,
    handleMoveToDraft,
    handleExport,
    resetFilters,
  } = useAdminTests();

  if (!pageMounted) {
    return null;
  }

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
          <Link
            href="/dashboard"
            className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
          >
            Student Panel
          </Link>

          <Link
            href="/practice"
            className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
          >
            Practice
          </Link>

          <Link
            href="/studytools"
            className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
          >
            Study tools
          </Link>

          <Link
            href="/admin"
            className="rounded-[10px] bg-[#5B4FCF] px-4 py-2 text-sm font-semibold text-white"
          >
            Admin
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              showNotice("Upgrade Plan bo‘limi keyingi update’da qo‘shiladi.")
            }
            className="hidden items-center gap-2 rounded-full bg-[#5B4FCF] px-5 py-2 text-sm font-bold text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8] md:flex"
          >
            <Sparkles size={16} /> Upgrade Plan
          </button>

          <button
            type="button"
            onClick={() => showNotice("Hozircha yangi admin notification yo‘q.")}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#E2DEFF] bg-white text-[#6B6880] transition hover:-translate-y-0.5 hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
          >
            <Bell size={18} />
          </button>

          <UserBadge />
        </div>
      </nav>

      <AdminTestsNotice message={notice} onClose={() => setNotice("")} />

      <AdminTestFormModal
        open={showForm}
        editingId={editingId}
        form={form}
        saving={saving}
        onClose={closeForm}
        onSave={handleSaveTest}
        onChange={setForm}
      />

      <div className="flex">
        <aside className="hidden min-h-[calc(100vh-62px)] w-[240px] shrink-0 flex-col gap-1 border-r border-[#E2DEFF] bg-white p-3 lg:flex">
          <p className="mt-2 px-3 py-1 text-[10px] font-bold tracking-wider text-[#6B6880]">
            ADMIN MAIN
          </p>

          {[
            { label: "Overview", icon: Home, href: "/admin" },
            { label: "Students", icon: Users, href: "/admin/students" },
            {
              label: "Tests",
              icon: FileText,
              href: "/admin/tests",
              active: true,
            },
            {
              label: "Questions",
              icon: FileQuestion,
              href: "/admin/questions",
            },
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

          <p className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#6B6880]">
            SYSTEM
          </p>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
          >
            <Settings size={18} /> Settings
          </Link>

          <button
            type="button"
            onClick={() =>
              showNotice("Roles & Access keyingi update’da alohida ulanadi.")
            }
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
          >
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
              <p className="mb-2 text-xs font-extrabold tracking-[0.18em] text-[#5B4FCF]">
                TEST MANAGEMENT
              </p>

              <h1 className="text-3xl font-extrabold text-[#13102B]">
                Manage tests
              </h1>

              <p className="mt-2 text-sm text-[#6B6880]">
                Create, publish and organize real Supabase tests from one admin
                workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:-translate-y-0.5 hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
              >
                <Download size={17} /> Export
              </button>

              <button
                type="button"
                onClick={() => openCreateForm()}
                className="flex items-center gap-2 rounded-xl bg-[#5B4FCF] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8]"
              >
                <Plus size={17} /> New Test
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-[#E24B4A] bg-[#FFF0EE] p-5">
              <p className="font-extrabold text-[#E24B4A]">
                Could not load tests
              </p>

              <p className="mt-1 text-sm font-semibold text-[#6B6880]">
                {errorMessage}
              </p>
            </div>
          )}

          <AdminTestsStats loading={loading} stats={stats} />

          <div className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
            <AdminTestsQuickCreate onCreate={openCreateForm} />

            <AdminTestsList
              tests={filteredTests}
              loading={loading}
              query={query}
              filter={filter}
              onQueryChange={setQuery}
              onFilterChange={setFilter}
              onResetFilters={resetFilters}
              onEdit={openEditForm}
              onDuplicate={handleDuplicateTest}
              onMoveToDraft={handleMoveToDraft}
              onToggleActive={handleToggleActive}
            />
          </div>
        </section>
      </div>
    </main>
  );
}