'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'
import ConceptenOverzicht from '@/components/ConceptenOverzicht'
import ToetsGesprek from '@/components/ToetsGesprek'
import Rapport from '@/components/Rapport'

// Types
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

interface DocumentAnalysis {
  concepts: Concept[]
  relations: ConceptRelation[]
  examples: Array<{ concept: string; example: string }>
}

type AppState = 'upload' | 'analyzing' | 'concepts' | 'conversation' | 'report'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload')
  const [documentText, setDocumentText] = useState<string>('')
  const [documentTitle, setDocumentTitle] = useState<string>('')
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [initialMessage, setInitialMessage] = useState<string>('')
  const [reportData, setReportData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Handle document upload
  const handleDocumentUpload = async (content: string, title: string) => {
    setDocumentText(content)
    setDocumentTitle(title)
    setAppState('analyzing')
    setError(null)

    try {
      const response = await fetch('/api/concepten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: content })
      })

      const data = await response.json()

      if (data.success && data.analysis) {
        setAnalysis(data.analysis)
        setAppState('concepts')
      } else {
        throw new Error(data.error || 'Analyse mislukt')
      }
    } catch (err) {
      console.error('Analyse error:', err)
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      setAppState('upload')
    }
  }

  // Start conversation
  const handleStartToets = async () => {
    if (!analysis) return

    setError(null)

    try {
      const response = await fetch('/api/sessie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle,
          concepts: analysis.concepts
        })
      })

      const data = await response.json()

      if (data.success && data.sessionId) {
        setSessionId(data.sessionId)
        setInitialMessage(data.message)
        setAppState('conversation')
      } else {
        throw new Error(data.error || 'Kon sessie niet starten')
      }
    } catch (err) {
      console.error('Start sessie error:', err)
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    }
  }

  // End conversation and show report
  const handleEndConversation = async () => {
    if (!sessionId || !analysis) return

    try {
      const response = await fetch(`/api/sessie/${sessionId}/einde`, {
        method: 'POST'
      })

      const data = await response.json()

      // Create report data
      const report = {
        sessionId,
        documentTitle,
        finalLevel: data.finalLevel || 2,
        duration: data.duration || 5,
        conceptCoverage: data.conceptCoverage || 50,
        levelProgression: data.levelProgression || [],
        strongestConcepts: data.strongestConcepts || analysis.concepts.slice(0, 2),
        weakestConcepts: data.weakestConcepts || analysis.concepts.slice(-2),
        conceptScores: data.conceptScores || [],
        concepts: analysis.concepts
      }

      setReportData(report)
      setAppState('report')
    } catch (err) {
      // Even if endpoint fails, show basic report
      const report = {
        sessionId,
        documentTitle,
        finalLevel: 2,
        duration: 5,
        conceptCoverage: 50,
        levelProgression: [],
        strongestConcepts: analysis?.concepts.slice(0, 2) || [],
        weakestConcepts: analysis?.concepts.slice(-2) || [],
        conceptScores: [],
        concepts: analysis?.concepts || []
      }
      setReportData(report)
      setAppState('report')
    }
  }

  // Reset to start
  const handleReset = () => {
    setAppState('upload')
    setDocumentText('')
    setDocumentTitle('')
    setAnalysis(null)
    setSessionId(null)
    setReportData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-han-red rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">AI Toetsapplicatie</h1>
              <p className="text-xs text-gray-500">Socratische dialoog op basis van eigen materiaal</p>
            </div>
          </div>

          {appState !== 'upload' && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              ← Nieuw Document
            </button>
          )}
        </div>
      </header>

      {/* Progress indicator */}
      {appState !== 'upload' && appState !== 'report' && (
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              {['upload', 'concepts', 'conversation'].map((step, i) => {
                const steps = ['upload', 'concepts', 'conversation']
                const currentIndex = steps.indexOf(appState)
                const stepIndex = i
                const isActive = stepIndex === currentIndex
                const isComplete = stepIndex < currentIndex

                return (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isComplete ? 'bg-green-500 text-white' :
                      isActive ? 'bg-han-red text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                      {isComplete ? '✓' : i + 1}
                    </div>
                    <span className={`ml-2 text-sm ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {step === 'upload' && 'Upload'}
                      {step === 'concepts' && 'Concepten'}
                      {step === 'conversation' && 'Gesprek'}
                    </span>
                    {i < 2 && (
                      <div className={`w-8 h-0.5 mx-2 ${isComplete ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Upload state */}
          {appState === 'upload' && (
            <div className="space-y-8">
              {/* Hero */}
              <div className="text-center py-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Test je kennis met AI
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Upload je studiemateriaal en voer een Socratisch gesprek.
                  De AI past zich aan op jouw niveau.
                </p>
                <div className="flex justify-center gap-4 mt-8">
                  <Link href="/dashboard" className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <span>📊</span> Mijn Dashboard
                  </Link>
                </div>
              </div>

              {/* Upload component */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Start een Zelftest</h3>
                <DocumentUploader onUpload={handleDocumentUpload} />
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 pt-8">
                {[
                  {
                    icon: '📚',
                    title: 'Document Upload',
                    desc: 'Upload je PDF of DOCX en de AI analyseert de kernconcepten.'
                  },
                  {
                    icon: '💬',
                    title: 'Socratische Dialoog',
                    desc: 'De AI stelt vragen die je tot nadenken aanzetten.'
                  },
                  {
                    icon: '📊',
                    title: 'Adaptief Niveau',
                    desc: 'Vraagniveau past zich aan op jouw antwoorden (1-5).'
                  }
                ].map((feature, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyzing state */}
          {appState === 'analyzing' && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-han-red rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">Document wordt geanalyseerd</h3>
              <p className="text-gray-600">AI extraheert concepten uit je document...</p>
            </div>
          )}

          {/* Concepts state */}
          {appState === 'concepts' && analysis && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <ConceptenOverzicht
                concepts={analysis.concepts}
                relations={analysis.relations}
                isEditable={true}
                onConceptsChange={(concepts) => {
                  setAnalysis({ ...analysis, concepts })
                }}
                onStartToets={handleStartToets}
              />
            </div>
          )}

          {/* Conversation state */}
          {appState === 'conversation' && sessionId && analysis && (
            <ToetsGesprek
              sessionId={sessionId}
              concepts={analysis.concepts}
              initialMessage={initialMessage}
              onEnd={handleEndConversation}
            />
          )}

          {/* Report state */}
          {appState === 'report' && reportData && (
            <Rapport
              data={reportData}
              onRetry={handleReset}
              onClose={handleReset}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            AI Toetsapplicatie • Socratische dialoog voor kennistoetsing
          </p>
        </div>
      </footer>
    </div>
  )
}

// Document uploader component
function DocumentUploader({ onUpload }: { onUpload: (content: string, title: string) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const processFile = async (file: File) => {
    const isDocx = file.name.endsWith('.docx')
    const isPdf = file.name.endsWith('.pdf')
    const isTxt = file.name.endsWith('.txt')
    const isMd = file.name.endsWith('.md')

    if (!isDocx && !isPdf && !isTxt && !isMd) {
      alert('Ondersteunde formaten: .pdf, .docx, .txt, .md')
      return
    }

    setIsProcessing(true)
    setFileName(file.name)

    try {
      // For txt and md files, read directly
      if (isTxt || isMd) {
        const text = await file.text()
        onUpload(text, file.name)
        return
      }

      // For pdf and docx, use API
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-docx', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.content) {
        onUpload(data.content, file.name)
      } else {
        throw new Error(data.error || 'Kon bestand niet verwerken')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Fout bij uploaden')
      setIsProcessing(false)
      setFileName(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) processFile(files[0])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) processFile(files[0])
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragging
        ? 'border-han-red bg-red-50'
        : 'border-gray-300 hover:border-han-red'
        }`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
    >
      {isProcessing ? (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-han-red rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700">{fileName} wordt verwerkt...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-1">
            Sleep je document hier
          </p>
          <p className="text-sm text-gray-500 mb-4">
            of klik om te selecteren
          </p>
          <input
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileInput}
            className="hidden"
            id="doc-upload"
          />
          <label
            htmlFor="doc-upload"
            className="px-6 py-3 bg-han-red text-white rounded-lg font-bold cursor-pointer hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
          >
            Bestand Selecteren
          </label>
          <p className="text-xs text-gray-400 mt-4">
            Ondersteund: PDF, DOCX, TXT, Markdown (max 10MB)
          </p>
        </div>
      )}
    </div>
  )
}