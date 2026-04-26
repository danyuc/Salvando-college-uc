'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Ensayo() {
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    const { data } = await supabase.from('questions').select('*')
    setQuestions(data || [])
  }

  const q = questions[index]

  const handleAnswer = (option) => {
    setSelected(option)
    setShowAnswer(true)

    if (option === q.correcta) {
      setScore(score + 1)
    }
  }

  const next = () => {
    setSelected(null)
    setShowAnswer(false)
    setIndex(index + 1)
  }

  if (!q) return <p>Cargando...</p>

  return (
    <div className="p-6">
      <h1>Pregunta {index + 1}</h1>

      <p>{q.pregunta}</p>

      {['A','B','C','D'].map((l) => {
        const text =
          l === 'A' ? q.opciona :
          l === 'B' ? q.opcionb :
          l === 'C' ? q.opcionc :
          q.opciond

        return (
          <button key={l} onClick={() => handleAnswer(l)}>
            {l}) {text}
          </button>
        )
      })}

      {showAnswer && (
        <div>
          <p>
            {selected === q.correcta
              ? 'Correcto'
              : `Incorrecto: ${q.correcta}`}
          </p>

          <button onClick={next}>Siguiente</button>
        </div>
      )}

      <p>Puntaje: {score}</p>
    </div>
  )
}