# Patrón UC - Dominio raíz/racional

## Resumen
- Nivel de aparición: muy frecuente
- Frecuencia detectada en PDFs cargados: 4
- Estructura general: `sqrt(ax+b)/(cx+d) o sqrt(ax+b)/(x-c)`
- Qué NO cambia: radicando >= 0 y denominador != 0.

## Método general
1) imponer radicando >= 0; 2) excluir ceros del denominador; 3) intersectar restricciones; 4) escribir intervalos.

## Errores típicos UC
- olvidar excluir el denominador
- usar radicando > 0 cuando puede ser >= 0
- unir intervalos sin intersectar restricciones

## Evidencia de repetición
- mat1000-i2-2025-forma-b-ej01
- mat1000-i2-2026-forma-a-ej01
- mat1000-i2-2025-forma-a-ej01
- mat1000-i2-2026-forma-b-ej01

## Variantes tipo UC
### Variante UC directa - dificultad media
- Enunciado: Determine el dominio de la función \(f(x)=\frac{\sqrt{x+7}}{x-5}\).
- Respuesta: \([ -7,5)\cup(5,\infty)\) si \(-7<5\).
- Solución propuesta, requiere validación: exigir \(x+7\ge0\Rightarrow x\ge -7\) y excluir \(x=5\).
- Patrón mantenido: dominio raíz/racional.
- Qué cambió: constantes del radicando y denominador.
- Qué no cambió: radicando no negativo y denominador no nulo.
- Trampa UC: incluir por error el valor que anula el denominador.
