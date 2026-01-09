'use client'

import { useState, useEffect } from 'react'

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

    // Bereken statistieken
    const avgLevel = data.levelProgression.length > 0
        ? (data.levelProgression.reduce((sum, p) => sum + p.level, 0) / data.levelProgression.length).toFixed(1)
        : data.finalLevel

    // Eenvoudige lijn grafiek
    const maxPoints = data.levelProgression.length
    const graphWidth = 100
    const graphHeight = 60
    const pointSpacing = maxPoints > 1 ? graphWidth / (maxPoints - 1) : 0

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
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
                    { id: 'overview', label: '📊 Overzicht' },
                    { id: 'concepts', label: '💡 Concepten' },
                    { id: 'advice', label: '📚 Advies' }
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
                            <h3 className="font-semibold text-blue-900 mb-2">📚 Studieadvies</h3>
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
                                <h3 className="font-semibold text-yellow-900 mb-2">⚡ Extra studie aanbevolen</h3>
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
                        🔁 Opnieuw Proberen
                    </button>
                )}
                <button
                    onClick={() => window.print()}
                    className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                >
                    📄 Download PDF
                </button>
            </div>
        </div>
    )
}
