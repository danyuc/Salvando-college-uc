# Patrón UC - Exponencial con cambio de variable o crecimiento

## Resumen
- Nivel de aparición: muy frecuente
- Frecuencia detectada en PDFs cargados: 10
- Estructura general: `a^(2x)+b a^x+c=0 o crecimiento a razón fija`
- Qué NO cambia: convertir a variable auxiliar o modelo exponencial.

## Método general
Identificar base común; usar u=a^x; resolver cuadrática; descartar u<=0; volver a x.

## Errores típicos UC
- no descartar soluciones negativas
- no reconocer 4^x=(2^x)^2
- confundir periodo de duplicación

## Evidencia de repetición
- mat1000-i2-2025-forma-b-ej08
- mat1000-i2-2025-forma-b-ej10
- mat1000-i2-2024-forma-b-ej02
- mat1000-i2-2024-forma-b-ej12
- mat1000-i2-2024-forma-a-ej02
- mat1000-i2-2024-forma-a-ej12
- mat1000-i2-2026-forma-a-ej08
- mat1000-i2-2025-forma-a-ej08
- mat1000-i2-2025-forma-a-ej10
- mat1000-i2-2026-forma-b-ej08

## Variantes tipo UC
### Variante UC directa - dificultad media
- Enunciado: Resuelva \(9^x-10\cdot3^x+9=0\).
- Respuesta: \(x=0\) o \(x=2\).
- Solución propuesta, requiere validación: sea \(u=3^x\). Entonces \(u^2-10u+9=0=(u-1)(u-9)\). Así \(3^x=1\Rightarrow x=0\) o \(3^x=9\Rightarrow x=2\).
- Patrón mantenido: exponencial con cambio de variable.
- Qué cambió: coeficientes.
- Qué no cambió: \(u=a^x\).
- Trampa UC: olvidar que \(9^x=(3^x)^2\).
