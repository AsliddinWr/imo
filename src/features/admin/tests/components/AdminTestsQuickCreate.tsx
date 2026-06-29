"use client";

import {
  BookOpen,
  Headphones,
  Mic,
  Pencil,
  Plus,
  type LucideIcon,
} from "lucide-react";
import type { SkillKey } from "../types/adminTests.types";

type QuickCreateItem = {
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  skill: SkillKey;
};

type AdminTestsQuickCreateProps = {
  onCreate: (skill: SkillKey) => void;
};

const quickCreateItems: QuickCreateItem[] = [
  {
    title: "Listening Test",
    desc: "Audio + listening questions",
    icon: Headphones,
    color: "#5B4FCF",
    skill: "listening",
  },
  {
    title: "Reading Test",
    desc: "Passage + question blocks",
    icon: BookOpen,
    color: "#378ADD",
    skill: "reading",
  },
  {
    title: "Writing Task",
    desc: "Task 1 / Task 2 prompt",
    icon: Pencil,
    color: "#E24B4A",
    skill: "writing",
  },
  {
    title: "Speaking Topic",
    desc: "Part 1 / 2 / 3 questions",
    icon: Mic,
    color: "#1D9E75",
    skill: "speaking",
  },
];

export default function AdminTestsQuickCreate({
  onCreate,
}: AdminTestsQuickCreateProps) {
  return (
    <div className="rounded-2xl border border-[#E2DEFF] bg-white p-5">
      <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
        CREATE FLOW
      </p>

      <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
        Quick test creator
      </h2>

      <p className="mt-1 text-sm text-[#6B6880]">
        Choose a test type and start building content.
      </p>

      <div className="mt-5 space-y-3">
        {quickCreateItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onCreate(item.skill)}
              className="flex w-full items-center gap-4 rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#5B4FCF] hover:bg-[#EEF0FF]"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white">
                <Icon size={20} color={item.color} />
              </div>

              <div className="flex-1">
                <p className="font-bold text-[#13102B]">{item.title}</p>
                <p className="text-sm text-[#6B6880]">{item.desc}</p>
              </div>

              <Plus size={18} className="text-[#6B6880]" />
            </button>
          );
        })}
      </div>
    </div>
  );
}