-- New reservation insert -> trigger -> pg_net.http_post -> Edge Function
-- "send-reservation-alert" sends an internal email via Zoho Mail API.

create extension if not exists pg_net with schema extensions;

-- Edge Function URL + shared secret are read from Vault, NOT hardcoded.
-- Setup (run once):
--   select vault.create_secret('https://<ref>.supabase.co/functions/v1/send-reservation-alert', 'edge_reservation_alert_url');
--   select vault.create_secret('<random-shared-secret>', 'edge_shared_secret');
-- The same secret must be set on the function:
--   supabase secrets set EDGE_SHARED_SECRET='<random-shared-secret>'
create or replace function public.fn_enqueue_reservation_alert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  fn_url     text;
  fn_secret  text;
begin
  select decrypted_secret into fn_url
    from vault.decrypted_secrets where name = 'edge_reservation_alert_url';
  select decrypted_secret into fn_secret
    from vault.decrypted_secrets where name = 'edge_shared_secret';

  -- If the pipeline isn't configured yet, reservation insert still succeeds.
  if fn_url is null then
    return new;
  end if;

  perform net.http_post(
    url     := fn_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-shared-secret', coalesce(fn_secret, '')
    ),
    body    := jsonb_build_object('reservation_id', new.id)
  );
  return new;
end;
$$;

drop trigger if exists trg_reservation_alert on public.reservation_requests;
create trigger trg_reservation_alert
  after insert on public.reservation_requests
  for each row
  execute function public.fn_enqueue_reservation_alert();
