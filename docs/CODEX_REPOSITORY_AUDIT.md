# Codex Repository Audit - Salvando College UC

Date: 2026-05-20

## 1. Route Map

| Route | Page file | Main component | Main imports / data | Access / rendering |
| --- | --- | --- | --- | --- |
| `/` | `app/page.tsx` | `HomeView`, `PrivateSeminarioActivity`, `LogoutButton` | `lib/local-user`, `lib/supabase` | Protected by proxy; page is client-rendered and redirects to `/login` or `/onboarding` if needed. |
| `/login` | `app/login/page.tsx` | inline login UI | `ACCESS_CODES`, `ACCESS_STORAGE_KEYS`, `lib/local-user`, `lib/supabase` | Public. Access codes are handled in logic, not displayed as literal codes in UI. |
| `/practica` | `app/practica/page.tsx` | `PracticeView` | `SUBJECT_THEMES`, `hasUserDiagnostic`, legacy MAT1000 helpers retained but MAT1000 redirects out | Protected unless docencia-review cookie/session is present; `dynamic = "force-dynamic"`. |
| `/practica/psicologia` | `app/practica/psicologia/page.tsx` | `PsychologyPracticeClient` | `lib/psychology-ui-data`, `lib/psychology` authors | Protected unless docencia-review cookie/session is present. |
| `/precalculo-full` | `app/precalculo-full/page.tsx` | `PrecalculoFullClient` | `lib/precalculo-full-data`, `lib/precalculo-practice-data`, `lib/precalculo` adapter | Public by proxy; static route. |
| `/precalculo-pro` | `app/precalculo-pro/page.tsx` | inline pro practice page | `lib/precalculo-engine`, `PrecalculoVisual`, `PrecalculoSteps` | Protected by proxy; legacy/simple pro route. |
| `/ipre2` | `app/ipre2/page.tsx` | `Ipre2AccessGate`, `Ipre2Home` | `lib/ipre2` through child components | Public prefix by proxy; local access gate in component. |
| `/ipre2/sesion` | `app/ipre2/sesion/page.tsx` | `Ipre2AccessGate`, `Ipre2Session` | `lib/ipre2` | Public prefix by proxy; local access gate in component. |
| `/ipre2/camara` | `app/ipre2/camara/page.tsx` | `Ipre2AccessGate`, `Ipre2Camera` | `lib/ipre2` | Public prefix by proxy; local access gate in component. |
| `/cardenal-respira` | `app/cardenal-respira/page.tsx` | `CardenalRespiraPage` | `lib/cardenal-respira`, CRSH components | Public prefix by proxy; CRSH-only. |
| `/cardenal-respira/docentes` | `app/cardenal-respira/docentes/page.tsx` | `TeacherPanel` after local code gate | `ACCESS_STORAGE_KEYS`, `CARDENAL_RESPIRA_ACCESS_CODE` | Public prefix by proxy; local teacher gate. |
| `/cardenal-respira/presentacion` | `app/cardenal-respira/presentacion/page.tsx` | `CardenalPresentation` | CRSH presentation component | Public prefix by proxy. |
| `/lab-ambiental` | `app/lab-ambiental/page.tsx` | `LabDashboard` | lab components and route data | Public prefix by proxy; existing local docente flow preserved. |

## 2. Active File Map

Active application shell:
- `app/layout.tsx` imports and wraps all non-fullscreen routes in `app/components/AppShell.tsx`.
- `app/components/AppShell.tsx` defines the real sidebar nav items and active/inactive link classes.
- `app/globals.css` contains the scoped `[data-app-sidebar]` contrast rules.

Active practice:
- `app/practica/page.tsx` -> `app/components/PracticeView.tsx`.
- Subject colors/names come from `lib/academic-calendar-data.ts`.
- Diagnostic completion comes from `lib/user-diagnostics.ts`.

Active Psychology:
- `app/practica/psicologia/page.tsx` -> `app/components/psychology/PsychologyPracticeClient.tsx`.
- UI adapter: `lib/psychology-ui-data.ts`.
- Source-backed bank exports: `lib/psychology/index.ts`.
- Source data: `lib/psychology/classes.ts`, `authors.ts`, `concepts.ts`, `subtopics.ts`, `questions.ts`, `questions.seed.ts`, `diagnostics.ts`, `simulations.ts`.
- Legacy converted source: `lib/psychology-practice-data.ts`.
- Source docs kept: `docs/psicologia/clases/*.md`.

Active Pre Calculo:
- `app/precalculo-full/page.tsx` -> `app/components/precalculo/PrecalculoFullClient.tsx`.
- Local UI data: `lib/precalculo-full-data.ts`, `lib/precalculo-practice-data.ts`.
- MAT1000 bank adapter: `lib/precalculo/index.ts`.
- Source of truth bank: `lib/pre-calculo/precalculo-past-exams.ts`, `precalculo-uc-patterns.ts`, `precalculo-generated-variants.ts`, `precalculo-simulations.ts`, `precalculo-types.ts`.

## 3. `/practica` Dependency Map

`/practica` renders `PracticeView` directly. The active subject selector is in `PracticeView`, not a separate config file. It now lists exactly:
- Seminario (`CLG0000`)
- Historia (`IHI0204`)
- Sociologia (`SOL500`)
- Psicologia (`PSI1101`)

MAT1000 is no longer selectable in generic practice. If `subject=MAT1000` is present, the client redirects to `/precalculo-full`. If Psicologia is selected or requested through `subject=PSI1101`, the client routes to `/practica/psicologia`.

The old fake generic question fallback was active in `PracticeView`; it has been removed. Seminario, Historia and Sociologia now show: "Todavia no hay preguntas reales cargadas para esta asignatura."

The incorrect "Sociologia 1" behavior came from the generic diagnostic sentence mixing the default Sociology subject with the evaluation/module label. The active diagnostic card now uses only the selected subject name dynamically.

## 4. `/practica/psicologia` Dependency Map

`/practica/psicologia` renders `PsychologyPracticeClient`.

The 110-question active UI bank is:
- `lib/psychology-ui-data.ts` imports `SOURCE_QUESTIONS` from `./psychology`.
- `lib/psychology/index.ts` exports `questions.ts`.
- `lib/psychology/questions.ts` combines `PSYCHOLOGY_QUESTION_SEED` from `questions.seed.ts` with converted legacy questions from `lib/psychology-practice-data.ts`.

Question count verified with `npx tsx`: 110 total.
- clase-4-memoria: 28
- clase-5-aprendizaje: 32
- clase-6-razonamiento-inteligencia: 22
- clase-7-lenguaje: 28

Psychology UI imports and preserves source labels through `sourceRefs`. No new psychology questions or content banks were added.

## 5. `/precalculo-full` Dependency Map

`/precalculo-full` renders `PrecalculoFullClient`.

Active imports:
- `PRECALCULO_EXAMS`, `TUTOR_SUGGESTIONS` from `lib/precalculo-full-data.ts`.
- `PRECALCULO_DIAGNOSTIC_13`, `PRECALCULO_PRACTICE_QUESTIONS`, `shuffledDiagnosticQuestions` from `lib/precalculo-practice-data.ts`.
- `pastExamExercises`, `ucPatterns`, `ucVariants`, `simulationSources`, `globalMAT1000Analysis` from `lib/precalculo/index.ts`.

`lib/precalculo/index.ts` is a valid adapter that re-exports the MAT1000 source bank from `lib/pre-calculo`. Verified counts:
- past exam exercises: 255
- UC patterns: 19
- UC variants: 19
- topic ranking entries: 11
- pattern ranking entries: 19

## 6. Sidebar Dependency Map

`app/layout.tsx` imports `AppShell`; `AppShell.tsx` is the real sidebar source. `GlobalSidebar.tsx` exists but is not imported by the layout and is not the active sidebar.

Active styles:
- Tailwind classes in `AppShell.tsx`.
- Scoped global rules in `app/globals.css` under `[data-app-sidebar]`.

Previous sidebar fixes in `globals.css` were active because they were scoped to `[data-app-sidebar]`, but they were broader than necessary inside the sidebar. This pass tightened active/inactive link classes and narrowed the scoped global color overrides to nav links only.

## 7. Active Files

Changed active files:
- `app/components/PracticeView.tsx`
- `app/components/AppShell.tsx`
- `app/globals.css`
- `app/components/precalculo/PrecalculoFullClient.tsx`
- `app/components/psychology/PsychologyPracticeClient.tsx`
- `docs/CODEX_REPOSITORY_AUDIT.md`

## 8. Probably Unused Files

Need manual review before deletion:
- `app/components/GlobalSidebar.tsx`: not imported by layout, likely superseded by `AppShell`.
- Older MAT1000 engines under `lib/mat1000-*` and `lib/precalculo-*.ts`: some are active through `/precalculo-pro`, diagnostics, or legacy generic practice imports, so they were kept.
- `lib/psychology-practice-data.ts`: still used by `lib/psychology/questions.ts` as a legacy source conversion layer, so it is active data and must be kept.

## 9. Backup / Dead Files Found

Deleted as safe:
- `app/components/lab/LabDashboard.tsx.bak`
- `app/components/precalculo/PrecalculoFullClient.tsx.bak-fix-theme`
- `0`
- `Build`
- `FETCH_HEAD`
- `husky`
- `next`
- `salvando-college-uc@0.1.0`
- `et --hard HEAD~1`
- `tmp-next-3001.err.log`
- `tmp-next-3001.out.log`

No imports or source references were found for the deleted backup/debris files. Academic docs and academic banks were not deleted.

## 10. Files Safe To Delete

Already deleted:
- unimported `.bak` files
- empty accidental root files
- old temporary Next logs
- accidental root file containing prior `git log` output

No additional files are marked safe for automatic deletion in this pass.

## 11. Files Requiring Manual Confirmation

- `app/components/GlobalSidebar.tsx`: likely inactive, but keep until the user confirms there is no alternate entrypoint.
- `docs/codex/PROMPT_PRECALCULO_PSICOLOGIA_PREMIUM.md`: prompt/archive doc contains historical audit text and examples, not active UI.
- Legacy Pre Calculo helper files not imported by `/precalculo-full` may still support `/precalculo-pro` or `/diagnostico`; keep for now.

## 12. Previous Fixes: Active Or Inactive?

- The previous sidebar scoped CSS was active because `AppShell` uses `data-app-sidebar`.
- The prior Precalculo backup theme file was inactive: `app/components/precalculo/PrecalculoFullClient.tsx.bak-fix-theme` was not imported. It has been deleted.
- `app/components/ProMaxUCPanel.tsx` is imported by legacy generic `PracticeView`, but `/precalculo-full` does not use it. The old premium wording is not visible in `/precalculo-full`; only data property names such as `proMax` remain internal.

## 13. Fixes Applied In This Pass

- Generic `/practica` subject selector limited to four subjects.
- MAT1000 removed from generic selector and redirected to `/precalculo-full`.
- Psicologia selection routes to `/practica/psicologia`.
- Fake generic fallback questions removed.
- Diagnostic card rewritten with dynamic subject text and clear disabled reasons.
- Added separate `/practica` CTA to `/precalculo-full`.
- Sidebar inactive/active contrast fixed in the active `AppShell`.
- `/precalculo-full` tabs made horizontally scrollable and required labels clarified.
- `/precalculo-full` dark math background strengthened with grid and symbols.
- Psychology UI labels changed to Spanish sections and an Authors section added from existing `lib/psychology` data.
- Strict targeted lint issues in `PracticeView` cleaned without changing auth/CRSH/IPRE2/lab behavior.

## 14. Build Result

`npm run build`: passed.

Next.js emitted existing Recharts container warnings during static generation:
`The width(-1) and height(-1) of chart should be greater than 0...`

These warnings did not fail the build and were not introduced by the practice/sidebar/precalculo changes.

## 15. Lint Result

Targeted lint command passed:

`npx eslint app/components/AppShell.tsx app/components/PracticeView.tsx app/components/precalculo/PrecalculoFullClient.tsx app/components/psychology/PsychologyPracticeClient.tsx app/practica/psicologia/page.tsx lib/psychology lib/precalculo`

## 16. Route Smoke Test Result

Production server tested at `http://localhost:3002`.

HTTP 200 verified for:
- `/practica` with docencia-review cookie
- `/practica/psicologia` with docencia-review cookie
- `/precalculo-full`
- `/practica?subject=MAT1000&evaluation=I3` with docencia-review cookie
- `/ipre2/sesion`
- `/ipre2/camara`
- `/cardenal-respira`
- `/cardenal-respira/docentes`
- `/lab-ambiental?docente=1`
- `/login`

Without auth/docencia-review, `/practica` and `/practica/psicologia` correctly redirect to `/login`.

## 17. Remaining Risks

- Browser plugin runtime was not available as a callable tool in this session, so visual verification was done through production HTML/route smoke checks instead of an in-app browser screenshot.
- `/practica?subject=MAT1000&evaluation=I3` redirects on the client after hydration; raw HTML smoke tests cannot observe client-side navigation.
- Recharts width/height warnings remain elsewhere in the app.
- `PracticeView` still contains legacy MAT1000 code paths, but MAT1000 is now routed away from generic practice. A later cleanup can remove that legacy code once `/diagnostico` and `/precalculo-pro` dependencies are reviewed together.
