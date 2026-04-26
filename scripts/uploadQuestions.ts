import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const questions = [
  // PEGA AQUÍ TODO TU BLOQUE,
  // pero debes dejarlo como UN SOLO ARRAY:
  // { ... },
  // { ... },
  // { ... }
]

async function uploadQuestions() {
  const cleanedQuestions = questions.map((q: any) => ({
    subject: q.subject,
    topic: q.topic,
    subtopic: q.subtopic,
    type: q.type,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    expected_answer: q.expected_answer,
    evaluation_criteria: q.evaluation_criteria,
    cognitive_level: q.cognitive_level,
    author_reference: q.author_reference,
    common_mistake: q.common_mistake,
    tags: q.tags,
    source: q.source,
  }))

  const { data, error } = await supabase
    .from('questions')
    .insert(cleanedQuestions)
    .select()

  if (error) {
    console.error('❌ Error subiendo preguntas:', error)
    process.exit(1)
  }

  console.log(`✅ ${data.length} preguntas subidas correctamente`)
}

uploadQuestions()