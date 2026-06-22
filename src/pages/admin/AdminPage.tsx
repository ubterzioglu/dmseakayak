import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import ReservationsPanel from "./ReservationsPanel";
import RevisionsPanel from "./RevisionsPanel";
import BlogPanel from "./BlogPanel";
import ReviewsPanel from "./ReviewsPanel";
import UpdatesPanel from "./UpdatesPanel";
import GalleryPanel from "./GalleryPanel";
import GuidePanel from "./GuidePanel";
import ChangePasswordModal from "./ChangePasswordModal";

// ─── Admin allowlist ─────────────────────────────────────────────────────────
// Sadece bu e-postalar admin paneline girebilir. Supabase'de kayıtlı olsalar
// bile listede olmayan kullanıcılar otomatik olarak çıkış yaptırılır.
const ADMIN_EMAILS = [
  "kelifterzioglu@gmail.com",
  "ubterzioglu@gmail.com",
  "oguzhandurmus@msn.com",
];

function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// ─── Login form ──────────────────────────────────────────────────────────────

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  error: string;
  loading: boolean;
}

function AdminLogin({ onLogin, error, loading }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onLogin(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl border border-teal/10 bg-white p-8 shadow-[0_10px_40px_rgba(1,68,57,0.1)]">
        <div className="mb-6 text-center">
          <div className="text-2xl font-extrabold text-teal-deep">Dragoman SeaKayak</div>
          <div className="mt-1 text-sm text-teal/60">Admin Paneli</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-teal-deep" htmlFor="adm-email">
              E-posta
            </label>
            <input
              id="adm-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-teal/15 px-4 py-2.5 text-base outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-teal-deep" htmlFor="adm-pass">
              Şifre
            </label>
            <input
              id="adm-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-teal/15 px-4 py-2.5 text-base outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-teal py-3 font-semibold text-white transition-colors hover:bg-teal-light disabled:opacity-50"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────

type TabKey =
  | "guide"
  | "reservations"
  | "revisions"
  | "blog"
  | "gallery"
  | "reviews"
  | "updates";

const TABS: { key: TabKey; label: string }[] = [
  { key: "guide", label: "Rehber" },
  { key: "reservations", label: "Rezervasyonlar" },
  { key: "revisions", label: "Revizyonlar" },
  { key: "blog", label: "Blog" },
  { key: "gallery", label: "Galeri" },
  { key: "reviews", label: "Yorumlar" },
  { key: "updates", label: "Güncellemeler" },
];

// ─── Main admin page ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("guide");
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const sessUser = data.session?.user ?? null;
      if (data.session && !isAdminEmail(sessUser?.email)) {
        void supabase!.auth.signOut();
        return;
      }
      setSession(data.session);
      setUser(sessUser);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      const sessUser = sess?.user ?? null;
      if (sess && !isAdminEmail(sessUser?.email)) {
        void supabase!.auth.signOut();
        setSession(null);
        setUser(null);
        return;
      }
      setSession(sess);
      setUser(sessUser);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8 text-center">
        <div className="max-w-sm rounded-2xl border border-teal/10 bg-white p-8">
          <div className="text-xl font-bold text-teal-deep">Admin Paneli</div>
          <p className="mt-3 text-sm text-teal/70">
            Supabase yapılandırılmamış. Ortam değişkenlerini ekleyin ve sayfayı yenileyin.
          </p>
        </div>
      </div>
    );
  }

  const handleLogin = async (email: string, password: string) => {
    if (!supabase) return;
    setLoginLoading(true);
    setLoginError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      setLoginLoading(false);
      return;
    }
    if (!isAdminEmail(data.user?.email)) {
      await supabase.auth.signOut();
      setLoginError("Bu hesabın admin paneline erişim yetkisi yok.");
      setLoginLoading(false);
      return;
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (!session) {
    return <AdminLogin onLogin={handleLogin} error={loginError} loading={loginLoading} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-teal shadow-md">
        <div className="container flex items-center justify-between py-4">
          <div>
            <div className="font-extrabold text-white">Dragoman SeaKayak</div>
            <div className="text-xs text-white/70">Admin Paneli</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-white/70 sm:block">{user?.email}</span>
            <button
              onClick={() => setShowChangePassword(true)}
              className="rounded-full border border-white/30 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Şifre Değiştir
            </button>
            <button
              onClick={() => void handleLogout()}
              className="rounded-full border border-white/30 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Google Drive card */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-orange/20 bg-orange/5 p-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange/10">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-orange" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.433 22l4-6.928H22l-4 6.928H4.433zM2 18l4-6.928 3.567 6.928H2zM8.567 11.072 12.567 4l4 6.928-4 6.928-4-6.856z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-teal-deep">Google Drive — Proje Klasörü</div>
            <div className="text-sm text-teal/60">Tüm belge, görsel ve dosyalar</div>
          </div>
          <a
            href="https://drive.google.com/drive/folders/1AsR07x9toMgQ8X5qUHDuzOXRjwBJLTvI"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-soft"
          >
            Aç
          </a>
        </div>

        {/* Microsoft Clarity card */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#0078D4]/20 bg-[#0078D4]/5 p-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#0078D4]/10">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#0078D4]" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4 3h2v11h-2V10zm4-6h2v17h-2V4zm4 9h2v8h-2v-8z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-teal-deep">Microsoft Clarity — Analytics</div>
            <div className="text-sm text-teal/60">Ziyaretçi istatistikleri, ısı haritaları ve oturum kayıtları</div>
          </div>
          <a
            href="https://clarity.microsoft.com/projects/view/x9l7k2sbw2/dashboard?date=Last%203%20days"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#0078D4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#106ebe]"
          >
            Aç
          </a>
        </div>

        {/* WhatsApp group card */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#25D366]/20 bg-[#25D366]/5 p-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366]/10">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.04c-.24.68-1.42 1.31-1.95 1.36-.5.05-.99.27-3.39-.71-2.86-1.13-4.68-4.05-4.82-4.24-.14-.19-1.16-1.54-1.16-2.94s.74-2.09 1-2.37c.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.97.88 2.11.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.12.6-.07.17-.19.69-.81.88-1.09.18-.28.37-.23.62-.14.25.09 1.61.76 1.89.9.28.14.46.21.53.33.07.12.07.69-.17 1.36z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-teal-deep">SeaKayak Web Sitesi — WhatsApp Grubu</div>
            <div className="text-sm text-teal/60">Proje iletişim grubu</div>
          </div>
          <a
            href="https://chat.whatsapp.com/JYC5ORJnbLnAFALiEEwX3G"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1ebe57]"
          >
            Aç
          </a>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-1 border-b-2 border-teal/10">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-0.5 border-b-[3px] px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? "border-orange text-orange"
                  : "border-transparent text-teal/60 hover:text-teal"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "guide" && <GuidePanel />}
        {tab === "reservations" && <ReservationsPanel />}
        {tab === "revisions" && <RevisionsPanel />}
        {tab === "blog" && <BlogPanel />}
        {tab === "gallery" && <GalleryPanel />}
        {tab === "reviews" && <ReviewsPanel />}
        {tab === "updates" && <UpdatesPanel />}
      </div>

      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </div>
  );
}
