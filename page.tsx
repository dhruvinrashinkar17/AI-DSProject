"use client"

import { useState, useRef, useEffect } from "react"
import CodeEditor from "@/components/code-editor"
import ReviewPanel from "@/components/review-panel"
import ControlPanel from "@/components/control-panel"
import type { ReviewResult, CodeReview } from "@/lib/types"
import { analyzeCode } from "@/lib/analyzer"
import { saveReview, loadReview, listReviews, deleteReview } from "@/lib/storage"

export default function Home() {
  const [code, setCode] = useState('// Paste your code here\nfunction example() {\n  console.log("Hello");\n}')
  const [language, setLanguage] = useState("javascript")
  const [results, setResults] = useState<ReviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [reviews, setReviews] = useState<CodeReview[]>([])
  const workerRef = useRef<Worker | null>(null)

  // Initialize Web Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL("@/lib/analyzer.worker", import.meta.url), {
      type: "module",
    })

    workerRef.current.onmessage = (e) => {
      setResults(e.data)
      setLoading(false)
    }

    workerRef.current.onerror = (error) => {
      console.error("Worker error:", error)
      setLoading(false)
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  // Load saved reviews on mount
  useEffect(() => {
    loadSavedReviews()
  }, [])

  const handleAnalyze = async () => {
    if (!code.trim()) return

    setLoading(true)

    // Use Web Worker for heavy analysis
    if (workerRef.current) {
      workerRef.current.postMessage({ code, language })
    } else {
      // Fallback to main thread
      const result = await analyzeCode(code, language)
      setResults(result)
      setLoading(false)
    }
  }

  const handleSaveReview = async () => {
    if (!results) return

    const review: CodeReview = {
      id: Date.now().toString(),
      code,
      language,
      results,
      timestamp: new Date().toISOString(),
    }

    await saveReview(review)
    loadSavedReviews()
  }

  const handleLoadReview = async (id: string) => {
    const review = await loadReview(id)
    if (review) {
      setCode(review.code)
      setLanguage(review.language)
      setResults(review.results)
    }
  }

  const handleDeleteReview = async (id: string) => {
    await deleteReview(id)
    loadSavedReviews()
  }

  const loadSavedReviews = async () => {
    const saved = await listReviews()
    setReviews(saved)
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-accent">AI Code Review</h1>
          <p className="text-sm text-muted-foreground">Intelligent code analysis powered by ML</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 gap-4">
        {/* Control Panel */}
        <ControlPanel
          language={language}
          onLanguageChange={setLanguage}
          onAnalyze={handleAnalyze}
          onSave={handleSaveReview}
          loading={loading}
          hasResults={!!results}
          savedReviews={reviews.length}
        />

        {/* Editor and Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          {/* Code Editor */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Code Editor</label>
            <CodeEditor code={code} language={language} onChange={setCode} />
          </div>

          {/* Review Results */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Analysis Results</label>
            <ReviewPanel
              results={results}
              loading={loading}
              onLoadReview={handleLoadReview}
              onDeleteReview={handleDeleteReview}
              reviews={reviews}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
