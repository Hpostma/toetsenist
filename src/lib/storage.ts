import { Concept, AssessmentMetadata } from './gemini'

// Types voor sessie storage
export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    questionLevel?: number
    answerQuality?: string
    timestamp: number
}

export interface ConceptScore {
    conceptId: string
    achievedLevel: number
    confidence: number
}

export interface Session {
    id: string
    documentId: string
    documentTitle: string
    concepts: Concept[]
    messages: Message[]
    conceptScores: ConceptScore[]
    currentLevel: number
    engagementStatus: string
    status: 'active' | 'completed' | 'abandoned'
    startedAt: number
    endedAt?: number
    finalLevel?: number
    // Sliding window voor niveau-aanpassing
    recentAnswers: Array<'correct' | 'partial' | 'incorrect' | 'unclear'>
}

// In-memory storage (later te vervangen door database)
const sessions: Map<string, Session> = new Map()

// Helper om unieke IDs te genereren
function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Maak een nieuwe sessie aan
export function createSession(
    documentId: string,
    documentTitle: string,
    concepts: Concept[]
): Session {
    const session: Session = {
        id: generateId(),
        documentId,
        documentTitle,
        concepts,
        messages: [],
        conceptScores: [],
        currentLevel: 2, // Start op niveau 2 voor kalibratie
        engagementStatus: 'high',
        status: 'active',
        startedAt: Date.now(),
        recentAnswers: []
    }

    sessions.set(session.id, session)

    // Probeer ook op te slaan in localStorage (client-side)
    try {
        if (typeof window !== 'undefined') {
            const storedSessions = JSON.parse(localStorage.getItem('toets_sessions') || '{}')
            storedSessions[session.id] = session
            localStorage.setItem('toets_sessions', JSON.stringify(storedSessions))
        }
    } catch (error) {
        // Ignore localStorage errors (server-side)
    }

    return session
}

// Haal een sessie op
export function getSession(sessionId: string): Session | null {
    // Eerst in memory kijken
    let session = sessions.get(sessionId)

    // Als niet in memory, probeer localStorage
    if (!session) {
        try {
            if (typeof window !== 'undefined') {
                const storedSessions = JSON.parse(localStorage.getItem('toets_sessions') || '{}')
                session = storedSessions[sessionId]
                if (session) {
                    sessions.set(sessionId, session)
                }
            }
        } catch (error) {
            // Ignore localStorage errors
        }
    }

    return session || null
}

// Update een sessie
export function updateSession(session: Session): void {
    sessions.set(session.id, session)

    // Update ook localStorage
    try {
        if (typeof window !== 'undefined') {
            const storedSessions = JSON.parse(localStorage.getItem('toets_sessions') || '{}')
            storedSessions[session.id] = session
            localStorage.setItem('toets_sessions', JSON.stringify(storedSessions))
        }
    } catch (error) {
        // Ignore localStorage errors
    }
}

// Voeg een bericht toe aan een sessie
export function addMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: AssessmentMetadata
): Message | null {
    const session = getSession(sessionId)
    if (!session) return null

    const message: Message = {
        id: generateId(),
        role,
        content,
        timestamp: Date.now()
    }

    if (metadata) {
        message.questionLevel = metadata.questionLevel
        message.answerQuality = metadata.answerQuality
    }

    session.messages.push(message)

    // Update niveau en engagement op basis van metadata
    if (metadata) {
        updateSessionFromMetadata(session, metadata)
    }

    updateSession(session)
    return message
}

// Pas sessie aan op basis van AI metadata
function updateSessionFromMetadata(session: Session, metadata: AssessmentMetadata): void {
    // Update engagement status
    session.engagementStatus = metadata.engagementSignal

    // Track antwoordkwaliteit voor sliding window
    if (metadata.answerQuality) {
        session.recentAnswers.push(metadata.answerQuality)
        // Houd alleen laatste 5 antwoorden bij
        if (session.recentAnswers.length > 5) {
            session.recentAnswers.shift()
        }
    }

    // Niveau-aanpassing logica
    const correctCount = session.recentAnswers.filter(a => a === 'correct').length
    const incorrectCount = session.recentAnswers.filter(a => a === 'incorrect' || a === 'unclear').length

    // 3+ correct op rij = niveau omhoog
    const lastThree = session.recentAnswers.slice(-3)
    if (lastThree.length === 3 && lastThree.every(a => a === 'correct')) {
        session.currentLevel = Math.min(5, session.currentLevel + 1)
    }
    // 2+ incorrect in window = niveau omlaag
    else if (incorrectCount >= 2) {
        session.currentLevel = Math.max(1, session.currentLevel - 1)
    }
    // AI suggestie als fallback
    else if (metadata.suggestedNextLevel) {
        session.currentLevel = metadata.suggestedNextLevel
    }

    // Update concept scores
    for (const conceptId of metadata.conceptsDemonstrated) {
        updateConceptScore(session, conceptId, metadata.questionLevel, true)
    }
    for (const conceptId of metadata.conceptsStruggling) {
        updateConceptScore(session, conceptId, metadata.questionLevel, false)
    }
}

// Update de score voor een specifiek concept
function updateConceptScore(
    session: Session,
    conceptId: string,
    level: number,
    demonstrated: boolean
): void {
    let score = session.conceptScores.find(s => s.conceptId === conceptId)

    if (!score) {
        score = { conceptId, achievedLevel: 0, confidence: 0 }
        session.conceptScores.push(score)
    }

    if (demonstrated) {
        // Verhoog behaald niveau als dit hoger is
        score.achievedLevel = Math.max(score.achievedLevel, level)
        score.confidence = Math.min(1, score.confidence + 0.2)
    } else {
        // Verlaag confidence bij moeite
        score.confidence = Math.max(0, score.confidence - 0.1)
    }
}

// Beëindig een sessie
export function endSession(sessionId: string): Session | null {
    const session = getSession(sessionId)
    if (!session) return null

    session.status = 'completed'
    session.endedAt = Date.now()

    // Bereken finaal niveau (hoogste stabiele niveau)
    const levelCounts: Record<number, number> = {}
    for (const msg of session.messages) {
        if (msg.questionLevel && msg.answerQuality === 'correct') {
            levelCounts[msg.questionLevel] = (levelCounts[msg.questionLevel] || 0) + 1
        }
    }

    // Hoogste niveau met 3+ correcte antwoorden
    session.finalLevel = 1
    for (let level = 5; level >= 1; level--) {
        if ((levelCounts[level] || 0) >= 3) {
            session.finalLevel = level
            break
        }
    }

    updateSession(session)
    return session
}

// Genereer rapport data
export function generateReportData(sessionId: string): {
    session: Session
    levelProgression: Array<{ messageIndex: number; level: number }>
    strongestConcepts: Concept[]
    weakestConcepts: Concept[]
    duration: number
    conceptCoverage: number
} | null {
    const session = getSession(sessionId)
    if (!session) return null

    // Niveau-verloop
    const levelProgression = session.messages
        .filter(m => m.questionLevel)
        .map((m, index) => ({
            messageIndex: index,
            level: m.questionLevel!
        }))

    // Sterkste concepten (hoogste behaald niveau)
    const conceptsSorted = [...session.conceptScores].sort((a, b) => b.achievedLevel - a.achievedLevel)
    const strongIds = conceptsSorted.slice(0, 3).map(s => s.conceptId)
    const weakIds = conceptsSorted.slice(-3).map(s => s.conceptId)

    const strongestConcepts = session.concepts.filter(c => strongIds.includes(c.id))
    const weakestConcepts = session.concepts.filter(c => weakIds.includes(c.id))

    // Duur
    const duration = session.endedAt
        ? Math.round((session.endedAt - session.startedAt) / 60000)
        : Math.round((Date.now() - session.startedAt) / 60000)

    // Concept dekking
    const coveredConcepts = new Set(session.conceptScores.map(s => s.conceptId))
    const conceptCoverage = session.concepts.length > 0
        ? Math.round((coveredConcepts.size / session.concepts.length) * 100)
        : 0

    return {
        session,
        levelProgression,
        strongestConcepts,
        weakestConcepts,
        duration,
        conceptCoverage
    }
}

// Haal alle sessies op (voor debug/admin)
export function getAllSessions(): Session[] {
    return Array.from(sessions.values())
}
