/**
 * Maps Supabase auth error messages (English, technical) to friendly Turkish
 * text for the non-technical admin team. Falls back to a generic message so we
 * never surface a raw English/stack-flavored string to the user.
 */
const KNOWN: { match: RegExp; message: string }[] = [
  {
    match: /invalid login credentials/i,
    message: "E-posta veya şifre hatalı. Lütfen tekrar deneyin.",
  },
  {
    match: /email not confirmed/i,
    message: "E-posta adresiniz henüz doğrulanmamış.",
  },
  {
    match: /user not found/i,
    message: "Bu e-posta ile kayıtlı bir hesap bulunamadı.",
  },
  {
    match: /(rate limit|too many requests)/i,
    message: "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.",
  },
  {
    match: /(network|fetch|failed to fetch)/i,
    message: "Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.",
  },
  {
    match: /new password should be different/i,
    message: "Yeni şifre eskisinden farklı olmalı.",
  },
  {
    match: /password should be at least/i,
    message: "Şifre çok kısa. Daha uzun bir şifre seçin.",
  },
];

export function friendlyAuthError(error: unknown): string {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const hit = KNOWN.find((k) => k.match.test(raw));
  if (hit) return hit.message;
  return "Bir sorun oluştu. Lütfen tekrar deneyin.";
}
