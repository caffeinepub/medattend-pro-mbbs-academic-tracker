# Specification

## Summary
**Goal:** Make Community Medicine fully visible and functional across all sections of the app (Dashboard, Today's Schedule, Add Class, Records, and Analytics).

**Planned changes:**
- Add `Community Medicine` as a valid literal to the `Subject` type union in `models.ts` so it can be stored and retrieved without type errors
- Register Community Medicine as a distinct subject in `subjects.ts` with the same class types (Theory, Practical) and threshold mappings as other subjects
- Add a `SubjectStatsCard` for Community Medicine on the Dashboard page alongside Anatomy, Physiology, and Biochemistry
- Ensure Community Medicine timetable entries appear in `TodaySchedule` with Present/Absent action buttons
- Add Community Medicine as a selectable subject in the Add Class form (`AddClassPage.tsx`)
- Add Community Medicine as a filter option in the Records page
- Include Community Medicine in the per-subject attendance breakdown on the Analytics page

**User-visible outcome:** Community Medicine appears as a fully functional subject throughout the app — users can view its attendance stats on the Dashboard, mark attendance from Today's Schedule and Add Class, filter its records, and see it in Analytics charts.
