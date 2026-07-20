"use client";

import { Sparkles, X } from "lucide-react";

type AdminTestsNoticeProps = {
  message: string;
  onClose: () => void;
};

export default function AdminTestsNotice({
  message,
  onClose,
}: AdminTestsNoticeProps) {
  if (!message) return null;

  return (
    <div className="fixed right-5 top-20 z-[999] flex max-w-[360px] items-start gap-3 rounded-2xl border border-[#DDE4F3] bg-white p-4 shadow-[0_16px_40px_rgba(7,26,82,.18)]">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FFF0EC] text-[#071A52]">
        <Sparkles size={18} />
      </div>

      <div className="flex-1">
        <p className="text-sm font-extrabold text-[#13102B]">EnglishPeak</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#6B6880]">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="grid h-8 w-8 place-items-center rounded-full text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
      >
        <X size={16} />
      </button>
    </div>
  );
}