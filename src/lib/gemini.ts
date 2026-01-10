import { GoogleGenerativeAI } from '@google/generative-ai'

// MOCK DATA VLAG
const USE_MOCK = false

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

// Mock Data
const MOCK_ANALYSIS: DocumentAnalysis = {
    concepts: [
        { id: "c1", name: "Fotosynthese", definition: "Proces waarbij planten lichtenergie omzetten in chemische energie", complexity: 2 },
        { id: "c2", name: "Chloroplasten", definition: "Celorganellen waar fotosynthese plaatsvindt", complexity: 3 },
        { id: "c3", name: "Glucose", definition: "Eenvoudige suiker die dient als energiebron", complexity: 1 },
        { id: "c4", name: "Koolstofdioxide", definition: "Gas dat nodig is voor fotosynthese", complexity: 1 }
    ],
    relations: [
        { from: "c2", to: "c1", type: "is_part_of" },
        { from: "c1", to: "c3", type: "leads_to" }
    ],
    examples: [
        { concept: "c1", example: "Planten die groeien door zonlicht" }
    ]
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

NIVEAUS (Bloom's Taxonomie):
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
- Nooit het antwoord voorzeggen.
- Spreek uitsluitend Nederlands.

NIVEAU-ESCALATIE (BELANGRIJK):
- Bij een CORRECT antwoord: verhoog suggestedNextLevel met 1 (max 5)
- Bij een PARTIAL antwoord: houd suggestedNextLevel gelijk
- Bij een INCORRECT antwoord: verlaag suggestedNextLevel met 1 (min 1)
- De volgende vraag moet altijd op het suggestedNextLevel niveau gesteld worden
- Wees proactief in het verhogen van het niveau bij goede antwoorden!

METADATA VEREIST:
Je MOET altijd eindigen met een JSON blok. Dit is essentieel voor het systeem.

OUTPUT FORMAT:
Elke response bevat VERPLICHT twee delen:
1. Je gesproken reactie naar de student (in normale tekst)
2. Een JSON blok met metadata (in \`\`\`json\`\`\` code block):

\`\`\`json
{
  "questionLevel": ${currentLevel},
  "answerQuality": "correct",
  "conceptsDemonstrated": ["concept_1"],
  "conceptsStruggling": [],
  "engagementSignal": "high",
  "suggestedNextLevel": ${Math.min(5, currentLevel + 1)},
  "phase": "exploration"
}
\`\`\`

UITLEG VELDEN:
- questionLevel: het niveau van de HUIDIGE vraag die je net stelde (${currentLevel})
- answerQuality: hoe goed was het antwoord van de student? (correct/partial/incorrect/unclear)
- suggestedNextLevel: het niveau voor de VOLGENDE vraag (verhoog bij correct, verlaag bij incorrect)
- conceptsDemonstrated: welke concept IDs heeft de student goed begrepen?
- conceptsStruggling: welke concept IDs zijn nog lastig?
- phase: calibration (begin), exploration (midden), integration (eind), closing (afsluiting)`
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
                               error.status === 429

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

// Initialiseer Gemini (Model configuration)
function getGeminiModel() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is niet geconfigureerd')
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    // Config: Gemini 2.0 Flash - veel hogere rate limits en sneller
    return genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT' as any, threshold: 'BLOCK_NONE' as any },
            { category: 'HARM_CATEGORY_HATE_SPEECH' as any, threshold: 'BLOCK_NONE' as any },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any, threshold: 'BLOCK_NONE' as any },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any, threshold: 'BLOCK_NONE' as any },
        ]
    })
}

// Analyseer een document en extraheer concepten
export async function analyzeDocument(documentText: string): Promise<DocumentAnalysis> {
    if (USE_MOCK) {
        console.log('MOCK MODE: Returning mock analysis')
        await new Promise(resolve => setTimeout(resolve, 1500)) // Fake delay
        return MOCK_ANALYSIS
    }

    const model = getGeminiModel()

    console.log('Gemini 2.0 Flash analyseert document (lengte:', documentText.length, ')')

    if (!documentText || documentText.trim().length === 0) {
        throw new Error('Document tekst is leeg, kan geen analyse uitvoeren.')
    }

    // Wrap in retry logic voor rate limit handling
    return withRetry(async () => {
        const result = await model.generateContent([
            DOCUMENT_ANALYSIS_PROMPT,
            `TEKST:\n${documentText}`
        ])

        const response = await result.response
        const responseText = response.text()

        if (!responseText) {
            throw new Error('Gemini gaf een leeg antwoord terug (blocked?)')
        }

        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            console.error('Geen JSON gevonden in Gemini response:', responseText)
            throw new Error('Geen JSON gevonden in response')
        }

        return JSON.parse(jsonMatch[0]) as DocumentAnalysis
    }, 3, 2000) // 3 retries, start with 2s delay
}

// Voer een conversatie beurt uit - STATELESS IMPLEMENTATIE
export async function chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    concepts: Concept[],
    currentLevel: number,
    engagementStatus: string = 'high'
): Promise<{ response: string; metadata: AssessmentMetadata | null }> {

    if (USE_MOCK) {
        console.log('MOCK MODE: Returning mock chat response')
        await new Promise(resolve => setTimeout(resolve, 1000))

        const lastMsg = messages[messages.length - 1].content.toLowerCase()
        let responseText = "Interessant antwoord! Kun je daar iets meer over vertellen?"
        let quality: AssessmentMetadata['answerQuality'] = 'partial'

        if (lastMsg.includes('start') || lastMsg.includes('welkomst')) {
            responseText = "Hallo! Ik ben je AI-toetsassistent. We gaan vandaag kijken wat je weet over Fotosynthese. Laten we beginnen: Wat is volgens jou het belangrijkste doel van fotosynthese?"
        } else if (lastMsg.includes('energie') || lastMsg.includes('suiker')) {
            responseText = "Heel goed! En waar in de cel vindt dit proces precies plaats?"
            quality = 'correct'
        } else if (lastMsg.includes('weet niet')) {
            responseText = "Geen probleem. Denk eens aan de groene kleur van planten. Waar komt die vandaan?"
            quality = 'incorrect'
        }

        return {
            response: responseText,
            metadata: {
                questionLevel: currentLevel,
                answerQuality: quality,
                conceptsDemonstrated: ['c1'],
                conceptsStruggling: [],
                engagementSignal: 'high',
                suggestedNextLevel: quality === 'correct' ? Math.min(5, currentLevel + 1) : currentLevel,
                phase: 'exploration'
            }
        }
    }

    const systemPrompt = generateConversationPrompt(concepts, currentLevel, engagementStatus)
    const model = getGeminiModel()

    // We bouwen handmatig de chat geschiedenis op in één grote string
    let promptHistory = `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\nCHAT HISTORY:\n`

    messages.forEach(msg => {
        promptHistory += `${msg.role.toUpperCase()}: ${msg.content}\n\n`
    })

    promptHistory += `ASSISTANT:`

    console.log('Gemini Stateless Chat Request...')

    try {
        const result = await model.generateContent(promptHistory)
        const response = await result.response
        const fullResponse = response.text()

        if (!fullResponse) {
            throw new Error('Gemini gaf een leeg antwoord (Safety Filter?)')
        }

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
        console.error('Gemini chat error:', error.message || error)
        if (error.message?.includes('model output must contain either output text')) {
            throw new Error('Gemini blokkeerde het antwoord. Probeer je antwoord anders te formuleren.')
        }
        throw new Error('Fout bij communicatie met Gemini: ' + (error.message || 'Onbekend'))
    }
}

// Start een nieuw gesprek met welkomstbericht
export async function startConversation(
    concepts: Concept[]
): Promise<{ response: string; metadata: AssessmentMetadata | null }> {

    if (USE_MOCK) {
        return chat([{ role: 'user', content: 'START' }], concepts, 2, 'high')
    }

    const initialMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
        {
            role: 'user',
            content: 'Start het toetsgesprek met een welkomstbericht en de eerste vraag op niveau 2.'
        }
    ]
    return chat(initialMessages, concepts, 2, 'high')
}
