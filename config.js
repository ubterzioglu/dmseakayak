// =============================================================================
// Dragoman SeaKayak — public istemci yapılandırması
//
// DİKKAT: Buradaki değerler PUBLIC'tir ve tarayıcıya gönderilmesi güvenlidir.
//   - SUPABASE_ANON_KEY: anon (public) anahtar — RLS politikaları korur.
//   - ADMIN_PASSWORD: client-side basit şifre (geçici). Kaynak kodda görünür;
//     gerçek güvenlik DEĞİLDİR, sadece sıradan kullanıcıyı uzak tutar.
//     Gerçek koruma için Supabase Auth'a geçilecek (plan Bölüm 4).
//
// service_role ve access_token ASLA buraya konmaz — onlar yalnızca sunucu/yerel.
// =============================================================================
window.DRAGOMAN_CONFIG = {
  SUPABASE_URL: "https://sqbfrpttawdsikukvpuv.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYmZycHR0YXdkc2lrdWt2cHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NzQ5MDAsImV4cCI6MjA5NzQ1MDkwMH0.zV9mSHmLDhISP_O48O82o3bJRZ3cSqdnwMWkekiuHVM",
  ADMIN_PASSWORD: "Seakayak!2026"
};
