import { NextRequest, NextResponse } from 'next/server'
import { getServerSession, updateSessionMetadata } from '@/lib/sessions'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sessionId } = await params
        console.log('Sessie beëindigen:', sessionId)

        const session = await getServerSession(sessionId)
        if (!session) {
            return NextResponse.json(
                { error: 'Sessie niet gevonden' },
                { status: 404 }
            )
        }

        // Markeer sessie als voltooid in DB
        await updateSessionMetadata(sessionId, { status: 'completed' })

        const endedAt = Date.now()
        // Bereken statistieken
        const duration = Math.round((endedAt - session.startedAt) / 60000)

        // Bereken niveau-verloop op basis van opgeslagen metadata
        const levelProgression = session.messages
            .filter(m => m.role === 'assistant')
            .map((m, index) => {
                // Gebruik metadata.questionLevel als beschikbaar, anders fallback naar eindniveau
                const level = m.metadata?.questionLevel ?? session.currentLevel
                return { messageIndex: index, level }
            })

        // Bereken stabiel niveau (berekend o.b.v. eindstatus)
        const finalLevel = session.currentLevel

        // Sorteer concepten op score
        const sortedScores = [...session.conceptScores].sort((a, b) => b.achievedLevel - a.achievedLevel)
        const strongestIds = sortedScores.slice(0, 3).map(s => s.conceptId)
        const weakestIds = sortedScores.slice(-3).map(s => s.conceptId)

        const strongestConcepts = session.concepts.filter(c => strongestIds.includes(c.id))
        const weakestConcepts = session.concepts.filter(c => weakestIds.includes(c.id))

        // Concept coverage
        const coveredConcepts = new Set(session.conceptScores.map(s => s.conceptId))
        const conceptCoverage = session.concepts.length > 0
            ? Math.round((coveredConcepts.size / session.concepts.length) * 100)
            : 0

        return NextResponse.json({
            success: true,
            finalLevel,
            duration,
            conceptCoverage,
            levelProgression,
            strongestConcepts,
            weakestConcepts,
            conceptScores: session.conceptScores
        })

    } catch (error) {
        console.error('Fout bij beëindigen sessie:', error)
        return NextResponse.json(
            {
                error: 'Er is een fout opgetreden bij het beëindigen van de sessie',
                details: error instanceof Error ? error.message : 'Onbekende fout'
            },
            { status: 500 }
        )
    }
}
