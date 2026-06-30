export const HTML_TEST_PREFIX = "__TESTORA_HTML_TEST_V1__";

export type HtmlTestPayload = {
  mode: "html";
  fileName: string;
  html: string;
  note?: string;
  uploadedAt?: string;
};

export function isHtmlTestDescription(description?: string | null) {
  return String(description || "").startsWith(HTML_TEST_PREFIX);
}

export function parseHtmlTestDescription(
  description?: string | null
): HtmlTestPayload | null {
  const text = String(description || "");
  if (!text.startsWith(HTML_TEST_PREFIX)) return null;

  try {
    const raw = text.slice(HTML_TEST_PREFIX.length);
    const parsed = JSON.parse(raw) as Partial<HtmlTestPayload>;

    if (parsed.mode !== "html" || typeof parsed.html !== "string") {
      return null;
    }

    return {
      mode: "html",
      fileName:
        typeof parsed.fileName === "string" && parsed.fileName.trim()
          ? parsed.fileName.trim()
          : "uploaded-test.html",
      html: parsed.html,
      note: typeof parsed.note === "string" ? parsed.note : "",
      uploadedAt:
        typeof parsed.uploadedAt === "string" ? parsed.uploadedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function createHtmlTestDescription(params: {
  fileName: string;
  html: string;
  note?: string;
}) {
  const payload: HtmlTestPayload = {
    mode: "html",
    fileName: params.fileName || "uploaded-test.html",
    html: params.html,
    note: params.note || "",
    uploadedAt: new Date().toISOString(),
  };

  return `${HTML_TEST_PREFIX}${JSON.stringify(payload)}`;
}

export function getVisibleTestDescription(description?: string | null) {
  const htmlTest = parseHtmlTestDescription(description);
  if (htmlTest) {
    return htmlTest.note || `Uploaded HTML file: ${htmlTest.fileName}`;
  }
  return description || "";
}

export function getHtmlTestFileName(description?: string | null) {
  return parseHtmlTestDescription(description)?.fileName || "";
}
