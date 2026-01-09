import { createClient } from '@/utils/supabase/server'
import { Concept, AssessmentMetadata } from './anthropic'

// Server-side sessie type (komt overeen met DB, maar met geparste JSON)
export interface ServerSession {
    id: string
    documentId?: string
    documentTitle?: string
    concepts: Concept[]
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    currentLevel: number
    engagementStatus: string
    status: 'active' | 'completed' | 'abandoned'
    startedAt: number // In DB is dit created_at timestamp
    recentAnswers: Array<'correct' | 'partial' | 'incorrect' | 'unclear'>
    conceptScores: Array<{ conceptId: string; achievedLevel: number; confidence: number }>
}

// Haal sessie op uit Supabase
export async function getServerSession(id: string): Promise<ServerSession | null> {
    const supabase = await createClient()

    // RLS zorgt ervoor dat we alleen sessies zien die van de user zijn.
    const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single()

    if (sessionError || !sessionData) {
        console.error('Fout bij ophalen sessie:', sessionError)
        return null
    }

    // Messages ophalen
    const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', id)
        .order('created_at', { ascending: true })

    if (messagesError) {
        console.error('Fout bij ophalen berichten:', messagesError)
        return null
    }

    // Map DB data naar ServerSession type
    return {
        id: sessionData.id,
        documentTitle: sessionData.document_title || 'Naamloos Document',
        concepts: sessionData.concepts as Concept[],
        messages: messagesData.map((m: any) => ({
            role: m.role,
            content: m.content
        })),
        currentLevel: sessionData.current_level,
        engagementStatus: sessionData.engagement_status || 'high',
        status: sessionData.status as any,
        startedAt: new Date(sessionData.created_at).getTime(),
        recentAnswers: (sessionData.recent_answers as any) || [],
        conceptScores: (sessionData.concept_scores as any) || []
    }
}


// Maak nieuwe sessie aan
export async function createSession(data: {
    documentTitle: string,
    concepts: Concept[],
    currentLevel: number
}, userId: string): Promise<string | null> {
    const supabase = await createClient()

    const { data: session, error } = await supabase
        .from('sessions')
        .insert({
            user_id: userId, // Koppel aan user!
            document_title: data.documentTitle,
            concepts: data.concepts,
            current_level: data.currentLevel,
            status: 'active',
            recent_answers: [],
            concept_scores: []
        })
        .select('id')
        .single()

    if (error) {
        console.error('Fout bij maken sessie:', error)
        return null
    }

    return session.id
}

// Voeg bericht toe aan sessie
export async function addMessage(sessionId: string, role: 'user' | 'assistant', content: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('messages')
        .insert({
            session_id: sessionId,
            role,
            content
        })

    if (error) {
        console.error('Fout bij toevoegen bericht:', error)
        throw new Error('Kon bericht niet opslaan')
    }
}

// Update sessie metadata (niveau, status, scores)
export async function updateSessionMetadata(
    sessionId: string,
    updates: {
        currentLevel?: number,
        engagementStatus?: string,
        status?: string,
        recentAnswers?: any[],
        conceptScores?: any[]
    }
) {
    const supabase = await createClient()

    const dbUpdates: any = {}
    if (updates.currentLevel !== undefined) dbUpdates.current_level = updates.currentLevel
    if (updates.engagementStatus !== undefined) dbUpdates.engagement_status = updates.engagementStatus
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.recentAnswers !== undefined) dbUpdates.recent_answers = updates.recentAnswers
    if (updates.conceptScores !== undefined) dbUpdates.concept_scores = updates.conceptScores

    const { error } = await supabase
        .from('sessions')
        .update(dbUpdates)
        .eq('id', sessionId)

    if (error) {
        console.error('Fout bij updaten sessie:', error)
        throw new Error('Kon sessie niet updaten')
    }
}

export function generateSessionId(): string {
    return `${Date.now()} `
}

// Haal ALLE sessies op (voor dashboard)
export async function getAllSessions(): Promise<ServerSession[]> {
    const supabase = await createClient()

    // Omdat RLS aan staat, haalt 'select *' automatisch alleen de sessies van de ingelogde user op.
    // We hoeven dus niet expliciet te filteren op user_id (maar het mag wel).

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
        console.log('Geen user gevonden in getAllSessions, dashboard zal leeg zijn.')
        return []
    }

    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id) // Expliciet is wel zo duidelijk
        .order('created_at', { ascending: false })

    if (error || !data) {
        console.error('Fout bij ophalen sessies:', error)
        return []
    }

    return data.map((sessionData: any) => ({
        id: sessionData.id,
        documentTitle: sessionData.document_title || 'Naamloos Document',
        concepts: sessionData.concepts as Concept[],
        messages: [],
        currentLevel: sessionData.current_level,
        engagementStatus: sessionData.engagement_status || 'high',
        status: sessionData.status as any,
        startedAt: new Date(sessionData.created_at).getTime(),
        recentAnswers: (sessionData.recent_answers as any) || [],
        conceptScores: (sessionData.concept_scores as any) || []
    }))
}

// Helper om sessie naar report data te converteren
export function convertSessionToReport(session: ServerSession) {
    const endedAt = Date.now()
    const duration = Math.round((endedAt - session.startedAt) / 60000)

    const sortedScores = [...session.conceptScores].sort((a, b) => b.achievedLevel - a.achievedLevel)
    const strongestIds = sortedScores.slice(0, 3).map(s => s.conceptId)
    const weakestIds = sortedScores.slice(-3).map(s => s.conceptId)

    const strongestConcepts = session.concepts.filter(c => strongestIds.includes(c.id))
    const weakestConcepts = session.concepts.filter(c => weakestIds.includes(c.id))

    const coveredConcepts = new Set(session.conceptScores.map(s => s.conceptId))
    const conceptCoverage = session.concepts.length > 0
        ? Math.round((coveredConcepts.size / session.concepts.length) * 100)
        : 0

    const levelProgression = session.messages
        .filter(m => m.role === 'assistant')
        .map((m, index) => {
            return { messageIndex: index, level: session.currentLevel }
        })

    return {
        sessionId: session.id,
        documentTitle: session.documentTitle || 'Naamloos',
        concepts: session.concepts,
        finalLevel: session.currentLevel,
        duration,
        conceptCoverage,
        levelProgression,
        strongestConcepts,
        weakestConcepts,
        conceptScores: session.conceptScores
    }
}
