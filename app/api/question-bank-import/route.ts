import { NextResponse } from 'next/server'
import JSZip from 'jszip'

type ImportedQuestion = {
  subject: string
  topic: string
  difficulty: 'baja' | 'media' | 'alta'
  type: 'multiple-choice' | 'true-false'
  question: string
  options: string[]
  answer: number
  explanation?: string
  tags?: string[]
}

function parseCsvText(text: string) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return lines
}

function tryParseStructuredText(text: string, subject: string, topic: string): ImportedQuestion[] {
  const blocks = text
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean)

  const questions: ImportedQuestion[] = []

  for (const block of blocks) {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)

    const questionLine = lines.find((line) => /^q[:\-]/i.test(line))
    const a = lines.find((line) => /^a[:\-]/i.test(line))
    const b = lines.find((line) => /^b[:\-]/i.test(line))
    const c = lines.find((line) => /^c[:\-]/i.test(line))
    const d = lines.find((line) => /^d[:\-]/i.test(line))
    const correct = lines.find((line) => /^(correct|respuesta|answer)[:\-]/i.test(line))
    const explanation = lines.find((line) => /^(explicacion|explanation)[:\-]/i.test(line))

    if (!questionLine || !a || !b || !c || !d || !correct) continue

    const correctRaw = correct.split(/[:\-]/).slice(1).join(':').trim().toUpperCase()
    const letterMap: Record<string, number> = {
      A: 0,
      B: 1,
      C: 2,
      D: 3,
    }

    if (!(correctRaw in letterMap)) continue

    questions.push({
      subject,
      topic,
      difficulty: 'media',
      type: 'multiple-choice',
      question: questionLine.split(/[:\-]/).slice(1).join(':').trim(),
      options: [
        a.split(/[:\-]/).slice(1).join(':').trim(),
        b.split(/[:\-]/).slice(1).join(':').trim(),
        c.split(/[:\-]/).slice(1).join(':').trim(),
        d.split(/[:\-]/).slice(1).join(':').trim(),
      ],
      answer: letterMap[correctRaw],
      explanation: explanation
        ? explanation.split(/[:\-]/).slice(1).join(':').trim()
        : '',
      tags: [],
    })
  }

  return questions
}

function tryParseJsonText(text: string, subject: string, topic: string): ImportedQuestion[] {
  try {
    const parsed = JSON.parse(text)

    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item) => item?.question && Array.isArray(item?.options))
      .map((item) => ({
        subject,
        topic,
        difficulty: item.difficulty || 'media',
        type: item.type || 'multiple-choice',
        question: String(item.question),
        options: item.options.map((x: unknown) => String(x)),
        answer:
          typeof item.answer === 'number'
            ? item.answer
            : typeof item.answerIndex === 'number'
            ? item.answerIndex
            : 0,
        explanation: item.explanation ? String(item.explanation) : '',
        tags: Array.isArray(item.tags) ? item.tags.map((x: unknown) => String(x)) : [],
      }))
  } catch {
    return []
  }
}

async function extractTextFromZip(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const texts: string[] = []

  const entries = Object.values(zip.files)

  for (const entry of entries) {
    if (entry.dir) continue

    const name = entry.name.toLowerCase()

    if (
      name.endsWith('.txt') ||
      name.endsWith('.md') ||
      name.endsWith('.csv') ||
      name.endsWith('.json')
    ) {
      const content = await entry.async('string')
      texts.push(content)
    }
  }

  return texts
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const subject = String(formData.get('subject') || '').trim()
    const topic = String(formData.get('topic') || '').trim() || 'General'
    const files = formData.getAll('files').filter(Boolean) as File[]

    if (!subject) {
      return NextResponse.json(
        { error: 'Falta la asignatura' },
        { status: 400 }
      )
    }

    if (!files.length) {
      return NextResponse.json(
        { error: 'Debes subir al menos un archivo' },
        { status: 400 }
      )
    }

    let collectedQuestions: ImportedQuestion[] = []

    for (const file of files) {
      const name = file.name.toLowerCase()

      if (name.endsWith('.zip')) {
        const texts = await extractTextFromZip(file)

        for (const text of texts) {
          const parsedJson = tryParseJsonText(text, subject, topic)
          const parsedStructured = tryParseStructuredText(text, subject, topic)
          collectedQuestions.push(...parsedJson, ...parsedStructured)
        }

        continue
      }

      if (
        name.endsWith('.txt') ||
        name.endsWith('.md') ||
        name.endsWith('.csv') ||
        name.endsWith('.json')
      ) {
        const text = await file.text()
        const parsedJson = tryParseJsonText(text, subject, topic)
        const parsedStructured = tryParseStructuredText(text, subject, topic)
        collectedQuestions.push(...parsedJson, ...parsedStructured)
      }
    }

    const deduped = collectedQuestions.filter(
      (item, index, arr) =>
        arr.findIndex(
          (q) =>
            q.question.trim().toLowerCase() ===
            item.question.trim().toLowerCase()
        ) === index
    )

    return NextResponse.json({
      ok: true,
      questions: deduped,
      total: deduped.length,
    })
  } catch (error) {
    console.error('QUESTION BANK IMPORT ERROR:', error)
    return NextResponse.json(
      { error: 'No se pudieron procesar los archivos' },
      { status: 500 }
    )
  }
}