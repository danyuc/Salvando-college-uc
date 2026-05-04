import { getWeakTopics, getLevel } from "./ai-engine"
import { generateLinearEquation } from "./question-generator"

export function getNextQuestion() {
  const weak = getWeakTopics()

  if (weak.includes("ecuaciones")) {
    return generateLinearEquation("easy")
  }

  return generateLinearEquation("medium")
}
