# Scripts

## scrape-google-reviews.mjs

One-time / monthly **free** Google Maps review scraper (local Playwright).
Pulls **all** reviews from the business page and writes a JSON array ready to
paste into the admin panel.

### Run

```bash
npm i -D playwright
npx playwright install chromium

# default URL (Dragoman SeaKayak):
npm run scrape:reviews

# or a specific URL / to watch it work:
HEADFUL=1 node scripts/scrape-google-reviews.mjs "https://maps.app.goo.gl/pDn4HTyraEKg5Buh8"
```

Output: `scripts/output/reviews.json`.

### Import

1. Open `/admin` → **Yorumlar** tab → **Toplu Ekle**.
2. Paste the contents of `reviews.json`.
3. Click **Yorumları Ekle**. Reviews are published immediately (auto-publish).
4. The insert trigger auto-translates each review into TR/EN/FR/RU/DE. If the free
   MyMemory quota throttles a big first batch, click **Tümünü Çevir** later to
   fill in the missing languages (already-translated rows are skipped).

> If Google changes its DOM and the scraper returns 0 reviews, run with
> `HEADFUL=1` and update the selectors in `scrape-google-reviews.mjs`.

---

## Translation pipeline setup (one time)

The auto-translate trigger calls the `translate-review` Edge Function via
`pg_net`. Configure it once:

```bash
# 1. Apply migrations (creates tables, trigger, enables pg_net)
supabase db push

# 2. Deploy the function
supabase functions deploy translate-review

# 3. Set the function's shared secret (any long random string)
supabase secrets set EDGE_SHARED_SECRET="<random-secret>"
# optional: raise MyMemory's free daily quota with a contact email
supabase secrets set MYMEMORY_EMAIL="info@dragomanseakayak.com"

# 4. Tell the DB trigger where the function lives + the same secret (Vault).
#    Run in the Supabase SQL editor (replace <ref> and <random-secret>):
#    select vault.create_secret(
#      'https://<ref>.supabase.co/functions/v1/translate-review', 'edge_translate_url');
#    select vault.create_secret('<random-secret>', 'edge_shared_secret');
```

If the Vault secrets are absent, review inserts still succeed — they just won't
auto-translate until you configure the URL/secret and press **Tümünü Çevir**.

---

## Reservation alert email setup (one time)

New reservation requests can send an internal email through Zoho Mail API. The
database trigger calls the `send-reservation-alert` Edge Function after each
insert; if the trigger secrets are missing, the reservation is still saved.

Zoho Mail docs require `POST /api/accounts/{accountId}/messages` with the
`ZohoMail.messages.CREATE` scope, plus OAuth refresh-token renewal.

### Which addresses to use

**Sender** is `info@dragomanseakayak.com`, an alias on the Zoho account
(`dragomanseakayak.com` was added to Zoho and verified 11/08/2026).

**Recipient** is `info@dragoman-turkey.com`, the public contact address, which
lives on Google Workspace. Zoho only requires the *sender* to be verified — the
recipient can be any address — so the mail goes there directly and no
forwarding rule is needed. `dragomanseakayak.com` publishes SPF
(`include:one.zoho.eu`) and a `zmail` DKIM key, so Google accepts it as
authenticated.

Do **not** swap these. `info@dragoman-turkey.com` as `ZOHO_FROM_EMAIL` fails:
Zoho rejects a `fromAddress` it has not verified, and that domain is on Google
(`MX → aspmx.l.google.com`), not Zoho.

### Data center: EU

The account is on Zoho's **EU** data center — confirmed by its live MX records
(`mx.zoho.eu`, `mx2.zoho.eu`, `mx3.zoho.eu`) and SPF (`include:one.zoho.eu`).

This matters more than it looks: a token issued by one data center is rejected
by every other one, and `index.ts` defaults to `.com`. So
`ZOHO_ACCOUNTS_BASE_URL` and `ZOHO_MAIL_API_BASE_URL` are **required**, not
optional, and every console URL below must be the `.eu` variant.

### Getting the Zoho credentials

1. Create the `info@dragomanseakayak.com` mailbox (Zoho Admin → Users). Domain
   verification alone does not create it, and Zoho cannot send from an address
   that has no mailbox.
2. At `api-console.zoho.eu` create a **Self Client** → gives `ZOHO_CLIENT_ID`
   and `ZOHO_CLIENT_SECRET`.
3. In the Self Client's *Generate Code* tab use scope
   `ZohoMail.messages.CREATE`, pick the longest duration, and enter any portal
   name. The code expires in minutes, so exchange it right away:
   ```bash
   curl -X POST "https://accounts.zoho.eu/oauth/v2/token" \
     -d grant_type=authorization_code -d client_id=... -d client_secret=... \
     -d code='<generated-code>'
   ```
   Store `refresh_token` from the response as `ZOHO_REFRESH_TOKEN`. It does not
   expire; the function trades it for a short-lived access token per send. The
   `access_token` in the same response is what step 4 uses.
4. Discover `ZOHO_ACCOUNT_ID`:
   ```bash
   curl "https://mail.zoho.eu/api/accounts" \
     -H "Authorization: Zoho-oauthtoken <access-token>"
   ```
   Use the `accountId` field of the `info@dragomanseakayak.com` entry.

### Deploy

```bash
# 1. Apply migrations (creates the reservation alert trigger)
supabase db push

# 2. Deploy the function. The DB trigger has no user JWT; the function checks
#    x-shared-secret itself.
supabase functions deploy send-reservation-alert --no-verify-jwt

# 3. Set function secrets. If the translate pipeline already uses
#    EDGE_SHARED_SECRET, keep the same value here.
supabase secrets set EDGE_SHARED_SECRET="<random-secret>"
supabase secrets set ZOHO_CLIENT_ID="<zoho-client-id>"
supabase secrets set ZOHO_CLIENT_SECRET="<zoho-client-secret>"
supabase secrets set ZOHO_REFRESH_TOKEN="<zoho-refresh-token>"
supabase secrets set ZOHO_ACCOUNT_ID="<zoho-mail-account-id>"
supabase secrets set ZOHO_FROM_EMAIL="info@dragomanseakayak.com"
supabase secrets set RESERVATION_ALERT_TO="info@dragoman-turkey.com"

# 4. REQUIRED — the account is on the EU data center and index.ts defaults
#    to .com. Skipping these makes every send fail with a 502.
supabase secrets set ZOHO_ACCOUNTS_BASE_URL="https://accounts.zoho.eu"
supabase secrets set ZOHO_MAIL_API_BASE_URL="https://mail.zoho.eu"
```

Then run this in the Supabase SQL editor, replacing `<ref>` and
`<random-secret>`. If `edge_shared_secret` already exists from the translation
pipeline, do not recreate it; reuse the same value.

```sql
select vault.create_secret(
  'https://<ref>.supabase.co/functions/v1/send-reservation-alert',
  'edge_reservation_alert_url'
);
select vault.create_secret('<random-secret>', 'edge_shared_secret');
```

### Verifying

The trigger fires `net.http_post` asynchronously and ignores the result, so a
broken pipeline is silent — reservations keep saving and no mail arrives. After
setup, submit one test reservation from the site, then read back what Postgres
recorded:

```sql
select id, status_code, content, created
from net._http_response
order by created desc
limit 5;
```

`200` with `{"ok":true}` means sent. `401` means `EDGE_SHARED_SECRET` and the
Vault `edge_shared_secret` disagree. `500` with a `missing` array names the
unset secrets. `502` means Zoho rejected the send — usually a wrong data
center, an unverified `ZOHO_FROM_EMAIL`, or a refresh token issued without the
`ZohoMail.messages.CREATE` scope.
