# Variantes UC basadas en patrones reales MAT1000

Estas variantes NO son ejercicios reales. Son ejercicios generados a partir de patrones observados en pruebas UC MAT1000.

## Trigonometría UC: identidades, cuadrantes y ángulos

- Apariciones detectadas: 60
### Variante UC directa - dificultad media
- Enunciado: Si \(t\) está en el tercer cuadrante y \(\cos(t)=-\frac35\), determine \(\tan(t)\).
- Respuesta: \(\frac43\).
- Solución propuesta, requiere validación: en QIII, seno y coseno son negativos y tangente positiva. \(\sin(t)=-\frac45\). Luego \(\tan(t)=\sin(t)/\cos(t)=4/3\).
- Patrón mantenido: razón trigonométrica por cuadrante.
- Qué cambió: razón dada.
- Qué no cambió: signos por cuadrante.
- Trampa UC: dejar la tangente negativa en el tercer cuadrante.

---

## Rectas, pendientes e intersecciones

- Apariciones detectadas: 35
### Variante UC directa - dificultad media
- Enunciado: Determine la ecuación principal de la recta que pasa por \((2,1)\) y es paralela a \(3x+2y-6=0\).
- Respuesta: \(y=-\frac32x+4\).
- Solución propuesta, requiere validación: \(3x+2y-6=0\Rightarrow y=-\frac32x+3\). Misma pendiente. Con \((2,1)\): \(y-1=-\frac32(x-2)\Rightarrow y=-\frac32x+4\).
- Patrón mantenido: rectas paralelas.
- Qué cambió: punto y recta base.
- Qué no cambió: mismas pendientes.
- Trampa UC: usar pendiente perpendicular en vez de paralela.

---

## Polinomios: resto, factores y raíces

- Apariciones detectadas: 28
### Variante UC directa - dificultad media
- Enunciado: Si \(P(x)=2x^3-5x^2+x-k\), determine \(k\) para que el resto al dividir por \(x-2\) sea cero.
- Respuesta: \(k=-2\).
- Solución propuesta, requiere validación: por teorema del resto \(P(2)=0\). Entonces \(16-20+2-k=0\Rightarrow -2-k=0\Rightarrow k=-2\).
- Patrón mantenido: teorema del resto.
- Qué cambió: divisor y coeficientes.
- Qué no cambió: evaluar en la raíz del divisor.
- Trampa UC: usar \(x=-2\) cuando el divisor es \(x-2\).

---

## Parábola: vértice, gráfica y modelo

- Apariciones detectadas: 20
### Variante UC directa - dificultad media
- Enunciado: ¿Cuál es el vértice de \(y=2x^2-8x+5\)?
- Respuesta: \((2,-3)\).
- Solución propuesta, requiere validación: \(h=-b/(2a)=8/4=2\); \(k=f(2)=8-16+5=-3\).
- Patrón mantenido: vértice de parábola.
- Qué cambió: coeficientes.
- Qué no cambió: fórmula del vértice.
- Trampa UC: confundir \(h\) con \(k\).

---

## Logaritmos con restricciones y propiedades

- Apariciones detectadas: 17
### Variante UC directa - dificultad media
- Enunciado: Resuelva \(\log_2(x-3)+\log_2(x+1)=3\).
- Respuesta: \(x=5\).
- Solución propuesta, requiere validación: restricciones \(x>3\); condensar \(\log_2((x-3)(x+1))=3\); \((x-3)(x+1)=8\); \(x^2-2x-11=0\). Esta variante requiere ajuste si se busca raíz entera; versión ajustada: \(\log_2(x-3)+\log_2(x+1)=4\Rightarrow (x-3)(x+1)=16\Rightarrow x=5\) válido.
- Patrón mantenido: logaritmos con restricciones.
- Qué cambió: base y constantes.
- Qué no cambió: restricciones antes de resolver.
- Trampa UC: aceptar soluciones que no cumplen dominio.

---

## Inecuaciones y análisis de signos

- Apariciones detectadas: 15
### Variante UC directa - dificultad media
- Enunciado: Resuelva \(|3x-2|<7\).
- Respuesta: \(\left(-\frac53,3\right)\).
- Solución propuesta, requiere validación: \(-7<3x-2<7\Rightarrow -5<3x<9\Rightarrow -5/3<x<3\).
- Patrón mantenido: valor absoluto/inecuación.
- Qué cambió: coeficientes.
- Qué no cambió: descomposición de la desigualdad.
- Trampa UC: cerrar extremos cuando la desigualdad es estricta.

---

## Sucesiones y patrones figurales

- Apariciones detectadas: 12
### Variante UC directa - dificultad media
- Enunciado: Una sucesión aritmética tiene primeros términos 5, 9, 13. Determine \(n\) si \(a_n=45\).
- Respuesta: \(n=11\).
- Solución propuesta, requiere validación: \(a_n=5+(n-1)4=4n+1\). Igualando \(4n+1=45\Rightarrow n=11\).
- Patrón mantenido: término general de sucesión aritmética.
- Qué cambió: primer término y diferencia.
- Qué no cambió: \(a_n=a_1+(n-1)d\).
- Trampa UC: usar \(nd\) en vez de \((n-1)d\).

---

## Función inversa racional o por tramos

- Apariciones detectadas: 10
### Variante UC directa - dificultad media
- Enunciado: Considere \(f(x)=\frac{3x+2}{x-1}\). Determine \(f^{-1}(x)\).
- Respuesta: \(f^{-1}(x)=\frac{x+2}{x-3}\).
- Solución propuesta, requiere validación: \(y=\frac{3x+2}{x-1}\Rightarrow yx-y=3x+2\Rightarrow x(y-3)=y+2\Rightarrow x=\frac{y+2}{y-3}\).
- Patrón mantenido: inversa racional.
- Qué cambió: coeficientes.
- Qué no cambió: despeje algebraico.
- Trampa UC: confundir \(f^{-1}\) con \(1/f\).

---

## Exponencial con cambio de variable o crecimiento

- Apariciones detectadas: 10
### Variante UC directa - dificultad media
- Enunciado: Resuelva \(9^x-10\cdot3^x+9=0\).
- Respuesta: \(x=0\) o \(x=2\).
- Solución propuesta, requiere validación: sea \(u=3^x\). Entonces \(u^2-10u+9=0=(u-1)(u-9)\). Así \(3^x=1\Rightarrow x=0\) o \(3^x=9\Rightarrow x=2\).
- Patrón mantenido: exponencial con cambio de variable.
- Qué cambió: coeficientes.
- Qué no cambió: \(u=a^x\).
- Trampa UC: olvidar que \(9^x=(3^x)^2\).

---

## Inecuación con valor absoluto

- Apariciones detectadas: 8
### Variante UC directa - dificultad media
- Enunciado: Resuelva \(|3x-2|<7\).
- Respuesta: \(\left(-\frac53,3\right)\).
- Solución propuesta, requiere validación: \(-7<3x-2<7\Rightarrow -5<3x<9\Rightarrow -5/3<x<3\).
- Patrón mantenido: valor absoluto/inecuación.
- Qué cambió: coeficientes.
- Qué no cambió: descomposición de la desigualdad.
- Trampa UC: cerrar extremos cuando la desigualdad es estricta.

---

## Modelamiento cuadrático y optimización

- Apariciones detectadas: 8
### Variante UC directa - dificultad alta
- Enunciado: Con 60 metros de malla se quiere cercar un rectángulo usando una pared como uno de sus lados. Determine dimensiones que maximizan el área.
- Respuesta: ancho 15 m y largo 30 m; área máxima 450 m².
- Solución propuesta, requiere validación: \(2x+y=60\Rightarrow y=60-2x\). \(A=x(60-2x)=-2x^2+60x\). Vértice \(x=-60/(2(-2))=15\), \(y=30\).
- Patrón mantenido: optimización cuadrática.
- Qué cambió: longitud total.
- Qué no cambió: restricción \(2x+y=P\).
- Trampa UC: cercar cuatro lados en vez de tres.

---

## Modelamiento aplicado UC

- Apariciones detectadas: 8
### Variante UC directa - dificultad alta
- Enunciado: Con 60 metros de malla se quiere cercar un rectángulo usando una pared como uno de sus lados. Determine dimensiones que maximizan el área.
- Respuesta: ancho 15 m y largo 30 m; área máxima 450 m².
- Solución propuesta, requiere validación: \(2x+y=60\Rightarrow y=60-2x\). \(A=x(60-2x)=-2x^2+60x\). Vértice \(x=-60/(2(-2))=15\), \(y=30\).
- Patrón mantenido: optimización cuadrática.
- Qué cambió: longitud total.
- Qué no cambió: restricción \(2x+y=P\).
- Trampa UC: cercar cuatro lados en vez de tres.

---

## Función por tramos: gráfico, recorrido e inyectividad

- Apariciones detectadas: 6
### Variante UC directa - dificultad alta
- Enunciado: Considere \(f(x)=x+1\) si \(x<0\), \(f(x)=x^2\) si \(0\le x\le2\), y \(f(x)=3\) si \(2<x\le4\). Trace el gráfico, determine recorrido e inyectividad.
- Respuesta: recorrido propuesto \((-\infty,1)\cup[0,4]\cup\{3\}=(-\infty,4]\). No es inyectiva.
- Solución propuesta, requiere validación: graficar cada rama con extremos; el valor 3 se repite en la rama cuadrática y constante.
- Patrón mantenido: tramos, recorrido, inyectividad.
- Qué cambió: ramas e intervalos.
- Qué no cambió: análisis rama por rama.
- Trampa UC: puntos abiertos/cerrados.

---

## Dominio raíz/racional

- Apariciones detectadas: 4
### Variante UC directa - dificultad media
- Enunciado: Determine el dominio de la función \(f(x)=\frac{\sqrt{x+7}}{x-5}\).
- Respuesta: \([ -7,5)\cup(5,\infty)\) si \(-7<5\).
- Solución propuesta, requiere validación: exigir \(x+7\ge0\Rightarrow x\ge -7\) y excluir \(x=5\).
- Patrón mantenido: dominio raíz/racional.
- Qué cambió: constantes del radicando y denominador.
- Qué no cambió: radicando no negativo y denominador no nulo.
- Trampa UC: incluir por error el valor que anula el denominador.

---

## Composición y operaciones de funciones

- Apariciones detectadas: 4
### Variante UC directa - dificultad media
- Enunciado: Sean \(f(x)=\frac{x+1}{x-2}\) y \(g(x)=\frac{2x}{x+3}\). Determine una fórmula para \((f\circ g)(x)\) y sus restricciones principales.
- Respuesta: \((f\circ g)(x)=\frac{3x+3}{-9}=-\frac{x+1}{3}\), con \(x\ne -3\) y \(g(x)\ne2\) si corresponde.
- Solución propuesta, requiere validación: sustituir \(g(x)\) en \(f\), simplificar y revisar denominadores.
- Patrón mantenido: composición y dominio.
- Qué cambió: funciones racionales específicas.
- Qué no cambió: sustituir y revisar restricciones.
- Trampa UC: simplificar sin conservar restricciones.

---

## Función sinusoidal: amplitud, período y desfase

- Apariciones detectadas: 4
### Variante UC directa - dificultad media
- Enunciado: Un período de \(f(x)=A\cos(k(x-B))\) tiene amplitud 4, período \(6\pi\) y desfase \(\pi/2\). Modele la función.
- Respuesta: \(f(x)=4\cos\left(\frac13(x-\pi/2)\right)\).
- Solución propuesta, requiere validación: \(T=2\pi/k=6\pi\Rightarrow k=1/3\), amplitud \(A=4\), desfase \(B=\pi/2\).
- Patrón mantenido: amplitud, período y desfase.
- Qué cambió: parámetros del gráfico.
- Qué no cambió: \(T=2\pi/k\).
- Trampa UC: usar \(k=6\pi\) en vez de despejarlo.

---

## Lectura de gráfico de función

- Apariciones detectadas: 2
### Variante UC directa - requiere revisión
- Enunciado: Variante pendiente de construcción manual basada en el patrón detectado.
- Respuesta: requiere validación.
- Solución propuesta: requiere validación.
- Patrón mantenido: requiere revisión.
- Qué cambió: requiere revisión.
- Qué no cambió: requiere revisión.
- Trampa UC: requiere revisión.

---

## Dominio con restricciones algebraicas

- Apariciones detectadas: 2
### Variante UC directa - requiere revisión
- Enunciado: Variante pendiente de construcción manual basada en el patrón detectado.
- Respuesta: requiere validación.
- Solución propuesta: requiere validación.
- Patrón mantenido: requiere revisión.
- Qué cambió: requiere revisión.
- Qué no cambió: requiere revisión.
- Trampa UC: requiere revisión.

---

## Modelamiento con sucesiones

- Apariciones detectadas: 2
### Variante UC directa - dificultad media
- Enunciado: Una sucesión aritmética tiene primeros términos 5, 9, 13. Determine \(n\) si \(a_n=45\).
- Respuesta: \(n=11\).
- Solución propuesta, requiere validación: \(a_n=5+(n-1)4=4n+1\). Igualando \(4n+1=45\Rightarrow n=11\).
- Patrón mantenido: término general de sucesión aritmética.
- Qué cambió: primer término y diferencia.
- Qué no cambió: \(a_n=a_1+(n-1)d\).
- Trampa UC: usar \(nd\) en vez de \((n-1)d\).

---
