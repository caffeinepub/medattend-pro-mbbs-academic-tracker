# Specification

## Summary
**Goal:** Resolve the app’s “Initializing…” startup hang by making IndexedDB initialization robust with clear success/error outcomes, and improve “Today’s Schedule” by grouping consecutive classes into a single, manageable display.

**Planned changes:**
- Update the IndexedDB initialization flow to always завершить with either a ready state (route UI renders) or a dedicated error UI, including handling blocked/upgrade/version-change scenarios and adding actionable console logging.
- Refine Today’s Schedule rendering to detect and group adjacent timetable entries that are consecutive periods of the same subject and type, showing a combined time range and period count.
- Add a clear interaction within grouped schedule items to view and mark attendance for each individual class occurrence (without introducing any day-wise bulk actions).

**User-visible outcome:** The app no longer gets stuck on “Initializing…”; it either loads normally or shows a clear error message explaining what’s wrong. In Today’s Schedule, consecutive same-subject/type periods appear as a single grouped item with a way to view and manage attendance per period inside the group.
