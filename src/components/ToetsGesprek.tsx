'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    questionLevel?: number
}

interface Concept {
    id: string
    name: string
    definition: string
    complexity: number
}

interface ToetsGesprekProps {
    sessionId: string
    concepts: Concept[]
    initialMessage?: string
    onEnd: () => void
}

export default function ToetsGesprek({ sessionId, concepts, initialMessage, onEnd }: ToetsGesprekProps) {
    const [messages, setMessages] = useState<Message[]>(() => {
        if (initialMessage) {
            return [{
                id: `init_${Date.now()}`,
                role: 'assistant',
                content: initialMessage,
                questionLevel: 2
            }]
        }
        return []
    })
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [currentLevel, setCurrentLevel] = useState(2)
    const [showEndConfirm, setShowEndConfirm] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Scroll naar beneden bij nieuwe berichten
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Focus op input
    useEffect(() => {
        inputRef.current?.focus()
    }, [isLoading])

    // Verstuur bericht
    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return

        const userMessage: Message = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: content.trim()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response = await fetch(`/api/sessie/${sessionId}/bericht`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: content.trim() })
            })

            const data = await response.json()

            if (data.success) {
                const assistantMessage: Message = {
                    id: `assistant_${Date.now()}`,
                    role: 'assistant',
                    content: data.message,
                    questionLevel: data.metadata?.questionLevel
                }
                setMessages(prev => [...prev, assistantMessage])
                setCurrentLevel(data.currentLevel || currentLevel)
            } else {
                throw new Error(data.error || 'Fout bij versturen bericht')
            }
        } catch (error) {
            console.error('Fout:', error)
            const errorMessage: Message = {
                id: `error_${Date.now()}`,
                role: 'assistant',
                content: 'Er is een fout opgetreden. Probeer het opnieuw.'
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        sendMessage(input)
    }

    // Handle "Ik weet het niet" button
    const handleDontKnow = () => {
        sendMessage('Ik weet het antwoord op deze vraag niet. Kun je me helpen of een hint geven?')
    }

    // Handle "Vraag anders" button
    const handleRephraseRequest = () => {
        sendMessage('Kun je deze vraag op een andere manier stellen? Ik begrijp niet helemaal wat je bedoelt.')
    }

    // Niveau indicator kleur
    const getLevelColor = (level: number) => {
        const colors = [
            'bg-blue-500',    // 1
            'bg-green-500',   // 2
            'bg-yellow-500',  // 3
            'bg-orange-500',  // 4
            'bg-red-500'      // 5
        ]
        return colors[level - 1] || colors[1]
    }

    return (
        <div className="flex flex-col h-full max-h-[80vh] bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-han-red text-white">
                <div>
                    <h2 className="text-lg font-bold font-heading">Toetsgesprek</h2>
                    <p className="text-sm text-white/80">{concepts.length} concepten</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Niveau:</span>
                        <div className={`w-8 h-8 rounded-full ${getLevelColor(currentLevel)} flex items-center justify-center font-bold`}>
                            {currentLevel}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowEndConfirm(true)}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
                    >
                        Beëindigen
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-han-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <p className="font-medium">Het gesprek wordt geladen...</p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-xl px-5 py-3 ${message.role === 'user'
                                ? 'bg-han-red text-white'
                                : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            {message.questionLevel && message.role === 'assistant' && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                    <span>Niveau {message.questionLevel}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3">
                            <div className="flex items-center gap-2">
                                <div className="animate-pulse flex gap-1">
                                    <div className="w-2 h-2 bg-han-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-han-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-han-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="text-gray-500 text-sm font-medium">Aan het denken...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Helper buttons */}
            <div className="px-6 py-2 bg-gray-50 border-t border-gray-200 flex gap-2">
                <button
                    onClick={handleDontKnow}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                    🤷 Ik weet het niet
                </button>
                <button
                    onClick={handleRephraseRequest}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                    🔄 Vraag anders
                </button>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-3">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmit(e)
                            }
                        }}
                        placeholder="Typ je antwoord..."
                        disabled={isLoading}
                        rows={2}
                        className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-han-red focus:ring-2 focus:ring-red-100 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-6 py-3 bg-han-red hover:bg-red-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>

            {/* End confirmation modal */}
            {showEndConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Gesprek beëindigen?</h3>
                        <p className="text-gray-600 mb-6">
                            Weet je zeker dat je het gesprek wilt beëindigen? Je krijgt daarna je rapport te zien.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowEndConfirm(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={onEnd}
                                className="px-4 py-2 bg-han-red hover:bg-red-700 text-white rounded-lg transition-colors font-bold"
                            >
                                Beëindigen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
