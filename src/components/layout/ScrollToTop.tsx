import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Floating "scroll to top" button, sits just above the WhatsApp FAB. Brand
 * orange with a white arrow; fades in after the user scrolls down.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Yukarı çık"
      className={`fixed bottom-[5.5rem] right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-orange text-white shadow-[0_10px_30px_rgba(241,110,11,0.45)] ring-1 ring-white/30 transition-all duration-300 hover:scale-110 hover:bg-orange-soft ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="h-6 w-6" strokeWidth={2.75} />
    </button>
  );
}
