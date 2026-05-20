# Patrón UC - Composición y operaciones de funciones

## Resumen
- Nivel de aparición: muy frecuente
- Frecuencia detectada en PDFs cargados: 4
- Estructura general: `(f∘g)(x), dominio de f/g, f·g, g∘f`
- Qué NO cambia: se debe respetar dominio interno y restricciones de denominadores.

## Método general
Calcular expresión y revisar restricciones de f, g y denominadores de operaciones.

## Errores típicos UC
- olvidar que divisor no puede ser cero
- solo mirar dominio de f
- no simplificar restricciones

## Evidencia de repetición
- mat1000-i2-2025-forma-b-ej03
- mat1000-i2-2024-forma-b-ej13
- mat1000-i2-2024-forma-a-ej13
- mat1000-i2-2025-forma-a-ej03

## Variantes tipo UC
### Variante UC directa - dificultad media
- Enunciado: Sean \(f(x)=\frac{x+1}{x-2}\) y \(g(x)=\frac{2x}{x+3}\). Determine una fórmula para \((f\circ g)(x)\) y sus restricciones principales.
- Respuesta: \((f\circ g)(x)=\frac{3x+3}{-9}=-\frac{x+1}{3}\), con \(x\ne -3\) y \(g(x)\ne2\) si corresponde.
- Solución propuesta, requiere validación: sustituir \(g(x)\) en \(f\), simplificar y revisar denominadores.
- Patrón mantenido: composición y dominio.
- Qué cambió: funciones racionales específicas.
- Qué no cambió: sustituir y revisar restricciones.
- Trampa UC: simplificar sin conservar restricciones.
