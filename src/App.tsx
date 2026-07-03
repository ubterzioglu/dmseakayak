import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { BASE_PATH, DEFAULT_LOCALE } from "@/lib/site";
import { SEG } from "@/lib/routes";
import { SiteLayout } from "@/components/layout/SiteLayout";
import Home from "@/pages/Home";

// Home is eager (first paint); the rest are split into their own chunks.
const Tours = lazy(() => import("@/pages/Tours"));
const TourDetail = lazy(() => import("@/pages/TourDetail"));
const CustomTours = lazy(() => import("@/pages/CustomTours"));
const TrakExperience = lazy(() => import("@/pages/TrakExperience"));
const About = lazy(() => import("@/pages/About"));
const Reviews = lazy(() => import("@/pages/Reviews"));
const Contact = lazy(() => import("@/pages/Contact"));
const Faq = lazy(() => import("@/pages/Faq"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdminPage = lazy(() => import("@/pages/admin/AdminPage"));
const ComingSoon = lazy(() => import("@/pages/ComingSoon"));

function PageFallback() {
  return <div className="flex min-h-[40vh] items-center justify-center text-teal">…</div>;
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Admin stays at the public root. */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Real site is staged under BASE_PATH (/mvp) until launch. To go live,
            set BASE_PATH to "" in lib/site.ts — router and links follow. */}
        <Route path={BASE_PATH} element={<Navigate to={`${BASE_PATH}/${DEFAULT_LOCALE}`} replace />} />

        <Route path={`${BASE_PATH}/:lang`} element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path={SEG.tours} element={<Tours />} />
          <Route path={`${SEG.tours}/:slug`} element={<TourDetail />} />
          <Route path={SEG.customTours} element={<CustomTours />} />
          <Route path={SEG.trak} element={<TrakExperience />} />
          <Route path={SEG.about} element={<About />} />
          <Route path={SEG.reviews} element={<Reviews />} />
          <Route path={SEG.contact} element={<Contact />} />
          <Route path={SEG.faq} element={<Faq />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Root and every unknown path show the Coming Soon placeholder. */}
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </Suspense>
  );
}
