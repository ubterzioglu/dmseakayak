// Edge Function: send-reservation-alert
//
// Sends an internal alert email when public.reservation_requests receives a row.
// Invocation path:
//   Postgres insert trigger -> { reservation_id } (x-shared-secret header)
// Deploy with --no-verify-jwt; the DB trigger has no user JWT and this function
// authorizes trigger calls with EDGE_SHARED_SECRET.
//
// Secrets (supabase secrets set ...):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY       (auto-injected by Supabase)
//   EDGE_SHARED_SECRET                            (must match Vault edge_shared_secret)
//   ZOHO_CLIENT_ID
//   ZOHO_CLIENT_SECRET
//   ZOHO_REFRESH_TOKEN                            (scope: ZohoMail.messages.CREATE)
//   ZOHO_ACCOUNT_ID
//   ZOHO_FROM_EMAIL
//   RESERVATION_ALERT_TO
//
// Optional secrets:
//   ZOHO_ACCOUNTS_BASE_URL  (default: https://accounts.zoho.com)
//   ZOHO_MAIL_API_BASE_URL  (default: https://mail.zoho.com)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { buildReservationAlertEmail, type ReservationAlertRow } from "./email.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SHARED_SECRET = Deno.env.get("EDGE_SHARED_SECRET") ?? "";

const ZOHO_CLIENT_ID = Deno.env.get("ZOHO_CLIENT_ID") ?? "";
const ZOHO_CLIENT_SECRET = Deno.env.get("ZOHO_CLIENT_SECRET") ?? "";
const ZOHO_REFRESH_TOKEN = Deno.env.get("ZOHO_REFRESH_TOKEN") ?? "";
const ZOHO_ACCOUNT_ID = Deno.env.get("ZOHO_ACCOUNT_ID") ?? "";
const ZOHO_FROM_EMAIL = Deno.env.get("ZOHO_FROM_EMAIL") ?? "";
const RESERVATION_ALERT_TO = Deno.env.get("RESERVATION_ALERT_TO") ?? "";
const ZOHO_ACCOUNTS_BASE_URL =
  Deno.env.get("ZOHO_ACCOUNTS_BASE_URL") ?? "https://accounts.zoho.com";
const ZOHO_MAIL_API_BASE_URL = Deno.env.get("ZOHO_MAIL_API_BASE_URL") ?? "https://mail.zoho.com";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function requireSecrets(): string[] {
  return [
    ["SUPABASE_URL", SUPABASE_URL],
    ["SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY],
    ["EDGE_SHARED_SECRET", SHARED_SECRET],
    ["ZOHO_CLIENT_ID", ZOHO_CLIENT_ID],
    ["ZOHO_CLIENT_SECRET", ZOHO_CLIENT_SECRET],
    ["ZOHO_REFRESH_TOKEN", ZOHO_REFRESH_TOKEN],
    ["ZOHO_ACCOUNT_ID", ZOHO_ACCOUNT_ID],
    ["ZOHO_FROM_EMAIL", ZOHO_FROM_EMAIL],
    ["RESERVATION_ALERT_TO", RESERVATION_ALERT_TO],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
}

async function getZohoAccessToken(): Promise<string> {
  const body = new URLSearchParams({
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: ZOHO_REFRESH_TOKEN,
  });

  const res = await fetch(`${ZOHO_ACCOUNTS_BASE_URL}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || typeof data.access_token !== "string") {
    throw new Error(`Zoho token request failed: ${res.status}`);
  }
  return data.access_token;
}

async function sendZohoEmail(row: ReservationAlertRow): Promise<void> {
  const token = await getZohoAccessToken();
  const email = buildReservationAlertEmail(row);
  const res = await fetch(`${ZOHO_MAIL_API_BASE_URL}/api/accounts/${ZOHO_ACCOUNT_ID}/messages`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Zoho-oauthtoken ${token}`,
    },
    body: JSON.stringify({
      fromAddress: ZOHO_FROM_EMAIL,
      toAddress: RESERVATION_ALERT_TO,
      subject: email.subject,
      content: email.html,
      mailFormat: "html",
    }),
  });

  if (!res.ok) {
    const message = await res.text().catch(() => "");
    throw new Error(`Zoho send failed: ${res.status} ${message.slice(0, 300)}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const headerSecret = req.headers.get("x-shared-secret") ?? "";
  if (!SHARED_SECRET || headerSecret !== SHARED_SECRET) {
    return json({ error: "unauthorized" }, 401);
  }

  const missing = requireSecrets();
  if (missing.length) {
    return json({ error: "missing secrets", missing }, 500);
  }

  let payload: { reservation_id?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid json body" }, 400);
  }

  const reservationId = payload.reservation_id ?? "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reservationId)) {
    return json({ error: "invalid reservation_id" }, 400);
  }

  const { data, error } = await admin
    .from("reservation_requests")
    .select("id, created_at, tour_slug, date, party_size, name, email, phone, message, lang")
    .eq("id", reservationId)
    // maybeSingle, not single: a missing row is a normal outcome here (the
    // reservation can be deleted between the trigger firing and this fetch),
    // and single() would surface it as an opaque coercion error with a 500.
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  if (!data) return json({ error: "reservation not found" }, 404);

  try {
    await sendZohoEmail(data as ReservationAlertRow);
  } catch (error) {
    const message = error instanceof Error ? error.message : "email send failed";
    console.error(message);
    return json({ error: message }, 502);
  }

  return json({ ok: true });
});
