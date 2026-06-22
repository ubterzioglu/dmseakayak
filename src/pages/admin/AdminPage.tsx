import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  AdminQuickLinkCard,
  AdminSidebar,
} from "./admin-ui";

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
    key: "revisions",
    label: "Revizyonlar",
    description: "İç ekip isteklerini öncelik ve statüyle düzenleyin.",
    icon: NotebookPen,
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
    accentClassName: "bg-sky-50 text-sky-700 border-sky-100",
  },
  {
    title: "WhatsApp Grubu",
    description: "Proje iletişimini hızlıca aynı yerden sürdürün.",
    href: "https://chat.whatsapp.com/JYC5ORJnbLnAFALiEEwX3G",
    icon: Phone,
    accentClassName: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
] as const;

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
    <div className="relative min-h-screen overflow-hidden bg-[#f6f3ee] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,110,11,0.14),transparent_26%),radial-gradient(circle_at_85%_15%,rgba(1,99,82,0.10),transparent_22%),linear-gradient(180deg,#f6f3ee_0%,#fbfaf7_100%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_480px]">
        <section className="rounded-[36px] border border-teal/10 bg-white/80 p-8 shadow-[0_32px_90px_rgba(4,43,37,0.08)] backdrop-blur sm:p-12">
          <div className="inline-flex rounded-full border border-orange/20 bg-orange/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-orange">
            Admin Workspace
          </div>
          <h1 className="mt-6 max-w-xl font-serif text-5xl leading-[0.92] text-teal-deep sm:text-6xl">
            Sade ama güçlü bir yönetim deneyimi.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-teal/62 sm:text-[15px]">
            Rezervasyonlar, içerik yönetimi ve ekip içi revizyon akışı tek bir rafine panelde.
            Mevcut işlevler korunur; odak, okunabilirlik ve hız artar.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { label: "8 bölüm", value: "Tam kapsam" },
              { label: "Canlı içerik", value: "Supabase bağlı" },
              { label: "Hızlı erişim", value: "Drive + Clarity" },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-teal/10 bg-foam/55 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal/45">
                  {item.label}
                </div>
                <div className="mt-2 text-lg font-semibold text-teal-deep">{item.value}</div>
              </div>
            ))}
          </div>
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
              <input
                id="adm-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-teal/12 bg-[#fcfbf8] px-4 py-3 text-base outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
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
}: {
  open: boolean;
  active: TabKey;
  onSelect: (key: TabKey) => void;
  onClose: () => void;
  userEmail?: string | null;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 lg:hidden"
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
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function renderPanel(tab: TabKey) {
  switch (tab) {
    case "guide":
      return <GuidePanel />;
    case "reservations":
      return <ReservationsPanel />;
    case "revisions":
      return <RevisionsPanel />;
    case "blog":
      return <BlogPanel />;
    case "gallery":
      return <GalleryPanel />;
    case "reviews":
      return <ReviewsPanel />;
    case "updates":
      return <UpdatesPanel />;
    case "status":
      return <StatusReportPanel />;
    default:
      return null;
  }
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("guide");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const adminClient = supabase;
    adminClient.auth.getSession().then(({ data }) => {
      const sessUser = data.session?.user ?? null;
      if (data.session && !isAdminEmail(sessUser?.email)) {
        void adminClient.auth.signOut();
        return;
      }
      setSession(data.session);
      setUser(sessUser);
    });
    const { data: sub } = adminClient.auth.onAuthStateChange((_event, sess) => {
      const sessUser = sess?.user ?? null;
      if (sess && !isAdminEmail(sessUser?.email)) {
        void adminClient.auth.signOut();
        setSession(null);
        setUser(null);
        return;
      }
      setSession(sess);
      setUser(sessUser);
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
      setLoginError(error.message);
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

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (!session) {
    return <AdminLogin onLogin={handleLogin} error={loginError} loading={loginLoading} />;
  }

  const todayLabel = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-[#f6f3ee]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,110,11,0.11),transparent_22%),radial-gradient(circle_at_80%_0%,rgba(1,99,82,0.08),transparent_26%),linear-gradient(180deg,#f6f3ee_0%,#fbfaf7_100%)]" />
      <div className="relative mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="hidden xl:block">
            <div className="sticky top-6 h-[calc(100vh-3rem)]">
              <AdminSidebar
                items={TABS}
                active={tab}
                onSelect={setTab}
                userEmail={user?.email}
                footer={
                  <div className="space-y-3">
                    <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal/45">
                      Quick Access
                    </div>
                    <div className="space-y-3">
                      {QUICK_LINKS.map((link) => (
                        <AdminQuickLinkCard key={link.title} {...link} />
                      ))}
                    </div>
                  </div>
                }
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
              actions={
                <>
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-teal/12 bg-white px-4 py-2.5 text-sm font-semibold text-teal-deep transition hover:bg-foam"
                  >
                    <KeyRound className="h-4 w-4" />
                    Şifre Değiştir
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="inline-flex items-center gap-2 rounded-full bg-teal-deep px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış
                  </button>
                </>
              }
              extra={
                <>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal/45">
                      Bugün
                    </div>
                    <div className="mt-2 font-serif text-2xl leading-none text-teal-deep">
                      {todayLabel}
                    </div>
                    <div className="mt-3 text-sm leading-6 text-teal/58">
                      Aktif alan: {activeTab.label}. Aynı route içinde hızlı geçiş korunur.
                    </div>
                  </div>
                  <div className="mt-5 space-y-2">
                    <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal/45">
                        Yetkili hesap
                      </div>
                      <div className="mt-1 break-all text-sm font-medium text-teal-deep">
                        {user?.email}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-teal/10 bg-white/65 px-4 py-3 text-sm text-teal/58">
                      Dış bağlantılar masaüstünde sol panelde, mobilde aşağıda yer alır.
                    </div>
                  </div>
                </>
              }
            />

            <div className="grid gap-4 md:grid-cols-3 xl:hidden">
              {QUICK_LINKS.map((link) => (
                <AdminQuickLinkCard key={link.title} {...link} actionLabel="Aç" />
              ))}
            </div>

            <div key={tab} className={cn("animate-fadeUp")}>
              {renderPanel(tab)}
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
      />

      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </div>
  );
}
