You are a senior full-stack engineer, senior Next.js architect, senior TypeScript engineer, senior Tailwind UI engineer, senior EdTech product designer, senior motion designer, academic learning-systems designer, mathematics learning engineer, psychology learning designer, university assessment designer, data visualization engineer, accessibility reviewer, QA engineer, and product-quality auditor.

This is a major high-quality product pass for Salvando College UC.

Do not rush.
Do not make destructive changes.
Do not commit.
Do not push.
Inspect the repository carefully before editing.
Understand the existing architecture before touching files.
Preserve working flows.
Run build before finishing.
Fix errors you introduce.
Report clearly what was changed.

============================================================
MAIN OBJECTIVE
============================================================

Make Salvando College UC feel like a premium academic learning platform, not a collection of disconnected pages.

This pass must improve:

1. Pre Cálculo MAT1000
- full premium visual redesign
- subject-specific mathematical background
- real internal practice system
- diagnostic without repetition
- graph/modeling support
- formulas/tips integrated
- data-aware step-by-step
- past exams section
- anti-repetition
- progress tracking
- tutor panel
- animations

2. Psicología
- serious university-level student practice module
- at least 100 questions ONLY if source materials are already available in the repository
- class-based system: Class 4 Memory, Class 5 Learning, Class 6 Reasoning/Intelligence, Class 7 Language
- diagnostic mode
- exam simulation
- incorrect review
- weakness map
- source-based explanations
- no invented content
- psychology-specific visual theme with brain/neuron background

3. Generic practice UI
- fix broken Spanish text / mojibake
- fix ugly disabled states
- fix colors and readability
- make filters professional
- remove cheap-looking labels like “Pro Max”

4. Sidebar
- fix contrast
- inactive and active items must be readable
- Pre Cálculo must be readable
- sidebar CSS must be scoped

5. Subject-aware visual system
- Pre Cálculo = math formulas, graphs, coordinate grids, unit circle
- Psicología = brain, neurons, cognition, emotion
- IPRE2 = classroom capsule / live learning
- CRSH = air, particles, sensors, semáforo
- default platform = academic cockpit

============================================================
PROJECT CONTEXT
============================================================

App: Salvando College UC
Stack:
- Next.js 16
- TypeScript
- Tailwind
- Vercel
- Supabase
- Framer Motion if installed
- Recharts if already installed
- SVG / lightweight custom visualizations

Existing modules:

1. CRSH / Cardenal Respira
- Institutional environmental module.
- Includes sensors, Sensor 71, semáforo, dashboard, institutional presentation.
- Do not mix with Psicología.
- Do not mix with IPRE2 classroom system.
- Do not break CRSH.

2. Explora IPRE2
- Educational line for capsules, material docente, session with students, scoring, ranking, camera/manual hand count.
- Do not mix with Psicología.
- Do not break IPRE2.

3. Pre Cálculo MAT1000
- Separate premium student learning module.
- Main route: /precalculo-full
- Must have its own diagnostic, practice, graph tools, formulas, tips, past exams, tutor, and guided learning.
- Must not depend on generic /practica to function.

4. Psicología
- Student practice only.
- Route should be /practica/psicologia.
- Must not be mixed with CRSH or IPRE2.
- Must use only real source materials if available.
- Do not invent source-based content.
- If sources are missing, create architecture and empty states only.

5. Main student practice
- Should remain clean and visually coherent.
- Must support subject-specific visual identity.

============================================================
HARD RULES
============================================================

Do NOT break:
- /precalculo-full
- /practica
- /practica/psicologia
- /ipre2
- /ipre2/sesion
- /ipre2/camara
- /cardenal-respira
- /cardenal-respira/docentes
- /cardenal-respira/presentacion
- /lab-ambiental
- /lab-ambiental?docente=1
- /login
- 2890 flow
- CRSH flow
- UC flow
- DOCENCIA-REVIEW flow if present
- Supabase proxy/fallback
- AppShell routing

Do NOT expose hidden access codes in UI.

Do NOT use broad global CSS selectors like:
- aside *
- nav *
- main *
unless strictly scoped.

Use scoped selectors:
- [data-app-sidebar]
- [data-subject-theme="precalculo"]
- [data-subject-theme="psicologia"]
- [data-page-theme="ipre2"]
- [data-page-theme="crsh"]

Do NOT invent Psychology content.
Do NOT invent official past-exam content.
Do NOT add heavy dependencies unless absolutely necessary and build-safe.
Animations must respect prefers-reduced-motion.

If the repository does not contain real Psychology source materials, do NOT create fake questions. Instead:
- create the data model
- create professional empty states
- create docs explaining how to add content
- mark missing content as “falta fuente” or “requires confirmation”

If the repository DOES contain real Psychology materials, use ONLY those materials and cite source labels in every question.

============================================================
PART 1 — SUBJECT-AWARE VISUAL SYSTEM
============================================================

Create a reusable visual theme system.

Suggested files:
- lib/subject-themes.ts
- app/components/shared/SubjectAtmosphere.tsx
- app/components/shared/AcademicPageShell.tsx
- app/components/shared/AnimatedAcademicBackground.tsx

Create a typed theme object:

SubjectTheme:
- id
- name
- description
- primaryColor
- secondaryColor
- accentColor
- backgroundGradient
- cardStyle
- iconSet or visualMotifs
- symbols
- backgroundPattern
- animationStyle

Required themes:

A. Pre Cálculo theme
Visual identity:
- dark navy / indigo / electric blue / violet
- mathematical symbols:
  ∑, π, √, f(x), x², log, sen, cos, tan, θ, Δ, ∞
- coordinate grid
- graph curves
- unit circle outlines
- subtle animated equations
- glowing graph lines
- particles as mathematical points

Background:
- dark academic gradient
- blueprint/grid feel
- floating formulas
- animated function curve
- subtle parallax math symbols
- no all-white page

B. Psicología theme
Visual identity:
- deep navy / purple / soft cyan / warm pink accents
- brain/neuron/cognition/emotion background
- subtle synapse lines
- animated neuron pulses
- calm, intelligent, social-science academic style
- no childish brain emojis
- no broken emoji artifacts

Background motifs:
- neuron network
- brain outline
- memory nodes
- emotion/cognition signal waves
- soft pulsing nodes

C. IPRE2 theme
Visual identity:
- classroom projection
- capsules
- live learning
- science education
- cyan/green/violet
- slide deck feel
- animated progress

D. CRSH theme
Visual identity:
- air quality
- sensors
- particles
- semáforo
- dashboard data
- green/cyan/blue
- clean institutional

E. Default student theme
Visual identity:
- academic cockpit
- dark navy
- glass cards
- blue/cyan accents

SubjectAtmosphere component:
- receives theme="precalculo" | "psicologia" | "ipre2" | "crsh" | "default"
- renders decorative background motifs
- pointer-events-none
- absolute/fixed background
- must not reduce readability
- must respect reduced motion

Use CSS variables where useful:
--subject-primary
--subject-secondary
--subject-accent
--subject-bg
--subject-card
--subject-glow

============================================================
PART 2 — GLOBAL COLOR, TYPOGRAPHY AND UI CONSISTENCY
============================================================

Inspect:
- app/globals.css
- app/components/AppShell.tsx
- shared layout components
- practice components
- precalculo components
- psychology components

Fix:
- text contrast
- backgrounds
- cards
- buttons
- inputs
- tabs
- disabled states
- hover states
- focus states
- empty states
- badges
- progress bars

Requirements:
- no unreadable text
- no dark text on dark background
- no white text on white background
- no broken purple/blue combinations
- no all-white disconnected pages inside dark app
- consistent rounded cards
- consistent spacing
- clear focus rings
- responsive mobile/tablet/desktop
- no unwanted horizontal scroll

Add safe utility classes if useful:
- academic-card
- academic-card-dark
- academic-button-primary
- academic-button-secondary
- academic-input
- academic-tab
- academic-badge
- subject-glass-card
- subject-panel
- learning-feedback-correct
- learning-feedback-wrong

Do not rewrite every component unnecessarily. Apply to key pages only.

============================================================
PART 3 — SIDEBAR CONTRAST FIX
============================================================

The sidebar has unreadable inactive items.

Inspect:
- app/components/AppShell.tsx
- app/globals.css

Fix:
- all sidebar labels readable
- all icons readable
- inactive items readable
- active item readable
- hover item readable
- Pre Cálculo item readable
- Inicio, Práctica, Grupal, Banco, Calendario, Coach, Ranking, Pizarra readable

Use scoped CSS only:
[data-app-sidebar] ...

Suggested inactive style:
- text-slate-200/90
- icon opacity 0.95
- hover text-white
- hover bg-white/10

Suggested active style:
Option A:
- bg-white
- text-slate-950
- icon visible

Option B:
- bg-cyan-400/15
- border-cyan-300/40
- text-cyan-50

Choose what best fits the existing app.

Do not allow sidebar CSS to affect:
- Pre Cálculo internal cards
- CRSH pages
- IPRE2 pages
- lab ambiental
- teacher layouts

============================================================
PART 4 — FIX BROKEN SPANISH TEXT / MOJIBAKE
============================================================

Search and fix visible mojibake:
- DiagnÃ³stico -> Diagnóstico
- PrÃ¡ctica -> Práctica
- MÃ³dulo -> Módulo
- sesiÃ³n -> sesión
- fÃ³rmula -> fórmula
- grÃ¡fico -> gráfico
- configuraciÃ³n -> configuración
- evaluaciÃ³n -> evaluación
- ðŸ -> remove or replace with proper icon/text

Search:
- DiagnÃ
- PrÃ
- MÃ
- sesiÃ
- ðŸ

Fix in:
- TSX components
- TypeScript data/config files
- docs if visible in UI
- labels
- buttons
- empty states

Do not break proper UTF-8 accents.

============================================================
PART 5 — PRE CÁLCULO VISUAL REBUILD
============================================================

/precalculo-full must become a first-class product.

Current issues:
- too white
- disconnected from app
- practice is not clear enough
- old “Pro Max” wording looks cheap
- formulas/tips are disconnected
- graph/modeling support is limited

Remove visible “Pro Max” wording.
Replace with:
- Modo guiado
- Estrategia de prueba
- Tip UC
- Paso a paso
- Error común
- Tutor local
- Práctica inteligente
- Ruta recomendada

Add visible marker:
“MAT1000 Practice UI v2”

Design:
- dark mathematical lab
- formulas and graphs in background
- academic premium style
- high contrast
- glass cards
- strong module hierarchy
- subtle math animations
- responsive
- no all-white hero section

Top hero:
Title:
Pre Cálculo MAT1000

Subtitle:
Entrena diagnóstico, práctica, gráficos, modelamiento y pruebas pasadas en una sola ruta.

Right card:
- Tutor local
- diagnostic progress
- route recommendation
- weakness summary

Module cards:
- I1 · Álgebra, funciones y geometría analítica
- I2 · Potencias, exponenciales y logaritmos
- I3 · Trigonometría y funciones trigonométricas
- Examen · Integración completa

Cards:
- dark/glass
- selected module highlighted
- readable text
- no giant white blocks

Tabs:
1. Ruta
2. Diagnóstico
3. Práctica
4. Fórmulas y tips
5. Gráficos interactivos
6. Pruebas pasadas
7. Tutor

Tabs must be visually clear and accessible.

============================================================
PART 6 — PRE CÁLCULO PRACTICE SYSTEM
============================================================

Create or improve a real internal practice system inside /precalculo-full.

Do not rely on generic /practica.

Practice tab must include:
- module selector
- topic selector
- difficulty selector
- recommended-by-diagnostic mode
- anti-repetition logic
- question screen
- graph/visual panel
- formula/tip panel
- tutor panel
- step-by-step panel
- progress
- localStorage progress

Layout:
Desktop:
- left: question + answer area
- right: graph/visual/model
- bottom or side drawer: formulas/tips/steps/tutor

Tablet/mobile:
- compact stacked layout
- no excessive scroll
- question first
- graph next
- hints/tips collapsible
- solution after answer

Question screen:
- module label
- topic/subtopic
- difficulty badge
- source badge if past exam
- prompt
- options A/B/C/D or numeric input
- “Verificar”
- “Pista”
- “Fórmula”
- “Primer paso”
- “Solución completa”
- “Siguiente”

Modes:
1. Practice mode
- answer first
- feedback after verification

2. Guided mode
- hints/formulas available before answer
- full solution only when clicked

3. Review mode
- incorrect questions and explanations

Feedback:
Correct:
- green accent
- “Correcto”
- explain why
- show key step
- animate feedback

Incorrect:
- orange/red accent
- “Revisemos”
- show correct answer
- show misconception
- show step-by-step
- animate feedback

For each answer, show:
- why selected answer is right/wrong
- concept tested
- common mistake
- how to recognize it in a UC-style test
- quick tip
- next recommended exercise

============================================================
PART 7 — PRE CÁLCULO TUTOR PANEL
============================================================

Add compact Tutor panel in practice mode.

Tutor panel must include:
- Pista 1
- Pista 2
- Ver fórmula
- Ver primer paso
- Ver solución completa

Rules:
- Do not show full solution immediately.
- Student must click to reveal.
- Hints should be related to the current question.
- Formula must explain variables.
- First step must use actual question data.
- Full solution must be data-aware.

============================================================
PART 8 — PRE CÁLCULO FORMULA MEMORY AID
============================================================

For each practice question, show:
- formula used
- when to use it
- what each variable means
- common trap
- mini example using current values when possible

Example:
For y = A sen(kx + b) + c:
- amplitude = |A|
- period = 2π / |k|
- phase shift = -b/k
- vertical shift = c
- trap: confusing k with period directly

============================================================
PART 9 — PRE CÁLCULO DIAGNOSTIC SYSTEM
============================================================

Fix diagnostic completely.

Requirements:
- at least 13 distinct diagnostic questions
- no repeated ID
- no repeated prompt
- no repeated same exercise disguised
- balanced coverage

Topics:
1. álgebra básica
2. funciones
3. geometría analítica
4. exponentes
5. logaritmos
6. razones trigonométricas
7. cuadrantes y signos
8. seno/coseno
9. amplitud
10. período
11. desfase
12. modelamiento
13. lectura de gráficos

Preferred:
- create 20-30 diagnostic questions
- sample 13 balanced per diagnostic session
- shuffle order
- prevent duplicates
- store diagnostic session ID
- store results

Result:
- score
- strong topics
- weak topics
- critical weaknesses
- recommended route
- recommended practice mode
- “Te conviene partir por…”
- “Prioridad alta: trigonometría / modelamiento / gráficos”
- button “Practicar mis debilidades”

Anti-repetition:
- track recently seen diagnostic question IDs in localStorage
- avoid repeating too soon

============================================================
PART 10 — PRE CÁLCULO QUESTION BANK QUALITY
============================================================

Create or improve:
- lib/precalculo-practice-data.ts
- lib/precalculo-past-exams.ts
- lib/precalculo-diagnostic.ts if useful

Each question:
- id
- moduleId
- topic
- subtopic
- difficulty
- type: multiple_choice | numeric | graph | modeling
- prompt
- options if multiple choice
- correctAnswer
- explanation
- distractorExplanations if multiple choice
- steps
- formulaRefs
- formulaMemoryAid
- tutorHints
- tip
- commonMistake
- graphConfig optional
- source optional
- pastExam optional
- nextRecommendedExercise

Question variety:
- linear equations
- functions
- line through points
- slope/intercept
- exponent rules
- log equations
- trig ratios
- quadrant signs
- sine/cosine graphs
- amplitude
- period
- phase shift
- graph reading
- modeling from data
- applied word problems
- contextual interpretation

Do not overuse the same example.
Do not repeat “10 + 2x = 30” everywhere.
Use valid math and valid answers.

============================================================
PART 11 — DATA-AWARE STEP-BY-STEP
============================================================

Every practice question must include real step-by-step using actual values.

Bad:
“Despeja la variable.”
“Aplica la fórmula.”
“Usa Pitágoras.”

Good:
For 10 + 2x = 30:
1. Restamos 10 a ambos lados:
   2x = 30 - 10 = 20.
2. Dividimos por 2:
   x = 20 / 2 = 10.
3. Respuesta:
   x = 10.

For sen(t)=-12/13 in QIII:
1. En QIII, seno y coseno son negativos, tangente es positiva.
2. sen(t)=y/r=-12/13, entonces y=-12 y r=13.
3. x²+(-12)²=13².
4. x²+144=169.
5. x²=25.
6. x=-5 porque QIII.
7. tan(t)=(-12)/(-5)=12/5.

For y=3sen(2x):
1. A=3, amplitude is |3|=3.
2. k=2, period is 2π/|2|=π.
3. No phase shift if expression is 2x.
4. Graph oscillates between -3 and 3.

For points (0,5) and (2,11):
1. m=(11-5)/(2-0)=6/2=3.
2. b=5 because when x=0, y=5.
3. model: y=3x+5.

Also explain why distractors are wrong when applicable.

============================================================
PART 12 — PRE CÁLCULO GRAPH PANEL
============================================================

Improve graph panel.

Graph panel must show real visual information when applicable:
- coordinate plane
- points with labels
- line equation
- x/y intercepts
- slope
- vertex if quadratic exists
- trig key points
- amplitude
- period
- phase shift
- quadrants
- positive/negative sign zones

Add graph drawing animation when a question loads.

Use SVG/canvas/lightweight components.
No heavy CAS/Desmos dependency.

Trig visualizer:
- y = A sin(kx + b) + c
- amplitude = |A|
- period = 2π/|k|
- phase shift = -b/k if applicable
- vertical shift = c
- show key x-values:
  0, π/2, π, 3π/2, 2π
- show quadrants and signs
- show trace point if feasible
- reduced-motion fallback

If graph is not needed:
“Esta pregunta se resuelve con análisis algebraico; no requiere gráfico.”

============================================================
PART 13 — MODELING QUESTIONS
============================================================

Add/improve modeling questions.

Modeling question types:
- linear model from context
- exponential/log model from context
- trigonometric model from context
- reading graph data
- choosing formula from context
- interpreting parameters

For modeling:
- show context
- show data table if applicable
- show plot if applicable
- ask student to choose or build model
- show step-by-step with actual values
- explain what parameters mean in context

============================================================
PART 14 — PRE CÁLCULO PAST EXAMS SECTION
============================================================

Add tab:
Pruebas pasadas

Search repository for past exam materials:
- docs/precalculo
- docs/mat1000
- public/precalculo
- data/precalculo
- files containing:
  MAT1000
  Precalculo
  precalculo
  prueba
  examen
  I1
  I2
  I3

If files exist:
- create structured entries from actual content
- include exercises found
- tag by year/evaluation/topic/difficulty/source
- include official solution if present
- if solution missing, mark “requiere solución”
- if generating a proposed solution, label:
  “Solución propuesta, requiere validación.”

If files do not exist:
Create:
- docs/PRECALCULO_PAST_EXAMS_FORMAT.md
- data model ready
- UI empty state:
  “No hay pruebas pasadas cargadas todavía.”
  “Agrega archivos en docs/precalculo/pruebas-pasadas.”

Past exams UI:
- filters:
  year
  I1/I2/I3/Examen
  topic
  difficulty
- exercise cards
- “Practicar este ejercicio”
- “Practicar ejercicios similares”
- “Ver solución”
- tags:
  “salió en prueba pasada”
  “tipo probable”
  “requiere fuente”

Add section:
“Ejercicios que pueden salir”

Label:
“No es predicción oficial; es una ruta de práctica basada en patrones de ejercicios.”

============================================================
PART 15 — PRE CÁLCULO ANIMATIONS
============================================================

Add subtle premium animations:
- tab changes
- answer feedback
- retry feedback
- graph drawing
- progress bars
- selected module glow
- formula panel reveal
- diagnostic result reveal
- unit circle trace
- background math symbol drift

Do not overdo.
Keep academic and fast.
Respect reduced motion.

Add visible:
“MAT1000 Practice UI v2”

============================================================
PART 16 — PRE CÁLCULO ANTI-REPETITION
============================================================

Diagnostic and practice must avoid repeating the same question too soon.

Use localStorage:
- recently seen question IDs
- diagnostic history
- practice history

Key:
precalculo-full-progress-v2

Track:
- diagnostic result
- weak topics
- practice history
- recently seen IDs
- incorrect IDs
- completed IDs
- recommended route

============================================================
PART 17 — PSYCHOLOGY VISUAL SYSTEM
============================================================

Create or improve:
/practica/psicologia

Psychology route must have its own identity:
- dark purple/navy background
- brain/neuron/cognition visuals
- soft cyan/pink accents
- neuron network
- subtle pulsing synapse lines
- calm academic style
- no broken emojis
- no childish UI

Header:
Práctica de Psicología

Subtitle:
Estudia por clase, autores, subtemas y preguntas basadas en tus materiales reales.

If there is no real content:
Show elegant empty state:
“Todavía no hay contenidos reales cargados para Psicología.”
“Cuando agregues clases, lecturas o apuntes, el sistema generará práctica por clase, autor y subtema.”
“Este módulo no inventa contenido: trabaja con fuentes reales.”

============================================================
PART 18 — PSYCHOLOGY DATA MODEL
============================================================

Create/improve:
- lib/psychology-practice-data.ts

Types must support:
- classes
- authors
- subtopics
- readings
- source labels
- questions by class
- self-assessment
- knowledge diagnostic
- guided practice weighting
- diagnostic history
- exam simulation
- incorrect review
- weakness map

Types:

PsychologyClass:
- id
- order
- title
- classNumber
- authors
- mainTopic
- centralIdea
- keyConcepts
- subtopics
- sources
- questionIds
- status

PsychologyAuthor:
- id
- name
- associatedConcepts
- sourceRefs

PsychologySubtopic:
- id
- classId
- title
- concepts
- authorIds
- sourceRefs

PsychologyQuestion:
- id
- classId
- type: multiple_choice | short_development | application_case | integrative_question
- difficulty: low | medium | high
- cognitiveSkill: remember | understand | apply | analyze | compare | interpret
- prompt
- options A/B/C/D when applicable
- correctAnswer when applicable
- explanation
- distractorExplanations when applicable
- expectedAnswer for development/application/integrative questions
- gradingCriteria for development/application/integrative questions
- source
- tags
- relatedConcepts
- weaknessDetected
- studyRecommendation
- authorIds
- subtopicIds

SelfAssessmentQuestion:
- id
- classId
- prompt
- options:
  “Lo entiendo bien”
  “Lo entiendo más o menos”
  “Me cuesta”
  “No lo he estudiado”

============================================================
PART 19 — PSYCHOLOGY CONTENT EXPANSION TO 100 QUESTIONS
============================================================

Expand Psychology to at least 100 questions ONLY if real source materials already exist in the repository.

Files to inspect:
- docs/psicologia
- content/psicologia
- materiales/psicologia
- public/psicologia
- any files mentioning:
  Psicología
  Memory
  Learning
  Reasoning
  Intelligence
  Language
  Memoria
  Aprendizaje
  Razonamiento
  Inteligencia
  Lenguaje

If materials exist and are readable, create at least 100 questions:

Required distribution:
- Class 4 — Memory: 25 questions
- Class 5 — Learning: 30 questions
- Class 6 — Reasoning and Intelligence: 20 questions
- Class 7 — Language: 25 questions

If sources are incomplete:
- create as many source-supported questions as possible
- mark missing distribution as “falta fuente”
- do not invent missing content
- update report with gaps

Question types:
- multiple_choice
- short_development
- application_case
- integrative_question

Cognitive skills:
- remember
- understand
- apply
- analyze
- compare
- interpret

Difficulty:
- low
- medium
- high

Each question must include:
- id
- classId
- type
- difficulty
- cognitiveSkill
- prompt
- options A/B/C/D when applicable
- correctAnswer
- explanation
- distractorExplanations
- expectedAnswer when applicable
- gradingCriteria when applicable
- source
- tags
- relatedConcepts
- weaknessDetected
- studyRecommendation

Content rules:
- no superficial questions
- plausible distractors
- applied cases
- conceptual traps
- variations of concept
- integration between class/text/notebook if sources allow
- university-level development questions
- understanding > memorization

Class 4 Memory should include IF SOURCED:
- modal model of memory
- sensory memory
- working memory
- long-term memory
- attention, encoding and retrieval
- Baddeley model
- phonological loop
- visuospatial sketchpad
- central executive
- elaboration
- organization
- chunking
- contextual retrieval cues
- constructive memory
- false memories
- retrograde amnesia
- anterograde amnesia
- explicit memory
- episodic memory
- semantic memory
- implicit/procedural memory

Class 5 Learning should include IF SOURCED:
- learning definition
- classical conditioning
- Pavlov
- unconditioned stimulus
- unconditioned response
- neutral stimulus
- conditioned stimulus
- conditioned response
- extinction
- spontaneous recovery
- generalization
- discrimination
- Watson
- Little Albert
- operant conditioning
- Skinner
- Thorndike
- law of effect
- reinforcement
- positive reinforcement
- negative reinforcement
- positive punishment
- negative punishment
- continuous reinforcement
- intermittent reinforcement
- fixed ratio
- variable ratio
- fixed interval
- variable interval
- superstition
- social media and reinforcement schedules

Class 6 Reasoning and Intelligence should include IF SOURCED:
- inductive reasoning
- deductive reasoning
- analogies
- availability bias
- confirmation bias
- predictable-world bias
- valid but factually strange deductions
- invalid but tempting deductions
- insight
- candle problem
- mental set
- functional fixedness
- intelligence
- Galton
- Binet
- Wechsler
- IQ
- Spearman
- g factor
- Cattell
- fluid intelligence
- crystallized intelligence

Class 7 Language should include IF SOURCED:
- language as communication
- language as thinking tool
- language as cultural phenomenon
- language as representation
- language as creation of social reality
- grammar
- phonology
- phonemes
- syntax
- semantics
- babbling
- telegraphic speech
- overgeneralization
- learning theory of language acquisition
- innatist approach
- Chomsky
- universal grammar
- language acquisition device
- interactionist approach
- Broca area
- Wernicke area
- arcuate fasciculus
- linguistic relativity
- strong hypothesis
- weak hypothesis
- Sapir-Whorf
- Aymara example: past/future

Again:
Do NOT invent these topics if they are not in source materials.
If a topic is requested but missing from sources, mark it as “requires confirmation”.

============================================================
PART 20 — PSYCHOLOGY MODES
============================================================

Implement/improve these modes in /practica/psicologia:

1. Class Review
- class cards
- sources
- key concepts
- authors
- subtopics
- available question count
- progress

2. Practice Questions
- filters:
  class
  difficulty
  question type
  cognitive skill
  tag/concept
  author
  subtopic
- question-by-question practice
- source visible in feedback
- explanation
- distractor explanations
- next recommendation

3. Diagnostic Mode
- balanced diagnostic test
- no repeated IDs
- mix all available classes
- mix difficulty
- detect weakness by tags and weaknessDetected
- show:
  strengths
  weaknesses
  critical topics
  recommended review path
  suggested next questions

4. Exam Simulation
- generate variable exam each time
- 20 questions total when enough source-supported questions exist
- at least 30% application questions when available
- at least 20% integrative questions when available
- include all classes if available
- mix multiple choice and short development
- do not show answers until “Corregir examen”
- after correction show:
  estimated score
  correct answers
  wrong answers
  explanations
  conceptual weaknesses
  recommended study plan

5. Incorrect Review
- store wrong question IDs in localStorage
- allow retrying wrong questions
- mark improved after correct retry

6. Weakness Map
- weakness by class
- weakness by author
- weakness by subtopic
- weakness by cognitive skill
- recommended route

============================================================
PART 21 — PSYCHOLOGY DIAGNOSTIC LOGIC
============================================================

Psychology diagnostic must not be only “how do you feel”.

It should combine:
1. self-perception
2. confidence
3. content questions when available
4. weakness analysis

For each class:
- self-perception:
  “¿Cómo sientes los contenidos de la Clase X?”
- confidence:
  “¿Qué tan seguro te sientes aplicando estos conceptos?”
- up to 5 knowledge questions from that class if real content exists
- if no real questions:
  “Faltan preguntas reales para esta clase.”

Diagnostic output:
- class confidence map
- weak classes
- weak authors
- weak subtopics
- recommended guided practice
- recommended review order

Do not invent class topics if not sourced.

============================================================
PART 22 — PSYCHOLOGY LOCALSTORAGE
============================================================

Use:
psychology-practice-progress-v1

Store:
- answered question IDs
- correct IDs
- incorrect IDs
- diagnostic history
- exam simulation history
- class progress
- weakness map
- last selected class
- last selected mode

Do not store sensitive data.

============================================================
PART 23 — PSYCHOLOGY IMPLEMENTATION REPORT
============================================================

Create/update:
docs/PSICOLOGIA_IMPLEMENTATION_REPORT.md

Report:
- materials reviewed
- final number of questions
- number by class
- number by type
- number by difficulty
- number by cognitive skill
- implemented modes
- localStorage key
- missing sources
- “falta fuente” items
- QA checklist
- next steps

============================================================
PART 24 — GENERIC PRACTICE CLEANUP
============================================================

Fix /practica.

Issues:
- broken accents
- awkward layout
- unreadable colors
- ugly disabled states
- “Pro Max” visible wording
- confusing diagnostic block

Fix:
- labels
- colors
- spacing
- cards
- disabled states
- buttons
- filters
- empty states

Use professional labels:
- Práctica guiada
- Diagnóstico inicial
- Ruta recomendada
- Revisión de errores
- Modo estudio

Practice filters:
- Asignatura
- Clase
- Autor
- Subtema
- Tipo
- Cantidad
- Tiempo total

If subject has no content:
- show empty state
- explain what is missing
- do not show broken/disabled confusing UI

============================================================
PART 25 — SUBJECT-SPECIFIC BACKGROUNDS
============================================================

Routes:
- /precalculo-full => math background
- /practica/psicologia => psychology background
- /ipre2 => classroom/capsule background
- /cardenal-respira => air/sensor background
- /practica => neutral academic background

Backgrounds:
- subtle
- readable
- responsive
- no heavy performance cost
- reduced motion support

============================================================
PART 26 — PREMIUM ANIMATIONS
============================================================

Use high-quality animations:
- fade/slide entrance
- staggered cards
- animated tab changes
- animated active module glow
- progress bar transitions
- graph drawing animation
- formula panel reveal
- answer feedback animation
- correct/incorrect feedback animation
- math symbol drift
- neuron pulse background
- source cards slide in
- weakness map animation

Do not make animations annoying.
Do not create layout shift.
Do not make text hard to read.
Respect reduced motion.

============================================================
PART 27 — FILES TO INSPECT
============================================================

Inspect:
- app/components/AppShell.tsx
- app/globals.css
- app/components/precalculo/PrecalculoFullClient.tsx
- lib/precalculo-practice-data.ts
- any existing Pre Cálculo data files
- app/practica/page.tsx
- app/components/PracticeView.tsx
- app/practica/psicologia/page.tsx
- app/components/psychology/*
- lib/psychology-practice-data.ts
- app/components/ipre2/*
- app/components/cardenal-respira/*
- package.json
- docs/*
- public/*
- data/*
- content/*

============================================================
PART 28 — LIKELY FILES TO CREATE OR UPDATE
============================================================

Likely create:
- lib/subject-themes.ts
- app/components/shared/SubjectAtmosphere.tsx
- app/components/shared/AcademicPageShell.tsx
- lib/precalculo-past-exams.ts
- docs/PRECALCULO_PAST_EXAMS_FORMAT.md
- docs/PSICOLOGIA_CONTENT_FORMAT.md

Likely update:
- app/components/precalculo/PrecalculoFullClient.tsx
- lib/precalculo-practice-data.ts
- lib/psychology-practice-data.ts
- app/practica/psicologia/page.tsx
- app/components/psychology/PsychologyPracticeClient.tsx
- docs/PSICOLOGIA_IMPLEMENTATION_REPORT.md
- app/components/PracticeView.tsx
- app/components/AppShell.tsx
- app/globals.css

============================================================
PART 29 — QA CHECKLIST
============================================================

Run:
npm run build

Also run directed lint on modified TS/TSX files if available.

Test routes:
- /precalculo-full
- /practica?subject=MAT1000&evaluation=I3
- /practica/psicologia
- /practica
- /ipre2
- /ipre2/sesion
- /ipre2/camara
- /cardenal-respira
- /cardenal-respira/docentes
- /lab-ambiental?docente=1

Confirm:
- sidebar text readable
- inactive sidebar readable
- active sidebar readable
- Pre Cálculo has dark premium math background
- “MAT1000 Practice UI v2” visible
- Pre Cálculo tabs visible
- Pre Cálculo Práctica tab works
- Pre Cálculo diagnostic has 13 distinct questions
- Pre Cálculo diagnostic avoids duplicates
- Pre Cálculo practice avoids recently seen repeated questions
- Pre Cálculo graph panel visible
- at least 5 practice questions have real data-aware steps
- graph drawing animation works
- formula memory aid visible
- tutor panel visible
- past exams tab exists
- if no past exams, pending-source empty state appears
- Psychology has brain/neuron background
- Psychology has clean UI
- Psychology does not invent content
- Psychology has 100 questions only if real source materials exist
- Psychology question IDs unique
- Psychology prompts unique
- Psychology diagnostic works
- Psychology exam simulation works if enough questions
- Psychology incorrect review works
- Psychology weakness map works
- generic practice no mojibake
- generic practice readable
- subject-specific backgrounds work
- no CRSH/IPRE2 contamination
- no secret codes shown
- build passes

Search:
- DiagnÃ
- PrÃ
- MÃ
- ðŸ
- Pro Max
- Códigos locales
- CARDENAL2026
- CRSH abre
- UC abre
- DOCENCIA-REVIEW activa

Visible “Pro Max” must be removed.
If it appears only in backup files, delete backup files or ignore if not shipped.

============================================================
PART 30 — FINAL RESPONSE FORMAT
============================================================

When finished, report:

1. Files changed.
2. New theme/background system.
3. Sidebar contrast fix.
4. Mojibake fixes.
5. Pre Cálculo visual redesign.
6. Pre Cálculo practice UI v2.
7. Pre Cálculo diagnostic system.
8. Pre Cálculo graph/modeling support.
9. Pre Cálculo formula/tutor panels.
10. Pre Cálculo past exams section.
11. Psychology visual redesign.
12. Psychology final question count.
13. Psychology count by class.
14. Psychology count by type.
15. Psychology diagnostic mode.
16. Psychology exam simulation mode.
17. Psychology incorrect review.
18. Psychology weakness map.
19. Generic practice cleanup.
20. How to add real Psychology content.
21. How to add Pre Cálculo past exams.
22. Animation and reduced-motion notes.
23. Build result.
24. Known limitations.
25. Next steps.