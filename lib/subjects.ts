export type PracticeFormat =
  | 'multiple-choice'
  | 'true-false'
  | 'flashcards'
  | 'open'
  | 'problem-solving'
  | 'exam'
  | 'all'

export type EvaluationTarget =
  | 'todas'
  | 'control'
  | 'control-lectura'
  | 'prueba'
  | 'interrogacion'
  | 'dossier'
  | 'ensayo'
  | 'columna'
  | 'actividad-evaluada'
  | 'evaluacion-oral'
  | 'taller-fuentes'
  | 'tarea-clase'
  | 'trabajo-final'
  | 'trabajo-grupal'
  | 'lectura-colaborativa'
  | 'poster'
  | 'examen-final'

export type SubjectStudyMode =
  | 'seminar-text'
  | 'history-analysis'
  | 'math-problem-solving'
  | 'memory-understanding'
  | 'sociology-analysis'
  | 'mixed'

export type SubjectReading = {
  id: string
  title: string
  authors?: string
  notes?: string
  linkedEvaluationKinds?: EvaluationTarget[]
}

export type SubjectUnit = {
  id: string
  name: string
  description?: string
  topics: string[]
  readings?: SubjectReading[]
  linkedEvaluationKinds?: EvaluationTarget[]
}

export type SubjectPreset = {
  name: string
  color: string
  icon?: string
  studyMode: SubjectStudyMode
  preferredDefaultFormat: PracticeFormat
  allowedFormats: PracticeFormat[]
  evaluationKinds: EvaluationTarget[]
  units: SubjectUnit[]
}

export const SUBJECT_PRESETS: SubjectPreset[] = [
  {
    name: 'Seminario',
    color: '#22c55e',
    icon: '📝',
    studyMode: 'seminar-text',
    preferredDefaultFormat: 'exam',
    allowedFormats: ['multiple-choice', 'open', 'exam', 'all', 'flashcards'],
    evaluationKinds: [
      'todas',
      'control-lectura',
      'prueba',
      'ensayo',
      'columna',
      'actividad-evaluada',
      'trabajo-final',
      'poster',
      'examen-final',
    ],
    units: [
      {
        id: 'seminario-u1',
        name: 'Unidad 1: ¿Qué es el aire que respiramos?',
        description:
          'Introducción a la contaminación atmosférica, medición, fuentes y relación con salud.',
        topics: [
          'Introducción a la contaminación atmosférica',
          'Cómo se mide',
          'Fuentes de contaminación atmosférica',
          'Contaminación y salud',
        ],
        linkedEvaluationKinds: ['control-lectura', 'prueba', 'actividad-evaluada'],
        readings: [
          {
            id: 'sem-u1-r1',
            title: 'Guía de Calidad del Aire y Educación Ambiental',
            authors: 'Ministerio del Medio Ambiente',
            linkedEvaluationKinds: ['control-lectura', 'prueba'],
          },
          {
            id: 'sem-u1-r2',
            title: 'Conversaciones de calidad del aire en Chile',
            authors: 'Z. Fleming / ANID',
            linkedEvaluationKinds: ['control-lectura', 'prueba'],
          },
          {
            id: 'sem-u1-r3',
            title: 'Modelo de Desarrollo y Problemas Ambientales – Cap. 2',
            authors: 'Ingeniería UDD / ANID',
            linkedEvaluationKinds: ['control-lectura', 'prueba'],
          },
          {
            id: 'sem-u1-r4',
            title: 'Sensores de bajo costo en la caracterización de partículas finas (PM2.5)',
            authors: 'Ninahuamán et al.',
            linkedEvaluationKinds: ['control-lectura', 'prueba'],
          },
          {
            id: 'sem-u1-r5',
            title: 'Ambient PM2.5 Exposure Modeling in LMICs',
            authors: 'Blanco-Villafuerte et al.',
            linkedEvaluationKinds: ['control-lectura', 'prueba'],
          },
          {
            id: 'sem-u1-r6',
            title: 'El aire que respiramos',
            authors: 'CR2',
            linkedEvaluationKinds: ['control-lectura', 'prueba'],
          },
          {
            id: 'sem-u1-r7',
            title: 'Indoor PM2.5 in an urban zone with heavy wood smoke pollution',
            authors: 'Jorquera et al.',
            linkedEvaluationKinds: ['control-lectura', 'prueba'],
          },
          {
            id: 'sem-u1-r8',
            title: 'Contaminación atmosférica y asma en niños',
            authors: 'Ubilla y Yohannessen',
            linkedEvaluationKinds: ['control-lectura', 'prueba'],
          },
          {
            id: 'sem-u1-r9',
            title: 'Contaminación aérea y sus efectos en la salud',
            authors: 'Oyarzún',
            linkedEvaluationKinds: ['control-lectura', 'prueba'],
          },
        ],
      },
      {
        id: 'seminario-u2',
        name: 'Unidad 2: Territorio y dinámicas ambientales',
        description:
          'Patrones espaciales y temporales, incendios forestales y análisis AGIES/costo-beneficio.',
        topics: [
          'Patrones espaciales y temporales',
          'Incendios forestales 1',
          'Incendios forestales 2',
          'AGIES',
          'Análisis costo/beneficio de la mitigación',
        ],
        linkedEvaluationKinds: ['prueba', 'actividad-evaluada', 'ensayo', 'columna'],
        readings: [
          {
            id: 'sem-u2-r1',
            title: 'Guía metodológica AGIES para instrumentos de gestión de calidad del aire',
            authors: 'Ministerio del Medio Ambiente',
            linkedEvaluationKinds: ['prueba', 'actividad-evaluada'],
          },
          {
            id: 'sem-u2-r2',
            title: 'Impacto económico y social del plan de descontaminación de Temuco',
            authors: 'Ministerio del Medio Ambiente',
            linkedEvaluationKinds: ['prueba', 'actividad-evaluada'],
          },
          {
            id: 'sem-u2-r3',
            title: 'Cambio climático y su impacto potencial en incendios forestales',
            authors: 'González et al.',
            linkedEvaluationKinds: ['prueba', 'ensayo', 'columna'],
          },
          {
            id: 'sem-u2-r4',
            title: 'Recent wildfires in Central Chile',
            authors: 'Sarricolea et al.',
            linkedEvaluationKinds: ['prueba', 'ensayo', 'columna'],
          },
          {
            id: 'sem-u2-r5',
            title: 'Incendios forestales en Chile: causas, impactos y resiliencia',
            authors: 'CR2',
            linkedEvaluationKinds: ['prueba', 'ensayo', 'columna'],
          },
        ],
      },
      {
        id: 'seminario-u3',
        name: 'Unidad 3: Inequidad',
        description:
          'Pobreza energética, espacio verde, justicia ambiental, transporte y exposición.',
        topics: [
          'Pobreza energética y contaminación atmosférica',
          'Espacio verde y justicia ambiental',
          'Transporte, urbanismo y exposición',
          'Desigualdad territorial',
        ],
        linkedEvaluationKinds: ['ensayo', 'columna', 'actividad-evaluada', 'poster'],
        readings: [
          {
            id: 'sem-u3-r1',
            title: 'Políticas públicas y pobreza energética en Chile',
            authors: 'Calvo et al.',
            linkedEvaluationKinds: ['ensayo', 'columna'],
          },
          {
            id: 'sem-u3-r2',
            title: 'Historias de Cambios – Aire',
            authors: 'Historias de Cambios',
            linkedEvaluationKinds: ['ensayo', 'columna'],
          },
          {
            id: 'sem-u3-r3',
            title: 'Dime qué tipo de vegetación tienes y te diré en qué comuna vives',
            authors: 'Fernández',
            linkedEvaluationKinds: ['ensayo', 'columna'],
          },
          {
            id: 'sem-u3-r4',
            title: 'Environmental justice and air quality in Santiago de Chile',
            authors: 'Rose-Pérez',
            linkedEvaluationKinds: ['ensayo', 'columna'],
          },
          {
            id: 'sem-u3-r5',
            title: '¿Qué es la justicia ambiental?',
            authors: 'CR2',
            linkedEvaluationKinds: ['ensayo', 'columna'],
          },
        ],
      },
      {
        id: 'seminario-u4',
        name: 'Unidad 4: Políticas y futuro',
        description:
          'Políticas públicas, zonas de sacrificio, investigación grupal, comunicación académica y póster.',
        topics: [
          'Normas de políticas públicas',
          'Zonas de sacrificio',
          'Comunicación académica',
          'Pregunta de investigación',
          'Síntesis y póster',
        ],
        linkedEvaluationKinds: ['actividad-evaluada', 'trabajo-final', 'poster'],
        readings: [
          {
            id: 'sem-u4-r1',
            title: 'Análisis de antecedentes y evaluación de impactos para revisar normas NO2, O3 y CO',
            authors: 'Informe Final',
            linkedEvaluationKinds: ['actividad-evaluada', 'trabajo-final'],
          },
          {
            id: 'sem-u4-r2',
            title: 'Mini Documental Cultura Energética',
            authors: 'Red Pobreza Energética',
            linkedEvaluationKinds: ['actividad-evaluada', 'trabajo-final'],
          },
          {
            id: 'sem-u4-r3',
            title: 'Guardianas de la Tierra – Definiendo el aire de Quintero',
            authors: 'Sustentabilidad AI Aire',
            linkedEvaluationKinds: ['actividad-evaluada', 'trabajo-final'],
          },
        ],
      },
    ],
  },

  {
    name: 'Psicología',
    color: '#ec4899',
    icon: '🧠',
    studyMode: 'memory-understanding',
    preferredDefaultFormat: 'multiple-choice',
    allowedFormats: [
      'multiple-choice',
      'true-false',
      'open',
      'flashcards',
      'exam',
      'all',
    ],
    evaluationKinds: [
      'todas',
      'lectura-colaborativa',
      'prueba',
      'examen-final',
    ],
    units: [
      {
        id: 'psi-u1',
        name: 'Prueba 1',
        description:
          'Psicología como disciplina científica, bases biológicas, sensación/percepción y atención.',
        topics: [
          'Psicología como disciplina científica',
          'Diseños y ciencia psicológica',
          'Bases biológicas de la conducta',
          'Sensación y percepción',
          'Atención',
        ],
        linkedEvaluationKinds: ['prueba', 'lectura-colaborativa'],
        readings: [
          {
            id: 'psi-u1-r1',
            title: 'Gray cap. 2',
            authors: 'Gray',
            linkedEvaluationKinds: ['prueba'],
          },
          {
            id: 'psi-u1-r2',
            title: 'Stanovich caps. 1 y 2',
            authors: 'Stanovich',
            linkedEvaluationKinds: ['prueba'],
          },
          {
            id: 'psi-u1-r3',
            title: 'Lilienfeld cap. 3',
            authors: 'Lilienfeld',
            linkedEvaluationKinds: ['lectura-colaborativa'],
          },
          {
            id: 'psi-u1-r4',
            title: 'Lilienfeld cap. 4',
            authors: 'Lilienfeld',
            linkedEvaluationKinds: ['lectura-colaborativa'],
          },
          {
            id: 'psi-u1-r5',
            title: 'Jahnke & Nowaczyk cap. 2',
            authors: 'Jahnke & Nowaczyk',
            linkedEvaluationKinds: ['prueba'],
          },
          {
            id: 'psi-u1-r6',
            title: 'Hari cap. 1',
            authors: 'Hari',
            linkedEvaluationKinds: ['prueba'],
          },
        ],
      },
      {
        id: 'psi-u2',
        name: 'Prueba 2',
        description:
          'Memoria, aprendizaje, razonamiento/inteligencia y comunicación/lenguaje.',
        topics: [
          'Memoria',
          'Aprendizaje',
          'Razonamiento',
          'Inteligencia',
          'Comunicación y lenguaje',
        ],
        linkedEvaluationKinds: ['prueba', 'lectura-colaborativa'],
        readings: [
          {
            id: 'psi-u2-r1',
            title: 'Gray cap. 9',
            authors: 'Gray',
            linkedEvaluationKinds: ['lectura-colaborativa'],
          },
          {
            id: 'psi-u2-r2',
            title: 'Feldman cap. 5',
            authors: 'Feldman',
            linkedEvaluationKinds: ['lectura-colaborativa'],
          },
          {
            id: 'psi-u2-r3',
            title: 'Gray cap. 10',
            authors: 'Gray',
            linkedEvaluationKinds: ['lectura-colaborativa'],
          },
          {
            id: 'psi-u2-r4',
            title: 'Feldman cap. 7 (módulo 22)',
            authors: 'Feldman',
            linkedEvaluationKinds: ['lectura-colaborativa'],
          },
        ],
      },
      {
        id: 'psi-u3',
        name: 'Prueba 3',
        description:
          'Motivación, emoción, personalidad, mente social y bienestar/psicopatología.',
        topics: [
          'Motivación',
          'Emoción',
          'Personalidad',
          'Mente social',
          'Bienestar',
          'Psicopatología',
        ],
        linkedEvaluationKinds: ['prueba', 'lectura-colaborativa'],
        readings: [
          {
            id: 'psi-u3-r1',
            title: 'Feldman cap. 8',
            authors: 'Feldman',
            linkedEvaluationKinds: ['lectura-colaborativa'],
          },
          {
            id: 'psi-u3-r2',
            title: 'Lilienfeld cap. 12',
            authors: 'Lilienfeld',
            linkedEvaluationKinds: ['lectura-colaborativa'],
          },
          {
            id: 'psi-u3-r3',
            title: 'Feldman cap. 14',
            authors: 'Feldman',
            linkedEvaluationKinds: ['lectura-colaborativa'],
          },
          {
            id: 'psi-u3-r4',
            title: 'Feldman cap. 12 (módulos 37 y 39)',
            authors: 'Feldman',
            linkedEvaluationKinds: ['lectura-colaborativa'],
          },
        ],
      },
    ],
  },

  {
    name: 'Sociología',
    color: '#14b8a6',
    icon: '🌍',
    studyMode: 'sociology-analysis',
    preferredDefaultFormat: 'exam',
    allowedFormats: ['multiple-choice', 'open', 'exam', 'all', 'flashcards'],
    evaluationKinds: [
      'todas',
      'prueba',
      'tarea-clase',
      'trabajo-grupal',
    ],
    units: [
      {
        id: 'soc-u1',
        name: 'Unidad 1: La sociología como punto de vista',
        description:
          'Sentido común y sociología, pregunta/problema, disciplina y oficio sociológico.',
        topics: [
          'Sentido común y sociología',
          'Continuidad y ruptura',
          'Pregunta sociológica',
          'Objeto sociológico',
          'Disciplina sociológica',
          'Oficio sociológico',
          'Reflexividad',
          'Abordajes metodológicos',
        ],
        linkedEvaluationKinds: ['prueba', 'tarea-clase'],
        readings: [
          {
            id: 'soc-u1-r1',
            title: 'La imaginación sociológica',
            authors: 'C. W. Mills',
            linkedEvaluationKinds: ['prueba'],
          },
          {
            id: 'soc-u1-r2',
            title: 'Pensando sociológicamente',
            authors: 'Zygmunt Bauman',
            linkedEvaluationKinds: ['prueba'],
          },
          {
            id: 'soc-u1-r3',
            title: '¿La doble crisis de la sociología en Chile?',
            authors: 'Undurraga y Ariztía',
            linkedEvaluationKinds: ['prueba'],
          },
        ],
      },
      {
        id: 'soc-u2',
        name: 'Unidad 2: Enfoques y conceptos básicos',
        description:
          'Sociedad y cambio, grupos, redes, cultura, identidades, normas, lenguaje e instituciones.',
        topics: [
          'Sociedad y cambio social',
          'Grupos',
          'Interacciones',
          'Redes',
          'Cultura',
          'Identidades',
          'Normas',
          'Lenguaje',
          'Instituciones sociales',
          'Estructuración',
        ],
        linkedEvaluationKinds: ['prueba', 'tarea-clase'],
        readings: [
          {
            id: 'soc-u2-r1',
            title: 'La Sociología Pública',
            authors: 'Michael Burawoy',
            linkedEvaluationKinds: ['prueba'],
          },
          {
            id: 'soc-u2-r2',
            title: 'La sociedad del riesgo (cap. 1)',
            authors: 'Ulrich Beck',
            linkedEvaluationKinds: ['prueba'],
          },
          {
            id: 'soc-u2-r3',
            title: 'Relaciones en público',
            authors: 'Erving Goffman',
            linkedEvaluationKinds: ['prueba'],
          },
        ],
      },
      {
        id: 'soc-u3',
        name: 'Unidad 3: Problemas sociales contemporáneos',
        description:
          'Desigualdad, política, movimientos sociales, religión, economía, pobreza y vulnerabilidad.',
        topics: [
          'Desigualdad',
          'Estratificación social',
          'Política',
          'Movimientos sociales',
          'Religión',
          'Espiritualidad',
          'Economía y sociedad',
          'Pobreza',
          'Vulnerabilidad social',
        ],
        linkedEvaluationKinds: ['prueba', 'tarea-clase'],
        readings: [
          {
            id: 'soc-u3-r1',
            title: 'Desiguales (síntesis)',
            authors: 'PNUD',
            linkedEvaluationKinds: ['prueba'],
          },
          {
            id: 'soc-u3-r2',
            title: 'Sociabilidad y asociatividad',
            authors: 'Valenzuela y Cousiño',
            linkedEvaluationKinds: ['prueba'],
          },
          {
            id: 'soc-u3-r3',
            title: 'Transformaciones sociales y desafíos para la política',
            authors: 'Kathya Araujo',
            linkedEvaluationKinds: ['prueba'],
          },
          {
            id: 'soc-u3-r4',
            title: '¿Existe Latinoamérica?',
            authors: 'Inglehart y Carballo',
            linkedEvaluationKinds: ['prueba'],
          },
          {
            id: 'soc-u3-r5',
            title: 'Expuestos y confundidos',
            authors: 'Auyero y Swistun',
            linkedEvaluationKinds: ['prueba'],
          },
          {
            id: 'soc-u3-r6',
            title: 'La construcción de problemas sociales',
            authors: 'Alejandro Frigerio',
            linkedEvaluationKinds: ['prueba'],
          },
        ],
      },
      {
        id: 'soc-u4',
        name: 'Unidad 4: El quehacer profesional de la sociología',
        description:
          'Trabajo sociológico en sector público, consultoría, empresas, academia, ONGs y organismos internacionales.',
        topics: [
          'Servicio público',
          'Consultoría',
          'Empresas',
          'Universidades',
          'Centros de investigación',
          'Fundaciones',
          'ONGs',
          'Organismos internacionales',
        ],
        linkedEvaluationKinds: ['tarea-clase', 'trabajo-grupal'],
        readings: [],
      },
    ],
  },

  {
    name: 'Historia',
    color: '#7c3aed',
    icon: '📚',
    studyMode: 'history-analysis',
    preferredDefaultFormat: 'exam',
    allowedFormats: ['multiple-choice', 'open', 'exam', 'all', 'flashcards'],
    evaluationKinds: [
      'todas',
      'control-lectura',
      'taller-fuentes',
      'evaluacion-oral',
    ],
    units: [
      {
        id: 'hist-u1',
        name: 'Unidad 1: Introducción',
        description:
          'Qué entendemos por historia contemporánea, cronología, geografía, modernidad y relación con el mundo contemporáneo.',
        topics: [
          'Historia contemporánea',
          'Cronología del período',
          'Marco geográfico',
          'Modernidad',
          'Historiografía',
        ],
        linkedEvaluationKinds: ['control-lectura'],
        readings: [],
      },
      {
        id: 'hist-u2',
        name: 'Unidad 2: Crisis del liberalismo y guerras mundiales',
        description:
          'Primera Guerra Mundial, crisis del progreso, vanguardias, Segunda Guerra Mundial y efectos globales.',
        topics: [
          'Primera Guerra Mundial',
          'Fin de la quimera del progreso',
          'Eurocentrismo',
          'Vanguardias artísticas',
          'Malestar de la cultura',
          'Segunda Guerra Mundial',
          'Posguerra',
          'Efectos globales del conflicto',
        ],
        linkedEvaluationKinds: ['control-lectura', 'taller-fuentes'],
        readings: [
          {
            id: 'hist-u2-r1',
            title: 'El reparto de África',
            authors: 'Roberto Ceamanos',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u2-r2',
            title: '1914: De la paz a la guerra',
            authors: 'Margaret Macmillan',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u2-r3',
            title: 'La nacionalización de las masas',
            authors: 'George Mosse',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u2-r4',
            title: 'Tierras de sangre',
            authors: 'Timothy Snyder',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u2-r5',
            title: 'La Primera Guerra Mundial: ¿la era de la mujer?',
            authors: 'Françoise Thébaud',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u2-r6',
            title: 'A sangre y fuego',
            authors: 'Enzo Traverso',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u2-r7',
            title: 'Discurso sobre el colonialismo',
            authors: 'Aimé Césaire',
            linkedEvaluationKinds: ['taller-fuentes'],
          },
          {
            id: 'hist-u2-r8',
            title: 'Los condenados de la tierra',
            authors: 'Frantz Fanon',
            linkedEvaluationKinds: ['taller-fuentes'],
          },
          {
            id: 'hist-u2-r9',
            title: 'El dominio del Eje en la Europa ocupada',
            authors: 'Raphael Lemkin',
            linkedEvaluationKinds: ['taller-fuentes'],
          },
          {
            id: 'hist-u2-r10',
            title: 'Si esto es un hombre',
            authors: 'Primo Levi',
            linkedEvaluationKinds: ['taller-fuentes'],
          },
        ],
      },
      {
        id: 'hist-u3',
        name: 'Unidad 3: Guerra Fría',
        description:
          'Edad de oro, descolonización, globalización, polarización, disidencias, resistencias y fin de la Guerra Fría.',
        topics: [
          'Edad de oro',
          'Progreso global',
          'Era atómica',
          'Globalización',
          'Descolonización',
          'Polarización política',
          'Disidencias',
          'Resistencias',
          'Fin de la Guerra Fría',
        ],
        linkedEvaluationKinds: ['control-lectura', 'taller-fuentes'],
        readings: [
          {
            id: 'hist-u3-r1',
            title: 'Posguerra (caps. IX y X)',
            authors: 'Tony Judt',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u3-r2',
            title: 'La limpieza étnica de Palestina',
            authors: 'Ilan Pappé',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u3-r3',
            title: 'Guerra por las ideas en América Latina',
            authors: 'Rafael Pedemonte',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u3-r4',
            title: 'Tierras de sangre (caps. X y XI)',
            authors: 'Timothy Snyder',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u3-r5',
            title: 'La Guerra Fría',
            authors: 'Odd Arne Westad',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u3-r6',
            title: 'Posguerra cap. XII: El espectro de la revolución',
            authors: 'Tony Judt',
            linkedEvaluationKinds: ['taller-fuentes'],
          },
          {
            id: 'hist-u3-r7',
            title: 'Sobre la violencia',
            authors: 'Hannah Arendt',
            linkedEvaluationKinds: ['taller-fuentes'],
          },
          {
            id: 'hist-u3-r8',
            title: 'Mujeres, raza y clase',
            authors: 'Angela Davis',
            linkedEvaluationKinds: ['taller-fuentes'],
          },
        ],
      },
      {
        id: 'hist-u4',
        name: 'Unidad 4: Nuevo orden mundial',
        description:
          'Fin de la historia, crisis democrática, ciudadanía, tecnología, naturaleza y cultura en el siglo XXI.',
        topics: [
          'Fin de la historia',
          'Crisis de la democracia',
          'Ciudadanía',
          'Valores democráticos',
          'Tecnología',
          'Naturaleza',
          'Cultura humana',
          'Siglo XXI',
        ],
        linkedEvaluationKinds: ['control-lectura', 'evaluacion-oral'],
        readings: [
          {
            id: 'hist-u4-r1',
            title: 'Posguerra cap. XIX: El fin del viejo orden',
            authors: 'Tony Judt',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u4-r2',
            title: 'Cómo mueren las democracias',
            authors: 'Levitsky y Ziblatt',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u4-r3',
            title: 'Democracia y ocupación militar en Oriente Medio',
            authors: 'Gema Martín Muñoz',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u4-r4',
            title: 'El odio a la democracia',
            authors: 'Jacques Rancière',
            linkedEvaluationKinds: ['control-lectura'],
          },
          {
            id: 'hist-u4-r5',
            title: 'Nuevo orden mundial y el mundo islámico',
            authors: 'Antoni Segura',
            linkedEvaluationKinds: ['control-lectura'],
          },
        ],
      },
    ],
  },

  {
    name: 'Precálculo',
    color: '#2563eb',
    icon: '📐',
    studyMode: 'math-problem-solving',
    preferredDefaultFormat: 'problem-solving',
    allowedFormats: [
      'problem-solving',
      'multiple-choice',
      'open',
      'exam',
      'all',
      'flashcards',
    ],
    evaluationKinds: [
      'todas',
      'control',
      'prueba',
      'interrogacion',
      'examen-final',
    ],
    units: [
      {
        id: 'pre-u1',
        name: 'Unidad 1',
        description:
          'Placeholder temporal hasta que me mandes el programa real de Precálculo.',
        topics: [
          'Álgebra',
          'Funciones',
          'Trigonometría',
          'Polinomios',
          'Inecuaciones',
          'Sistemas de ecuaciones',
        ],
        readings: [],
        linkedEvaluationKinds: ['todas'],
      },
    ],
  },
]

export const SUBJECT_COLORS: Record<string, string> = Object.fromEntries(
  SUBJECT_PRESETS.map((subject) => [subject.name, subject.color])
)

export function getSubjectPreset(subjectName: string) {
  return SUBJECT_PRESETS.find((subject) => subject.name === subjectName) || null
}

export function getSubjectColor(subjectName: string) {
  return SUBJECT_COLORS[subjectName] || '#2563eb'
}

export function getSubjectUnits(subjectName: string) {
  return getSubjectPreset(subjectName)?.units || []
}

export function getSubjectTopics(subjectName: string) {
  return getSubjectUnits(subjectName).flatMap((unit) => unit.topics || [])
}

export function getSubjectReadings(subjectName: string) {
  return getSubjectUnits(subjectName).flatMap((unit) => unit.readings || [])
}

export function getEvaluationKinds(subjectName: string) {
  return getSubjectPreset(subjectName)?.evaluationKinds || ['todas']
}

export function getAllowedFormats(subjectName: string) {
  return getSubjectPreset(subjectName)?.allowedFormats || ['multiple-choice']
}


export const SUBJECT_CODE_TO_NAME: Record<string, string> = {
  SOL500: 'Sociología',
  MAT1000: 'Precálculo',
  PSI1101: 'Psicología',
  IHI0204: 'Historia',
  SEMINARIO: 'Seminario',
}

export function getSubjectName(subject?: string | null) {
  if (!subject) return 'Sin asignatura'
  return SUBJECT_CODE_TO_NAME[subject] || subject
}

export function getSubjectPresetByCodeOrName(subject?: string | null) {
  if (!subject) return null
  const name = getSubjectName(subject)

  return (
    SUBJECT_PRESETS.find((preset) => preset.name === name) ||
    SUBJECT_PRESETS.find((preset) => preset.name === subject) ||
    null
  )
}

export function getSubjectColorByCodeOrName(subject?: string | null) {
  const preset = getSubjectPresetByCodeOrName(subject)
  return preset?.color || '#2563eb'
}
