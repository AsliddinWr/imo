"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Clock,
  Copy,
  Eye,
  FileQuestion,
  FileText,
  Filter,
  Headphones,
  Layers,
  Mic,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import type { TestItem } from "../types/adminTests.types";
import {
  accessClass,
  statusClass,
  typeStyle,
} from "../utils/adminTests.utils";

type AdminTestsListProps = {
  tests: TestItem[];
  loading: boolean;
  query: string;
  filter: string;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onResetFilters: () => void;
  onEdit: (test: TestItem) => void;
  onDuplicate: (test: TestItem) => void;
  onMoveToDraft: (test: TestItem) => void;
  onToggleActive: (test: TestItem) => void;
};

const filters = [
  "All",
  "Listening",
  "Reading",
  "Writing",
  "Speaking",
  "Full Mock",
  "Published",
  "Draft",
  "Free",
  "IELTS",
];

function getIconByName(iconName: string) {
  if (iconName === "Headphones") return Headphones;
  if (iconName === "BookOpen") return BookOpen;
  if (iconName === "Pencil") return Pencil;
  if (iconName === "Mic") return Mic;
  if (iconName === "Layers") return Layers;
  return FileQuestion;
}

export default function AdminTestsList({
  tests,
  loading,
  query,
  filter,
  onQueryChange,
  onFilterChange,
  onResetFilters,
  onEdit,
  onDuplicate,
  onMoveToDraft,
  onToggleActive,
}: AdminTestsListProps) {
  return (
    <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
            TEST LIBRARY
          </p>

          <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
            All tests
          </h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-2 rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-3 py-2">
            <Search size={16} className="text-[#6B6880]" />

            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="w-52 bg-transparent text-sm outline-none placeholder:text-[#6B6880]"
              placeholder="Search test title"
            />
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#DDE4F3] bg-white px-4 py-2 text-sm font-bold text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]"
          >
            <Filter size={16} /> Reset
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onFilterChange(item)}
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

      {loading ? (
        <div className="rounded-2xl border border-dashed border-[#DDE4F3] p-8 text-center">
          <Clock className="mx-auto mb-3 text-[#6B6880]" />
          <p className="font-bold text-[#13102B]">Loading tests...</p>
          <p className="text-sm text-[#6B6880]">
            Reading real tests from Supabase.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => {
            const style = typeStyle(test.type);
            const Icon = getIconByName(style.iconName);

            return (
              <div
                key={test.id}
                className="rounded-2xl border border-[#DDE4F3] bg-white p-4 transition hover:-translate-y-1 hover:border-[#071A52] hover:bg-[#F8FAFE]"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#FFF0EC] text-[#071A52]">
                      <Icon size={21} />
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-[#13102B]">
                          {test.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${style.badge}`}
                        >
                          {test.type}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${statusClass(test.status)}`}
                        >
                          {test.status}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${accessClass(test.access)}`}
                        >
                          {test.access}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#6B6880]">
                        <span>{test.exam}</span>
                        <span>·</span>
                        <span>{test.level}</span>
                        <span>·</span>
                        <span>{test.questions} questions</span>
                        <span>·</span>
                        <span>{test.duration}</span>
                        <span>·</span>
                        <span>{test.attempts} attempts</span>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs text-[#6B6880]">
                        <CalendarDays size={13} /> Created: {test.created}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 xl:justify-end">
                    <Link
                      href={`/practice/test/${test.id}`}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]"
                      title="Preview test"
                    >
                      <Eye size={16} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => onEdit(test)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]"
                      title="Edit test"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicate(test)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]"
                      title="Duplicate test"
                    >
                      <Copy size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onMoveToDraft(test)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#E24B4A] transition hover:border-[#E24B4A] hover:bg-rose-50"
                      title="Move to draft"
                    >
                      <Trash2 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleActive(test)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]"
                      title="Toggle status"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && tests.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-[#DDE4F3] p-8 text-center">
          <FileText className="mx-auto mb-3 text-[#6B6880]" />
          <p className="font-bold text-[#13102B]">No tests found</p>
          <p className="text-sm text-[#6B6880]">
            Create a new test or try another search keyword.
          </p>
        </div>
      )}
    </div>
  );
}