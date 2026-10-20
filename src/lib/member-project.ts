// Membership now belongs to the project explicitly supplied by the site owner.
export const MEMBER_PROJECT_URL = "https://ejwutsrpugxuexdquchu.supabase.co";

export function normalizeMemberUrl(value: string | undefined) {
  return value?.trim().replace(/\/+$/, "") ?? "";
}

export function memberPublicConfig(url: string | undefined, key: string | undefined) {
  const normalizedUrl = normalizeMemberUrl(url);
  const normalizedKey = key?.trim() ?? "";
  if (normalizedUrl !== MEMBER_PROJECT_URL || !normalizedKey || /REPLACE_ME|sb_secret_/i.test(normalizedKey)) return null;
  const publishable = /^sb_publishable_[A-Za-z0-9_-]+$/.test(normalizedKey);
  let legacyAnon = false;
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(normalizedKey)) {
    try {
      const payload = normalizedKey.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      legacyAnon = JSON.parse(atob(payload)).role === "anon";
    } catch { /* Malformed legacy credentials are not public configuration. */ }
  }
  if (!publishable && !legacyAnon) return null;
  return { url: normalizedUrl, key: normalizedKey };
}
