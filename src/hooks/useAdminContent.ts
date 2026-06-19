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

export interface ReviewRow {
  id: string;
  author: string;
  rating: number;
  body: string;
  source_label: string | null;
  status: ReviewStatus;
  sort_order: number;
  created_at: string;
}

export interface ReviewInput {
  author: string;
  rating: number;
  body: string;
  source_label: string | null;
  status: ReviewStatus;
  sort_order: number;
}

export async function fetchReviews(): Promise<ReviewRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ReviewRow[];
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

/** Bulk-inserts parsed reviews (admin "Toplu Ekle"). Published by default; sort_order filled by index. */
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
  }));
  const { error } = await supabase.from("reviews").insert(payload);
  if (error) throw new Error(error.message);
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
