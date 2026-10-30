export class SupabaseServerConfigError extends Error {
  code: string;
  constructor(code: string) { super("Supabase server configuration is invalid"); this.code=code; }
}
export function supabaseServerConfig(values: { url?: string; publicUrl?: string; key?: string }, expectedUrl?: string) {
  const url=(values.url?.trim() || values.publicUrl?.trim() || "").replace(/\/+$/, "");
  const key=values.key?.trim() ?? "";
  if(!url)throw new SupabaseServerConfigError("BOARD_URL_MISSING");
  if(expectedUrl&&url!==expectedUrl)throw new SupabaseServerConfigError("BOARD_URL_MISMATCH");
  if(!key)throw new SupabaseServerConfigError("BOARD_SECRET_MISSING");
  let valid=/^sb_secret_[A-Za-z0-9_-]+$/.test(key)&&!key.includes("REPLACE_ME");
  if(!valid&&/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)){
    try { valid=JSON.parse(Buffer.from(key.split(".")[1],"base64url").toString()).role==="service_role"; } catch { valid=false; }
  }
  if(!valid)throw new SupabaseServerConfigError("BOARD_SECRET_FORMAT");
  return {url,key};
}
