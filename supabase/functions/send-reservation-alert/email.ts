export interface ReservationAlertRow {
  id: string;
  created_at: string;
  tour_slug: string | null;
  date: string | null;
  party_size: number | null;
  name: string;
  email: string | null;
  phone: string;
  message: string | null;
  lang: string | null;
}

export interface ReservationAlertEmail {
  subject: string;
  html: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function present(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  return escapeHtml(String(value));
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function buildReservationAlertEmail(row: ReservationAlertRow): ReservationAlertEmail {
  const subjectName = row.name.trim() || row.phone;
  const subject = `Yeni rezervasyon talebi: ${subjectName}`;
  const rows: Array<[string, string | number | null]> = [
    ["Ad Soyad", row.name],
    ["Telefon", row.phone],
    ["E-posta", row.email],
    ["Tur", row.tour_slug],
    ["Tarih", row.date],
    ["Kisi sayisi", row.party_size],
    ["Dil", row.lang],
    ["Gelis zamani", formatCreatedAt(row.created_at)],
    ["Rezervasyon ID", row.id],
  ];

  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e5e7eb;color:#0f766e;width:140px;">${escapeHtml(label)}</th>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${present(value)}</td>
        </tr>`,
    )
    .join("");

  const message = row.message?.trim()
    ? `<p style="white-space:pre-wrap;margin:0;">${escapeHtml(row.message.trim())}</p>`
    : "<p style=\"margin:0;color:#6b7280;\">-</p>";

  return {
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5;">
        <h2 style="margin:0 0 16px;color:#0f766e;">Yeni rezervasyon talebi</h2>
        <table style="border-collapse:collapse;width:100%;max-width:680px;background:#ffffff;border:1px solid #e5e7eb;">
          <tbody>${tableRows}</tbody>
        </table>
        <h3 style="margin:20px 0 8px;color:#0f766e;">Mesaj</h3>
        ${message}
      </div>`,
  };
}
