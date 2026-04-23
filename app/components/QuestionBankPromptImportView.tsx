'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  createBankQuestions,
  deleteQuestionBankItem,
  getAllQuestionBankItems,
  type BankQuestion,
} from '../../lib/question-bank'
import { SUBJECT_PRESETS, getSubjectColor, getSubjectTopics } from '../../lib/subjects'
import QuestionBankPromptImportView from './QuestionBankPromptImportView'

type DraftQuestion = {
  subject: string
  topic: string
  difficulty: string
  type: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  answerIndex: string
  explanation: string
  tags: string
}

const emptyDraft: DraftQuestion = {
  subject: '',
  topic: '',
  difficulty: 'media',
  type: 'multiple-choice',
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  answerIndex: '0',
  explanation: '',
  tags: '',
}

export default function QuestionBankView() {
  const [draft, setDraft] = useState<DraftQuestion>(emptyDraft)
  const [items, setItems] = useState<BankQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('')

  const [selectedSubject, setSelectedSubject] = useState('Precálculo')
  const [newSubject, setNewSubject] = useState('')
  const [useNewSubject, setUseNewSubject] = useState(false)
  const [importTopic, setImportTopic] = useState('General')
  const [files, setFiles] = useState<File[]>([])
  const [importing, setImporting] = useState(false)

  async function loadAll() {
    try {
      setLoading(true)
      const data = await getAllQuestionBankItems()
      setItems(data || [])
    } catch (error) {
      console.error(error)
      alert('No se pudieron cargar las preguntas del banco')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    if (!useNewSubject) {
      const topics = getSubjectTopics(selectedSubject)
      const firstTopic = topics.find((t) => t !== 'Diagnóstico base') || 'General'
      setImportTopic(firstTopic)
    }
  }, [selectedSubject, useNewSubject])

  const subjectOptions = useMemo(() => {
    const presetNames = SUBJECT_PRESETS.map((item) => item.name)
    const bankNames = items
      .map((item) => item.subject || '')
      .filter(Boolean) as string[]

    return [...new Set([...presetNames, ...bankNames])].sort((a, b) =>
      a.localeCompare(b)
    )
  }, [items])

  const grouped = useMemo(() => {
    const filtered = items.filter((item) => {
      const text =
        `${item.subject || ''} ${item.topic || ''} ${item.question || ''}`.toLowerCase()

      return text.includes(filter.trim().toLowerCase())
    })

    const map = new Map<string, BankQuestion[]>()

    for (const item of filtered) {
      const key = item.subject || 'Sin asignatura'

      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }

    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [items, filter])

  function updateDraft(field: keyof DraftQuestion, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  function getEffectiveSubject() {
    return useNewSubject ? newSubject.trim() : selectedSubject.trim()
  }

  async function handleImportFiles() {
    const subject = getEffectiveSubject()

    if (!subject) {
      alert('Debes seleccionar o crear una asignatura')
      return
    }

    if (!files.length) {
      alert('Debes subir al menos un archivo o zip')
      return
    }

    try {
      setImporting(true)

      const formData = new FormData()
      formData.append('subject', subject)
      formData.append('topic', importTopic.trim() || 'General')

      files.forEach((file) => formData.append('files', file))

      const res = await fetch('/api/question-bank-import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo procesar la importación')
      }

      const parsedQuestions = (data?.questions || []).map((item: any) => ({
        subject: item.subject,
        topic: item.topic,
        difficulty: item.difficulty || 'media',
        type: item.type || 'multiple-choice',
        question: item.question,
        options: item.options || [],
        answer: item.answer ?? 0,
        explanation: item.explanation || '',
        tags: item.tags || [],
      }))

      if (!parsedQuestions.length) {
        alert('No se detectaron preguntas válidas en los archivos')
        return
      }

      await createBankQuestions(parsedQuestions)
      setFiles([])
      await loadAll()
      alert(`Importación lista. Se agregaron ${parsedQuestions.length} preguntas.`)
    } catch (error) {
      console.error(error)
      alert('No se pudieron importar los archivos')
    } finally {
      setImporting(false)
    }
  }

  async function handleSaveManual() {
    if (
      !draft.subject.trim() ||
      !draft.topic.trim() ||
      !draft.question.trim() ||
      !draft.optionA.trim() ||
      !draft.optionB.trim() ||
      !draft.optionC.trim() ||
      !draft.optionD.trim()
    ) {
      alert('Completa todos los campos principales')
      return
    }

    try {
      setSaving(true)

      await createBankQuestions([
        {
          subject: draft.subject.trim(),
          topic: draft.topic.trim(),
          difficulty: draft.difficulty,
          type: draft.type,
          question: draft.question.trim(),
          options: [
            draft.optionA.trim(),
            draft.optionB.trim(),
            draft.optionC.trim(),
            draft.optionD.trim(),
          ],
          answer: Number(draft.answerIndex),
          explanation: draft.explanation.trim(),
          tags: draft.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        },
      ])

      setDraft(emptyDraft)
      await loadAll()
      alert('Pregunta guardada')
    } catch (error) {
      console.error(error)
      alert('No se pudo guardar la pregunta')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, question: string) {
    const ok = window.confirm(`Eliminar banco que habla de:\n\n${question}`)
    if (!ok) return

    try {
      await deleteQuestionBankItem(id)
      await loadAll()
    } catch (error) {
      console.error(error)
      alert('No se pudo eliminar la pregunta')
    }
  }

  const activeColor = getSubjectColor(getEffectiveSubject() || 'Precálculo')
  const activeTopics = getSubjectTopics(selectedSubject).filter(
    (topic) => topic !== 'Diagnóstico base'
  )

  return (
    <div style={container}>
      <div
        style={{
          ...heroCard,
          border: `1px solid ${activeColor}`,
          boxShadow: `0 0 0 1px ${activeColor}22 inset`,
        }}
      >
        <h2 style={title}>Banco de preguntas</h2>
        <p style={subtitle}>
          Puedes cargar preguntas manualmente, importar archivos, subir un zip o usar un prompt copiable para generar preguntas con IA y luego pegarlas directo al banco.
        </p>
      </div>

      <div style={layout}>
        <div style={leftColumn}>
          <div style={card}>
            <h3 style={sectionTitle}>Importar desde archivos o ZIP</h3>

            <div style={field}>
              <label style={label}>Asignatura</label>
              <div style={row}>
                <button
                  onClick={() => setUseNewSubject(false)}
                  style={useNewSubject ? chip : activeChip}
                >
                  Elegir existente
                </button>
                <button
                  onClick={() => setUseNewSubject(true)}
                  style={useNewSubject ? activeChip : chip}
                >
                  Crear nueva
                </button>
              </div>
            </div>

            {!useNewSubject ? (
              <div style={field}>
                <label style={label}>Materia existente</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={input}
                >
                  {subjectOptions.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={field}>
                <label style={label}>Nueva materia</label>
                <input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ej: Teoría política"
                  style={input}
                />
              </div>
            )}

            <div style={field}>
              <label style={label}>Tema por defecto</label>
              {!useNewSubject && activeTopics.length > 0 ? (
                <select
                  value={importTopic}
                  onChange={(e) => setImportTopic(e.target.value)}
                  style={input}
                >
                  {activeTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={importTopic}
                  onChange={(e) => setImportTopic(e.target.value)}
                  placeholder="Ej: Unidad 1"
                  style={input}
                />
              )}
            </div>

            <div style={field}>
              <label style={label}>Archivos</label>
              <input
                type="file"
                multiple
                accept=".txt,.md,.csv,.json,.zip"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                style={input}
              />
            </div>

            <div style={hintBox}>
              Formatos soportados: TXT, MD, CSV, JSON y ZIP que contenga esos formatos.
            </div>

            <div style={actions}>
              <button
                onClick={handleImportFiles}
                style={button}
                disabled={importing}
              >
                {importing ? 'Importando...' : 'Importar al banco'}
              </button>
            </div>
          </div>

          <QuestionBankPromptImportView />

          <div style={card}>
            <h3 style={sectionTitle}>Nueva pregunta manual</h3>

            <div style={grid2}>
              <div style={field}>
                <label style={label}>Asignatura</label>
                <input
                  value={draft.subject}
                  onChange={(e) => updateDraft('subject', e.target.value)}
                  placeholder="Ej: Historia"
                  style={input}
                />
              </div>

              <div style={field}>
                <label style={label}>Tema</label>
                <input
                  value={draft.topic}
                  onChange={(e) => updateDraft('topic', e.target.value)}
                  placeholder="Ej: Poder y democracia"
                  style={input}
                />
              </div>
            </div>

            <div style={grid3}>
              <div style={field}>
                <label style={label}>Dificultad</label>
                <select
                  value={draft.difficulty}
                  onChange={(e) => updateDraft('difficulty', e.target.value)}
                  style={input}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div style={field}>
                <label style={label}>Tipo</label>
                <select
                  value={draft.type}
                  onChange={(e) => updateDraft('type', e.target.value)}
                  style={input}
                >
                  <option value="multiple-choice">Alternativa</option>
                  <option value="true-false">Verdadero / Falso</option>
                </select>
              </div>

              <div style={field}>
                <label style={label}>Respuesta correcta</label>
                <select
                  value={draft.answerIndex}
                  onChange={(e) => updateDraft('answerIndex', e.target.value)}
                  style={input}
                >
                  <option value="0">A</option>
                  <option value="1">B</option>
                  <option value="2">C</option>
                  <option value="3">D</option>
                </select>
              </div>
            </div>

            <div style={field}>
              <label style={label}>Pregunta</label>
              <textarea
                value={draft.question}
                onChange={(e) => updateDraft('question', e.target.value)}
                placeholder="Escribe la pregunta"
                style={textarea}
              />
            </div>

            <div style={grid2}>
              <div style={field}>
                <label style={label}>Opción A</label>
                <input
                  value={draft.optionA}
                  onChange={(e) => updateDraft('optionA', e.target.value)}
                  style={input}
                />
              </div>

              <div style={field}>
                <label style={label}>Opción B</label>
                <input
                  value={draft.optionB}
                  onChange={(e) => updateDraft('optionB', e.target.value)}
                  style={input}
                />
              </div>

              <div style={field}>
                <label style={label}>Opción C</label>
                <input
                  value={draft.optionC}
                  onChange={(e) => updateDraft('optionC', e.target.value)}
                  style={input}
                />
              </div>

              <div style={field}>
                <label style={label}>Opción D</label>
                <input
                  value={draft.optionD}
                  onChange={(e) => updateDraft('optionD', e.target.value)}
                  style={input}
                />
              </div>
            </div>

            <div style={field}>
              <label style={label}>Explicación</label>
              <textarea
                value={draft.explanation}
                onChange={(e) => updateDraft('explanation', e.target.value)}
                placeholder="Explica por qué la correcta es la correcta"
                style={textareaSmall}
              />
            </div>

            <div style={field}>
              <label style={label}>Tags</label>
              <input
                value={draft.tags}
                onChange={(e) => updateDraft('tags', e.target.value)}
                placeholder="Ej: control 1, continuidad, liberalismo"
                style={input}
              />
            </div>

            <div style={actions}>
              <button
                onClick={handleSaveManual}
                style={button}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar pregunta'}
              </button>
            </div>
          </div>
        </div>

        <div style={rightColumn}>
          <div style={card}>
            <div style={headerRow}>
              <h3 style={sectionTitle}>Preguntas cargadas</h3>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Buscar por ramo o tema"
                style={searchInput}
              />
            </div>

            {loading ? (
              <div style={emptyText}>Cargando...</div>
            ) : grouped.length === 0 ? (
              <div style={emptyText}>No hay preguntas todavía.</div>
            ) : (
              <div style={groupList}>
                {grouped.map(([subject, subjectItems]) => (
                  <div
                    key={subject}
                    style={{
                      ...subjectBlock,
                      borderLeft: `4px solid ${getSubjectColor(subject)}`,
                    }}
                  >
                    <div style={subjectTitle}>
                      {subject} ({subjectItems.length})
                    </div>

                    <div style={questionList}>
                      {subjectItems.map((item, index) => (
                        <div key={item.id} style={questionCard}>
                          <div style={questionTop}>
                            <div>
                              <div style={questionTopic}>
                                Banco {index + 1} · {item.topic || 'Sin tema'}
                              </div>
                              <div style={questionText}>{item.question}</div>
                            </div>

                            <button
                              onClick={() =>
                                handleDelete(item.id, item.question)
                              }
                              style={deleteButton}
                            >
                              Eliminar
                            </button>
                          </div>

                          <div style={metaRow}>
                            <span style={pill}>{item.difficulty || 'media'}</span>
                            <span style={pill}>{item.type || 'multiple-choice'}</span>
                          </div>

                          {item.explanation && (
                            <div style={explanationBox}>{item.explanation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
  padding: '20px',
  color: 'white',
}

const heroCard: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
}

const title: React.CSSProperties = {
  margin: 0,
}

const subtitle: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.75,
  lineHeight: 1.45,
}

const layout: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.1fr',
  gap: '18px',
}

const leftColumn: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
}

const rightColumn: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '14px',
}

const grid2: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px',
}

const grid3: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '10px',
  marginTop: '10px',
}

const field: React.CSSProperties = {
  display: 'grid',
  gap: '6px',
  marginBottom: '10px',
}

const label: React.CSSProperties = {
  fontWeight: 700,
}

const row: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
}

const chip: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
}

const activeChip: React.CSSProperties = {
  ...chip,
  background: '#2563eb',
}

const input: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const textarea: React.CSSProperties = {
  width: '100%',
  minHeight: '90px',
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  resize: 'vertical',
}

const textareaSmall: React.CSSProperties = {
  ...textarea,
  minHeight: '70px',
}

const hintBox: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  background: 'rgba(59,130,246,0.12)',
  opacity: 0.9,
  lineHeight: 1.4,
}

const actions: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '10px',
}

const button: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '12px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 700,
}

const headerRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px',
  alignItems: 'center',
  flexWrap: 'wrap',
}

const searchInput: React.CSSProperties = {
  ...input,
  minWidth: '240px',
}

const emptyText: React.CSSProperties = {
  opacity: 0.75,
}

const groupList: React.CSSProperties = {
  display: 'grid',
  gap: '14px',
}

const subjectBlock: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
  paddingLeft: '10px',
}

const subjectTitle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: '1rem',
}

const questionList: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
}

const questionCard: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
}

const questionTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'flex-start',
}

const questionTopic: React.CSSProperties = {
  fontWeight: 700,
  opacity: 0.85,
  marginBottom: '6px',
}

const questionText: React.CSSProperties = {
  lineHeight: 1.45,
}

const deleteButton: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '10px',
  border: 'none',
  background: 'rgba(239,68,68,0.18)',
  color: 'white',
  cursor: 'pointer',
}

const metaRow: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginTop: '10px',
  flexWrap: 'wrap',
}

const pill: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '999px',
  background: 'rgba(59,130,246,0.18)',
  fontSize: '0.8rem',
}

const explanationBox: React.CSSProperties = {
  marginTop: '10px',
  padding: '10px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.04)',
  opacity: 0.88,
  lineHeight: 1.45,
}