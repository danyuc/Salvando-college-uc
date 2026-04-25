import OpenAI from 'openai'

let openaiInstance: OpenAI | null = null

export function getOpenAI() {
  if (openaiInstance) return openaiInstance

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no configurada')
  }

  openaiInstance = new OpenAI({ apiKey })

  return openaiInstance
}