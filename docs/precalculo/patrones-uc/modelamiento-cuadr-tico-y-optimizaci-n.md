# Patrón UC - Modelamiento cuadrático y optimización

## Resumen
- Nivel de aparición: frecuente
- Frecuencia detectada en PDFs cargados: 8
- Estructura general: `área, ingresos, costos, máximos/mínimos con cuadrática`
- Qué NO cambia: la optimización ocurre en el vértice si la parábola aplica.

## Método general
Definir variables; construir función; usar vértice; interpretar.

## Errores típicos UC
- no poner dominio contextual
- confundir máximo/mínimo
- olvidar unidades

## Evidencia de repetición
- mat1000-i1-2025-forma-a-ej13
- mat1000-i1-2026-forma-b-ej13
- mat1000-i1-2025-forma-b-ej13
- mat1000-i1-2026-forma-a-ej13
- mat1000-i2-2025-forma-b-ej13
- mat1000-i2-2026-forma-a-ej12
- mat1000-i2-2025-forma-a-ej13
- mat1000-i2-2026-forma-b-ej12

## Variantes tipo UC
### Variante UC directa - dificultad alta
- Enunciado: Con 60 metros de malla se quiere cercar un rectángulo usando una pared como uno de sus lados. Determine dimensiones que maximizan el área.
- Respuesta: ancho 15 m y largo 30 m; área máxima 450 m².
- Solución propuesta, requiere validación: \(2x+y=60\Rightarrow y=60-2x\). \(A=x(60-2x)=-2x^2+60x\). Vértice \(x=-60/(2(-2))=15\), \(y=30\).
- Patrón mantenido: optimización cuadrática.
- Qué cambió: longitud total.
- Qué no cambió: restricción \(2x+y=P\).
- Trampa UC: cercar cuatro lados en vez de tres.
