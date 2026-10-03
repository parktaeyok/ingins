create extension if not exists pgcrypto;

create table public.inquiries (
  id bigint generated always as identity primary key,
  receipt_number text not null unique,
  inquiry_type text not null check (inquiry_type in ('general','estimate','maintenance')),
  company_name text,
  contact_name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'received' check (status in ('received','checking','consulting','quoted','contracted','completed','cancelled')),
  privacy_agreed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inquiries_status_created_idx on public.inquiries(status, created_at desc);

create table public.diagnosis_requests (
  id bigint generated always as identity primary key,
  receipt_number text not null unique,
  diagnosis_type text not null check (diagnosis_type in ('simple','detailed')),
  company_name text,
  contact_name text not null,
  email text not null,
  phone text,
  website_url text not null,
  request_detail text,
  status text not null default 'received' check (status in ('received','checking','consulting','completed','cancelled')),
  privacy_agreed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index diagnosis_requests_status_created_idx on public.diagnosis_requests(status, created_at desc);

create table public.education_requests (
  id bigint generated always as identity primary key,
  receipt_number text not null unique,
  applicant_name text not null,
  company_name text,
  email text not null,
  phone text not null,
  experience_level text,
  request_detail text,
  status text not null default 'received' check (status in ('received','checking','consulting','completed','cancelled')),
  privacy_agreed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index education_requests_status_created_idx on public.education_requests(status, created_at desc);

create table public.submission_rate_limits (
  fingerprint text primary key,
  last_submitted_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;
alter table public.diagnosis_requests enable row level security;
alter table public.education_requests enable row level security;
alter table public.submission_rate_limits enable row level security;

create or replace function public.submit_public_request(p_kind text, p_payload jsonb, p_fingerprint text)
returns text language plpgsql security definer set search_path = public as $$
declare v_receipt text;
begin
  if p_kind not in ('inquiry','diagnosis','education') or p_fingerprint !~ '^[a-f0-9]{64}$' then raise exception 'INVALID_REQUEST'; end if;
  perform pg_advisory_xact_lock(hashtext(p_fingerprint));
  if exists(select 1 from submission_rate_limits where fingerprint=p_fingerprint and last_submitted_at > now()-interval '30 seconds') then raise exception 'RATE_LIMITED'; end if;
  insert into submission_rate_limits(fingerprint,last_submitted_at) values(p_fingerprint,now()) on conflict(fingerprint) do update set last_submitted_at=excluded.last_submitted_at;
  v_receipt := 'INS-' || upper(substr(p_kind,1,1)) || '-' || to_char(now(),'YYYYMMDD') || '-' || upper(encode(gen_random_bytes(3),'hex'));
  if p_kind='inquiry' then
    insert into inquiries(receipt_number,inquiry_type,company_name,contact_name,email,phone,subject,message) values(v_receipt,p_payload->>'inquiryType',nullif(p_payload->>'companyName',''),p_payload->>'name',p_payload->>'email',nullif(p_payload->>'phone',''),p_payload->>'subject',p_payload->>'message');
  elsif p_kind='diagnosis' then
    insert into diagnosis_requests(receipt_number,diagnosis_type,company_name,contact_name,email,phone,website_url,request_detail) values(v_receipt,p_payload->>'diagnosisType',nullif(p_payload->>'companyName',''),p_payload->>'name',p_payload->>'email',nullif(p_payload->>'phone',''),p_payload->>'websiteUrl',nullif(p_payload->>'message',''));
  else
    insert into education_requests(receipt_number,applicant_name,company_name,email,phone,experience_level,request_detail) values(v_receipt,p_payload->>'name',nullif(p_payload->>'companyName',''),p_payload->>'email',p_payload->>'phone',nullif(p_payload->>'experienceLevel',''),nullif(p_payload->>'message',''));
  end if;
  return v_receipt;
end $$;

revoke all on function public.submit_public_request(text,jsonb,text) from public, anon, authenticated;
grant execute on function public.submit_public_request(text,jsonb,text) to service_role;
