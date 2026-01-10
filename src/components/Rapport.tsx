'use client'

import { useState } from 'react'
import { jsPDF } from 'jspdf'

interface Concept {
    id: string
    name: string
    definition: string
    complexity: number
}

interface ConceptScore {
    conceptId: string
    achievedLevel: number
    confidence: number
}

interface LevelProgress {
    messageIndex: number
    level: number
}

interface ReportData {
    sessionId: string
    documentTitle: string
    finalLevel: number
    duration: number
    conceptCoverage: number
    levelProgression: LevelProgress[]
    strongestConcepts: Concept[]
    weakestConcepts: Concept[]
    conceptScores: ConceptScore[]
    concepts: Concept[]
}

interface RapportProps {
    data: ReportData
    onRetry?: () => void
    onClose?: () => void
}

export default function Rapport({ data, onRetry, onClose }: RapportProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'concepts' | 'advice'>('overview')
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

    // Niveau labels
    const getLevelLabel = (level: number) => {
        const labels = [
            'Herkenning',
            'Reproductie',
            'Toepassing',
            'Analyse',
            'Synthese'
        ]
        return labels[level - 1] || 'Onbekend'
    }

    // Niveau kleuren
    const getLevelColor = (level: number) => {
        const colors = [
            'text-blue-600 bg-blue-100',
            'text-green-600 bg-green-100',
            'text-yellow-600 bg-yellow-100',
            'text-orange-600 bg-orange-100',
            'text-red-600 bg-red-100'
        ]
        return colors[level - 1] || colors[0]
    }

    // Genereer uitgebreide PDF
    const generatePDF = async () => {
        setIsGeneratingPdf(true)

        try {
            const doc = new jsPDF()
            const pageWidth = doc.internal.pageSize.getWidth()
            const margin = 20
            const contentWidth = pageWidth - 2 * margin
            let y = 20

            // Helper functies
            const addTitle = (text: string, size: number = 18) => {
                doc.setFontSize(size)
                doc.setFont('helvetica', 'bold')
                doc.text(text, margin, y)
                y += size * 0.5 + 4
            }

            const addSubtitle = (text: string) => {
                doc.setFontSize(14)
                doc.setFont('helvetica', 'bold')
                doc.text(text, margin, y)
                y += 10
            }

            const addText = (text: string, indent: number = 0) => {
                doc.setFontSize(11)
                doc.setFont('helvetica', 'normal')
                const lines = doc.splitTextToSize(text, contentWidth - indent)
                doc.text(lines, margin + indent, y)
                y += lines.length * 6
            }

            const addBullet = (text: string) => {
                doc.setFontSize(11)
                doc.setFont('helvetica', 'normal')
                doc.text('•', margin + 5, y)
                const lines = doc.splitTextToSize(text, contentWidth - 15)
                doc.text(lines, margin + 12, y)
                y += lines.length * 6
            }

            const addSpace = (space: number = 8) => {
                y += space
            }

            const checkNewPage = (neededSpace: number = 40) => {
                if (y > doc.internal.pageSize.getHeight() - neededSpace) {
                    doc.addPage()
                    y = 20
                }
            }

            // === PAGINA 1: TITEL EN OVERZICHT ===

            // Header
            doc.setFillColor(229, 0, 85) // HAN rood
            doc.rect(0, 0, pageWidth, 45, 'F')

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(22)
            doc.setFont('helvetica', 'bold')
            doc.text('Toetsrapport', margin, 25)

            doc.setFontSize(12)
            doc.setFont('helvetica', 'normal')
            doc.text(data.documentTitle, margin, 35)

            doc.setTextColor(0, 0, 0)
            y = 60

            // Datum
            const now = new Date()
            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            doc.text(`Gegenereerd op: ${now.toLocaleDateString('nl-NL')} om ${now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`, margin, y)
            y += 15
            doc.setTextColor(0, 0, 0)

            // Overzicht sectie
            addTitle('Samenvatting', 16)
            addSpace(4)

            // Score kaarten
            doc.setFillColor(245, 245, 245)
            doc.roundedRect(margin, y, 50, 35, 3, 3, 'F')
            doc.roundedRect(margin + 57, y, 50, 35, 3, 3, 'F')
            doc.roundedRect(margin + 114, y, 50, 35, 3, 3, 'F')

            doc.setFontSize(20)
            doc.setFont('helvetica', 'bold')
            doc.text(String(data.finalLevel), margin + 25, y + 18, { align: 'center' })
            doc.text(String(data.duration), margin + 82, y + 18, { align: 'center' })
            doc.text(`${data.conceptCoverage}%`, margin + 139, y + 18, { align: 'center' })

            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(100, 100, 100)
            doc.text('Stabiel Niveau', margin + 25, y + 28, { align: 'center' })
            doc.text('Minuten', margin + 82, y + 28, { align: 'center' })
            doc.text('Concepten', margin + 139, y + 28, { align: 'center' })
            doc.setTextColor(0, 0, 0)

            y += 50

            // Niveau uitleg
            addSubtitle(`Niveau ${data.finalLevel}: ${getLevelLabel(data.finalLevel)}`)
            addSpace(2)

            const levelDescriptions: { [key: number]: string } = {
                1: 'Je kunt de basisbegrippen herkennen. Focus op het begrijpen van definities en het onthouden van belangrijke termen.',
                2: 'Je kunt concepten in eigen woorden uitleggen. Je hebt een goede basis en bent klaar om te oefenen met toepassingen.',
                3: 'Je kunt kennis toepassen op nieuwe situaties. Je begrijpt niet alleen wat de concepten zijn, maar ook hoe je ze kunt gebruiken.',
                4: 'Je kunt kritisch analyseren en vergelijken. Je ziet verbanden tussen concepten en kunt ze evalueren.',
                5: 'Uitstekend! Je beheerst alle niveaus inclusief synthese. Je kunt concepten creatief combineren en nieuwe inzichten genereren.'
            }
            addText(levelDescriptions[data.finalLevel] || 'Niveau niet bepaald.')

            addSpace(10)

            // Niveau-verloop grafiek (tekst versie)
            addSubtitle('Niveau-verloop tijdens sessie')
            addSpace(2)

            if (data.levelProgression.length > 0) {
                const progressText = data.levelProgression
                    .map((p, i) => `Vraag ${i + 1}: Niveau ${p.level}`)
                    .join(' → ')
                addText(progressText)

                // Gemiddeld niveau
                const avgLevel = (data.levelProgression.reduce((sum, p) => sum + p.level, 0) / data.levelProgression.length).toFixed(1)
                addSpace(4)
                addText(`Gemiddeld niveau: ${avgLevel}`)
            } else {
                addText('Geen niveau-verloop data beschikbaar.')
            }

            // === PAGINA 2: CONCEPTEN ===
            doc.addPage()
            y = 20

            addTitle('Concepten Analyse', 16)
            addSpace(8)

            // Sterkste concepten
            addSubtitle('Sterkste Concepten')
            addSpace(2)

            if (data.strongestConcepts.length > 0) {
                data.strongestConcepts.forEach(concept => {
                    checkNewPage()
                    const score = data.conceptScores.find(s => s.conceptId === concept.id)
                    doc.setFont('helvetica', 'bold')
                    addText(`${concept.name} (Niveau ${score?.achievedLevel || concept.complexity})`)
                    doc.setFont('helvetica', 'normal')
                    addText(concept.definition, 5)
                    addSpace(4)
                })
            } else {
                addText('Nog geen concepten als sterk beoordeeld.')
            }

            addSpace(10)

            // Aandachtspunten
            addSubtitle('Aandachtspunten')
            addSpace(2)

            if (data.weakestConcepts.length > 0) {
                data.weakestConcepts.forEach(concept => {
                    checkNewPage()
                    const score = data.conceptScores.find(s => s.conceptId === concept.id)
                    doc.setFont('helvetica', 'bold')
                    addText(`${concept.name} (Niveau ${score?.achievedLevel || 1})`)
                    doc.setFont('helvetica', 'normal')
                    addText(concept.definition, 5)
                    addSpace(4)
                })
            } else {
                addText('Geen specifieke aandachtspunten geïdentificeerd.')
            }

            addSpace(10)

            // Alle concepten overzicht
            checkNewPage(60)
            addSubtitle('Alle Concepten')
            addSpace(2)

            data.concepts.forEach(concept => {
                checkNewPage()
                const score = data.conceptScores.find(s => s.conceptId === concept.id)
                const achievedLevel = score?.achievedLevel || '-'
                addBullet(`${concept.name}: ${concept.definition} [Niveau: ${achievedLevel}]`)
                addSpace(2)
            })

            // === PAGINA 3: STUDIEADVIES ===
            doc.addPage()
            y = 20

            addTitle('Studieadvies', 16)
            addSpace(8)

            // Algemeen advies op basis van niveau
            addSubtitle('Algemeen Advies')
            addSpace(2)

            if (data.finalLevel <= 2) {
                addText('Focus op het begrijpen van de basisbegrippen:')
                addSpace(4)
                addBullet('Lees de definities meerdere keren door')
                addBullet('Schrijf de concepten in je eigen woorden op')
                addBullet('Maak samenvattingen van elk concept')
                addBullet('Gebruik flashcards om begrippen te oefenen')
            } else if (data.finalLevel === 3) {
                addText('Je hebt een goede basis. Werk aan toepassingen:')
                addSpace(4)
                addBullet('Bedenk eigen voorbeelden voor elk concept')
                addBullet('Probeer concepten toe te passen op casussen')
                addBullet('Oefen met praktijkgerichte vraagstukken')
                addBullet('Verbind theorie aan praktijksituaties')
            } else {
                addText('Uitstekend niveau! Verdiep je kennis verder:')
                addSpace(4)
                addBullet('Analyseer verbanden tussen concepten')
                addBullet('Vergelijk verschillende benaderingen')
                addBullet('Bedenk nieuwe toepassingen en combinaties')
                addBullet('Deel je kennis met anderen om te consolideren')
            }

            addSpace(15)

            // Specifiek advies voor zwakke concepten
            if (data.weakestConcepts.length > 0) {
                checkNewPage(50)
                addSubtitle('Extra Studie Aanbevolen')
                addSpace(2)
                addText('Besteed extra aandacht aan de volgende concepten:')
                addSpace(4)

                data.weakestConcepts.forEach(concept => {
                    checkNewPage()
                    addBullet(`${concept.name}: ${concept.definition}`)
                    addSpace(2)
                })
            }

            addSpace(15)

            // Volgende stappen
            checkNewPage(50)
            addSubtitle('Volgende Stappen')
            addSpace(2)
            addBullet('Herhaal de toets over 1-2 weken om je voortgang te meten')
            addBullet('Focus eerst op de aandachtspunten voordat je verder gaat')
            addBullet('Gebruik verschillende studiemethoden voor betere retentie')
            addBullet('Vraag om hulp bij concepten die onduidelijk blijven')

            // Footer op elke pagina
            const totalPages = doc.getNumberOfPages()
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i)
                doc.setFontSize(9)
                doc.setTextColor(150, 150, 150)
                doc.text(
                    `Pagina ${i} van ${totalPages} | AI Toetsapplicatie | ${data.documentTitle}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                )
            }

            // Download PDF
            const filename = `Toetsrapport_${data.documentTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${now.toISOString().split('T')[0]}.pdf`
            doc.save(filename)

        } catch (error) {
            console.error('PDF generatie mislukt:', error)
            alert('Er is een fout opgetreden bij het genereren van de PDF. Probeer het opnieuw.')
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    // Bereken statistieken
    const avgLevel = data.levelProgression.length > 0
        ? (data.levelProgression.reduce((sum, p) => sum + p.level, 0) / data.levelProgression.length).toFixed(1)
        : data.finalLevel

    // Eenvoudige lijn grafiek
    const maxPoints = data.levelProgression.length

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-han-red text-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Jouw Toetsrapport</h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                <p className="text-white/80 mb-4 font-medium">{data.documentTitle}</p>

                {/* Score card */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
                        <div className="text-4xl font-bold font-heading">{data.finalLevel}</div>
                        <div className="text-sm text-white/90">Stabiel Niveau</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
                        <div className="text-4xl font-bold font-heading">{data.duration}</div>
                        <div className="text-sm text-white/90">Minuten</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
                        <div className="text-4xl font-bold font-heading">{data.conceptCoverage}%</div>
                        <div className="text-sm text-white/90">Concepten</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                {[
                    { id: 'overview', label: 'Overzicht' },
                    { id: 'concepts', label: 'Concepten' },
                    { id: 'advice', label: 'Advies' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-4 px-6 text-sm font-bold transition-colors ${activeTab === tab.id
                            ? 'text-han-red border-b-4 border-han-red'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Overview tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Level interpretation */}
                        <div className={`p-4 rounded-xl ${getLevelColor(data.finalLevel)}`}>
                            <h3 className="font-semibold mb-1">Niveau {data.finalLevel}: {getLevelLabel(data.finalLevel)}</h3>
                            <p className="text-sm">
                                {data.finalLevel === 1 && 'Je kunt de basisbegrippen herkennen. Focus op het begrijpen van definities.'}
                                {data.finalLevel === 2 && 'Je kunt concepten in eigen woorden uitleggen. Ga nu oefenen met toepassingen.'}
                                {data.finalLevel === 3 && 'Je kunt kennis toepassen op nieuwe situaties. Probeer kritischer te analyseren.'}
                                {data.finalLevel === 4 && 'Je kunt kritisch analyseren en vergelijken. Werk aan het combineren van concepten.'}
                                {data.finalLevel === 5 && 'Uitstekend! Je beheerst alle niveaus inclusief synthese en creatieve combinaties.'}
                            </p>
                        </div>

                        {/* Level progression graph */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold mb-3">Niveau-verloop</h3>
                            <div className="relative h-40 bg-white rounded-lg p-4">
                                {/* Y-axis labels */}
                                <div className="absolute left-0 top-4 bottom-4 w-8 flex flex-col justify-between text-xs text-gray-400">
                                    <span>5</span>
                                    <span>4</span>
                                    <span>3</span>
                                    <span>2</span>
                                    <span>1</span>
                                </div>

                                {/* Graph area */}
                                <div className="ml-10 h-full relative">
                                    {/* Grid lines */}
                                    {[1, 2, 3, 4, 5].map(level => (
                                        <div
                                            key={level}
                                            className="absolute left-0 right-0 border-t border-gray-100"
                                            style={{ bottom: `${(level - 1) * 25}%` }}
                                        />
                                    ))}

                                    {/* Line chart */}
                                    {data.levelProgression.length > 0 && (
                                        <svg className="absolute inset-0 w-full h-full overflow-visible">
                                            {/* Line */}
                                            <polyline
                                                fill="none"
                                                stroke="#E50055"
                                                strokeWidth="3"
                                                points={data.levelProgression.map((p, i) => {
                                                    const x = maxPoints > 1 ? (i / (maxPoints - 1)) * 100 : 50
                                                    const y = 100 - ((p.level - 1) / 4) * 100
                                                    return `${x}%,${y}%`
                                                }).join(' ')}
                                            />

                                            {/* Points */}
                                            {data.levelProgression.map((p, i) => {
                                                const x = maxPoints > 1 ? (i / (maxPoints - 1)) * 100 : 50
                                                const y = 100 - ((p.level - 1) / 4) * 100
                                                return (
                                                    <circle
                                                        key={i}
                                                        cx={`${x}%`}
                                                        cy={`${y}%`}
                                                        r="5"
                                                        fill="#E50055"
                                                    />
                                                )
                                            })}
                                        </svg>
                                    )}

                                    {data.levelProgression.length === 0 && (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            Geen data beschikbaar
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 text-center">
                                Vraagnummer →
                            </div>
                        </div>
                    </div>
                )}

                {/* Concepts tab */}
                {activeTab === 'concepts' && (
                    <div className="space-y-6">
                        {/* Strongest concepts */}
                        <div>
                            <h3 className="font-semibold text-green-700 flex items-center gap-2 mb-3">
                                <span className="text-lg">✅</span> Sterkste Concepten
                            </h3>
                            <div className="space-y-2">
                                {data.strongestConcepts.map(concept => {
                                    const score = data.conceptScores.find(s => s.conceptId === concept.id)
                                    return (
                                        <div key={concept.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div>
                                                <h4 className="font-medium text-green-900">{concept.name}</h4>
                                                <p className="text-sm text-green-700">{concept.definition}</p>
                                            </div>
                                            <div className="text-green-600 font-bold">
                                                Lvl {score?.achievedLevel || concept.complexity}
                                            </div>
                                        </div>
                                    )
                                })}
                                {data.strongestConcepts.length === 0 && (
                                    <p className="text-gray-500 text-sm">Nog geen concepten beoordeeld</p>
                                )}
                            </div>
                        </div>

                        {/* Weakest concepts */}
                        <div>
                            <h3 className="font-semibold text-orange-700 flex items-center gap-2 mb-3">
                                <span className="text-lg">📌</span> Aandachtspunten
                            </h3>
                            <div className="space-y-2">
                                {data.weakestConcepts.map(concept => {
                                    const score = data.conceptScores.find(s => s.conceptId === concept.id)
                                    return (
                                        <div key={concept.id} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-3">
                                            <div>
                                                <h4 className="font-medium text-orange-900">{concept.name}</h4>
                                                <p className="text-sm text-orange-700">{concept.definition}</p>
                                            </div>
                                            <div className="text-orange-600 font-bold">
                                                Lvl {score?.achievedLevel || 1}
                                            </div>
                                        </div>
                                    )
                                })}
                                {data.weakestConcepts.length === 0 && (
                                    <p className="text-gray-500 text-sm">Geen specifieke aandachtspunten</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Advice tab */}
                {activeTab === 'advice' && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <h3 className="font-semibold text-blue-900 mb-2">Studieadvies</h3>
                            <div className="text-blue-800 space-y-3 text-sm">
                                {data.finalLevel <= 2 && (
                                    <>
                                        <p>Focus op het begrijpen van de <strong>basisbegrippen</strong>:</p>
                                        <ul className="list-disc list-inside ml-2 space-y-1">
                                            <li>Lees de definities meerdere keren door</li>
                                            <li>Schrijf de concepten in je eigen woorden op</li>
                                            <li>Maak samenvattingen van elk concept</li>
                                        </ul>
                                    </>
                                )}
                                {data.finalLevel === 3 && (
                                    <>
                                        <p>Je hebt een goede basis. Werk aan <strong>toepassingen</strong>:</p>
                                        <ul className="list-disc list-inside ml-2 space-y-1">
                                            <li>Bedenk eigen voorbeelden voor elk concept</li>
                                            <li>Probeer concepten toe te passen op casussen</li>
                                            <li>Oefen met praktijkgerichte vraagstukken</li>
                                        </ul>
                                    </>
                                )}
                                {data.finalLevel >= 4 && (
                                    <>
                                        <p>Uitstekend niveau! Verdiep je kennis verder:</p>
                                        <ul className="list-disc list-inside ml-2 space-y-1">
                                            <li>Analyseer verbanden tussen concepten</li>
                                            <li>Vergelijk verschillende benaderingen</li>
                                            <li>Bedenk nieuwe toepassingen en combinaties</li>
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>

                        {data.weakestConcepts.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <h3 className="font-semibold text-yellow-900 mb-2">Extra studie aanbevolen</h3>
                                <p className="text-yellow-800 text-sm mb-2">
                                    Besteed extra aandacht aan deze concepten:
                                </p>
                                <ul className="list-disc list-inside ml-2 text-yellow-700 text-sm space-y-1">
                                    {data.weakestConcepts.map(c => (
                                        <li key={c.id}><strong>{c.name}</strong>: {c.definition}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-4">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex-1 py-3 bg-han-red hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-md"
                    >
                        Opnieuw Proberen
                    </button>
                )}
                <button
                    onClick={generatePDF}
                    disabled={isGeneratingPdf}
                    className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isGeneratingPdf ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            PDF maken...
                        </>
                    ) : (
                        'Download PDF'
                    )}
                </button>
            </div>
        </div>
    )
}
