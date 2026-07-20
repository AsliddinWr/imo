"use client";

import {
  BarChart3,
  Eye,
  FileText,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import type { TestStats } from "../types/adminTests.types";

type AdminTestsStatsProps = {
  loading: boolean;
  stats: TestStats;
};

type StatCard = {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  bg: string;
  color: string;
};

export default function AdminTestsStats({
  loading,
  stats,
}: AdminTestsStatsProps) {
  const cards: StatCard[] = [
    {
      label: "Total tests",
      value: loading ? "..." : String(stats.total),
      sub: "All test types",
      icon: FileText,
      bg: "#FFF0EC",
      color: "#071A52",
    },
    {
      label: "Published",
      value: loading ? "..." : String(stats.published),
      sub: "Live for students",
      icon: Eye,
      bg: "#E1F5EE",
      color: "#1D9E75",
    },
    {
      label: "Drafts",
      value: loading ? "..." : String(stats.drafts),
      sub: "Inactive tests",
      icon: Pencil,
      bg: "#FAEEDA",
      color: "#F5A623",
    },
    {
      label: "Attempts",
      value: loading ? "..." : String(stats.attempts),
      sub: "All saved results",
      icon: BarChart3,
      bg: "#FFF0EE",
      color: "#E24B4A",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="rounded-2xl border border-[#DDE4F3] bg-white p-5 transition hover:-translate-y-1 hover:border-[#071A52] hover:shadow-[0_10px_30px_rgba(7,26,82,.10)]"
          >
            <div
              className="mb-4 grid h-11 w-11 place-items-center rounded-xl"
              style={{ background: item.bg }}
            >
              <Icon size={20} color={item.color} />
            </div>

            <p className="text-xs font-semibold text-[#6B6880]">
              {item.label}
            </p>

            <h3 className="mt-1 text-3xl font-extrabold text-[#13102B]">
              {item.value}
            </h3>

            <p className="mt-1 text-xs text-[#6B6880]">{item.sub}</p>
          </div>
        );
      })}
    </div>
  );
}