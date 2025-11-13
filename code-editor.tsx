"use client"

import { useEffect, useRef } from "react"
import { EditorState } from "@codemirror/state"
import { EditorView, basicSetup } from "codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { json } from "@codemirror/lang-json"
import { oneDark } from "@codemirror/theme-one-dark"

interface CodeEditorProps {
  code: string
  language: string
  onChange: (code: string) => void
}

export default function CodeEditor({ code, language, onChange }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  const getLanguageExtension = (lang: string) => {
    switch (lang) {
      case "python":
        return python()
      case "html":
        return html()
      case "css":
        return css()
      case "json":
        return json()
      case "javascript":
      default:
        return javascript()
    }
  }

  useEffect(() => {
    if (!editorRef.current) return

    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        getLanguageExtension(language),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [language, onChange])

  return (
    <div ref={editorRef} className="w-full h-full min-h-96 border border-border rounded-lg overflow-hidden bg-card" />
  )
}
