-- The "osi-2" Genel Durum Raporu item (Kekova Klasik için 3 fotoğraf / Kekova
-- Gulet turunun fotoğrafları) was removed from src/pages/admin/GeneralStatusReport.tsx.
-- Its topic key is retired per the "never reuse a retired topic key" convention
-- (see that file's header comment). Clean up the now-orphaned thread so it
-- doesn't linger as an unreachable row in report_comments.

delete from public.report_comments where topic = 'osi-2';
