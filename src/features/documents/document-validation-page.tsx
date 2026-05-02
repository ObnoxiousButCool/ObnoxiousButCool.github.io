import { useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  Plus,
  TriangleAlert,
  Upload,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ApiError, addRejectionPattern, fetchRejectionPatterns, validateDocument } from "@/lib/api"
import type { DocumentValidationCheck, DocumentValidationResult, RejectionPattern } from "@/lib/types"

const ACCEPTED_DOCUMENTS = ".pdf,.png,.jpg,.jpeg,.tif,.tiff"

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function ocrEngineLabel(engine: string) {
  if (engine === "paddle") return "PaddleOCR"
  if (engine === "pypdf") return "PDF text layer"
  return "pytesseract"
}

function statusStyles(status: DocumentValidationCheck["status"]) {
  if (status === "pass") {
    return {
      icon: CheckCircle2,
      card: "bg-[#ECFDF5]",
      iconWrap: "bg-white text-[#047857]",
      text: "text-[#047857]",
      badge: "bg-[#D1FAE5] text-[#047857]",
    }
  }
  if (status === "fail") {
    return {
      icon: XCircle,
      card: "bg-[#FEF2F2]",
      iconWrap: "bg-white text-[#B91C1C]",
      text: "text-[#991B1B]",
      badge: "bg-[#FEE2E2] text-[#B91C1C]",
    }
  }
  return {
    icon: TriangleAlert,
    card: "bg-[#FFFBEB]",
    iconWrap: "bg-white text-[#B45309]",
    text: "text-[#92400E]",
    badge: "bg-[#FEF3C7] text-[#92400E]",
  }
}

function ChecklistCard({ check }: { check: DocumentValidationCheck }) {
  const styles = statusStyles(check.status)
  const Icon = styles.icon

  return (
    <Card className={`rounded-2xl border-0 p-1 shadow-none ${styles.card}`}>
      <CardContent className="flex gap-3 p-4">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.iconWrap}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#111827]">{check.item}</p>
            <Badge className={`rounded-full px-2 py-0.5 text-[11px] uppercase ${styles.badge}`}>
              {check.status}
            </Badge>
          </div>
          <p className={`mt-2 text-sm leading-6 ${styles.text} ${check.status === "fail" ? "font-semibold" : ""}`}>
            {check.note || "No additional note."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function DocumentValidationPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [insurerName, setInsurerName] = useState("")
  const [result, setResult] = useState<DocumentValidationResult | null>(null)
  const [patterns, setPatterns] = useState<RejectionPattern[]>([])
  const [newPattern, setNewPattern] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState<"extracting" | "checking">("extracting")
  const [savingPattern, setSavingPattern] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(file: File | null | undefined) {
    setSelectedFile(file || null)
    setResult(null)
    setError(null)
  }

  async function loadPatterns(name: string) {
    if (!name.trim()) {
      setPatterns([])
      return
    }
    try {
      setPatterns(await fetchRejectionPatterns(name.trim()))
    } catch {
      setPatterns([])
    }
  }

  async function handleValidate() {
    if (!selectedFile) {
      setError("Select a claim document to validate.")
      return
    }

    setLoading(true)
    setLoadingStage("extracting")
    setError(null)
    setResult(null)

    const stageTimer = window.setTimeout(() => setLoadingStage("checking"), 1200)
    try {
      const validation = await validateDocument(selectedFile, insurerName)
      setResult(validation)
      await loadPatterns(insurerName)
      if (validation.error) {
        setError(validation.error)
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to validate document"
      setError(message)
    } finally {
      window.clearTimeout(stageTimer)
      setLoading(false)
    }
  }

  async function handleAddPattern() {
    if (!insurerName.trim() || !newPattern.trim()) {
      return
    }

    setSavingPattern(true)
    setError(null)
    try {
      setPatterns(await addRejectionPattern(insurerName.trim(), newPattern.trim()))
      setNewPattern("")
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to save rejection pattern"
      setError(message)
    } finally {
      setSavingPattern(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[32px] bg-white p-6 card-shadow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7C3AED]">Pre-submission review</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">Document validation</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Upload a claim document and run an AI checklist before sending it to the insurer.
            </p>
          </div>

          <div className="rounded-3xl bg-[#EEF2FF] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#6366F1]">Accepted files</p>
            <p className="mt-2 text-sm font-semibold text-[#111827]">PDF, PNG, JPG, TIFF</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_320px_auto] xl:items-end">
          <label
            className="rounded-2xl border border-dashed border-[#C4B5FD] bg-[#F8FAFC] p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              handleFile(event.dataTransfer.files[0])
            }}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#EEF2FF] p-3 text-[#4F46E5]">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111827]">
                  {selectedFile ? selectedFile.name : "Choose or drop a claim document"}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {selectedFile ? formatFileSize(selectedFile.size) : "The checklist runs before submission."}
                </p>
              </div>
            </div>
            <input
              className="mt-3 block w-full text-sm text-[#6B7280]"
              type="file"
              accept={ACCEPTED_DOCUMENTS}
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </label>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
              Insurer name
            </label>
            <Input
              className="mt-2 h-11 rounded-full border-[#E5E7EB] bg-white px-4"
              placeholder="Optional"
              value={insurerName}
              onChange={(event) => setInsurerName(event.target.value)}
              onBlur={() => void loadPatterns(insurerName)}
            />
          </div>

          <Button
            className="h-11 rounded-full bg-[#111827] px-5 text-white hover:bg-[#1F2937]"
            disabled={!selectedFile || loading}
            onClick={() => void handleValidate()}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Validate document
          </Button>
        </div>

        {loading ? (
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#EEF2FF] p-4 text-sm text-[#4338CA]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{loadingStage === "extracting" ? "Extracting text from document..." : "Running AI validation checks..."}</span>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {result ? (
        <div className="space-y-5">
          <div
            className={`flex flex-col gap-2 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between ${
              result.verdict === "ready" ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#FEF2F2] text-[#B91C1C]"
            }`}
          >
            <div className="flex items-center gap-3">
              {result.verdict === "ready" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <p className="text-sm font-semibold">
                {result.verdict === "ready"
                  ? "Ready to submit"
                  : `Issues found - review before submitting. Estimated delay if submitted as-is: ${result.estimatedDelayDays} days`}
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {result.checks.map((check) => (
              <ChecklistCard key={check.item} check={check} />
            ))}
          </div>

          <div className="rounded-[28px] bg-white p-5 card-shadow">
            <p className="text-sm leading-6 text-[#111827]">{result.summary}</p>
            <p className="mt-3 text-xs text-[#9CA3AF]">Text extracted using: {ocrEngineLabel(result.ocrEngine)}</p>
          </div>

          {insurerName.trim() ? (
            <details className="rounded-[28px] bg-white p-5 card-shadow">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[#111827]">
                Known rejection patterns for {insurerName.trim()}
                <ChevronDown className="h-4 w-4 text-[#6B7280]" />
              </summary>

              <div className="mt-4 space-y-3">
                {patterns.length ? (
                  patterns.map((pattern) => (
                    <div key={pattern.id} className="rounded-2xl bg-[#F8FAFC] p-3">
                      <p className="text-sm text-[#111827]">{pattern.pattern}</p>
                      <p className="mt-1 text-xs text-[#9CA3AF]">Seen {pattern.occurrenceCount} time(s)</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl bg-[#F8FAFC] p-3 text-sm text-[#6B7280]">
                    No stored patterns for this insurer yet.
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    className="h-11 rounded-full border-[#E5E7EB] bg-white px-4"
                    placeholder="Add a known rejection pattern"
                    value={newPattern}
                    onChange={(event) => setNewPattern(event.target.value)}
                  />
                  <Button
                    className="h-11 rounded-full bg-[#7C3AED] px-5 text-white hover:bg-[#6D28D9]"
                    disabled={!newPattern.trim() || savingPattern}
                    onClick={() => void handleAddPattern()}
                  >
                    {savingPattern ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Add pattern
                  </Button>
                </div>
              </div>
            </details>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
