import Anthropic from '@anthropic-ai/sdk'

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

// System prompt voor document analyse
const DOCUMENT_ANALYSIS_PROMPT = `Je bent een expert in kennisstructurering. Analyseer de volgende tekst en extraheer de kernconcepten.

Retourneer JSON in dit formaat:
{
  "concepts": [
    {
      "id": "concept_1",
      "name": "Conceptnaam",
      "definition": "Korte definitie in 1-2 zinnen",
      "complexity": 1-5,
      "sourceSection": "Sectie waar dit concept voorkomt"
    }
  ],
  "relations": [
    {
      "from": "concept_1",
      "to": "concept_2",
      "type": "is_example_of|leads_to|contrasts_with|is_part_of"
    }
  ],
  "examples": [
    {
      "concept": "concept_1",
      "example": "Beschrijving van het voorbeeld"
    }
  ]
}

Complexiteit guidelines:
1 = Basisterminologie, eenvoudige feiten
2 = Concepten met meerdere aspecten
3 = Concepten die relaties met andere concepten vereisen
4 = Abstracte concepten die analyse vereisen
5 = Complexe theorieën of modellen

Genereer ten minste 3-5 concepten per document. Geef elk concept een unieke id (concept_1, concept_2, etc.).
Retourneer ALLEEN de JSON, geen extra tekst.`

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

// Initialiseer Anthropic client
function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is niet geconfigureerd')
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
}

// Analyseer een document en extraheer concepten
export async function analyzeDocument(documentText: string): Promise<DocumentAnalysis> {
  const anthropic = getAnthropicClient()

  console.log('Claude analyseert document (lengte:', documentText.length, ')')

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${DOCUMENT_ANALYSIS_PROMPT}\n\nTEKST:\n${documentText}`
        }
      ]
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Onverwacht response format van Claude')
    }

    // Parse de JSON response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Geen JSON gevonden in Claude response:', content.text)
      throw new Error('Geen JSON gevonden in response')
    }

    return JSON.parse(jsonMatch[0]) as DocumentAnalysis
  } catch (error: any) {
    console.error('Claude API error bij analyse:', error)
    if (error.status === 404) {
      throw new Error('Model niet gevonden of geen toegang. Check je API key.')
    }
    throw error
  }
}

// Voer een conversatie beurt uit
export async function chat(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  concepts: Concept[],
  currentLevel: number,
  engagementStatus: string = 'high'
): Promise<{ response: string; metadata: AssessmentMetadata | null }> {

  const anthropic = getAnthropicClient()
  const systemPrompt = generateConversationPrompt(concepts, currentLevel, engagementStatus)

  // Filter messages om te zorgen dat we alleen user/assistant roles hebben en content string is
  const apiMessages = messages.map(m => ({
    role: m.role,
    content: m.content
  }))

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: apiMessages
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Onverwacht response format van Claude')
    }

    const fullResponse = content.text

    // Parse metadata uit de response
    let metadata: AssessmentMetadata | null = null
    const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      try {
        metadata = JSON.parse(jsonMatch[1]) as AssessmentMetadata
      } catch (error) {
        console.error('Kon metadata niet parsen:', error)
      }
    }

    // Verwijder het JSON blok uit de zichtbare response
    const visibleResponse = fullResponse.replace(/```json[\s\S]*?```/g, '').trim()

    return {
      response: visibleResponse,
      metadata
    }

  } catch (error: any) {
    console.error('Claude chat error:', error)
    throw new Error('Fout bij communicatie met Claude: ' + (error.message || 'Onbekend'))
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
