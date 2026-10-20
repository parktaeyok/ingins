-- Existing registration tables only. For a new project use setup-registration.sql.
-- No browser access to user_id or email is granted.
grant select on public.registration_handles to service_role;
