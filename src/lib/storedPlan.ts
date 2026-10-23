// Plans are stored in localStorage as plain JSON. Older versions stored
// btoa(JSON), which throws on characters above U+00FF (en dashes, emoji...).

function decodeBase64Utf8(value: string): string {
  const binary = atob(value);
  try {
    return decodeURIComponent(escape(binary));
  } catch {
    return binary;
  }
}

export function parseStoredPlan(stored: string | null): Record<string, unknown> | null {
  if (!stored) return null;
  // Plain JSON is the current format; base64 is the legacy one.
  const attempts = [() => stored, () => decodeBase64Utf8(stored)];
  for (const decode of attempts) {
    try {
      const parsed = JSON.parse(decode());
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
      // try next format
    }
  }
  return null;
}

export function serializePlan(plan: unknown): string {
  return JSON.stringify(plan);
}
