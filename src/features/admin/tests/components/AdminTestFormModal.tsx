"use client";

import { FileCode2, UploadCloud, X } from "lucide-react";
import type { SkillKey, TestForm, TestMode } from "../types/adminTests.types";

type AdminTestFormModalProps = {
  open: boolean;
  editingId: string | null;
  form: TestForm;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (form: TestForm) => void;
};

const skillOptions: { value: SkillKey; label: string }[] = [
  { value: "listening", label: "Listening" },
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "speaking", label: "Speaking" },
  { value: "fullmock", label: "Full Mock" },
];

const levelOptions = ["A1", "A2", "B1", "B2", "B2+", "C1", "C2"];

export default function AdminTestFormModal({
  open,
  editingId,
  form,
  saving,
  onClose,
  onSave,
  onChange,
}: AdminTestFormModalProps) {
  if (!open) return null;

  function updateForm<K extends keyof TestForm>(key: K, value: TestForm[K]) {
    onChange({ ...form, [key]: value });
  }

  async function handleHtmlFile(file?: File) {
    if (!file) return;

    const fileName = file.name || "uploaded-test.html";
    const isHtml =
      file.type === "text/html" || fileName.toLowerCase().endsWith(".html");

    if (!isHtml) {
      window.alert("Faqat .html fayl yuklang.");
      return;
    }

    const html = await file.text();

    onChange({
      ...form,
      test_mode: "html",
      skill: form.skill || "reading",
      html_file_name: fileName,
      html_file_content: html,
      title: form.title || fileName.replace(/\.html?$/i, ""),
    });
  }

  function changeMode(mode: TestMode) {
    onChange({
      ...form,
      test_mode: mode,
      html_file_name: mode === "html" ? form.html_file_name : "",
      html_file_content: mode === "html" ? form.html_file_content : "",
    });
  }

  const htmlSizeKb = form.html_file_content
    ? Math.max(1, Math.round(new Blob([form.html_file_content]).size / 1024))
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-[#E2DEFF] bg-white shadow-[0_28px_90px_rgba(19,16,43,0.22)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ECE9FF] bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#5B4FCF]">
              {editingId ? "EDIT TEST" : "NEW TEST"}
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#13102B]">
              {editingId ? "Update test" : "Create a new test"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-[#E2DEFF] text-[#6B6880] transition hover:border-[#E24B4A] hover:text-[#E24B4A]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="rounded-3xl border border-[#E2DEFF] bg-[#F7F6FF] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6B6880]">
              Test source
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => changeMode("builder")}
                className={`rounded-2xl border p-4 text-left transition ${
                  form.test_mode === "builder"
                    ? "border-[#5B4FCF] bg-white shadow-[0_8px_24px_rgba(91,79,207,.14)]"
                    : "border-[#E2DEFF] bg-white/60 hover:border-[#5B4FCF]"
                }`}
              >
                <p className="text-sm font-black text-[#13102B]">Builder test</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#6B6880]">
                  Savollar Supabase questions jadvalidan olinadi.
                </p>
              </button>

              <button
                type="button"
                onClick={() => changeMode("html")}
                className={`rounded-2xl border p-4 text-left transition ${
                  form.test_mode === "html"
                    ? "border-[#5B4FCF] bg-white shadow-[0_8px_24px_rgba(91,79,207,.14)]"
                    : "border-[#E2DEFF] bg-white/60 hover:border-[#5B4FCF]"
                }`}
              >
                <p className="flex items-center gap-2 text-sm font-black text-[#13102B]">
                  <FileCode2 size={17} /> Uploaded HTML test
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#6B6880]">
                  Tayyor .html fayl sayt ichida iframe orqali ochiladi.
                </p>
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#6B6880]">
                Test title
              </span>
              <input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                placeholder="Example: Cleveland Museum of Art"
                className="w-full rounded-2xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#5B4FCF]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#6B6880]">
                Skill
              </span>
              <select
                value={form.skill}
                onChange={(event) =>
                  updateForm("skill", event.target.value as SkillKey)
                }
                className="w-full rounded-2xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#5B4FCF]"
              >
                {skillOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#6B6880]">
                Level
              </span>
              <select
                value={form.level}
                onChange={(event) => updateForm("level", event.target.value)}
                className="w-full rounded-2xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#5B4FCF]"
              >
                {levelOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#6B6880]">
                Duration minutes
              </span>
              <input
                type="number"
                min="0"
                value={form.duration_minutes}
                onChange={(event) =>
                  updateForm("duration_minutes", event.target.value)
                }
                className="w-full rounded-2xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#5B4FCF]"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#6B6880]">
                Status
              </span>
              <select
                value={form.is_active ? "published" : "draft"}
                onChange={(event) =>
                  updateForm("is_active", event.target.value === "published")
                }
                className="w-full rounded-2xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#5B4FCF]"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>

          {form.test_mode === "html" && (
            <div className="rounded-3xl border border-dashed border-[#B8B0FF] bg-[#F7F6FF] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-black text-[#13102B]">
                    <UploadCloud size={18} /> HTML file upload
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#6B6880]">
                    IELTS test tayyor .html ko‘rinishida bo‘lsa, shu yerdan yuklang.
                    Student bosganda test sayt ichida ochiladi.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-[#5B4FCF] px-5 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8]">
                  Choose HTML
                  <input
                    type="file"
                    accept=".html,text/html"
                    className="hidden"
                    onChange={(event) => handleHtmlFile(event.target.files?.[0])}
                  />
                </label>
              </div>

              {form.html_file_name && (
                <div className="mt-4 rounded-2xl border border-[#E2DEFF] bg-white p-4">
                  <p className="text-sm font-black text-[#13102B]">
                    {form.html_file_name}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#1D9E75]">
                    HTML loaded · {htmlSizeKb} KB
                  </p>
                </div>
              )}
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#6B6880]">
              {form.test_mode === "html"
                ? "Short note / description"
                : "Description / passage / prompt"}
            </span>
            <textarea
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              placeholder={
                form.test_mode === "html"
                  ? "Masalan: Passage 3, 17 questions, Cleveland Museum of Art"
                  : "Reading passage, writing prompt or test description..."
              }
              className="min-h-[130px] w-full resize-none rounded-2xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#5B4FCF]"
            />
          </label>
        </div>

        <div className="sticky bottom-0 flex flex-col justify-end gap-3 border-t border-[#ECE9FF] bg-white/95 px-6 py-5 backdrop-blur md:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#E2DEFF] bg-white px-5 py-3 text-sm font-bold text-[#6B6880] transition hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="rounded-xl bg-[#5B4FCF] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Update test" : "Create test"}
          </button>
        </div>
      </div>
    </div>
  );
}
