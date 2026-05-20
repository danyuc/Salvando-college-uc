# Psicología - Implementation Report

## Resumen

Se integró una arquitectura de práctica para Psicología bajo `/practica/psicologia`, usando únicamente material ya presente en el repositorio:

- `docs/psicologia/clases/clase-4-memoria.md`
- `docs/psicologia/clases/clase-5-aprendizaje.md`
- `docs/psicologia/clases/clase-6-razonamiento-inteligencia.md`
- `docs/psicologia/clases/clase-7-lenguaje.md`
- `lib/psychology/questions.seed.ts`
- `lib/psychology/classes.ts`
- `lib/psychology/authors.ts`
- `lib/psychology-practice-data.ts`

No se agregó contenido académico externo. La meta de 200 preguntas no se completa porque no hay fuente suficiente para crear 50 preguntas sólidas por clase sin inventar contenido.

## Archivos creados

- `lib/psychology/concepts.ts`
- `lib/psychology/subtopics.ts`
- `lib/psychology/questions.ts`
- `lib/psychology/simulations.ts`
- `lib/psychology/diagnostics.ts`
- `lib/psychology/index.ts`
- `lib/psychology-ui-data.ts`

## Archivos modificados

- `lib/psychology/schema.ts`
- `app/components/psychology/PsychologyPracticeClient.tsx`
- `app/practica/psicologia/page.tsx`

## Conteo final de preguntas

Total: 110.

Por clase:

- Clase 4 - Memoria: 28.
- Clase 5 - Aprendizaje: 32.
- Clase 6 - Razonamiento e Inteligencia: 22.
- Clase 7 - Lenguaje: 28.

Por autor:

- Gray: 38.
- Baddeley: 7.
- Bartlett: 1.
- Dupuy: 0.
- Pavlov: 24.
- Watson: 3.
- Skinner: 27.
- Thorndike: 1.
- Duncker: 1.
- Galton: 1.
- Binet: 1.
- Wechsler: 1.
- Spearman: 1.
- Cattell: 3.
- Feldman: 1.
- Chomsky: 3.
- Sapir-Whorf: 3.

Por tipo:

- multiple_choice: 54.
- short_development: 12.
- application_case: 37.
- integrative_question: 7.

Por dificultad:

- baja: 20.
- media: 59.
- alta: 31.

Por habilidad cognitiva:

- recordar: 11.
- comprender: 33.
- aplicar: 30.
- analizar: 18.
- comparar: 10.
- interpretar: 8.

## Simulaciones creadas

- `diagnostic-general`
- `prueba-tipo-1`
- `prueba-tipo-2`
- `prueba-mixta`

## Reglas diagnósticas creadas

- `modelo-modal`
- `baddeley`
- `memoria-constructiva`
- `falsas-memorias`
- `amnesias`
- `ei-ri-ec-rc`
- `refuerzo-castigo`
- `programas-reforzamiento`
- `induccion-deduccion`
- `sesgos-razonamiento`
- `insight-vela`
- `fluida-cristalizada`
- `fonologia-sintaxis-semantica`
- `adquisicion-lenguaje`
- `sapir-whorf`

## Fuentes faltantes

No se alcanza la cantidad por falta de fuente en las cuatro clases:

- Clase 4 requiere 22 preguntas adicionales para llegar a 50.
- Clase 5 requiere 18 preguntas adicionales para llegar a 50.
- Clase 6 requiere 28 preguntas adicionales para llegar a 50.
- Clase 7 requiere 22 preguntas adicionales para llegar a 50.

Autores que no alcanzan la cobertura objetivo: Baddeley, Watson, Thorndike, Galton, Binet, Wechsler, Spearman, Cattell, Gray, Feldman, Chomsky y Sapir-Whorf. Requiere más fuente o mayor granularidad de apuntes antes de crear preguntas adicionales.

## QA checklist

- IDs únicos: revisado por deduplicación en `lib/psychology/questions.ts`.
- Prompts únicos: revisado por deduplicación normalizada.
- Todas las preguntas tienen `sourceRefs`.
- Las preguntas de alternativas/caso tienen 4 opciones desde el banco legado o seed.
- Desarrollo/aplicación/integración incluyen `expectedAnswer` y `gradingCriteria` cuando corresponde.
- LocalStorage: `psychology-practice-progress-v1`.
- Build result: `npm run build` OK.
- Lint result: targeted ESLint OK; `app/globals.css` fue ignorado por la configuración de ESLint.
