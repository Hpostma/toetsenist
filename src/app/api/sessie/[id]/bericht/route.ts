import { NextRequest, NextResponse } from 'next/server'
import { chat, AssessmentMetadata } from '@/lib/anthropic'
import { getServerSession, addMessage, updateSessionMetadata } from '@/lib/sessions'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json(
                { error: 'ANTHROPIC_API_KEY niet geconfigureerd' },
                { status: 500 }
            )
        }

        const { id: sessionId } = await params
        console.log('Bericht ontvangen voor sessie (DB):', sessionId)

        const body = await request.json()
        const { content } = body

        if (!content || typeof content !== 'string') {
            return NextResponse.json(
                { error: 'content is vereist' },
                { status: 400 }
            )
        }

        // Haal sessie op (Async)
        const session = await getServerSession(sessionId)

        if (!session) {
            console.warn('Sessie niet gevonden in DB:', sessionId)
            return NextResponse.json(
                { error: 'Sessie niet gevonden.' },
                { status: 404 }
            )
        }

        if (session.status !== 'active') {
            return NextResponse.json(
                { error: 'Sessie is niet meer actief' },
                { status: 400 }
            )
        }

        // Sla user message op in DB
        await addMessage(sessionId, 'user', content)

        // Voeg toe aan lokale messages array voor de AI context
        // (We voegen hem toe omdat getServerSession de 'oude' staat had van voor de insert)
        const contextMessages = [
            ...session.messages,
            { role: 'user' as const, content }
        ]

        // Stuur naar Claude
        const { response, metadata } = await chat(
            contextMessages,
            session.concepts,
            session.currentLevel,
            session.engagementStatus
        )

        // Sla AI message op in DB
        await addMessage(sessionId, 'assistant', response)

        // Update sessie metadata in DB als nodig
        let newLevel = session.currentLevel
        let newEngagement = session.engagementStatus

        if (metadata) {
            const updates = calculateSessionUpdates(session, metadata)
            await updateSessionMetadata(sessionId, updates)

            // Update lokale variabelen voor de response
            if (updates.currentLevel) newLevel = updates.currentLevel
            if (updates.engagementStatus) newEngagement = updates.engagementStatus
        }

        return NextResponse.json({
            success: true,
            message: response,
            metadata,
            currentLevel: newLevel,
            engagementStatus: newEngagement
        })

    } catch (error) {
        console.error('Fout bij verwerken bericht:', error)
        return NextResponse.json(
            {
                error: 'Er is een fout opgetreden bij het verwerken van je bericht',
                details: error instanceof Error ? error.message : 'Onbekende fout'
            },
            { status: 500 }
        )
    }
}

// Helper functie om updates te berekenen (Pure function)
function calculateSessionUpdates(
    session: {
        currentLevel: number
        engagementStatus: string
        recentAnswers: Array<'correct' | 'partial' | 'incorrect' | 'unclear'>
        conceptScores: Array<{ conceptId: string; achievedLevel: number; confidence: number }>
    },
    metadata: AssessmentMetadata
) {
    const updates: any = {}

    // Engagement
    if (metadata.engagementSignal && metadata.engagementSignal !== session.engagementStatus) {
        updates.engagementStatus = metadata.engagementSignal
    }

    // Recent Answers
    let recentAnswers = [...session.recentAnswers]
    if (metadata.answerQuality) {
        recentAnswers.push(metadata.answerQuality)
        if (recentAnswers.length > 5) {
            recentAnswers.shift()
        }
        updates.recentAnswers = recentAnswers
    }

    // Niveau logica
    const lastThree = recentAnswers.slice(-3)
    const incorrectCount = recentAnswers.filter(a => a === 'incorrect' || a === 'unclear').length

    let nextLevel = session.currentLevel
    if (lastThree.length === 3 && lastThree.every(a => a === 'correct')) {
        nextLevel = Math.min(5, session.currentLevel + 1)
    } else if (incorrectCount >= 2) {
        nextLevel = Math.max(1, session.currentLevel - 1)
    } else if (metadata.suggestedNextLevel) {
        nextLevel = metadata.suggestedNextLevel
    }

    if (nextLevel !== session.currentLevel) {
        updates.currentLevel = nextLevel
    }

    // Concept Scores
    let conceptScores = [...session.conceptScores]
    let scoresChanged = false

    for (const conceptId of metadata.conceptsDemonstrated) {
        let score = conceptScores.find(s => s.conceptId === conceptId)
        if (!score) {
            score = { conceptId, achievedLevel: 0, confidence: 0 }
            conceptScores.push(score)
        }
        score.achievedLevel = Math.max(score.achievedLevel, metadata.questionLevel)
        score.confidence = Math.min(1, score.confidence + 0.2)
        scoresChanged = true
    }

    for (const conceptId of metadata.conceptsStruggling) {
        let score = conceptScores.find(s => s.conceptId === conceptId)
        if (!score) {
            score = { conceptId, achievedLevel: 0, confidence: 0 }
            conceptScores.push(score)
        }
        score.confidence = Math.max(0, score.confidence - 0.1)
        scoresChanged = true
    }

    if (scoresChanged) {
        updates.conceptScores = conceptScores
    }

    return updates
}
