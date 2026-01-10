import { NextRequest, NextResponse } from 'next/server'
import { analyzeDocument } from '@/lib/gemini'

export async function POST(request: NextRequest) {
    try {
        // Check API key (using Gemini for document analysis)
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY not found')
            return NextResponse.json(
                {
                    error: 'API configuratie ontbreekt. Voeg GEMINI_API_KEY toe.',
                    hint: 'Stel de GEMINI_API_KEY environment variable in'
                },
                { status: 500 }
            )
        }

        const body = await request.json()
        const { documentText } = body

        if (!documentText) {
            return NextResponse.json(
                { error: 'documentText is vereist' },
                { status: 400 }
            )
        }

        if (typeof documentText !== 'string') {
            return NextResponse.json(
                { error: 'documentText moet een string zijn' },
                { status: 400 }
            )
        }

        // Beperk document grootte
        if (documentText.length > 200000) {
            return NextResponse.json(
                { error: 'Document te groot (max 200.000 karakters)' },
                { status: 400 }
            )
        }

        // Analyseer document en extraheer concepten
        const analysis = await analyzeDocument(documentText)

        return NextResponse.json({
            success: true,
            analysis
        })

    } catch (error: any) {
        console.error('Fout bij concept-extractie:', error)
        return NextResponse.json(
            {
                error: 'Er is een fout opgetreden bij het analyseren van het document',
                details: error instanceof Error ? error.message : 'Onbekende fout'
            },
            { status: 500 }
        )
    }
}
