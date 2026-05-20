import type { PsychologyQuestion } from "./schema";

export const PSYCHOLOGY_QUESTION_SEED: PsychologyQuestion[] = [
  {
    id: "memoria-mc-001",
    classId: "clase-4-memoria",
    authorIds: ["gray"],
    conceptIds: ["memoria-sensorial", "modelo-modal"],
    subtopicIds: ["modelo-modal-memoria"],
    type: "multiple_choice",
    difficulty: "media",
    cognitiveSkill: "comprender",
    prompt:
      "Según el modelo modal, ¿cuál es la función principal de la memoria sensorial?",
    options: [
      { id: "A", text: "Almacenar recuerdos autobiográficos durante años." },
      { id: "B", text: "Mantener brevemente entradas sensoriales, incluso sin atención consciente." },
      { id: "C", text: "Coordinar todos los procesos conscientes de pensamiento." },
      { id: "D", text: "Convertir recuerdos episódicos en memoria implícita." },
    ],
    correctAnswer: "B",
    explanation:
      "La memoria sensorial mantiene por un periodo muy breve las entradas sensoriales que llegan al sistema, aunque la persona no preste atención a ellas.",
    distractorExplanations: {
      A: "Eso corresponde a memoria de largo plazo o episódica.",
      C: "La coordinación consciente se asocia más al ejecutivo central.",
      D: "No corresponde a una función de la memoria sensorial.",
    },
    commonMistake:
      "Confundir memoria sensorial con memoria de trabajo o largo plazo.",
    weaknessDetected: "Dificultad para comprender el modelo modal.",
    studyRecommendation:
      "Repasar memoria sensorial, atención, memoria de trabajo y memoria de largo plazo.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 4 - Memoria sensorial" },
      { kind: "texto", label: "Gray Cap. 9" },
    ],
    tags: ["memoria", "modelo modal", "memoria sensorial"],
  },
  {
    id: "memoria-mc-002",
    classId: "clase-4-memoria",
    authorIds: ["baddeley"],
    conceptIds: ["bucle-fonologico", "memoria-trabajo"],
    subtopicIds: ["memoria-trabajo-baddeley"],
    type: "multiple_choice",
    difficulty: "media",
    cognitiveSkill: "aplicar",
    prompt:
      "Una estudiante repite en silencio una lista de conceptos antes de entrar a una prueba. ¿Qué componente de la memoria de trabajo está usando principalmente?",
    options: [
      { id: "A", text: "Agenda visoespacial." },
      { id: "B", text: "Bucle fonológico." },
      { id: "C", text: "Memoria episódica." },
      { id: "D", text: "Memoria implícita." },
    ],
    correctAnswer: "B",
    explanation:
      "El bucle fonológico mantiene información verbal mediante repetición en voz baja o subvocal.",
    distractorExplanations: {
      A: "La agenda visoespacial mantiene información visual y espacial.",
      C: "La memoria episódica corresponde a experiencias personales.",
      D: "La memoria implícita corresponde a habilidades o procedimientos no conscientes.",
    },
    commonMistake:
      "Confundir información verbal con imágenes mentales.",
    weaknessDetected: "Confusión entre componentes de Baddeley.",
    studyRecommendation:
      "Repasar bucle fonológico, agenda visoespacial y ejecutivo central.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 4 - Bucle fonológico" },
      { kind: "texto", label: "Gray Cap. 9 / Baddeley" },
    ],
    tags: ["Baddeley", "memoria de trabajo", "bucle fonológico"],
  },
  {
    id: "memoria-dev-001",
    classId: "clase-4-memoria",
    authorIds: ["bartlett", "gray"],
    conceptIds: ["memoria-constructiva", "falsas-memorias"],
    subtopicIds: ["distorsion-falsas-memorias"],
    type: "short_development",
    difficulty: "alta",
    cognitiveSkill: "analizar",
    prompt:
      "Explique por qué la memoria humana puede considerarse constructiva y cómo esto ayuda a entender la aparición de falsas memorias.",
    correctAnswer:
      "La memoria es constructiva porque no recupera una copia exacta de lo ocurrido, sino que reconstruye información usando esquemas, asociaciones, contexto y experiencias previas. Esa reconstrucción puede distorsionarse por sugestión, imaginación o presión social, generando falsas memorias.",
    explanation:
      "La respuesta debe explicar reconstrucción, no solo decir que la memoria falla.",
    expectedAnswer:
      "Debe mencionar memoria constructiva, esquemas o guiones, recuperación, distorsión y un ejemplo como testigos presenciales.",
    gradingCriteria: [
      "Define memoria constructiva.",
      "Explica la reconstrucción del recuerdo.",
      "Menciona esquemas, contexto o asociaciones.",
      "Relaciona la reconstrucción con falsas memorias.",
      "Usa un ejemplo coherente.",
    ],
    commonMistake:
      "Decir solo que la memoria es imprecisa sin explicar el mecanismo constructivo.",
    weaknessDetected: "Dificultad para explicar memoria constructiva.",
    studyRecommendation:
      "Repasar construcción como distorsión, esquemas y falsas memorias.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 4 - Construcción como distorsión" },
      { kind: "cuaderno", label: "Apuntes Clase 4" },
    ],
    tags: ["memoria constructiva", "falsas memorias", "Bartlett"],
  },
  {
    id: "aprendizaje-mc-001",
    classId: "clase-5-aprendizaje",
    authorIds: ["pavlov", "watson"],
    conceptIds: ["estimulo-condicionado", "condicionamiento-clasico"],
    subtopicIds: ["little-albert"],
    type: "multiple_choice",
    difficulty: "media",
    cognitiveSkill: "aplicar",
    prompt:
      "En el caso de Little Albert, la rata blanca inicialmente no provocaba miedo, pero luego de asociarse con un ruido fuerte comenzó a generar miedo. Después del condicionamiento, ¿qué es la rata blanca?",
    options: [
      { id: "A", text: "Estímulo incondicionado." },
      { id: "B", text: "Respuesta incondicionada." },
      { id: "C", text: "Estímulo condicionado." },
      { id: "D", text: "Respuesta condicionada." },
    ],
    correctAnswer: "C",
    explanation:
      "La rata blanca era inicialmente neutra, pero después de asociarse con el ruido fuerte pasó a provocar miedo; por eso se vuelve estímulo condicionado.",
    distractorExplanations: {
      A: "El estímulo incondicionado era el ruido fuerte.",
      B: "La respuesta incondicionada era el miedo provocado por el ruido.",
      D: "La respuesta condicionada era el miedo ante la rata, no la rata misma.",
    },
    commonMistake: "Confundir estímulo con respuesta.",
    weaknessDetected: "Dificultad para identificar EI, RI, EC y RC.",
    studyRecommendation:
      "Repasar el esquema completo del condicionamiento clásico.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 5 - Little Albert" },
      { kind: "texto", label: "Feldman - Condicionamiento clásico" },
    ],
    tags: ["Little Albert", "Watson", "condicionamiento clásico"],
  },
  {
    id: "aprendizaje-mc-002",
    classId: "clase-5-aprendizaje",
    authorIds: ["skinner"],
    conceptIds: ["refuerzo-negativo", "condicionamiento-operante"],
    subtopicIds: ["refuerzo-castigo"],
    type: "multiple_choice",
    difficulty: "alta",
    cognitiveSkill: "analizar",
    prompt:
      "Una persona se pone el cinturón de seguridad porque así deja de sonar una alarma molesta del auto. ¿Qué tipo de consecuencia explica mejor el aumento de esta conducta?",
    options: [
      { id: "A", text: "Refuerzo positivo." },
      { id: "B", text: "Refuerzo negativo." },
      { id: "C", text: "Castigo positivo." },
      { id: "D", text: "Castigo negativo." },
    ],
    correctAnswer: "B",
    explanation:
      "Es refuerzo negativo porque la conducta aumenta al remover un estímulo no deseable: la alarma.",
    distractorExplanations: {
      A: "No se agrega algo deseable.",
      C: "El castigo positivo agrega algo desagradable para disminuir una conducta.",
      D: "El castigo negativo remueve algo deseable para disminuir una conducta.",
    },
    commonMistake: "Creer que negativo significa castigo.",
    weaknessDetected: "Confusión entre refuerzo negativo y castigo.",
    studyRecommendation:
      "Repasar que refuerzo aumenta conducta y castigo la disminuye; positivo agrega y negativo remueve.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 5 - Glosario refuerzo/castigo" },
    ],
    tags: ["Skinner", "refuerzo negativo", "condicionamiento operante"],
  },
  {
    id: "aprendizaje-dev-001",
    classId: "clase-5-aprendizaje",
    authorIds: ["skinner"],
    conceptIds: ["conducta-supersticiosa", "reforzamiento"],
    subtopicIds: ["supersticion"],
    type: "short_development",
    difficulty: "alta",
    cognitiveSkill: "analizar",
    prompt:
      "Explique cómo una conducta supersticiosa puede entenderse desde el condicionamiento operante.",
    correctAnswer:
      "Una conducta supersticiosa puede surgir cuando una conducta queda accidentalmente seguida por una consecuencia reforzante. Aunque no exista relación causal real, el organismo puede repetir la conducta porque fue seguida por un resultado favorable.",
    explanation:
      "Debe explicarse el refuerzo accidental y la ausencia de causalidad real.",
    expectedAnswer:
      "Debe mencionar condicionamiento operante, consecuencia reforzante, repetición de conducta y atribución errónea de causalidad.",
    gradingCriteria: [
      "Usa correctamente condicionamiento operante.",
      "Explica el rol de la consecuencia reforzante.",
      "Aclara que la relación puede ser accidental.",
      "Aplica la explicación a una superstición.",
    ],
    commonMistake:
      "Explicar superstición como creencia irracional sin conectarla con aprendizaje.",
    weaknessDetected: "Dificultad para aplicar condicionamiento operante.",
    studyRecommendation:
      "Repasar ley del efecto, reforzamiento y conducta supersticiosa.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 5 - Palomas supersticiosas" },
      { kind: "cuaderno", label: "Apuntes Clase 5" },
    ],
    tags: ["superstición", "Skinner", "reforzamiento"],
  },
  {
    id: "razonamiento-mc-001",
    classId: "clase-6-razonamiento-inteligencia",
    authorIds: ["gray"],
    conceptIds: ["razonamiento-inductivo"],
    subtopicIds: ["razonamiento-inductivo"],
    type: "multiple_choice",
    difficulty: "media",
    cognitiveSkill: "comprender",
    prompt:
      "¿Cuál alternativa describe mejor el razonamiento inductivo?",
    options: [
      { id: "A", text: "Derivar una conclusión necesariamente verdadera desde premisas aceptadas." },
      { id: "B", text: "Inferir un principio o hipótesis a partir de observaciones o experiencias previas." },
      { id: "C", text: "Mantener información verbal mediante repetición subvocal." },
      { id: "D", text: "Aplicar una regla gramatical universal al lenguaje." },
    ],
    correctAnswer: "B",
    explanation:
      "El razonamiento inductivo infiere un patrón o hipótesis desde observaciones o experiencias.",
    distractorExplanations: {
      A: "Eso describe razonamiento deductivo.",
      C: "Eso corresponde al bucle fonológico.",
      D: "Eso corresponde al innatismo lingüístico.",
    },
    commonMistake: "Confundir inducción con deducción.",
    weaknessDetected: "Dificultad para distinguir tipos de razonamiento.",
    studyRecommendation:
      "Repasar razonamiento inductivo, deductivo y ejemplos de clase.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 6 - Razonamiento inductivo" },
      { kind: "texto", label: "Gray Cap. 10" },
    ],
    tags: ["razonamiento", "inducción", "Gray"],
  },
  {
    id: "razonamiento-mc-002",
    classId: "clase-6-razonamiento-inteligencia",
    authorIds: ["gray"],
    conceptIds: ["sesgo-disponibilidad"],
    subtopicIds: ["sesgos"],
    type: "multiple_choice",
    difficulty: "alta",
    cognitiveSkill: "aplicar",
    prompt:
      "Una persona recibe un 'ok' breve de un amigo y recuerda de inmediato otras ocasiones negativas, concluyendo que el amigo está enojado. ¿Qué sesgo aparece con mayor claridad?",
    options: [
      { id: "A", text: "Sesgo de disponibilidad." },
      { id: "B", text: "Sesgo de mundo predecible." },
      { id: "C", text: "Habla telegráfica." },
      { id: "D", text: "Refuerzo negativo." },
    ],
    correctAnswer: "A",
    explanation:
      "El sesgo de disponibilidad aparece porque la persona da demasiado peso a recuerdos negativos fácilmente accesibles.",
    distractorExplanations: {
      B: "El mundo predecible implica atribuir patrones o causalidad donde puede no haber relación.",
      C: "Habla telegráfica pertenece al desarrollo del lenguaje.",
      D: "Refuerzo negativo pertenece al condicionamiento operante.",
    },
    commonMistake: "Confundir disponibilidad con confirmación.",
    weaknessDetected: "Dificultad para identificar sesgos en casos cotidianos.",
    studyRecommendation:
      "Repasar disponibilidad, confirmación y mundo predecible con ejemplos.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 6 - Escenario del 'ok'" },
    ],
    tags: ["sesgos", "disponibilidad", "razonamiento"],
  },
  {
    id: "razonamiento-dev-001",
    classId: "clase-6-razonamiento-inteligencia",
    authorIds: ["duncker", "gray"],
    conceptIds: ["insight", "problema-vela", "fijacion-funcional"],
    subtopicIds: ["insight-creatividad"],
    type: "short_development",
    difficulty: "alta",
    cognitiveSkill: "analizar",
    prompt:
      "Explique el problema de la vela como ejemplo de insight y fijación funcional.",
    correctAnswer:
      "El problema de la vela exige dejar de ver la caja solo como contenedor y verla como soporte para la vela. La dificultad surge por fijación funcional, porque se atribuye al objeto solo su uso habitual. El insight aparece cuando se reorganiza la representación del problema y surge la solución.",
    explanation:
      "La respuesta debe conectar cambio de perspectiva, insight y uso no habitual de la caja.",
    expectedAnswer:
      "Debe mencionar problema de la vela, caja, soporte, fijación funcional e insight.",
    gradingCriteria: [
      "Define insight.",
      "Explica fijación funcional.",
      "Describe la solución del problema.",
      "Relaciona solución con cambio de representación.",
    ],
    commonMistake:
      "Describir la solución sin explicar el concepto psicológico.",
    weaknessDetected: "Dificultad para aplicar insight y fijación funcional.",
    studyRecommendation:
      "Repasar problema de la vela y disposición mental.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 6 - Problema de la vela" },
      { kind: "texto", label: "Gray Cap. 10" },
    ],
    tags: ["insight", "Duncker", "fijación funcional"],
  },
  {
    id: "lenguaje-mc-001",
    classId: "clase-7-lenguaje",
    authorIds: ["feldman"],
    conceptIds: ["fonologia", "sintaxis", "semantica"],
    subtopicIds: ["gramatica"],
    type: "multiple_choice",
    difficulty: "media",
    cognitiveSkill: "comprender",
    prompt:
      "¿Cuál alternativa distingue correctamente fonología, sintaxis y semántica?",
    options: [
      { id: "A", text: "Fonología estudia significados; sintaxis estudia sonidos; semántica estudia memoria." },
      { id: "B", text: "Fonología estudia fonemas; sintaxis estudia combinación de palabras; semántica estudia significado." },
      { id: "C", text: "Fonología estudia cultura; sintaxis estudia emoción; semántica estudia percepción." },
      { id: "D", text: "Fonología, sintaxis y semántica son nombres distintos para el mismo proceso." },
    ],
    correctAnswer: "B",
    explanation:
      "Fonología se relaciona con fonemas, sintaxis con orden y combinación, y semántica con significado.",
    distractorExplanations: {
      A: "Invierte los conceptos y agrega memoria.",
      C: "No corresponde a los componentes de gramática.",
      D: "Son componentes distintos.",
    },
    commonMistake: "Confundir sintaxis con semántica.",
    weaknessDetected: "Dificultad en componentes gramaticales.",
    studyRecommendation:
      "Repasar fonología, sintaxis y semántica con ejemplos.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 7 - Gramática" },
      { kind: "texto", label: "Feldman Módulo 22" },
    ],
    tags: ["lenguaje", "gramática", "Feldman"],
  },
  {
    id: "lenguaje-mc-002",
    classId: "clase-7-lenguaje",
    authorIds: ["sapir-whorf"],
    conceptIds: ["hipotesis-debil", "relatividad-linguistica"],
    subtopicIds: ["relatividad-linguistica"],
    type: "multiple_choice",
    difficulty: "alta",
    cognitiveSkill: "analizar",
    prompt:
      "¿Cuál alternativa representa mejor la hipótesis débil de Sapir-Whorf trabajada en clase?",
    options: [
      { id: "A", text: "El lenguaje determina completamente lo que una persona puede pensar." },
      { id: "B", text: "El lenguaje puede influir en cómo las personas experimentan y categorizan el mundo." },
      { id: "C", text: "El pensamiento no tiene relación con el lenguaje." },
      { id: "D", text: "Todos los idiomas organizan la experiencia del mismo modo." },
    ],
    correctAnswer: "B",
    explanation:
      "La hipótesis débil plantea influencia del lenguaje sobre el pensamiento, no determinación completa.",
    distractorExplanations: {
      A: "Eso corresponde a la versión fuerte/determinista.",
      C: "Contradice la relación lenguaje-pensamiento trabajada en clase.",
      D: "Contradice la relatividad lingüística.",
    },
    commonMistake: "Confundir influir con determinar.",
    weaknessDetected: "Confusión entre hipótesis fuerte y débil.",
    studyRecommendation:
      "Repasar Sapir-Whorf, hipótesis fuerte, hipótesis débil y Aymara.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 7 - Sapir-Whorf" },
      { kind: "texto", label: "Feldman Módulo 22" },
    ],
    tags: ["Sapir-Whorf", "relatividad lingüística", "Aymara"],
  },
  {
    id: "lenguaje-dev-001",
    classId: "clase-7-lenguaje",
    authorIds: ["chomsky", "skinner"],
    conceptIds: [
      "teoria-aprendizaje-lenguaje",
      "innatismo",
      "interaccionismo",
    ],
    subtopicIds: ["teorias-adquisicion-lenguaje"],
    type: "short_development",
    difficulty: "alta",
    cognitiveSkill: "comparar",
    prompt:
      "Compare la teoría del aprendizaje, el enfoque innatista y el enfoque interaccionista sobre la adquisición del lenguaje.",
    correctAnswer:
      "La teoría del aprendizaje explica el lenguaje por refuerzo, modelaje y experiencia con cuidadores. El innatismo de Chomsky propone un dispositivo de adquisición del lenguaje y una gramática universal. El interaccionismo combina predisposiciones biológicas con exposición ambiental.",
    explanation:
      "La respuesta debe comparar las teorías, no solo nombrarlas.",
    expectedAnswer:
      "Debe mencionar refuerzo/modelaje, Chomsky, dispositivo de adquisición, gramática universal e integración biología-ambiente.",
    gradingCriteria: [
      "Explica teoría del aprendizaje.",
      "Explica innatismo.",
      "Explica interaccionismo.",
      "Compara diferencias entre enfoques.",
      "Evita presentar una teoría como explicación total.",
    ],
    commonMistake:
      "Nombrar las teorías sin explicar sus diferencias.",
    weaknessDetected: "Dificultad para comparar teorías de adquisición.",
    studyRecommendation:
      "Repasar teoría del aprendizaje, Chomsky e interaccionismo.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 7 - Adquisición del lenguaje" },
      { kind: "texto", label: "Feldman Módulo 22" },
    ],
    tags: ["lenguaje", "Chomsky", "interaccionismo"],
  },
];