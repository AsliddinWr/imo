import { Suspense } from "react";
import PracticePageClient from "./PracticePageClient";

function PracticePageFallback() {
  return (
    <main className="min-h-screen bg-[#F7F6FF] px-6 py-10 text-[#13102B]">
      <div className="mx-auto max-w-7xl rounded-[28px] border border-[#E2DEFF] bg-white p-8 shadow-[0_18px_50px_rgba(91,79,207,.10)]">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-[#5B4FCF]">
          Practice
        </p>
        <h1 className="mt-3 text-3xl font-black">Loading tests...</h1>
        <p className="mt-2 text-sm font-semibold text-[#6B6880]">
          IELTS practice testlar tayyorlanmoqda.
        </p>
      </div>
    </main>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<PracticePageFallback />}>
      <PracticePageClient />
    </Suspense>
  );
}
