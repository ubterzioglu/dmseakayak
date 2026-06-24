import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import type { Session, User } from "@supabase/supabase-js";
import {
  BookOpenText,
  ChartColumnBig,
  ClipboardList,
  FolderOpen,
  GalleryVerticalEnd,
  Images,
  KeyRound,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquareQuote,
  NotebookPen,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { friendlyAuthError } from "@/lib/authErrors";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import BlogPanel from "./BlogPanel";
import ChangePasswordModal from "./ChangePasswordModal";
import GalleryPanel from "./GalleryPanel";
import GuidePanel from "./GuidePanel";
import ReservationsPanel from "./ReservationsPanel";
import ReviewsPanel from "./ReviewsPanel";
import RevisionsPanel from "./RevisionsPanel";
import StatusReportPanel from "./StatusReportPanel";
import UpdatesPanel from "./UpdatesPanel";
import {
  type AdminNavItem,
  AdminPageHeader,
  AdminSidebar,
  SectionInfoAccordion,
} from "./admin-ui";
import { GUIDE_BY_TAB } from "./guide-content";

const ADMIN_EMAILS = [
  "kelifterzioglu@gmail.com",
  "ubterzioglu@gmail.com",
  "oguzhandurmus@msn.com",
];

function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

type TabKey =
  | "guide"
  | "reservations"
  | "revisions"
  | "blog"
  | "gallery"
  | "reviews"
  | "updates"
  | "status";

const TABS: AdminNavItem<TabKey>[] = [
  {
    key: "guide",
    label: "Rehber",
    description: "Paneli yeni kullanan ekip üyeleri için adım adım açıklamalar.",
    icon: BookOpenText,
  },
  {
    key: "reservations",
    label: "Rezervasyonlar",
    description: "Gelen talepleri takip edin, durum akışını yönetin.",
    icon: ClipboardList,
  },
  {
    key: "blog",
    label: "Blog",
    description: "Yazı üretin, taslakları düzenleyin, yayına alın.",
    icon: LayoutGrid,
  },
  {
    key: "gallery",
    label: "Galeri",
    description: "Fotoğraf seçin, sıralayın, görünürlüğünü kontrol edin.",
    icon: Images,
  },
  {
    key: "reviews",
    label: "Yorumlar",
    description: "Müşteri yorumları ve çeviri akışlarını yönetin.",
    icon: MessageSquareQuote,
  },
  {
    key: "updates",
    label: "Güncellemeler",
    description: "Yayınlanan geliştirmeler ve içerik bekleyen işler.",
    icon: Sparkles,
  },
  {
    key: "status",
    label: "Durum Raporu",
    description: "Proje hedeflerini ve eksik alanları tek tabloda izleyin.",
    icon: ChartColumnBig,
  },
  {
    key: "revisions",
    label: "Revizyonlar",
    description: "İç ekip isteklerini öncelik ve statüyle düzenleyin.",
    icon: NotebookPen,
  },
];

const QUICK_LINKS = [
  {
    title: "Google Drive",
    description: "Proje klasörü, görseller ve içerik dokümanları.",
    href: "https://drive.google.com/drive/folders/1AsR07x9toMgQ8X5qUHDuzOXRjwBJLTvI",
    icon: FolderOpen,
    accentClassName: "bg-orange/10 text-orange border-orange/15",
  },
  {
    title: "Microsoft Clarity",
    description: "Ziyaretçi oturumları, ısı haritaları ve analitik görünümü.",
    href: "https://clarity.microsoft.com/projects/view/x9l7k2sbw2/dashboard?date=Last%203%20days",
    icon: GalleryVerticalEnd,
    accentClassName: "bg-teal/10 text-teal border-teal/15",
  },
  {
    title: "WhatsApp Grubu",
    description: "Proje iletişimini hızlıca aynı yerden sürdürün.",
    href: "https://chat.whatsapp.com/JYC5ORJnbLnAFALiEEwX3G",
    icon: Phone,
    accentClassName: "bg-teal/10 text-teal border-teal/15",
  },
] as const;

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
  error: string;
  loading: boolean;
}

function AdminLogin({ onLogin, onForgotPassword, error, loading }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onLogin(email, password);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f3ee] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,110,11,0.14),transparent_26%),radial-gradient(circle_at_85%_15%,rgba(1,99,82,0.10),transparent_22%),linear-gradient(180deg,#f6f3ee_0%,#fbfaf7_100%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_480px]">
        <section className="rounded-[36px] border border-teal/10 bg-white/80 p-8 shadow-[0_32px_90px_rgba(4,43,37,0.08)] backdrop-blur sm:p-12">
          <img
            src="/tekrardene.png"
            alt="Dragoman Admin"
            className="mb-6 h-64 w-auto object-contain sm:h-80"
          />
          <div className="inline-flex rounded-full border border-orange/20 bg-orange/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-orange">
            Yönetim Paneli
          </div>
          <h1 className="mt-6 max-w-xl font-serif text-5xl leading-[0.92] text-teal-deep sm:text-6xl">
            Dragoman Yönetim Paneli
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-teal/62 sm:text-[15px]">
            Rezervasyonları takip edin, blog ve galeriyi yönetin, ekip içi revizyon
            isteklerini tek yerden düzenleyin. Giriş yapmak için sağdaki formu kullanın.
          </p>
        </section>

        <section className="rounded-[32px] border border-teal/10 bg-white p-7 shadow-[0_28px_80px_rgba(4,43,37,0.10)] sm:p-9">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <div className="font-serif text-3xl leading-none text-teal-deep">Dragoman</div>
              <div className="mt-2 text-sm text-teal/58">Admin paneline güvenli giriş</div>
            </div>
            <div className="rounded-full border border-teal/10 bg-foam/60 px-3 py-1 text-xs font-semibold text-teal-deep">
              Yetkili hesap
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-teal-deep" htmlFor="adm-email">
                E-posta
              </label>
              <input
                id="adm-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-teal/12 bg-[#fcfbf8] px-4 py-3 text-base outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-teal-deep" htmlFor="adm-pass">
                Şifre
              </label>
              <PasswordInput
                id="adm-pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-teal-deep px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal disabled:opacity-50"
            >
              {loading ? "Giriş yapılıyor..." : "Panele Gir"}
            </button>

            <button
              type="button"
              onClick={() => void onForgotPassword(email)}
              className="block w-full text-center text-sm font-semibold text-teal/70 underline-offset-2 transition hover:text-orange hover:underline"
            >
              Şifremi unuttum
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function MobileSidebar({
  open,
  active,
  onSelect,
  onClose,
  userEmail,
  onChangePassword,
  onLogout,
}: {
  open: boolean;
  active: TabKey;
  onSelect: (key: TabKey) => void;
  onClose: () => void;
  userEmail?: string | null;
  onChangePassword: () => void;
  onLogout: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 xl:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-teal-deep/35 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Navigasyonu kapat"
          />
          <motion.div
            initial={{ x: -32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative h-full w-full max-w-[360px] p-4"
          >
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/85 text-teal-deep shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminSidebar
              items={TABS}
              active={active}
              onSelect={(key) => {
                onSelect(key);
                onClose();
              }}
              userEmail={userEmail}
              onChangePassword={() => {
                onChangePassword();
                onClose();
              }}
              onLogout={onLogout}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function renderPanel(item: AdminNavItem<TabKey>) {
  // Collapsed-by-default "Bu bölüm ne işe yarar?" card, embedded as the second
  // card inside each panel. Its body is a verbatim copy of the matching guide
  // ("Rehber") section, looked up by label; falls back to the one-line tab
  // description for tabs without a guide entry (Rehber, Durum Raporu).
  const infoSlot = (
    <SectionInfoAccordion
      guide={GUIDE_BY_TAB[item.label]}
      description={item.description}
    />
  );
  switch (item.key) {
    case "guide":
      return <GuidePanel infoSlot={infoSlot} />;
    case "reservations":
      return <ReservationsPanel infoSlot={infoSlot} />;
    case "revisions":
      return <RevisionsPanel infoSlot={infoSlot} />;
    case "blog":
      return <BlogPanel infoSlot={infoSlot} />;
    case "gallery":
      return <GalleryPanel infoSlot={infoSlot} />;
    case "reviews":
      return <ReviewsPanel infoSlot={infoSlot} />;
    case "updates":
      return <UpdatesPanel infoSlot={infoSlot} />;
    case "status":
      return <StatusReportPanel infoSlot={infoSlot} />;
    default:
      return null;
  }
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("guide");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthChecking(false);
      return;
    }
    const adminClient = supabase;
    adminClient.auth.getSession().then(({ data }) => {
      const sessUser = data.session?.user ?? null;
      if (data.session && !isAdminEmail(sessUser?.email)) {
        void adminClient.auth.signOut();
        setAuthChecking(false);
        return;
      }
      setSession(data.session);
      setUser(sessUser);
      setAuthChecking(false);
    });
    const { data: sub } = adminClient.auth.onAuthStateChange((_event, sess) => {
      const sessUser = sess?.user ?? null;
      if (sess && !isAdminEmail(sessUser?.email)) {
        void adminClient.auth.signOut();
        setSession(null);
        setUser(null);
        setAuthChecking(false);
        return;
      }
      setSession(sess);
      setUser(sessUser);
      setAuthChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const activeTab = useMemo(
    () => TABS.find((item) => item.key === tab) ?? TABS[0],
    [tab],
  );

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ee] p-8">
        <div className="max-w-md rounded-[32px] border border-teal/10 bg-white p-8 text-center shadow-[0_24px_70px_rgba(4,43,37,0.08)]">
          <div className="font-serif text-3xl text-teal-deep">Admin Paneli</div>
          <p className="mt-3 text-sm leading-7 text-teal/65">
            Supabase yapılandırılmamış. Ortam değişkenlerini ekleyin ve sayfayı yenileyin.
          </p>
        </div>
      </div>
    );
  }

  const handleLogin = async (email: string, password: string) => {
    if (!supabase) return;
    const adminClient = supabase;
    setLoginLoading(true);
    setLoginError("");
    const { data, error } = await adminClient.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(friendlyAuthError(error));
      setLoginLoading(false);
      return;
    }
    if (!isAdminEmail(data.user?.email)) {
      await adminClient.auth.signOut();
      setLoginError("Bu hesabın admin paneline erişim yetkisi yok.");
      setLoginLoading(false);
      return;
    }
    setLoginLoading(false);
  };

  const handleForgotPassword = async (email: string) => {
    if (!supabase) return;
    const trimmed = email.trim();
    if (!trimmed) {
      setLoginError("Önce e-posta adresinizi yazın, sonra 'Şifremi unuttum'a basın.");
      return;
    }
    if (!isAdminEmail(trimmed)) {
      setLoginError("Bu e-posta admin paneline kayıtlı değil.");
      return;
    }
    setLoginError("");
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/admin`,
    });
    if (error) {
      toast.error(friendlyAuthError(error));
      return;
    }
    toast.success("Şifre sıfırlama bağlantısı e-postanıza gönderildi.");
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    toast.success("Çıkış yapıldı.");
  };

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ee]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal/20 border-t-teal-deep" />
          <div className="text-sm font-semibold text-teal/60">Panel yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <AdminLogin
        onLogin={handleLogin}
        onForgotPassword={handleForgotPassword}
        error={loginError}
        loading={loginLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3ee]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,110,11,0.11),transparent_22%),radial-gradient(circle_at_80%_0%,rgba(1,99,82,0.08),transparent_26%),linear-gradient(180deg,#f6f3ee_0%,#fbfaf7_100%)]" />
      <div className="relative mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid gap-6 xl:grid-cols-[288px_minmax(0,1fr)]">
          <div className="hidden xl:block">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pb-2">
              <AdminSidebar
                items={TABS}
                active={tab}
                onSelect={setTab}
                userEmail={user?.email}
                onChangePassword={() => setShowChangePassword(true)}
                onLogout={() => void handleLogout()}
                className="h-auto"
              />
            </div>
          </div>

          <main className="min-w-0 space-y-6">
            <div className="flex items-center justify-between xl:hidden">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-teal/10 bg-white px-4 py-2 text-sm font-semibold text-teal-deep shadow-sm"
              >
                <Menu className="h-4 w-4" />
                Bölümler
              </button>
              <div className="rounded-full border border-teal/10 bg-white px-4 py-2 text-xs font-semibold text-teal/60 shadow-sm">
                {activeTab.label}
              </div>
            </div>

            <AdminPageHeader
              eyebrow="Çalışma Alanı"
              title={activeTab.label}
              description={activeTab.description}
              extra={
                <div className="flex flex-wrap gap-2">
                  {QUICK_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.title}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-teal/12 bg-foam/60 px-3 py-1.5 text-[12px] font-semibold text-teal-deep transition hover:bg-foam"
                      >
                        <Icon className="h-3.5 w-3.5 text-orange" />
                        {link.title}
                      </a>
                    );
                  })}
                </div>
              }
              actions={
                <div className="hidden items-center gap-2 xl:flex">
                  {user?.email && (
                    <span className="hidden max-w-[200px] truncate text-[12px] font-medium text-teal/55 2xl:inline">
                      {user.email}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-teal/15 bg-white px-3 py-1.5 text-[12px] font-semibold text-teal-deep transition hover:bg-foam"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Şifre
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-teal-deep px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-teal"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Çıkış
                  </button>
                </div>
              }
            />

            <div key={tab} className={cn("animate-fadeUp")}>
              {renderPanel(activeTab)}
            </div>
          </main>
        </div>
      </div>

      <MobileSidebar
        open={mobileNavOpen}
        active={tab}
        onSelect={setTab}
        onClose={() => setMobileNavOpen(false)}
        userEmail={user?.email}
        onChangePassword={() => setShowChangePassword(true)}
        onLogout={() => void handleLogout()}
      />

      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </div>
  );
}
