from pathlib import Path
import re

ROOT = Path.cwd()


def safe_replace(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        print(f"skip replace: {label}")
        return text
    return text.replace(old, new, 1)


def patch_results():
    path = ROOT / "src/app/results/page.tsx"
    if not path.exists():
        print("skip src/app/results/page.tsx: not found")
        return

    text = path.read_text()

    # Add spent_time_seconds to result row type.
    if "type TestResultRow" in text:
        type_block = text.split("type TestResultRow", 1)[1].split("};", 1)[0]
        if "spent_time_seconds" not in type_block:
            text = text.replace(
                "  created_at: string;\n};",
                "  created_at: string;\n  spent_time_seconds?: number | null;\n};",
                1,
            )

    # Add spentSeconds to UI result item type.
    if "spentSeconds: number;" not in text:
        text = text.replace(
            "  numericTotal: number;\n  time: string;",
            "  numericTotal: number;\n  spentSeconds: number;\n  time: string;",
            1,
        )

    # Add helper functions only once.
    helper_marker = "function formatSpentSeconds(seconds: number | null | undefined)"
    if helper_marker not in text:
        helper = '''
function formatSpentSeconds(seconds: number | null | undefined) {
  const safeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
  if (!safeSeconds) return "0 min";

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours}h ${mins}m` : `${hours}h`;
  }

  if (minutes <= 0) return `${remainingSeconds}s`;
  return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes} min`;
}

function getPrimaryResultsByTest(results: ResultItem[]) {
  const map = new Map<string, ResultItem>();

  results.forEach((result) => {
    const previous = map.get(result.testId);
    if (!previous) {
      map.set(result.testId, result);
      return;
    }

    const currentBand = safeBand(result.band);
    const previousBand = safeBand(previous.band);
    const currentDate = new Date(result.rawDate).getTime();
    const previousDate = new Date(previous.rawDate).getTime();

    if (
      currentBand > previousBand ||
      (currentBand === previousBand && currentDate > previousDate)
    ) {
      map.set(result.testId, result);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
  );
}
'''
        if "function average(values: number[]) {" in text:
            text = text.replace(
                "function average(values: number[]) {",
                helper + "\nfunction average(values: number[]) {",
                1,
            )
        else:
            print("skip helper insert in results: average() not found")

    # Save real spent time in mapped result items.
    text = text.replace(
        'time: "Saved",',
        'spentSeconds: Math.max(0, Number(item.spent_time_seconds) || 0),\n    time: formatSpentSeconds(item.spent_time_seconds),',
    )

    # Select real spent time from Supabase.
    text = text.replace(
        '.select("id, test_id, skill, score, total, band, status, created_at")',
        '.select("id, test_id, skill, score, total, band, status, created_at, spent_time_seconds")',
    )

    # Replace estimated study time with actual saved time.
    text = re.sub(
        r"function formatStudyTime\(results: ResultItem\[\]\) \{[\s\S]*?\n\}\n\nfunction escapeCsv",
        '''function formatStudyTime(results: ResultItem[]) {
  const seconds = results.reduce((total, item) => total + item.spentSeconds, 0);
  return formatSpentSeconds(seconds);
}

function escapeCsv''',
        text,
        count=1,
    )

    # Use one primary/best result per test for band stats.
    if "const primaryResults = useMemo(" not in text:
        text = text.replace(
            "  const latestResult = allResults[0] || null;",
            "  const primaryResults = useMemo(\n    () => getPrimaryResultsByTest(filteredResults),\n    [filteredResults],\n  );\n\n  const primaryAllResults = useMemo(\n    () => getPrimaryResultsByTest(allResults),\n    [allResults],\n  );\n\n  const latestResult = allResults[0] || null;",
            1,
        )

    text = text.replace(
        "  const testsCompleted = filteredResults.length;",
        "  const testsCompleted = primaryResults.length;",
    )
    text = text.replace(
        "  const overallBand = latestResult?.band || \"0\";",
        "  const overallBand = primaryResults.length\n    ? average(primaryResults.map((item) => safeBand(item.band))).toFixed(1)\n    : \"0\";",
    )
    text = text.replace(
        "  const bestBand = filteredResults.length\n    ? filteredResults\n        .reduce((best, item) => Math.max(best, safeBand(item.band)), 0)\n        .toFixed(1)\n    : \"0\";",
        "  const bestBand = primaryResults.length\n    ? primaryResults\n        .reduce((best, item) => Math.max(best, safeBand(item.band)), 0)\n        .toFixed(1)\n    : \"0\";",
    )
    text = text.replace(
        "  const bestSkill =\n    filteredResults.find((item) => safeBand(item.band) === safeBand(bestBand))\n      ?.type || \"No data\";",
        "  const bestSkill =\n    primaryResults.find((item) => safeBand(item.band) === safeBand(bestBand))\n      ?.type || \"No data\";",
    )
    text = text.replace("buildSkillCards(filteredResults)", "buildSkillCards(primaryResults)")
    text = text.replace("buildBandTrend(filteredResults)", "buildBandTrend(primaryResults)")
    text = text.replace("sub: \"Estimated from tests\"", "sub: \"Actual completed time\"")

    path.write_text(text)
    print("patched src/app/results/page.tsx")


def patch_dashboard():
    path = ROOT / "src/app/dashboard/page.tsx"
    if not path.exists():
        print("skip src/app/dashboard/page.tsx: not found")
        return

    text = path.read_text()

    helper_marker = "function getPrimaryResultsByTest(results: ResultRow[])"
    if helper_marker not in text:
        helper = '''
function getPrimaryResultsByTest(results: ResultRow[]) {
  const map = new Map<string, ResultRow>();

  results.forEach((result) => {
    const previous = map.get(result.test_id);
    if (!previous) {
      map.set(result.test_id, result);
      return;
    }

    const currentBand = safeBand(result.band);
    const previousBand = safeBand(previous.band);
    const currentDate = new Date(result.created_at).getTime();
    const previousDate = new Date(previous.created_at).getTime();

    if (
      currentBand > previousBand ||
      (currentBand === previousBand && currentDate > previousDate)
    ) {
      map.set(result.test_id, result);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
'''
        if "function getSkillBands(results: ResultRow[]): SkillBands {" in text:
            text = text.replace(
                "function getSkillBands(results: ResultRow[]): SkillBands {",
                helper + "\nfunction getSkillBands(results: ResultRow[]): SkillBands {",
                1,
            )
        else:
            print("skip helper insert in dashboard: getSkillBands() not found")

    if "const scoreResults = useMemo(" not in text:
        text = text.replace(
            "  const skillBands = useMemo(() => getSkillBands(results), [results]);",
            "  const scoreResults = useMemo(() => getPrimaryResultsByTest(results), [results]);\n  const skillBands = useMemo(() => getSkillBands(scoreResults), [scoreResults]);",
            1,
        )

    text = text.replace(
        "  const history = useMemo(() => buildHistory(results), [results]);",
        "  const history = useMemo(() => buildHistory(scoreResults), [scoreResults]);",
    )
    text = text.replace("  const latest = results[0] || null;", "  const latest = scoreResults[0] || null;")
    text = text.replace(
        "  const bestBand = results.length\n    ? Math.max(...results.map((item) => safeBand(item.band)))\n    : 0;",
        "  const bestBand = scoreResults.length\n    ? Math.max(...scoreResults.map((item) => safeBand(item.band)))\n    : 0;",
    )
    text = text.replace(
        "  const firstBand = results.length\n    ? safeBand(results[results.length - 1]?.band)\n    : 0;",
        "  const firstBand = scoreResults.length\n    ? safeBand(scoreResults[scoreResults.length - 1]?.band)\n    : 0;",
    )
    text = text.replace('value: loading ? "..." : results.length,', 'value: loading ? "..." : scoreResults.length,')

    path.write_text(text)
    print("patched src/app/dashboard/page.tsx")


patch_results()
patch_dashboard()
