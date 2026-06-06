export function extractJson(text: string): unknown {
  let s = text.trim();
  // strip markdown code fences
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  // locate first { or [ and matching last } or ]
  const startObj = s.indexOf("{");
  const startArr = s.indexOf("[");
  let start = -1;
  let openChar = "";
  let closeChar = "";
  if (startObj === -1 && startArr === -1) {
    throw new Error("No JSON found in response");
  }
  if (startArr === -1 || (startObj !== -1 && startObj < startArr)) {
    start = startObj;
    openChar = "{";
    closeChar = "}";
  } else {
    start = startArr;
    openChar = "[";
    closeChar = "]";
  }
  const end = s.lastIndexOf(closeChar);
  if (end === -1 || end < start) throw new Error("Unterminated JSON in response");
  let candidate = s.substring(start, end + 1);

  try {
    return JSON.parse(candidate);
  } catch {
    // repair: strip control chars + trailing commas
    let repaired = candidate
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/,(\s*[}\]])/g, "$1");

    // balance braces/brackets
    let braces = 0;
    let brackets = 0;
    for (const c of repaired) {
      if (c === "{") braces++;
      else if (c === "}") braces--;
      else if (c === "[") brackets++;
      else if (c === "]") brackets--;
    }
    while (brackets-- > 0) repaired += "]";
    while (braces-- > 0) repaired += "}";

    return JSON.parse(repaired);
  }
}
