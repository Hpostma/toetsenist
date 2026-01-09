'use client'

import { useState } from 'react'

interface Concept {
    id: string
    name: string
    definition: string
    complexity: number
    sourceSection?: string
}

interface ConceptRelation {
    from: string
    to: string
    type: string
}

interface ConceptenOverzichtProps {
    concepts: Concept[]
    relations?: ConceptRelation[]
    isEditable?: boolean
    onConceptsChange?: (concepts: Concept[]) => void
    onStartToets?: () => void
}

export default function ConceptenOverzicht({
    concepts,
    relations = [],
    isEditable = false,
    onConceptsChange,
    onStartToets
}: ConceptenOverzichtProps) {
    const [expandedConcept, setExpandedConcept] = useState<string | null>(null)
    const [editingConcept, setEditingConcept] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ name: '', definition: '', complexity: 1 })

    // Complexiteit labels en kleuren
    const getComplexityInfo = (level: number) => {
        const info = [
            { label: 'Basis', color: 'bg-green-100 text-green-800', dotColor: 'bg-green-500' },
            { label: 'Gemiddeld', color: 'bg-blue-100 text-blue-800', dotColor: 'bg-blue-500' },
            { label: 'Uitdagend', color: 'bg-yellow-100 text-yellow-800', dotColor: 'bg-yellow-500' },
            { label: 'Complex', color: 'bg-orange-100 text-orange-800', dotColor: 'bg-orange-500' },
            { label: 'Expert', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' }
        ]
        return info[level - 1] || info[0]
    }

    // Start editing
    const startEditing = (concept: Concept) => {
        setEditingConcept(concept.id)
        setEditForm({
            name: concept.name,
            definition: concept.definition,
            complexity: concept.complexity
        })
    }

    // Save edit
    const saveEdit = (conceptId: string) => {
        const updatedConcepts = concepts.map(c =>
            c.id === conceptId
                ? { ...c, name: editForm.name, definition: editForm.definition, complexity: editForm.complexity }
                : c
        )
        onConceptsChange?.(updatedConcepts)
        setEditingConcept(null)
    }

    // Get related concepts
    const getRelatedConcepts = (conceptId: string) => {
        return relations
            .filter(r => r.from === conceptId || r.to === conceptId)
            .map(r => {
                const relatedId = r.from === conceptId ? r.to : r.from
                const relatedConcept = concepts.find(c => c.id === relatedId)
                return { ...r, relatedConcept }
            })
            .filter(r => r.relatedConcept)
    }

    // Relation type labels
    const getRelationLabel = (type: string) => {
        const labels: Record<string, string> = {
            is_example_of: 'is een voorbeeld van',
            leads_to: 'leidt tot',
            contrasts_with: 'contrasteert met',
            is_part_of: 'is onderdeel van'
        }
        return labels[type] || type
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Geëxtraheerde Concepten</h2>
                    <p className="text-gray-500">{concepts.length} concepten gevonden</p>
                </div>
                {onStartToets && (
                    <button
                        onClick={onStartToets}
                        className="px-6 py-3 bg-han-red hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
                    >
                        🎯 Start Toetsgesprek
                    </button>
                )}
            </div>

            {/* Complexity legend */}
            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-medium">Complexiteit:</span>
                {[1, 2, 3, 4, 5].map(level => {
                    const info = getComplexityInfo(level)
                    return (
                        <span key={level} className={`px-2 py-1 text-xs rounded-full ${info.color}`}>
                            {level}. {info.label}
                        </span>
                    )
                })}
            </div>

            {/* Concepts grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {concepts.map((concept) => {
                    const info = getComplexityInfo(concept.complexity)
                    const isExpanded = expandedConcept === concept.id
                    const isEditing = editingConcept === concept.id
                    const relatedConcepts = getRelatedConcepts(concept.id)

                    return (
                        <div
                            key={concept.id}
                            className={`bg-white rounded-lg border-2 transition-all cursor-pointer ${isExpanded
                                ? 'border-han-red shadow-lg'
                                : 'border-gray-200 hover:border-han-red hover:shadow-md'
                                }`}
                            onClick={() => !isEditing && setExpandedConcept(isExpanded ? null : concept.id)}
                        >
                            <div className="p-4">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-2">
                                    {isEditing ? (
                                        <input
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:border-han-red"
                                        />
                                    ) : (
                                        <h3 className="font-semibold text-gray-900">{concept.name}</h3>
                                    )}
                                    <div className="flex items-center gap-2 ml-2">
                                        <div className={`w-3 h-3 rounded-full ${info.dotColor}`} title={info.label}></div>
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${info.color}`}>
                                            {concept.complexity}
                                        </span>
                                    </div>
                                </div>

                                {/* Definition */}
                                {isEditing ? (
                                    <textarea
                                        value={editForm.definition}
                                        onChange={(e) => setEditForm({ ...editForm, definition: e.target.value })}
                                        onClick={(e) => e.stopPropagation()}
                                        rows={3}
                                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:border-han-red text-sm"
                                    />
                                ) : (
                                    <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                                        {concept.definition}
                                    </p>
                                )}

                                {/* Expanded content */}
                                {isExpanded && !isEditing && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                        {/* Source section */}
                                        {concept.sourceSection && (
                                            <div className="text-xs text-gray-500">
                                                <span className="font-medium">Bron:</span> {concept.sourceSection}
                                            </div>
                                        )}

                                        {/* Related concepts */}
                                        {relatedConcepts.length > 0 && (
                                            <div>
                                                <span className="text-xs font-medium text-gray-500 block mb-1">Relaties:</span>
                                                <div className="space-y-1">
                                                    {relatedConcepts.map((rel, idx) => (
                                                        <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                                                            <span className="text-han-red">→</span>
                                                            <span>{getRelationLabel(rel.type)}</span>
                                                            <span className="font-medium">{rel.relatedConcept?.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Edit mode controls */}
                                {isEditing && (
                                    <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <label className="text-sm text-gray-600">Niveau:</label>
                                        <select
                                            value={editForm.complexity}
                                            onChange={(e) => setEditForm({ ...editForm, complexity: parseInt(e.target.value) })}
                                            className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
                                        >
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                        <div className="flex-1"></div>
                                        <button
                                            onClick={() => setEditingConcept(null)}
                                            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Annuleren
                                        </button>
                                        <button
                                            onClick={() => saveEdit(concept.id)}
                                            className="px-3 py-1 text-sm bg-han-red text-white rounded-lg hover:bg-red-700 font-bold"
                                        >
                                            Opslaan
                                        </button>
                                    </div>
                                )}

                                {/* Edit button (only if editable and not editing) */}
                                {isEditable && isExpanded && !isEditing && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            startEditing(concept)
                                        }}
                                        className="mt-3 w-full py-2 text-sm text-han-red hover:bg-red-50 rounded-lg transition-colors font-bold"
                                    >
                                        ✏️ Bewerken
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {concepts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <p>Nog geen concepten geëxtraheerd.</p>
                    <p className="text-sm">Upload een document om te beginnen.</p>
                </div>
            )}
        </div>
    )
}
