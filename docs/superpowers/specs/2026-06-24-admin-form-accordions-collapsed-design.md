# Admin Panel: Forms in Collapsed-by-Default Accordion Cards

**Date:** 2026-06-24
**Status:** Approved (design)

## Goal

Every entry form in the admin panel must sit inside an accordion card within its
section, and the accordion must be **collapsed by default**. When a user starts
editing an existing record, the form's accordion auto-expands.

## Current State

- `AdminCollapsible` (the accordion component) already exists in
  `src/pages/admin/admin-ui.tsx` and defaults to `defaultOpen = true`.
- Form-bearing panels:
  - **BlogPanel** (`src/pages/admin/BlogPanel.tsx:223`) — form wrapped in
    `AdminCollapsible`, opens by default. Has edit mode (`editId`).
  - **GalleryPanel** (`src/pages/admin/GalleryPanel.tsx:142`) — form wrapped in
    `AdminCollapsible`, opens by default. Has edit mode (`editId`).
  - **RevisionsPanel** (`src/pages/admin/RevisionsPanel.tsx:138`) — form wrapped
    in `AdminCollapsible`, opens by default. No edit mode.
  - **ReviewsPanel** (`src/pages/admin/ReviewsPanel.tsx:318,338,368`) — three
    form accordions, already `defaultOpen={false}`. No change.
- Non-form panels (no entry form, manage/read views only): ReservationsPanel,
  GuidePanel, StatusReportPanel, UpdatesPanel. No change.

## Design

### Component change — `AdminCollapsible` (`admin-ui.tsx`)

Keep `defaultOpen` (default `true`, unchanged for backward compatibility). Add an
optional `forceOpenSignal?: unknown` prop. A `useEffect` watches it; whenever it
changes to a truthy value, the accordion calls `setOpen(true)`. The user can
still collapse it manually afterward — the component remains uncontrolled, the
signal only nudges it open.

This supports "collapsed by default" and "auto-open on edit" without converting
the component to fully controlled.

### Per-panel edits

- **RevisionsPanel** `:138` — add `defaultOpen={false}`.
- **BlogPanel** `:223` — add `defaultOpen={false}` and `forceOpenSignal={editId}`.
  `editId` becomes the post id on edit, so the accordion auto-opens.
- **GalleryPanel** `:142` — add `defaultOpen={false}` and
  `forceOpenSignal={editId}`. Same edit behavior.
- **ReviewsPanel** — no change (already collapsed).

## Edge Cases

- **Edit auto-open:** In Blog/Gallery, clicking "edit" sets `editId` to a record
  id, which flips `forceOpenSignal` truthy and expands the form. New-record flow
  keeps `editId` undefined → accordion stays collapsed.
- **Manual collapse after edit:** Still possible — the signal only opens; it does
  not lock the accordion open.

## Testing

Manual verification in the admin panel:
1. Open Blog, Gallery, Revisions sections → form accordion is collapsed.
2. Click a list item's "edit" in Blog and Gallery → form accordion expands and is
   populated.
3. Reviews section forms remain collapsed (unchanged).

## Out of Scope

- No changes to non-form panels (Reservations, Guide, Status, Updates).
- No restyling of the accordion visuals.
