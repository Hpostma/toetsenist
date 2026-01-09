import { NextRequest, NextResponse } from 'next/server'
import { startConversation } from '@/lib/anthropic'
import { createSession, addMessage, getServerSession } from '@/lib/sessions'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized: Je moet ingelogd zijn om een sessie te starten.' },
                { status: 401 }
            )
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json(
                { error: 'ANTHROPIC_API_KEY niet geconfigureerd' },
                { status: 500 }
            )
        }

        const body = await request.json()
        const { documentTitle, concepts } = body

        if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
            return NextResponse.json(
                { error: 'concepts array is vereist' },
                { status: 400 }
            )
        }

        // 1. Maak sessie in DB (Koppel aan user)
        const sessionId = await createSession({
            documentTitle: documentTitle || 'Naamloos',
            concepts,
            currentLevel: 2
        }, user.id)

        if (!sessionId) {
            throw new Error('Kon geen sessie aanmaken in database')
        }

        // 2. Verkrijg welkomstbericht van AI
        const { response, metadata } = await startConversation(concepts)

        // 3. Sla berichten op in DB
        // Anthropic vereist dat we met user beginnen in de historie, dus die voegen we ook toe aan DB
        await addMessage(sessionId, 'user', 'Start het toetsgesprek met een welkomstbericht en de eerste vraag op niveau 2.')
        await addMessage(sessionId, 'assistant', response, metadata)

        return NextResponse.json({
            success: true,
            sessionId: sessionId,
            message: response,
            metadata,
            currentLevel: 2
        })

    } catch (error) {
        console.error('Fout bij starten sessie:', error)
        return NextResponse.json(
            {
                error: 'Er is een fout opgetreden bij het starten van de sessie',
                details: error instanceof Error ? error.message : 'Onbekende fout'
            },
            { status: 500 }
        )
    }
}

// GET endpoint om sessie info op te halen
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('id')

    if (!sessionId) {
        return NextResponse.json(
            { error: 'Session ID is vereist' },
            { status: 400 }
        )
    }

    const session = await getServerSession(sessionId)
    if (!session) {
        return NextResponse.json(
            { error: 'Sessie niet gevonden' },
            { status: 404 }
        )
    }

    return NextResponse.json({
        success: true,
        session: {
            id: session.id,
            documentTitle: session.documentTitle,
            status: session.status,
            currentLevel: session.currentLevel,
            messageCount: session.messages.length,
            startedAt: session.startedAt
        }
    })
}
