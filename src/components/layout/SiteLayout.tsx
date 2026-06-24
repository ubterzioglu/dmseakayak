import { Outlet, useParams, Navigate } from "react-router-dom";
import { BASE_PATH, DEFAULT_LOCALE, isLocale } from "@/lib/site";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsappFab } from "./WhatsappFab";
import { ScrollToTop } from "./ScrollToTop";

/** Shell for all localized pages. Guards the :lang segment. */
export function SiteLayout() {
  const { lang } = useParams();
  if (!isLocale(lang)) return <Navigate to={`${BASE_PATH}/${DEFAULT_LOCALE}`} replace />;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <WhatsappFab />
    </div>
  );
}
