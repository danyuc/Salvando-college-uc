# Patrón UC - Función por tramos: gráfico, recorrido e inyectividad

## Resumen
- Nivel de aparición: frecuente
- Frecuencia detectada en PDFs cargados: 6
- Estructura general: `función por tramos con dominios parciales`
- Qué NO cambia: cada rama se analiza en su intervalo.

## Método general
Graficar rama por rama; cuidar extremos; unir recorridos; test de recta horizontal.

## Errores típicos UC
- puntos abiertos/cerrados
- recorrido por dominio
- inyectividad sin contraejemplo

## Evidencia de repetición
- mat1000-i2-2025-forma-b-ej11
- mat1000-i2-2024-forma-b-ej11
- mat1000-i2-2024-forma-a-ej11
- mat1000-i2-2026-forma-a-ej11
- mat1000-i2-2025-forma-a-ej11
- mat1000-i2-2026-forma-b-ej11

## Variantes tipo UC
### Variante UC directa - dificultad alta
- Enunciado: Considere \(f(x)=x+1\) si \(x<0\), \(f(x)=x^2\) si \(0\le x\le2\), y \(f(x)=3\) si \(2<x\le4\). Trace el gráfico, determine recorrido e inyectividad.
- Respuesta: recorrido propuesto \((-\infty,1)\cup[0,4]\cup\{3\}=(-\infty,4]\). No es inyectiva.
- Solución propuesta, requiere validación: graficar cada rama con extremos; el valor 3 se repite en la rama cuadrática y constante.
- Patrón mantenido: tramos, recorrido, inyectividad.
- Qué cambió: ramas e intervalos.
- Qué no cambió: análisis rama por rama.
- Trampa UC: puntos abiertos/cerrados.
