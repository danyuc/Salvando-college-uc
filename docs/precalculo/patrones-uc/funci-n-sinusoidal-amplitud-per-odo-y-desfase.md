# Patrón UC - Función sinusoidal: amplitud, período y desfase

## Resumen
- Nivel de aparición: frecuente
- Frecuencia detectada en PDFs cargados: 4
- Estructura general: `A sen(k(x-B)) o A cos(k(x-B))`
- Qué NO cambia: amplitud |A|, periodo 2pi/k, desfase B.

## Método general
Leer amplitud, periodo desde puntos clave y despejar k.

## Errores típicos UC
- usar k=periodo
- confundir desfase con corte
- perder signo de amplitud

## Evidencia de repetición
- mat1000-i3-2025-forma-a-ej12
- mat1000-i3-2025-forma-b-ej12
- mat1000-examen-2024-forma-b-ej14
- mat1000-examen-2024-forma-a-ej14

## Variantes tipo UC
### Variante UC directa - dificultad media
- Enunciado: Un período de \(f(x)=A\cos(k(x-B))\) tiene amplitud 4, período \(6\pi\) y desfase \(\pi/2\). Modele la función.
- Respuesta: \(f(x)=4\cos\left(\frac13(x-\pi/2)\right)\).
- Solución propuesta, requiere validación: \(T=2\pi/k=6\pi\Rightarrow k=1/3\), amplitud \(A=4\), desfase \(B=\pi/2\).
- Patrón mantenido: amplitud, período y desfase.
- Qué cambió: parámetros del gráfico.
- Qué no cambió: \(T=2\pi/k\).
- Trampa UC: usar \(k=6\pi\) en vez de despejarlo.
