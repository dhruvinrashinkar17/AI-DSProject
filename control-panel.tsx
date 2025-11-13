"use client"

import { Button } from "@/components/ui/button"
import { Zap, Download } from "lucide-react"

interface ControlPanelProps {
  language: string
  onLanguageChange: (lang: string) => void
  onAnalyze: () => void
  onSave: () => void
  loading: boolean
  hasResults: boolean
  savedReviews: number
}

export default function ControlPanel({
  language,
  onLanguageChange,
  onAnalyze,
  onSave,
  loading,
  hasResults,
  savedReviews,
}: ControlPanelProps) {
  const languages = ["javascript", "python", "html", "css", "json"]

  return (
    <div className="flex gap-2 flex-wrap items-center p-4 bg-card rounded-lg border border-border">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Language:</label>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="ml-2 px-3 py-1 bg-input border border-border rounded text-sm text-foreground outline-none focus:ring-1 focus:ring-accent"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 ml-auto">
        <Button onClick={onAnalyze} disabled={loading} className="gap-2 bg-accent hover:bg-accent/90">
          <Zap className="w-4 h-4" />
          {loading ? "Analyzing..." : "Analyze"}
        </Button>

        <Button onClick={onSave} disabled={!hasResults} variant="outline" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Save Review
        </Button>

        {savedReviews > 0 && (
          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">{savedReviews} saved</span>
        )}
      </div>
    </div>
  )
}
