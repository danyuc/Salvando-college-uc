import { PSYCHOLOGY_CLASSES } from "./classes";
import type { PsychologySimulation } from "./schema";

const allClassIds = PSYCHOLOGY_CLASSES.map((item) => item.id);

export const PSYCHOLOGY_SIMULATIONS: PsychologySimulation[] = [
  {
    id: "diagnostic-general",
    title: "Diagnóstico general",
    description: "Muestra balanceada por clase para detectar debilidades por etiquetas, autores y subtemas.",
    classIds: allClassIds,
    questionCount: 24,
    difficultyDistribution: { baja: 8, media: 10, alta: 6 },
    typeDistribution: { multiple_choice: 12, application_case: 6, short_development: 4, integrative_question: 2 },
    suggestedMinutes: 35,
    rules: ["Sin IDs repetidos.", "Balancear por clase cuando exista banco suficiente.", "Corregir desarrollo con pauta."],
    selectionStrategy: "Round-robin por clase, luego por dificultad y tipo.",
    sourcePolicy: "Solo preguntas con sourceRefs existentes; si falta cobertura, reducir cantidad.",
  },
  {
    id: "prueba-tipo-1",
    title: "Prueba tipo 1",
    description: "Práctica mixta universitaria con énfasis en alternativas y desarrollo corto.",
    classIds: allClassIds,
    questionCount: 20,
    difficultyDistribution: { baja: 4, media: 10, alta: 6 },
    typeDistribution: { multiple_choice: 10, application_case: 4, short_development: 4, integrative_question: 2 },
    suggestedMinutes: 45,
    rules: ["No mostrar respuestas hasta corregir.", "Incluir todas las clases si hay preguntas disponibles."],
    selectionStrategy: "Priorizar conceptos de alta probabilidad de evaluación.",
    sourcePolicy: "Basada en clases, textos y cuaderno declarados en sourceRefs.",
  },
  {
    id: "prueba-tipo-2",
    title: "Prueba tipo 2",
    description: "Simulación con mayor proporción de casos aplicados e integrativos si el banco lo permite.",
    classIds: allClassIds,
    questionCount: 20,
    difficultyDistribution: { baja: 2, media: 8, alta: 10 },
    typeDistribution: { multiple_choice: 6, application_case: 6, short_development: 4, integrative_question: 4 },
    suggestedMinutes: 55,
    rules: ["Al menos 30% aplicación si existe cobertura.", "Al menos 20% integrativa si existe cobertura."],
    selectionStrategy: "Seleccionar primero application_case e integrative_question sin duplicar IDs.",
    sourcePolicy: "No completar con contenido externo; mostrar falta fuente si no alcanza.",
  },
  {
    id: "prueba-mixta",
    title: "Prueba mixta",
    description: "Todas las clases, tipos y dificultades en una sesión de práctica integradora.",
    classIds: allClassIds,
    questionCount: 20,
    difficultyDistribution: { baja: 5, media: 9, alta: 6 },
    typeDistribution: { multiple_choice: 8, application_case: 6, short_development: 4, integrative_question: 2 },
    suggestedMinutes: 50,
    rules: ["Mezclar clases.", "Mezclar dificultad.", "Registrar debilidades para ruta recomendada."],
    selectionStrategy: "Barajar por semilla local y completar cupos por clase.",
    sourcePolicy: "Usa únicamente preguntas con fuente declarada.",
  },
];
