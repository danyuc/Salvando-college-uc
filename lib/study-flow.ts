export function shouldTriggerMidDiagnostic(progress: number) {
  return progress >= 0.4 && progress <= 0.6
}

export function shouldTriggerFinalDiagnostic(progress: number) {
  return progress >= 0.85
}