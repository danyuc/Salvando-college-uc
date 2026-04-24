export type ParsedStudyContent = {
  title: string
  cleanText: string
  summary: string
  detectedTopics: string[]
  keyIdeas: string[]
  keyConcepts: string[] // 👈 compatibilidad
  estimatedLevel: 'básico' | 'medio' | 'alto'
  wordCount: number
}

function cleanText(text: string) {
  return text
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function getWordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length
}

function detectTopics(text: string) {
  const lower = text.toLowerCase()

  const candidates = [
    'memoria',
    'aprendizaje',
    'condicionamiento',
    'atención',
    'percepción',
    'razonamiento',
    'inteligencia',
    'lenguaje',
    'democracia',
    'guerra fría',
    'modernidad',
    'contaminación',
    'pm2.5',
    'justicia ambiental',
    'desigualdad',
    'funciones',
    'trigonometría',
    'polinomios',
  ]

  return candidates.filter((topic) => lower.includes(topic)).slice(0, 10)
}

function extractKeyIdeas(text: string) {
  const sentences = text
    .split(/[.!?]\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 40)

  return sentences.slice(0, 8)
}

function estimateLevel(wordCount: number): 'básico' | 'medio' | 'alto' {
  if (wordCount < 500) return 'básico'
  if (wordCount < 1800) return 'medio'
  return 'alto'
}

function inferTitle(text: string) {
  const firstLine = text
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 5 && line.length < 120)

  return firstLine || 'Material de estudio'
}

function buildSummary(clean: string, keyIdeas: string[]) {
  if (keyIdeas.length > 0) {
    return keyIdeas.slice(0, 4).join('. ') + '.'
  }

  return clean.slice(0, 600) || 'Sin resumen generado.'
}

function extractConcepts(text: string) {
  const words = text
    .toLowerCase()
    .replace(/[^\wáéíóúñ\s]/g, '')
    .split(/\s+/)

  const stopwords = ['el', 'la', 'los', 'las', 'de', 'y', 'en', 'un', 'una']
  
  const freq: Record<string, number> = {}

  for (const w of words) {
    if (w.length < 4 || stopwords.includes(w)) continue
    freq[w] = (freq[w] || 0) + 1
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
}

export function parseStudyContent(rawText: string): ParsedStudyContent {
  const clean = cleanText(rawText || '')
  const wordCount = getWordCount(clean)
  const keyIdeas = extractKeyIdeas(clean)
  const keyConcepts = extractConcepts(clean)

  return {
    title: inferTitle(clean),
    cleanText: clean,
    summary: buildSummary(clean, keyIdeas),
    detectedTopics: detectTopics(clean),
    keyIdeas,
    keyConcepts, // 👈 ahora sí existe
    estimatedLevel: estimateLevel(wordCount),
    wordCount,
  }
}