"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { communityApi, type MemberProfile } from "@/lib/community-api";

type MemberState = { user: User | null; profile: MemberProfile | null; ready: boolean; configured: boolean; reload: () => Promise<void>; logout: () => Promise<void> };
const MemberContext = createContext<MemberState | null>(null);
export function MemberSession({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [ready, setReady] = useState(() => !getBrowserSupabase());
  const generation = useRef(0);
  const invalidate = useCallback(() => { generation.current++; }, []);
  const configured = Boolean(getBrowserSupabase());
  const reload = useCallback(async () => {
    const client = getBrowserSupabase();
    if (!client) return;
    const current = ++generation.current;
    const { data } = await client.auth.getSession();
    if (current !== generation.current) return;
    setUser(data.session?.user ?? null);
    if (data.session) {
      try { const result = await communityApi<{ profile: MemberProfile | null }>("profile/"); if (current === generation.current) setProfile(result.profile); }
      catch { if (current === generation.current) setProfile(null); }
    } else setProfile(null);
    if (current === generation.current) setReady(true);
  }, []);
  useEffect(() => {
    const client = getBrowserSupabase();
    if (!client) return;
    let timer: ReturnType<typeof setTimeout>;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      invalidate();
      setUser(session?.user ?? null);
      if (!session) setProfile(null);
      clearTimeout(timer);
      timer = setTimeout(() => { void reload(); }, 0);
    });
    // Supabase emits INITIAL_SESSION after loading the persisted session.
    return () => { subscription.unsubscribe(); clearTimeout(timer); invalidate(); };
  }, [reload, invalidate]);
  async function logout() {
    generation.current++;
    const result = await getBrowserSupabase()?.auth.signOut();
    if (result?.error) throw new Error("로그아웃하지 못했습니다. 다시 시도해주세요.");
    setUser(null); setProfile(null);
  }
  return <MemberContext.Provider value={{ user, profile, ready, configured, reload, logout }}>{children}</MemberContext.Provider>;
}
export function useMember() {
  const context = useContext(MemberContext);
  if (!context) throw new Error("MemberSession provider is required.");
  return context;
}
