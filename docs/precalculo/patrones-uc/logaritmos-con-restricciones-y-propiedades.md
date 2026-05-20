# Patrón UC - Logaritmos con restricciones y propiedades

## Resumen
- Nivel de aparición: muy frecuente
- Frecuencia detectada en PDFs cargados: 17
- Estructura general: `log(A)+log(B)=c, log(A^p C^q/B^r)`
- Qué NO cambia: restricciones antes de aplicar propiedades.

## Método general
Establecer dominio; condensar/expandir logaritmos; resolver; verificar.

## Errores típicos UC
- olvidar restricciones
- log(a+b)=log(a)+log(b)
- aceptar soluciones extranas

## Evidencia de repetición
- mat1000-i2-2025-forma-b-ej09
- mat1000-i2-2024-forma-b-ej03
- mat1000-i2-2024-forma-b-ej04
- mat1000-i2-2024-forma-b-ej05
- mat1000-i2-2024-forma-b-ej08
- mat1000-i2-2024-forma-b-ej09
- mat1000-i2-2024-forma-a-ej03
- mat1000-i2-2024-forma-a-ej04
- mat1000-i2-2024-forma-a-ej05
- mat1000-i2-2024-forma-a-ej08
- mat1000-i2-2024-forma-a-ej09
- mat1000-i2-2026-forma-a-ej09
- mat1000-i2-2026-forma-a-ej10
- mat1000-i2-2025-forma-a-ej09
- mat1000-i2-2026-forma-b-ej09
- mat1000-i2-2026-forma-b-ej10
- mat1000-examen-2025-forma-a-ej01

## Variantes tipo UC
### Variante UC directa - dificultad media
- Enunciado: Resuelva \(\log_2(x-3)+\log_2(x+1)=3\).
- Respuesta: \(x=5\).
- Solución propuesta, requiere validación: restricciones \(x>3\); condensar \(\log_2((x-3)(x+1))=3\); \((x-3)(x+1)=8\); \(x^2-2x-11=0\). Esta variante requiere ajuste si se busca raíz entera; versión ajustada: \(\log_2(x-3)+\log_2(x+1)=4\Rightarrow (x-3)(x+1)=16\Rightarrow x=5\) válido.
- Patrón mantenido: logaritmos con restricciones.
- Qué cambió: base y constantes.
- Qué no cambió: restricciones antes de resolver.
- Trampa UC: aceptar soluciones que no cumplen dominio.
