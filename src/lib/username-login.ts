type SessionTokens = { access_token: string; refresh_token: string };
type LoginDependencies = {
  findUserId: (username: string) => Promise<string | null>;
  findEmail: (id: string) => Promise<string | null>;
  authenticate: (email: string, password: string) => Promise<SessionTokens | null>;
};

// Each account is limited locally as well as by Supabase Auth's upstream limits.
// For multiple application instances, add a shared gateway rate limit too.
export function createLoginLimiter(now = Date.now) {
  const attempts = new Map<string, { count: number; until: number }>();
  return (username: string) => {
    const time = now();
    for (const [key, value] of attempts) if (value.until <= time) attempts.delete(key);
    const current = attempts.get(username);
    if (current) { current.count++; return current.count <= 8; }
    if (attempts.size >= 10000) return false;
    attempts.set(username, { count: 1, until: time + 60000 });
    return true;
  };
}

export async function loginByUsername(username: string, password: string, dependencies: LoginDependencies) {
  const id = await dependencies.findUserId(username);
  const email = id ? await dependencies.findEmail(id) : null;
  // Unknown accounts also reach password verification and its rate limiter.
  const session = await dependencies.authenticate(email ?? "unknown-account@invalid.invalid", password);
  if (!email || !session) return null;
  return { access_token: session.access_token, refresh_token: session.refresh_token };
}
