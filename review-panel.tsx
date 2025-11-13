"use client"

import type { ReviewResult, CodeReview } from "@/lib/types"
import { exportPDF, exportJSON } from "@/lib/export"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, AlertTriangle, Download, Trash2, History } from "lucide-react"
import { useState } from "react"

interface ReviewPanelProps {
  results: ReviewResult | null
  loading: boolean
  onLoadReview: (id: string) => void
  onDeleteReview: (id: string) => void
  reviews: CodeReview[]
}

export default function ReviewPanel({ results, loading, onLoadReview, onDeleteReview, reviews }: ReviewPanelProps) {
  const [showHistory, setShowHistory] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "text-destructive"
      case "warning":
        return "text-yellow-500"
      case "info":
        return "text-blue-500"
      default:
        return "text-foreground"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "info":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Analyzing code...</p>
        </div>
      </Card>
    )
  }

  if (!results) {
    return (
      <Card className="p-6 min-h-96 bg-card/50 flex flex-col gap-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No analysis yet. Click "Analyze" to review your code.</p>
        </div>

        {reviews.length > 0 && (
          <div className="border-t border-border pt-4">
            <Button
              variant="outline"
              className="w-full mb-2 bg-transparent"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4 mr-2" />
              Recent Reviews ({reviews.length})
            </Button>

            {showHistory && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {reviews
                  .slice()
                  .reverse()
                  .map((review) => (
                    <div
                      key={review.id}
                      className="p-2 bg-muted rounded border border-border flex justify-between items-center"
                    >
                      <div className="text-xs">
                        <p className="font-mono text-xs truncate">{review.language}</p>
                        <p className="text-muted-foreground">{new Date(review.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => onLoadReview(review.id)}>
                          Load
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDeleteReview(review.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card className="p-6 min-h-96 flex flex-col gap-4 overflow-y-auto bg-card">
      <div className="flex justify-between items-start gap-2 pb-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">Analysis Results</h3>
          <p className="text-sm text-muted-foreground">
            {results.issues.length} issue{results.issues.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportJSON(results)} className="gap-1">
            <Download className="w-3 h-3" />
            JSON
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportPDF(results)} className="gap-1">
            <Download className="w-3 h-3" />
            PDF
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">Errors</p>
          <p className="text-lg font-bold text-destructive">
            {results.issues.filter((i) => i.severity === "error").length}
          </p>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">Warnings</p>
          <p className="text-lg font-bold text-yellow-500">
            {results.issues.filter((i) => i.severity === "warning").length}
          </p>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">Score</p>
          <p className="text-lg font-bold text-accent">{results.score}%</p>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-2">
        {results.issues.length === 0 ? (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400 font-medium">✓ Code looks great! No issues found.</p>
          </div>
        ) : (
          results.issues.map((issue, idx) => (
            <div key={idx} className="p-3 bg-muted rounded-lg border border-border hover:border-accent/50 transition">
              <div className="flex gap-2 mb-1">
                <div className={`flex-shrink-0 ${getSeverityColor(issue.severity)}`}>
                  {getSeverityIcon(issue.severity)}
                </div>
                <div className="flex-1">
                  <p className="font-mono text-xs text-muted-foreground">Line {issue.line}</p>
                  <p className="text-sm font-medium text-foreground">{issue.message}</p>
                </div>
              </div>
              {issue.suggestion && (
                <p className="text-xs text-accent ml-6 p-2 bg-card rounded mt-2">💡 {issue.suggestion}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Summary</p>
        <p className="text-sm text-foreground">{results.summary}</p>
      </div>
    </Card>
  )
}
