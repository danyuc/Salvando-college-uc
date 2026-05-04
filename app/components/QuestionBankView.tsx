'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Question,
  AnswerOption,
  getQuestionOptions,
  normalizeCorrectAnswer,
} from '@/lib/questionTypes'

export default function QuestionBankView() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tema, setTema] = useState('Todos')
  const [dificultad, setDificultad] = useState('Todas')
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, AnswerOption>>({})

  useEffect(() => {
    loadQuestions()
  }, [])

  async function loadQuestions() {
    setLoading(true)

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('tema', { ascending: true })

    if (error) {
      console.error('Error cargando preguntas:', error.message)
      setQuestions([])
    } else {
      setQuestions((data || []) as Question[])
    }

    setLoading(false)
  }

  const temas = useMemo(() => {
    const unique = Array.from(
      new Set(questions.map((q) => q.tema).filter(Boolean))
    ) as string[]

    return ['Todos', ...unique]
  }, [questions])

  const dificultades = useMemo(() => {
    const unique = Array.from(
      new Set(questions.map((q) => q.dificultad).filter(Boolean))
    ) as string[]

    return ['Todas', ...unique]
  }, [questions])

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        q.pregunta?.toLowerCase().includes(search.toLowerCase()) ||
        q.tema?.toLowerCase().includes(search.toLowerCase()) ||
        q.subtema?.toLowerCase().includes(search.toLowerCase())

      const matchesTema = tema === 'Todos' || q.tema === tema
      const matchesDificultad =
        dificultad === 'Todas' || q.dificultad === dificultad

      return matchesSearch && matchesTema && matchesDificultad
    })
  }, [questions, search, tema, dificultad])

  function handleAnswer(questionId: string, option: AnswerOption) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }))
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Cargando banco de preguntas...</p>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Banco de preguntas
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-950">
              Preguntas cargadas en Supabase
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Total: {questions.length} preguntas · Mostrando:{' '}
              {filteredQuestions.length}
            </p>
          </div>

          <a
            href="/ensayo"
            className="rounded-xl bg-gray-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Iniciar modo PSU
          </a>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por pregunta, tema o subtema..."
            className="rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <select
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            className="rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            {temas.map((t) => (
              <option key={t} value={t}>
                Tema: {t}
              </option>
            ))}
          </select>

          <select
            value={dificultad}
            onChange={(e) => setDificultad(e.target.value)}
            className="rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            {dificultades.map((d) => (
              <option key={d} value={d}>
                Dificultad: {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-gray-500">
          No hay preguntas que coincidan con los filtros.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, index) => {
            const selected = selectedAnswers[q.id]
            const correct = normalizeCorrectAnswer(q.correcta)
            const answered = Boolean(selected)
            const isCorrect = selected === correct

            return (
              <article
                key={q.id}
                className="rounded-3xl border bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Pregunta {index + 1}
                  </span>

                  {q.tema && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                      {q.tema}
                    </span>
                  )}

                  {q.subtema && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                      {q.subtema}
                    </span>
                  )}

                  {q.dificultad && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {q.dificultad}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold leading-relaxed text-gray-950">
                  {q.pregunta}
                </h3>

                <div className="mt-5 space-y-3">
                  {getQuestionOptions(q).map((option) => {
                    const optionIsSelected = selected === option.letter
                    const optionIsCorrect = correct === option.letter

                    let style =
                      'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50'

                    if (answered && optionIsCorrect) {
                      style = 'border-green-500 bg-green-50'
                    }

                    if (answered && optionIsSelected && !optionIsCorrect) {
                      style = 'border-red-500 bg-red-50'
                    }

                    return (
                      <button
                        key={option.letter}
                        onClick={() => handleAnswer(q.id, option.letter)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${style}`}
                      >
                        <span className="font-bold">{option.letter})</span>{' '}
                        <span>{option.text}</span>
                      </button>
                    )
                  })}
                </div>

                {answered && (
                  <div className="mt-5 rounded-2xl border bg-gray-50 p-4">
                    <p
                      className={`font-bold ${
                        isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {isCorrect
                        ? 'Correcto ✅'
                        : `Incorrecto ❌ · Respuesta correcta: ${correct}`}
                    </p>

                    {q.explicacion && (
                      <p className="mt-2 text-sm leading-relaxed text-gray-700">
                        {q.explicacion}
                      </p>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
