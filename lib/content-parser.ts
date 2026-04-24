export type ParsedStudyContent = {
  title: string
  cleanText: string
  detectedTopics: string[]
  keyIdeas: string[]
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
    'condicionamiento clásico',
    'condicionamiento operante',
    'refuerzo',
    'castigo',
    'atención',
    'percepción',
    'democracia',
    'guerra fría',
    'modernidad',
    'eurocentrismo',
    'contaminación atmosférica',
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

export function parseStudyContent(rawText: string): ParsedStudyContent {
  const clean = cleanText(rawText || '')
  const wordCount = getWordCount(clean)

  return {
    title: inferTitle(clean),
    cleanText: clean,
    detectedTopics: detectTopics(clean),
    keyIdeas: extractKeyIdeas(clean),
    estimatedLevel: estimateLevel(wordCount),
    wordCount,
  }
}
