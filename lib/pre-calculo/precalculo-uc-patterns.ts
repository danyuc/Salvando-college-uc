import type { UCPattern } from './precalculo-types';

export const ucPatterns: UCPattern[] = [
  {
    "id": "trigonometr-a-uc-identidades-cuadrantes-y-ngulos",
    "name": "Trigonometría UC: identidades, cuadrantes y ángulos",
    "frequency": 60,
    "structure": "sen/cos/tan, cuadrantes, identidades, inversas trig",
    "invariantLogic": "signos por cuadrante e identidades pitagóricas.",
    "method": "Determinar cuadrante; usar identidad; aplicar fórmula de suma/doble si corresponde.",
    "commonErrors": [
      "signo incorrecto",
      "rango de función inversa",
      "confundir sen^2 con sen(2x)"
    ],
    "level": "muy frecuente",
    "examples": [
      "mat1000-i1-2026-forma-b-ej11",
      "mat1000-i1-2026-forma-b-ej12",
      "mat1000-i1-2026-forma-a-ej11",
      "mat1000-i1-2026-forma-a-ej12",
      "mat1000-i2-2025-forma-b-ej04",
      "mat1000-i2-2025-forma-b-ej05",
      "mat1000-i2-2025-forma-b-ej07",
      "mat1000-i2-2024-forma-b-ej07",
      "mat1000-i2-2024-forma-a-ej07",
      "mat1000-i2-2026-forma-a-ej04"
    ]
  },
  {
    "id": "rectas-pendientes-e-intersecciones",
    "name": "Rectas, pendientes e intersecciones",
    "frequency": 35,
    "structure": "pendiente, paralela/perpendicular, cortes con ejes",
    "invariantLogic": "pendiente e intersecciones definen rectas.",
    "method": "Calcular pendiente, usar punto-pendiente, despejar forma principal y cortes.",
    "commonErrors": [
      "invertir pendiente",
      "perpendicular sin recíproco negativo",
      "confundir corte x con corte y"
    ],
    "level": "muy frecuente",
    "examples": [
      "mat1000-i1-2025-forma-a-ej02",
      "mat1000-i1-2025-forma-a-ej05",
      "mat1000-i1-2025-forma-a-ej06",
      "mat1000-i1-2025-forma-a-ej11",
      "mat1000-i1-2026-forma-b-ej01",
      "mat1000-i1-2026-forma-b-ej02",
      "mat1000-i1-2026-forma-b-ej03",
      "mat1000-i1-2026-forma-b-ej04",
      "mat1000-i1-2026-forma-b-ej05",
      "mat1000-i1-2026-forma-b-ej07"
    ]
  },
  {
    "id": "polinomios-resto-factores-y-ra-ces",
    "name": "Polinomios: resto, factores y raíces",
    "frequency": 28,
    "structure": "teorema del resto, división, raíces racionales, factores",
    "invariantLogic": "evaluar o factorizar según divisor/factor.",
    "method": "Usar teorema del resto P(c); división sintética/larga; raíces racionales si aplica.",
    "commonErrors": [
      "usar c con signo incorrecto",
      "confundir cociente con resto",
      "no considerar multiplicidad"
    ],
    "level": "muy frecuente",
    "examples": [
      "mat1000-i1-2025-forma-a-ej12",
      "mat1000-i1-2024-forma-a-ej12",
      "mat1000-i1-2025-forma-b-ej12",
      "mat1000-i1-2024-forma-b-ej12",
      "mat1000-i2-2025-forma-b-ej12",
      "mat1000-i2-2025-forma-a-ej12",
      "mat1000-i3-2024-forma-b-ej07",
      "mat1000-i3-2024-forma-b-ej08",
      "mat1000-i3-2024-forma-b-ej09",
      "mat1000-i3-2024-forma-b-ej10"
    ]
  },
  {
    "id": "par-bola-v-rtice-gr-fica-y-modelo",
    "name": "Parábola: vértice, gráfica y modelo",
    "frequency": 20,
    "structure": "y=ax^2+bx+c o y=a(x-h)^2+k",
    "invariantLogic": "el vértice organiza la gráfica.",
    "method": "Usar h=-b/(2a) o forma de vértice; evaluar k; analizar concavidad.",
    "commonErrors": [
      "signo de h",
      "confundir valor mínimo con abscisa",
      "expandir mal"
    ],
    "level": "muy frecuente",
    "examples": [
      "mat1000-i1-2025-forma-a-ej01",
      "mat1000-i1-2025-forma-a-ej03",
      "mat1000-i1-2025-forma-a-ej04",
      "mat1000-i1-2025-forma-a-ej07",
      "mat1000-i1-2026-forma-b-ej06",
      "mat1000-i1-2024-forma-a-ej01",
      "mat1000-i1-2024-forma-a-ej03",
      "mat1000-i1-2024-forma-a-ej05",
      "mat1000-i1-2024-forma-a-ej06",
      "mat1000-i1-2024-forma-a-ej13"
    ]
  },
  {
    "id": "logaritmos-con-restricciones-y-propiedades",
    "name": "Logaritmos con restricciones y propiedades",
    "frequency": 17,
    "structure": "log(A)+log(B)=c, log(A^p C^q/B^r)",
    "invariantLogic": "restricciones antes de aplicar propiedades.",
    "method": "Establecer dominio; condensar/expandir logaritmos; resolver; verificar.",
    "commonErrors": [
      "olvidar restricciones",
      "log(a+b)=log(a)+log(b)",
      "aceptar soluciones extranas"
    ],
    "level": "muy frecuente",
    "examples": [
      "mat1000-i2-2025-forma-b-ej09",
      "mat1000-i2-2024-forma-b-ej03",
      "mat1000-i2-2024-forma-b-ej04",
      "mat1000-i2-2024-forma-b-ej05",
      "mat1000-i2-2024-forma-b-ej08",
      "mat1000-i2-2024-forma-b-ej09",
      "mat1000-i2-2024-forma-a-ej03",
      "mat1000-i2-2024-forma-a-ej04",
      "mat1000-i2-2024-forma-a-ej05",
      "mat1000-i2-2024-forma-a-ej08"
    ]
  },
  {
    "id": "inecuaciones-y-an-lisis-de-signos",
    "name": "Inecuaciones y análisis de signos",
    "frequency": 15,
    "structure": "lineal/cuadrática/racional con intervalos críticos",
    "invariantLogic": "se analiza el signo por intervalos.",
    "method": "Llevar a un lado; factorizar; construir puntos críticos; tabla de signos; intervalos.",
    "commonErrors": [
      "multiplicar por expresión con signo variable",
      "incluir denominador cero",
      "cerrar intervalos incorrectos"
    ],
    "level": "muy frecuente",
    "examples": [
      "mat1000-i1-2025-forma-a-ej08",
      "mat1000-i1-2025-forma-a-ej09",
      "mat1000-i1-2026-forma-b-ej08",
      "mat1000-i1-2026-forma-b-ej09",
      "mat1000-i1-2024-forma-a-ej07",
      "mat1000-i1-2024-forma-a-ej08",
      "mat1000-i1-2024-forma-a-ej14",
      "mat1000-i1-2025-forma-b-ej08",
      "mat1000-i1-2025-forma-b-ej09",
      "mat1000-i1-2024-forma-b-ej07"
    ]
  },
  {
    "id": "sucesiones-y-patrones-figurales",
    "name": "Sucesiones y patrones figurales",
    "frequency": 12,
    "structure": "sucesiones aritméticas/geométricas o conteo visual",
    "invariantLogic": "buscar término general o recurrencia.",
    "method": "Identificar primeros términos, diferencia/razón o patrón visual.",
    "commonErrors": [
      "contar figura inicial como n=0",
      "confundir crecimiento lineal/exponencial",
      "no verificar con figuras dadas"
    ],
    "level": "frecuente",
    "examples": [
      "mat1000-examen-2024-forma-b-ej07",
      "mat1000-examen-2024-forma-b-ej08",
      "mat1000-examen-2024-forma-b-ej09",
      "mat1000-examen-2024-forma-b-ej10",
      "mat1000-examen-2024-forma-a-ej07",
      "mat1000-examen-2024-forma-a-ej08",
      "mat1000-examen-2024-forma-a-ej09",
      "mat1000-examen-2024-forma-a-ej10",
      "mat1000-examen-2025-forma-a-ej06",
      "mat1000-examen-2025-forma-a-ej07"
    ]
  },
  {
    "id": "funci-n-inversa-racional-o-por-tramos",
    "name": "Función inversa racional o por tramos",
    "frequency": 10,
    "structure": "f(x)=(ax+b)/(cx+d) o función inyectiva por tramos",
    "invariantLogic": "intercambiar x,y y despejar.",
    "method": "y=f(x), despejar x en función de y y reemplazar y por x.",
    "commonErrors": [
      "no despejar todos los términos con x",
      "olvidar dominio/rango",
      "confundir f^{-1} con 1/f"
    ],
    "level": "muy frecuente",
    "examples": [
      "mat1000-i2-2025-forma-b-ej06",
      "mat1000-i2-2024-forma-b-ej10",
      "mat1000-i2-2024-forma-a-ej10",
      "mat1000-i2-2026-forma-a-ej06",
      "mat1000-i2-2026-forma-a-ej07",
      "mat1000-i2-2025-forma-a-ej06",
      "mat1000-i2-2026-forma-b-ej06",
      "mat1000-i2-2026-forma-b-ej07",
      "mat1000-examen-2024-forma-b-ej01",
      "mat1000-examen-2024-forma-a-ej01"
    ]
  },
  {
    "id": "exponencial-con-cambio-de-variable-o-crecimiento",
    "name": "Exponencial con cambio de variable o crecimiento",
    "frequency": 10,
    "structure": "a^(2x)+b a^x+c=0 o crecimiento a razón fija",
    "invariantLogic": "convertir a variable auxiliar o modelo exponencial.",
    "method": "Identificar base común; usar u=a^x; resolver cuadrática; descartar u<=0; volver a x.",
    "commonErrors": [
      "no descartar soluciones negativas",
      "no reconocer 4^x=(2^x)^2",
      "confundir periodo de duplicación"
    ],
    "level": "muy frecuente",
    "examples": [
      "mat1000-i2-2025-forma-b-ej08",
      "mat1000-i2-2025-forma-b-ej10",
      "mat1000-i2-2024-forma-b-ej02",
      "mat1000-i2-2024-forma-b-ej12",
      "mat1000-i2-2024-forma-a-ej02",
      "mat1000-i2-2024-forma-a-ej12",
      "mat1000-i2-2026-forma-a-ej08",
      "mat1000-i2-2025-forma-a-ej08",
      "mat1000-i2-2025-forma-a-ej10",
      "mat1000-i2-2026-forma-b-ej08"
    ]
  },
  {
    "id": "inecuaci-n-con-valor-absoluto",
    "name": "Inecuación con valor absoluto",
    "frequency": 8,
    "structure": "|ax+b| < c o |ax+b| >= c",
    "invariantLogic": "se divide en casos o intervalo central/exterior.",
    "method": "Aplicar definición de valor absoluto según desigualdad; resolver; expresar intervalos.",
    "commonErrors": [
      "no invertir desigualdad en caso negativo",
      "confundir < con >",
      "cerrar mal extremos"
    ],
    "level": "frecuente",
    "examples": [
      "mat1000-i1-2025-forma-a-ej10",
      "mat1000-i1-2026-forma-b-ej10",
      "mat1000-i1-2024-forma-a-ej09",
      "mat1000-i1-2024-forma-a-ej10",
      "mat1000-i1-2025-forma-b-ej10",
      "mat1000-i1-2024-forma-b-ej09",
      "mat1000-i1-2024-forma-b-ej10",
      "mat1000-i1-2026-forma-a-ej10"
    ]
  },
  {
    "id": "modelamiento-cuadr-tico-y-optimizaci-n",
    "name": "Modelamiento cuadrático y optimización",
    "frequency": 8,
    "structure": "área, ingresos, costos, máximos/mínimos con cuadrática",
    "invariantLogic": "la optimización ocurre en el vértice si la parábola aplica.",
    "method": "Definir variables; construir función; usar vértice; interpretar.",
    "commonErrors": [
      "no poner dominio contextual",
      "confundir máximo/mínimo",
      "olvidar unidades"
    ],
    "level": "frecuente",
    "examples": [
      "mat1000-i1-2025-forma-a-ej13",
      "mat1000-i1-2026-forma-b-ej13",
      "mat1000-i1-2025-forma-b-ej13",
      "mat1000-i1-2026-forma-a-ej13",
      "mat1000-i2-2025-forma-b-ej13",
      "mat1000-i2-2026-forma-a-ej12",
      "mat1000-i2-2025-forma-a-ej13",
      "mat1000-i2-2026-forma-b-ej12"
    ]
  },
  {
    "id": "modelamiento-aplicado-uc",
    "name": "Modelamiento aplicado UC",
    "frequency": 8,
    "structure": "contexto aplicado con función dada o relación lineal/exponencial",
    "invariantLogic": "traducir texto a función y resolver/interpetar.",
    "method": "Identificar variables, función y pregunta; resolver ecuación/inecuación; interpretar con unidades.",
    "commonErrors": [
      "no interpretar unidades",
      "usar variable equivocada",
      "no restringir dominio"
    ],
    "level": "frecuente",
    "examples": [
      "mat1000-i2-2024-forma-b-ej14",
      "mat1000-i2-2024-forma-a-ej14",
      "mat1000-i2-2026-forma-a-ej13",
      "mat1000-i2-2026-forma-b-ej13",
      "mat1000-i3-2024-forma-b-ej13",
      "mat1000-i3-2024-forma-b-ej14",
      "mat1000-i3-2024-forma-a-ej13",
      "mat1000-i3-2024-forma-a-ej14"
    ]
  },
  {
    "id": "funci-n-por-tramos-gr-fico-recorrido-e-inyectividad",
    "name": "Función por tramos: gráfico, recorrido e inyectividad",
    "frequency": 6,
    "structure": "función por tramos con dominios parciales",
    "invariantLogic": "cada rama se analiza en su intervalo.",
    "method": "Graficar rama por rama; cuidar extremos; unir recorridos; test de recta horizontal.",
    "commonErrors": [
      "puntos abiertos/cerrados",
      "recorrido por dominio",
      "inyectividad sin contraejemplo"
    ],
    "level": "frecuente",
    "examples": [
      "mat1000-i2-2025-forma-b-ej11",
      "mat1000-i2-2024-forma-b-ej11",
      "mat1000-i2-2024-forma-a-ej11",
      "mat1000-i2-2026-forma-a-ej11",
      "mat1000-i2-2025-forma-a-ej11",
      "mat1000-i2-2026-forma-b-ej11"
    ]
  },
  {
    "id": "dominio-ra-z-racional",
    "name": "Dominio raíz/racional",
    "frequency": 4,
    "structure": "sqrt(ax+b)/(cx+d) o sqrt(ax+b)/(x-c)",
    "invariantLogic": "radicando >= 0 y denominador != 0.",
    "method": "1) imponer radicando >= 0; 2) excluir ceros del denominador; 3) intersectar restricciones; 4) escribir intervalos.",
    "commonErrors": [
      "olvidar excluir el denominador",
      "usar radicando > 0 cuando puede ser >= 0",
      "unir intervalos sin intersectar restricciones"
    ],
    "level": "muy frecuente",
    "examples": [
      "mat1000-i2-2025-forma-b-ej01",
      "mat1000-i2-2026-forma-a-ej01",
      "mat1000-i2-2025-forma-a-ej01",
      "mat1000-i2-2026-forma-b-ej01"
    ]
  },
  {
    "id": "composici-n-y-operaciones-de-funciones",
    "name": "Composición y operaciones de funciones",
    "frequency": 4,
    "structure": "(f∘g)(x), dominio de f/g, f·g, g∘f",
    "invariantLogic": "se debe respetar dominio interno y restricciones de denominadores.",
    "method": "Calcular expresión y revisar restricciones de f, g y denominadores de operaciones.",
    "commonErrors": [
      "olvidar que divisor no puede ser cero",
      "solo mirar dominio de f",
      "no simplificar restricciones"
    ],
    "level": "muy frecuente",
    "examples": [
      "mat1000-i2-2025-forma-b-ej03",
      "mat1000-i2-2024-forma-b-ej13",
      "mat1000-i2-2024-forma-a-ej13",
      "mat1000-i2-2025-forma-a-ej03"
    ]
  },
  {
    "id": "funci-n-sinusoidal-amplitud-per-odo-y-desfase",
    "name": "Función sinusoidal: amplitud, período y desfase",
    "frequency": 4,
    "structure": "A sen(k(x-B)) o A cos(k(x-B))",
    "invariantLogic": "amplitud |A|, periodo 2pi/k, desfase B.",
    "method": "Leer amplitud, periodo desde puntos clave y despejar k.",
    "commonErrors": [
      "usar k=periodo",
      "confundir desfase con corte",
      "perder signo de amplitud"
    ],
    "level": "frecuente",
    "examples": [
      "mat1000-i3-2025-forma-a-ej12",
      "mat1000-i3-2025-forma-b-ej12",
      "mat1000-examen-2024-forma-b-ej14",
      "mat1000-examen-2024-forma-a-ej14"
    ]
  },
  {
    "id": "lectura-de-gr-fico-de-funci-n",
    "name": "Lectura de gráfico de función",
    "frequency": 2,
    "structure": "gráfico con datos, puntos, ejes o curva para interpretar",
    "invariantLogic": "la respuesta depende de leer correctamente escala, puntos y tendencia.",
    "method": "Identificar ejes, puntos clave, tramos, pendiente o valores solicitados; luego evaluar afirmaciones.",
    "commonErrors": [
      "leer escala incorrecta",
      "confundir variación con valor absoluto",
      "ignorar unidades o intervalo"
    ],
    "level": "frecuente",
    "examples": [
      "mat1000-i2-2024-forma-b-ej01",
      "mat1000-i2-2024-forma-a-ej01"
    ]
  },
  {
    "id": "dominio-con-restricciones-algebraicas",
    "name": "Dominio con restricciones algebraicas",
    "frequency": 2,
    "structure": "requiere revisión manual",
    "invariantLogic": "requiere clasificación experta posterior",
    "method": "leer enunciado y asociar patrón",
    "commonErrors": [
      "clasificación automática insuficiente"
    ],
    "level": "poco frecuente",
    "examples": [
      "mat1000-i2-2026-forma-a-ej03",
      "mat1000-i2-2026-forma-b-ej03"
    ]
  },
  {
    "id": "modelamiento-con-sucesiones",
    "name": "Modelamiento con sucesiones",
    "frequency": 2,
    "structure": "ahorro, rebotes, patrones figurales con progresiones",
    "invariantLogic": "identificar primer término y razón/diferencia.",
    "method": "Determinar si es aritmética o geométrica; escribir término general; sumar si corresponde.",
    "commonErrors": [
      "usar n o n-1 mal",
      "confundir razón con diferencia",
      "doble conteo en recorridos"
    ],
    "level": "frecuente",
    "examples": [
      "mat1000-examen-2024-forma-b-ej13",
      "mat1000-examen-2024-forma-a-ej13"
    ]
  }
];
