import { getSkillState } from "./storage"
import { decideNextPractice } from "./personalization"

export function getNextExperience() {
  const state = getSkillState()
  const decision = decideNextPractice(state)

  return {
    subtema: decision.focusSubtema,
    modo: decision.nextMode,
    detalle: decision.explanationDepth,
    hint: decision.shouldShowHint,
  }
}
