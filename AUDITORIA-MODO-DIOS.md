# Auditoría Salvando College UC

## Ya existe
- Ranking: `RankingView`, `lib/scores.ts`
- Calendario/notas: `CalendarView`, `academic-calendar-data`
- Diagnóstico: `DiagnosticView`, motores diagnósticos
- Práctica: `PracticeView`, `PracticeEngine`
- Timer: `PracticeTimerPro`, `SmartTimer`
- Gráficos: `MathGraph`, `InteractiveGraphCanvas`, `graph-engine`
- IA/coach: `AIStudyChat`, `StudyCoachView`, `ai-coach`
- Supabase: auth, profiles, evaluations, attempts

## No duplicar
- No crear otro ranking
- No crear otro calendario
- No crear otro PracticeView paralelo
- No crear otro motor de notas
- No crear otro gráfico básico

## Lo que falta de verdad
1. Unificar PracticeView con motores existentes.
2. Usar `InteractiveGraphCanvas` o `MathGraph`, no gráficos básicos nuevos.
3. Usar `precalculo-tracking` y `precalculo-adaptive-model` como base IA.
4. Conectar `practice-attempts` con diagnóstico y debilidades.
5. Mejorar explicaciones matemáticas por tipo de ejercicio.
6. Crear tabla de signos visual real.
7. Crear animación algebraica real: mover término, cancelar, dividir.
8. Crear modo pre-prueba intensivo usando debilidades.
9. Crear revisión final tipo prueba UC.
10. Unificar timer real con modo UC.
11. Mostrar tips por trampa UC.
12. Agregar ejercicios de desarrollo y modelamiento reales.
13. Hacer feedback por error específico.
14. Conectar pizarra con práctica.
15. Conectar calendario con práctica recomendada.
16. Corregir pesos agrupados: Perusall, actividades seminario.
17. Agregar gestión de evaluaciones extra.
18. Mejorar UI de Home sin romper datos.
19. Mejorar UI de práctica sin tocar banco.
20. Crear capa “modo dios” encima, no otra app.

## Próximo paso correcto
Refactorizar `PracticeView.tsx` para usar:
- `MathLessonEngine`
- `MathGraph` / `InteractiveGraphCanvas`
- `precalculo-tracking`
- `precalculo-adaptive-model`
- `PracticeTimerPro`
- `mat1000-uc-real-engine`
