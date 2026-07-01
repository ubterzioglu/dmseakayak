import { supabase } from "@/lib/supabase";
import type { ParsedReview } from "@/lib/parseReviews";

/**
 * Admin content data layer for /admin: revision requests, blog posts, reviews,
 * and image uploads. All writes require an authenticated Supabase session (RLS
 * enforces this — see supabase/migrations/0002_admin_content.sql). Functions
 * return typed rows or throw, so the admin UI can surface errors.
 */

// ─── Revision requests ────────────────────────────────────────────────────────

export type RevisionStatus = "open" | "progress" | "done";

export interface RevisionRow {
  id: string;
  requester: string;
  body: string;
  urgency: number;
  status: RevisionStatus;
  created_at: string;
}

export interface RevisionInput {
  requester: string;
  body: string;
  urgency: number;
  status: RevisionStatus;
}

export async function fetchRevisions(): Promise<RevisionRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("revision_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as RevisionRow[];
}

export async function createRevision(input: RevisionInput): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { error } = await supabase.from("revision_requests").insert(input);
  if (error) throw new Error(error.message);
}

export async function updateRevisionStatus(id: string, status: RevisionStatus): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { error } = await supabase.from("revision_requests").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteRevision(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { error } = await supabase.from("revision_requests").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Revision comments ──────────────────────────────────────────────────────────

export interface RevisionCommentRow {
  id: string;
  revision_id: string;
  author: string;
  body: string;
  created_at: string;
}

/** Fetches comments for the given revision IDs, oldest first. */
export async function fetchRevisionComments(
  revisionIds: string[],
): Promise<RevisionCommentRow[]> {
  if (!supabase || !revisionIds.length) return [];
  const { data, error } = await supabase
    .from("revision_comments")
    .select("*")
    .in("revision_id", revisionIds)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as RevisionCommentRow[];
}

export async function addRevisionComment(
  revisionId: string,
  author: string,
  body: string,
): Promise<RevisionCommentRow> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { data, error } = await supabase
    .from("revision_comments")
    .insert({ revision_id: revisionId, author, body })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as RevisionCommentRow;
}

export async function deleteRevisionComment(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { error } = await supabase.from("revision_comments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Report comments ──────────────────────────────────────────────────────────
// Threaded comments under the static "Genel Durum Raporu" items. The items are
// hardcoded (not DB rows), so comments hang off a stable text `topic` key
// (e.g. "osi-1") instead of a foreign key. See migration 0007_report_comments.

export interface ReportCommentRow {
  id: string;
  topic: string;
  author: string;
  body: string;
  created_at: string;
}

/** Fetches comments for the given report topics, oldest first. */
export async function fetchReportComments(topics: string[]): Promise<ReportCommentRow[]> {
  if (!supabase || !topics.length) return [];
  const { data, error } = await supabase
    .from("report_comments")
    .select("*")
    .in("topic", topics)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ReportCommentRow[];
}

export async function addReportComment(
  topic: string,
  author: string,
  body: string,
): Promise<ReportCommentRow> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { data, error } = await supabase
    .from("report_comments")
    .insert({ topic, author, body })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ReportCommentRow;
}

export async function deleteReportComment(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { error } = await supabase.from("report_comments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Blog posts ───────────────────────────────────────────────────────────────

export interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  content_html: string;
  cover_image_url: string | null;
  excerpt: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPostInput {
  slug: string;
  title: string;
  content_html: string;
  cover_image_url: string | null;
  excerpt: string | null;
  published: boolean;
}

export async function fetchBlogPosts(): Promise<BlogPostRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as BlogPostRow[];
}

export async function saveBlogPost(input: BlogPostInput, id?: string): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const payload = { ...input, updated_at: new Date().toISOString() };
  const { error } = id
    ? await supabase.from("blog_posts").update(payload).eq("id", id)
    : await supabase.from("blog_posts").insert(payload);
  if (error) throw new Error(error.message);
}

export async function deleteBlogPost(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export type ReviewStatus = "published" | "archived";
export type ReviewLang = "tr" | "en" | "fr" | "ru";
export const REVIEW_LANGS: readonly ReviewLang[] = ["tr", "en", "fr", "ru"] as const;

export interface ReviewRow {
  id: string;
  author: string;
  rating: number;
  body: string;
  source_label: string | null;
  status: ReviewStatus;
  sort_order: number;
  source_lang: ReviewLang;
  external_id: string | null;
  review_date: string | null;
  author_country: string | null;
  created_at: string;
}

export interface ReviewInput {
  author: string;
  rating: number;
  body: string;
  source_label: string | null;
  status: ReviewStatus;
  sort_order: number;
  source_lang?: ReviewLang;
}

export interface ReviewTranslationRow {
  id: string;
  review_id: string;
  lang: ReviewLang;
  body: string;
  is_machine: boolean;
}

export async function fetchReviews(): Promise<ReviewRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  // DB rows predating migration 0004 (or inserted via paths that skipped the
  // column default) can have a null source_lang. The render layer assumes it is
  // always a valid ReviewLang, so normalize at the boundary instead of casting.
  return (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    source_lang: (r.source_lang ?? "en") as ReviewLang,
  })) as ReviewRow[];
}

export async function saveReview(input: ReviewInput, id?: string): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { error } = id
    ? await supabase.from("reviews").update(input).eq("id", id)
    : await supabase.from("reviews").insert(input);
  if (error) throw new Error(error.message);
}

export async function deleteReview(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Bulk-inserts parsed reviews (admin "Toplu Ekle"). Published by default;
 * sort_order filled by index. Rows carrying an external_id are upserted on that
 * key so re-importing the same Maps scrape never creates duplicates. The DB
 * insert trigger kicks off auto-translation for each new row.
 */
export async function insertReviews(rows: ParsedReview[]): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  if (!rows.length) return;
  const payload = rows.map((r, i) => ({
    author: r.author,
    rating: r.rating,
    body: r.body,
    source_label: r.source_label || "Google",
    status: "published" as ReviewStatus,
    sort_order: i,
    source_lang: (r.source_lang ?? "en") as ReviewLang,
    external_id: r.external_id ?? null,
  }));

  const withId = payload.filter((p) => p.external_id);
  const withoutId = payload.filter((p) => !p.external_id);

  if (withId.length) {
    const { error } = await supabase
      .from("reviews")
      .upsert(withId, { onConflict: "external_id", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  }
  if (withoutId.length) {
    const { error } = await supabase.from("reviews").insert(withoutId);
    if (error) throw new Error(error.message);
  }
}

// ─── Review translations ───────────────────────────────────────────────────────

/** Fetches translations for the given review IDs (admin per-language editing). */
export async function fetchReviewTranslations(
  reviewIds: string[],
): Promise<ReviewTranslationRow[]> {
  if (!supabase || !reviewIds.length) return [];
  const { data, error } = await supabase
    .from("review_translations")
    .select("id, review_id, lang, body, is_machine")
    .in("review_id", reviewIds);
  if (error) throw new Error(error.message);
  return (data ?? []) as ReviewTranslationRow[];
}

/** Saves an admin-edited translation (marks it is_machine=false so it is never overwritten). */
export async function saveReviewTranslation(
  reviewId: string,
  lang: ReviewLang,
  body: string,
): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { error } = await supabase.from("review_translations").upsert(
    {
      review_id: reviewId,
      lang,
      body,
      is_machine: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "review_id,lang" },
  );
  if (error) throw new Error(error.message);
}

export interface TranslateResult {
  ok: boolean;
  reviews: number;
  written: number;
  skipped: number;
  failed: number;
}

/**
 * Invokes the translate-review Edge Function. Pass review IDs to translate a
 * subset, or omit to translate every review (fills missing languages only).
 */
export async function triggerTranslateReviews(reviewIds?: string[]): Promise<TranslateResult> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  let ids = reviewIds;
  if (!ids) {
    const { data, error } = await supabase.from("reviews").select("id");
    if (error) throw new Error(error.message);
    ids = (data ?? []).map((r: { id: string }) => r.id);
  }
  if (!ids.length) return { ok: true, reviews: 0, written: 0, skipped: 0, failed: 0 };

  const { data, error } = await supabase.functions.invoke("translate-review", {
    body: { review_ids: ids },
  });
  if (error) throw new Error(error.message);
  return data as TranslateResult;
}

/**
 * Public-facing: published reviews with the body localized to `locale`.
 * Falls back to the original body when a translation is missing.
 */
export async function fetchPublishedReviewsLocalized(
  locale: ReviewLang,
): Promise<ReviewRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*, review_translations(lang, body)")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchPublishedReviewsLocalized:", error.message);
    return [];
  }
  type Joined = ReviewRow & { review_translations?: { lang: ReviewLang; body: string }[] };
  return ((data ?? []) as Joined[]).map(({ review_translations, ...rest }) => {
    const match = review_translations?.find((t) => t.lang === locale);
    return { ...rest, body: match?.body ?? rest.body };
  });
}

/** Public-facing: only published reviews, ordered for the homepage marquee. */
export async function fetchPublishedReviews(): Promise<ReviewRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchPublishedReviews:", error.message);
    return [];
  }
  return (data ?? []) as ReviewRow[];
}

// ─── Gallery images ─────────────────────────────────────────────────────────────

export interface GalleryRow {
  id: string;
  image_url: string;
  /** Turkish caption (default locale). */
  caption: string | null;
  /** Per-language captions; null falls back to the Turkish `caption`. */
  caption_en: string | null;
  caption_fr: string | null;
  caption_ru: string | null;
  alt: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
}

export interface GalleryInput {
  image_url: string;
  caption: string | null;
  caption_en: string | null;
  caption_fr: string | null;
  caption_ru: string | null;
  alt: string | null;
  published: boolean;
  sort_order: number;
}

export async function fetchGalleryImages(): Promise<GalleryRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as GalleryRow[];
}

export async function saveGalleryImage(input: GalleryInput, id?: string): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { error } = id
    ? await supabase.from("gallery_images").update(input).eq("id", id)
    : await supabase.from("gallery_images").insert(input);
  if (error) throw new Error(error.message);
}

export async function deleteGalleryImage(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Uploads an image to the gallery-images bucket and returns its public URL. */
export async function uploadGalleryImage(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `gallery/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("gallery-images").upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("gallery-images").getPublicUrl(path).data.publicUrl;
}

/** Public-facing: only published gallery images, ordered for the /galeri page. */
export async function fetchPublishedGallery(): Promise<GalleryRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchPublishedGallery:", error.message);
    return [];
  }
  return (data ?? []) as GalleryRow[];
}

// ─── Hero video ─────────────────────────────────────────────────────────────────
// Single active row: the homepage hero background video. Admin uploads a
// replacement; its row overwrites the previous one (see 0008_hero_video.sql).

export interface HeroVideoRow {
  id: string;
  video_url: string;
  updated_at: string;
}

/** Max upload size enforced client-side, matching the Supabase free plan's 50MB cap. */
export const HERO_VIDEO_MAX_BYTES = 50 * 1024 * 1024;

export async function fetchHeroVideo(): Promise<HeroVideoRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("hero_video").select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return (data as HeroVideoRow | null) ?? null;
}

/** Uploads a video to the hero-video bucket and returns its public URL. */
export async function uploadHeroVideo(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
  const path = `hero/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("hero-video").upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("hero-video").getPublicUrl(path).data.publicUrl;
}

/** Saves the active hero video row (updates the existing row if one exists). */
export async function saveHeroVideo(videoUrl: string, existingId?: string): Promise<void> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const payload = { video_url: videoUrl, updated_at: new Date().toISOString() };
  const { error } = existingId
    ? await supabase.from("hero_video").update(payload).eq("id", existingId)
    : await supabase.from("hero_video").insert(payload);
  if (error) throw new Error(error.message);
}

/**
 * Deletes a previously uploaded hero video file from storage. Best-effort:
 * failures are logged, not thrown, since the active row has already been
 * switched to the new video by the time this runs.
 */
export async function deleteHeroVideoFile(videoUrl: string): Promise<void> {
  if (!supabase) return;
  const marker = "/hero-video/";
  const idx = videoUrl.indexOf(marker);
  if (idx === -1) return;
  const path = videoUrl.slice(idx + marker.length);
  const { error } = await supabase.storage.from("hero-video").remove([path]);
  if (error) console.error("deleteHeroVideoFile:", error.message);
}

/** Public-facing: the active hero video URL, or null if none is configured / on error. */
export async function fetchActiveHeroVideoUrl(): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("hero_video").select("video_url").maybeSingle();
  if (error) {
    console.error("fetchActiveHeroVideoUrl:", error.message);
    return null;
  }
  return (data as { video_url: string } | null)?.video_url ?? null;
}

// ─── Image upload (blog-images bucket) ──────────────────────────────────────────

/** Uploads an image to the blog-images bucket and returns its public URL. */
export async function uploadBlogImage(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `posts/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("blog-images").upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("blog-images").getPublicUrl(path).data.publicUrl;
}

/** Turkish-aware slug generator for blog post URLs. */
export function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i",
  };
  return input
    .toLowerCase()
    .replace(/[çğıöşüİ]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
