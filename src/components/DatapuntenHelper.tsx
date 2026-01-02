'use client'

import { useState, useRef, useEffect } from 'react'
import { datapunten, Datapunt } from '../data/datapunten'
import MarkdownRenderer from './MarkdownRenderer'

// Reusing the UploadedFile interface and logic from TestChatBot
// Ideally, we should extract this to a shared hook or context, but for now we'll duplicate to keep it self-contained as requested.
interface UploadedFile {
    id: string
    name: string
    type: 'image' | 'document' | 'data' | 'audio'
    preview: string | null
    content: string
    size: number
    uploadedAt: Date
    selected: boolean
}

export default function DatapuntenHelper() {
    const [selectedDatapuntId, setSelectedDatapuntId] = useState<string>(datapunten[0].id)
    const [activeTab, setActiveTab] = useState<'info' | 'feedback'>('info')

    // AI State
    const [message, setMessage] = useState('')
    const [response, setResponse] = useState('')
    const [streamingResponse, setStreamingResponse] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isStreaming, setIsStreaming] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [isDragOver, setIsDragOver] = useState(false)

    const abortControllerRef = useRef<AbortController | null>(null)
    const currentStreamingResponseRef = useRef<string>('')
    const hasReceivedFirstTokenRef = useRef<boolean>(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const selectedDatapunt = datapunten.find(d => d.id === selectedDatapuntId) || datapunten[0]

    // File handling logic (simplified version of TestChatBot)
    const generateFileId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const handleFileUpload = async (files: FileList | null) => {
        if (!files) return

        Array.from(files).forEach(async (file) => {
            // Basic text/image handling for now
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    const result = e.target?.result as string
                    setUploadedFiles(prev => [...prev, {
                        id: generateFileId(),
                        name: file.name,
                        type: 'image',
                        preview: result,
                        content: result,
                        size: file.size,
                        uploadedAt: new Date(),
                        selected: true
                    }])
                }
                reader.readAsDataURL(file)
            } else if (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    const content = e.target?.result as string
                    setUploadedFiles(prev => [...prev, {
                        id: generateFileId(),
                        name: file.name,
                        type: 'document',
                        preview: null,
                        content: content,
                        size: file.size,
                        uploadedAt: new Date(),
                        selected: true
                    }])
                }
                reader.readAsText(file)
            } else {
                // Fallback for other files (like PDF/DOCX) - using the same API endpoint as TestChatBot
                const formData = new FormData()
                formData.append('file', file)

                try {
                    const response = await fetch('/api/upload-docx', {
                        method: 'POST',
                        body: formData,
                    })

                    if (response.ok) {
                        const data = await response.json()
                        setUploadedFiles(prev => [...prev, {
                            id: generateFileId(),
                            name: file.name,
                            type: 'document',
                            preview: null,
                            content: data.content,
                            size: file.size,
                            uploadedAt: new Date(),
                            selected: true
                        }])
                    } else {
                        alert(`Kon bestand ${file.name} niet uploaden.`)
                    }
                } catch (error) {
                    console.error('Upload error:', error)
                    alert(`Fout bij uploaden ${file.name}`)
                }
            }
        })
    }

    const removeFile = (id: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== id))
    }

    const sendMessageStreaming = async () => {
        if (!message.trim() && uploadedFiles.length === 0) return

        setIsStreaming(true)
        setIsLoading(true)
        setResponse('')
        setStreamingResponse('')
        currentStreamingResponseRef.current = ''
        hasReceivedFirstTokenRef.current = false
        abortControllerRef.current = new AbortController()

        // Construct system prompt context based on selected datapunt
        const contextPrompt = `
Je bent een behulpzame assistent voor CMD studenten van de HAN.
De student werkt aan: ${selectedDatapunt.title}
Beschrijving: ${selectedDatapunt.description}

Beoordelingscriteria (Rubric):
${selectedDatapunt.criteria.map(c => `
- ${c.title}:
  - In Ontwikkeling: ${c.levels.development}
  - Op Niveau: ${c.levels.level}
  - Boven Niveau: ${c.levels.above}
`).join('\n')}

Jouw doel is om de student feedback te geven op hun werk en te helpen om minimaal "Op Niveau" te komen.
Kijk specifiek naar de mate van grondigheid, de kwaliteit van het werk en of er bewust ontworpen is.
Wees constructief, bemoedigend maar wel kritisch op de inhoud.
`

        try {
            const payload = {
                message: `${contextPrompt}\n\nStudent vraag/werk:\n${message}`,
                useGrounding: true,
                aiModel: 'smart',
                images: uploadedFiles.filter(f => f.type === 'image').map(f => f.content)
            }

            // Add file content to message
            const fileContexts = uploadedFiles.filter(f => f.type !== 'image').map(f => `[Bestand: ${f.name}]\n${f.content}`).join('\n\n')
            if (fileContexts) {
                payload.message += `\n\nBijgevoegde bestanden:\n${fileContexts}`
            }

            const response = await fetch('/api/chat-stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: abortControllerRef.current.signal
            })

            if (!response.ok) throw new Error(response.statusText)

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            if (!reader) throw new Error('No reader')

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))
                            if (data.token) {
                                if (!hasReceivedFirstTokenRef.current) {
                                    hasReceivedFirstTokenRef.current = true
                                    setIsLoading(false)
                                }
                                currentStreamingResponseRef.current += data.token
                                setStreamingResponse(currentStreamingResponseRef.current)
                            }
                            if (data.done) {
                                setResponse(currentStreamingResponseRef.current)
                                setIsStreaming(false)
                            }
                        } catch (e) {
                            // ignore parse errors
                        }
                    }
                }
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                setResponse('Er is een fout opgetreden bij het genereren van het antwoord.')
            }
        } finally {
            setIsLoading(false)
            setIsStreaming(false)
            abortControllerRef.current = null
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-han-gray p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-han-black mb-4">Datapunten Helper</h2>
                <div className="flex flex-wrap gap-2">
                    {datapunten.map(dp => (
                        <button
                            key={dp.id}
                            onClick={() => {
                                setSelectedDatapuntId(dp.id)
                                setResponse('')
                                setStreamingResponse('')
                                setMessage('')
                                setUploadedFiles([])
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${selectedDatapuntId === dp.id
                                    ? 'bg-han-red text-white'
                                    : 'bg-white text-han-black border border-gray-300 hover:border-han-red'
                                }`}
                        >
                            {dp.id}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-han-black mb-2">{selectedDatapunt.title}</h3>
                    <p className="text-gray-700 mb-4">{selectedDatapunt.description}</p>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <h4 className="font-bold text-blue-800 mb-2">Te leveren producten:</h4>
                        <ul className="list-disc list-inside text-blue-900">
                            {selectedDatapunt.deliverables.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'info'
                                ? 'border-han-red text-han-red'
                                : 'border-transparent text-gray-500 hover:text-han-black'
                            }`}
                    >
                        Beoordelingscriteria
                    </button>
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'feedback'
                                ? 'border-han-red text-han-red'
                                : 'border-transparent text-gray-500 hover:text-han-black'
                            }`}
                    >
                        AI Feedback Assistent
                    </button>
                </div>

                {activeTab === 'info' ? (
                    <div className="space-y-8">
                        {selectedDatapunt.criteria.map(criterion => (
                            <div key={criterion.id} className="border border-gray-200 rounded-lg p-6">
                                <h4 className="text-lg font-bold text-han-black mb-2">
                                    <span className="text-han-red mr-2">{criterion.id}</span>
                                    {criterion.title}
                                </h4>
                                <p className="text-gray-600 mb-4 italic">{criterion.description}</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-orange-50 p-4 rounded border border-orange-100">
                                        <div className="font-bold text-orange-800 mb-2 text-sm uppercase tracking-wide">In Ontwikkeling</div>
                                        <p className="text-sm text-gray-700">{criterion.levels.development}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded border border-green-100">
                                        <div className="font-bold text-green-800 mb-2 text-sm uppercase tracking-wide">Op Niveau</div>
                                        <p className="text-sm text-gray-700">{criterion.levels.level}</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded border border-purple-100">
                                        <div className="font-bold text-purple-800 mb-2 text-sm uppercase tracking-wide">Boven Niveau</div>
                                        <p className="text-sm text-gray-700">{criterion.levels.above}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-4">
                                Upload je werk (tekst, afbeeldingen, PDF) of typ je vragen hieronder. De AI assistent geeft feedback gebaseerd op de rubric van <strong>{selectedDatapunt.id}</strong>.
                            </p>

                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Typ hier je vraag of plak je tekst..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-han-red focus:border-transparent min-h-[150px] mb-4"
                            />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                                    >
                                        📎 Bestand toevoegen
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => handleFileUpload(e.target.files)}
                                        className="hidden"
                                        multiple
                                    />
                                    <span className="text-xs text-gray-500">
                                        {uploadedFiles.length} bestand(en)
                                    </span>
                                </div>

                                <button
                                    onClick={sendMessageStreaming}
                                    disabled={isLoading || (!message.trim() && uploadedFiles.length === 0)}
                                    className={`px-6 py-2 rounded-lg font-bold text-white transition-colors ${isLoading || (!message.trim() && uploadedFiles.length === 0)
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-han-red hover:bg-red-700'
                                        }`}
                                >
                                    {isLoading ? 'Analyseren...' : 'Vraag Feedback'}
                                </button>
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {uploadedFiles.map(file => (
                                        <div key={file.id} className="flex items-center bg-white border border-gray-200 px-3 py-1 rounded-full text-sm">
                                            <span className="mr-2">{file.type === 'image' ? '🖼️' : '📄'}</span>
                                            <span className="truncate max-w-[150px]">{file.name}</span>
                                            <button onClick={() => removeFile(file.id)} className="ml-2 text-gray-400 hover:text-red-500">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {(streamingResponse || response) && (
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <h4 className="font-bold text-han-black mb-4 flex items-center">
                                    <span className="text-xl mr-2">🤖</span> AI Feedback
                                </h4>
                                <div className="prose prose-sm max-w-none">
                                    <MarkdownRenderer content={streamingResponse || response} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
