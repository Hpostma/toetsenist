import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

// Types
export interface Concept {
  id: string
  name: string
  definition: string
  complexity: number // 1-5
  sourceSection?: string
}

export interface ConceptRelation {
  from: string
  to: string
  type: 'is_example_of' | 'leads_to' | 'contrasts_with' | 'is_part_of'
}

export interface ConceptExample {
  concept: string
  example: string
}

export interface DocumentAnalysis {
  concepts: Concept[]
  relations: ConceptRelation[]
  examples: ConceptExample[]
}

export interface AssessmentMetadata {
  questionLevel: number // 1-5
  answerQuality: 'correct' | 'partial' | 'incorrect' | 'unclear'
  conceptsDemonstrated: string[]
  conceptsStruggling: string[]
  engagementSignal: 'high' | 'medium' | 'low' | 'declining'
  suggestedNextLevel: number
  phase: 'calibration' | 'exploration' | 'integration' | 'closing'
}

// Retry helper met exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      const isRateLimit = error.message?.includes('429') ||
                         error.message?.includes('rate') ||
                         error.message?.includes('quota') ||
                         error.message?.includes('overloaded') ||
                         error.status === 429 ||
                         error.status === 529

      if (!isRateLimit || attempt === maxRetries - 1) {
        throw error
      }

      const delay = baseDelayMs * Math.pow(2, attempt)
      console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Genereer de conversatie system prompt met dynamische context
export function generateConversationPrompt(
  concepts: Concept[],
  currentLevel: number,
  engagementStatus: string = 'high'
): string {
  return `Je bent een vriendelijke, nieuwsgierige docent die een Socratisch toetsgesprek voert.

JE DOEL:
- Toets het begrip van de student over de gegeven leerstof
- Pas je vraagniveau aan op basis van de antwoorden
- Houd het gesprek interactief: de student moet aan het denken worden gezet
- Verzamel evidence over het begrip per concept

NIVEAUS:
1. Herkenning: Ja/nee vragen, termen herkennen
2. Reproductie: Uitleggen in eigen woorden
3. Toepassing: Toepassen op nieuwe situatie
4. Analyse: Kritisch evalueren, vergelijken
5. Synthese: Creatief combineren van concepten

HUIDIG NIVEAU: ${currentLevel}
STATUS: ${engagementStatus}

KENNISBANK:
${JSON.stringify(concepts, null, 2)}

REGELS:
- Stel één vraag per keer.
- Eindig elk bericht ALTIJD met een duidelijke vraag of een specifieke opdracht voor de student.
- Houd het initiatief in het gesprek; wacht niet tot de student vraagt om een volgende vraag.
- Bij 3+ goede antwoorden op rij: verhoog niveau.
- Bij 2+ slechte antwoorden: verlaag niveau.
- Bij engagement-daling: geef ondersteuning of een hint.
- Nooit het antwoord voorzeggen.
- Spreek uitsluitend Nederlands.

OUTPUT FORMAT:
Elke response bevat twee delen:
1. Je gesproken reactie naar de student (in normale tekst)
2. Een JSON blok met metadata (in \`\`\`json\`\`\` code block):
\`\`\`json
{
  "questionLevel": 1-5,
  "answerQuality": "correct|partial|incorrect|unclear",
  "conceptsDemonstrated": ["concept_ids"],
  "conceptsStruggling": ["concept_ids"],
  "engagementSignal": "high|medium|low|declining",
  "suggestedNextLevel": 1-5,
  "phase": "calibration|exploration|integration|closing"
}
\`\`\``
}

// Provider clients
function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// Chat via Anthropic Claude
async function chatWithAnthropic(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string
): Promise<string> {
  const anthropic = getAnthropicClient()
  if (!anthropic) throw new Error('Anthropic client niet beschikbaar')

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content }))
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Onverwacht response format van Claude')
  }

  return content.text
}

// Chat via OpenAI
async function chatWithOpenAI(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string
): Promise<string> {
  const openai = getOpenAIClient()
  if (!openai) throw new Error('OpenAI client niet beschikbaar')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    ]
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('Geen response van OpenAI')
  }

  return content
}

// Parse metadata uit response
function parseMetadata(fullResponse: string): { visibleResponse: string; metadata: AssessmentMetadata | null } {
  let metadata: AssessmentMetadata | null = null
  const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/)

  if (jsonMatch) {
    try {
      metadata = JSON.parse(jsonMatch[1]) as AssessmentMetadata
    } catch (error) {
      console.error('Kon metadata niet parsen:', error)
    }
  }

  const visibleResponse = fullResponse.replace(/```json[\s\S]*?```/g, '').trim()

  return { visibleResponse, metadata }
}

// Hoofdfunctie: chat met fallback tussen providers
export async function chat(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  concepts: Concept[],
  currentLevel: number,
  engagementStatus: string = 'high'
): Promise<{ response: string; metadata: AssessmentMetadata | null }> {

  const systemPrompt = generateConversationPrompt(concepts, currentLevel, engagementStatus)
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
  const hasOpenAI = !!process.env.OPENAI_API_KEY

  if (!hasAnthropic && !hasOpenAI) {
    throw new Error('Geen AI provider geconfigureerd. Stel ANTHROPIC_API_KEY of OPENAI_API_KEY in.')
  }

  let fullResponse: string | null = null
  let lastError: Error | null = null

  // Probeer eerst Anthropic met retry
  if (hasAnthropic) {
    try {
      console.log('Probeer chat via Anthropic Claude...')
      fullResponse = await withRetry(
        () => chatWithAnthropic(messages, systemPrompt),
        3,
        2000
      )
      console.log('Anthropic chat succesvol')
    } catch (error: any) {
      console.error('Anthropic chat mislukt:', error.message)
      lastError = error
    }
  }

  // Fallback naar OpenAI als Anthropic faalt
  if (!fullResponse && hasOpenAI) {
    try {
      console.log('Fallback naar OpenAI GPT-4o...')
      fullResponse = await withRetry(
        () => chatWithOpenAI(messages, systemPrompt),
        3,
        2000
      )
      console.log('OpenAI chat succesvol')
    } catch (error: any) {
      console.error('OpenAI chat mislukt:', error.message)
      lastError = error
    }
  }

  if (!fullResponse) {
    throw lastError || new Error('Alle AI providers gefaald')
  }

  const { visibleResponse, metadata } = parseMetadata(fullResponse)

  return {
    response: visibleResponse,
    metadata
  }
}

// Start een nieuw gesprek met welkomstbericht
export async function startConversation(
  concepts: Concept[]
): Promise<{ response: string; metadata: AssessmentMetadata | null }> {
  const initialMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    {
      role: 'user',
      content: 'Start het toetsgesprek met een welkomstbericht en de eerste vraag op niveau 2.'
    }
  ]

  return chat(initialMessages, concepts, 2, 'high')
}

// Document analyse functie (niet meer gebruikt, maar behouden voor backwards compatibility)
export async function analyzeDocument(documentText: string): Promise<DocumentAnalysis> {
  // Deze functie wordt nu vervangen door Gemini in /api/concepten
  throw new Error('Gebruik Gemini voor document analyse via /api/concepten')
}
