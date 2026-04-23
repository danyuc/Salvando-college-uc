export type PromptType =
  | 'summary'
  | 'practice'
  | 'chat'
  | 'exam'

type Context = {
  subject: string
  unit?: string
  topic?: string
  reading?: string
  mode?: string
}

export function getSubjectPrompt(
  type: PromptType,
  ctx: Context
) {
  const base = `
Actúa como un profesor experto nivel universitario (UC).
Asignatura: ${ctx.subject}
Unidad: ${ctx.unit || 'General'}
Tema: ${ctx.topic || 'General'}
Lectura: ${ctx.reading || 'No especificada'}

NO inventes información fuera del contenido entregado.
Responde de forma clara, profunda y útil para estudiar.
`

  const subjectSpecific = getSubjectStyle(ctx.subject)

  if (type === 'summary') {
    return `
${base}

${subjectSpecific}

Quiero:

1. Idea central
2. Conceptos clave
3. Explicación detallada
4. Relaciones importantes
5. Qué podría entrar en la prueba
6. Cómo estudiarlo correctamente

Modo: ${ctx.mode || 'normal'}
`
  }

  if (type === 'practice') {
    return `
${base}

${subjectSpecific}

Genera preguntas tipo prueba UC:
- alternativas difíciles
- con distractores realistas
- mezcla teoría + aplicación
`
  }

  if (type === 'exam') {
    return `
${base}

${subjectSpecific}

Simula una prueba real:
- nivel alto
- enfoque evaluativo
- sin pistas
`
  }

  return `
${base}

${subjectSpecific}

Responde como profesor exigente UC.
`
}

function getSubjectStyle(subject: string) {
  switch (subject) {
    case 'Seminario':
      return `
- No usar pensamiento blanco/negro
- Conectar autores entre sí
- Identificar tesis del texto
- Explicar continuidad vs ruptura
- Contextualizar históricamente
- Vincular con Chile y actualidad
`

    case 'Historia':
      return `
- Explicar contexto histórico
- Relacionar procesos
- Identificar causas y consecuencias
- Analizar impacto cultural y político
- Conectar con guerra fría, democracia, modernidad
`

    case 'Psicología':
      return `
- Definir conceptos con claridad
- Diferenciar conceptos similares
- Dar ejemplos reales
- Explicar aplicaciones
- Señalar errores comunes
`

    case 'Sociología':
      return `
- Analizar desde mirada sociológica
- Diferenciar sentido común vs análisis
- Relacionar con estructuras sociales
- Conectar con desigualdad y poder
`

    case 'Precálculo':
      return `
- Explicar paso a paso
- Mostrar lógica matemática
- Incluir interpretación gráfica
- Señalar errores frecuentes
- Enfocar en resolución de ejercicios
`

    default:
      return `
- Explicar de forma clara y profunda
- Priorizar comprensión real
`
  }
}