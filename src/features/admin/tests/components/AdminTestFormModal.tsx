"use client";

import { X } from "lucide-react";
import type { SkillKey, TestForm } from "../types/adminTests.types";

type AdminTestFormModalProps = {
  open: boolean;
  editingId: string | null;
  form: TestForm;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (form: TestForm) => void;
};

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
    onChange({
      ...form,
      [key]: value,
    });
  }

  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-black/35 px-5">
      <div className="w-full max-w-[720px] rounded-[26px] border border-[#E2DEFF] bg-white p-6 shadow-[0_24px_80px_rgba(19,16,43,.25)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold tracking-widest text-[#5B4FCF]">
              {editingId ? "EDIT TEST" : "NEW TEST"}
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-[#13102B]">
              {editingId ? "Update test" : "Create a new test"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close test form"
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#E2DEFF] text-[#6B6880] transition hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-bold text-[#6B6880]">
              Test title
            </span>

            <input
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              placeholder="Example: The History of Glass"
              className="w-full rounded-2xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#5B4FCF]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#6B6880]">
              Skill
            </span>

            <select
              value={form.skill}
              onChange={(event) =>
                updateForm("skill", event.target.value as SkillKey)
              }
              className="w-full rounded-2xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#5B4FCF]"
            >
              <option value="listening">Listening</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
              <option value="fullmock">Full Mock</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#6B6880]">
              Level
            </span>

            <select
              value={form.level}
              onChange={(event) => updateForm("level", event.target.value)}
              className="w-full rounded-2xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#5B4FCF]"
            >
              <option>A1</option>
              <option>A2</option>
              <option>B1</option>
              <option>B2</option>
              <option>B2+</option>
              <option>C1</option>
              <option>C2</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#6B6880]">
              Duration minutes
            </span>

            <input
              type="number"
              value={form.duration_minutes}
              onChange={(event) =>
                updateForm("duration_minutes", event.target.value)
              }
              className="w-full rounded-2xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#5B4FCF]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#6B6880]">
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

          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-bold text-[#6B6880]">
              Description / passage / prompt
            </span>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
              placeholder="Reading passage, writing prompt or test description..."
              className="min-h-[150px] w-full resize-none rounded-2xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#5B4FCF]"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
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