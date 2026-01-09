import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand gevonden' }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    const isDocx = fileName.endsWith('.docx')
    const isPdf = fileName.endsWith('.pdf')
    const isCsv = fileName.endsWith('.csv')
    const isTxt = fileName.endsWith('.txt')

    if (!isDocx && !isPdf && !isCsv && !isTxt) {
      return NextResponse.json({
        error: 'Ondersteunde formaten: .docx, .pdf, .csv, .txt'
      }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Bestand is te groot (max 10MB)' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let textContent = ''
    let fileType = ''

    if (isDocx) {
      const result = await mammoth.extractRawText({ buffer })
      textContent = result.value
      fileType = 'Word Document (.docx)'
    } else if (isPdf) {
      try {
        // Gebruik de library direct als dat kan, anders de fallback require
        const pdfParse = require('pdf-parse/lib/pdf-parse')
        const pdfData = await pdfParse(buffer)
        textContent = pdfData.text
        fileType = 'PDF Document (.pdf)'

        if (!textContent || textContent.trim().length === 0) {
          throw new Error('Geen tekst gevonden in PDF. Is het een gescand document?')
        }
      } catch (pdfError: any) {
        console.error('PDF parsing error:', pdfError)

        let errorMessage = 'De tekst uit dit PDF bestand kon niet worden gelezen.'
        let hint = 'Probeer het document op te slaan als .docx of kopieer de tekst naar een .txt bestand.'

        if (pdfError.message?.includes('password')) {
          errorMessage = 'Dit PDF bestand is beveiligd met een wachtwoord.'
        } else if (textContent.trim().length === 0) {
          errorMessage = 'Dit lijkt een gescand document of een afbeelding te zijn zonder leesbare tekst.'
        }

        return NextResponse.json({ error: errorMessage, hint }, { status: 400 })
      }
    } else if (isTxt) {
      textContent = buffer.toString('utf-8')
      fileType = 'Tekstbestand (.txt)'
    } else if (isCsv) {
      try {
        const csvText = buffer.toString('utf-8')
        const lines = csvText.split('\n').filter(line => line.trim().length > 0)

        if (lines.length === 0) {
          return NextResponse.json({ error: 'CSV bestand is leeg' }, { status: 400 })
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const rows = lines.slice(1, Math.min(11, lines.length))

        let formattedContent = `CSV Data (${lines.length - 1} rijen, ${headers.length} kolommen)\n\n`
        formattedContent += `Kolommen: ${headers.join(', ')}\n\n`
        formattedContent += 'Eerste 10 rijen:\n'
        rows.forEach((row, index) => {
          const values = row.split(',').map(v => v.trim().replace(/"/g, ''))
          formattedContent += `${index + 1}. ${values.join(' | ')}\n`
        })

        textContent = formattedContent
        fileType = 'CSV Data (.csv)'
      } catch (csvError) {
        return NextResponse.json({ error: 'Fout bij het lezen van het CSV bestand' }, { status: 400 })
      }
    }

    if (!textContent || textContent.trim().length < 10) {
      return NextResponse.json({
        error: 'Te weinig tekst gevonden in het bestand. Controleer of het bestand niet leeg is.'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      filename: file.name,
      size: file.size,
      fileType: fileType,
      content: textContent,
      wordCount: textContent.split(/\s+/).filter(word => word.length > 0).length,
      characterCount: textContent.length
    })

  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verwerken van het bestand. Probeer het opnieuw.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'GET method not allowed. Use POST to upload files.' },
    { status: 405 }
  )
} 