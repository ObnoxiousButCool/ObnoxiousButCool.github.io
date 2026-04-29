import { useMemo, useState } from "react"
import { CheckCircle2, FileSpreadsheet, Loader2, Upload, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiError, confirmIngestion, previewIngestion } from "@/lib/api"
import type { IngestionConfirmResult, IngestionPreview } from "@/lib/types"

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-[#F8FAFC] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">{label}</p>
      <p className="mt-3 text-2xl font-bold text-[#111827]">{value}</p>
      <p className="mt-1 text-sm text-[#6B7280]">{detail}</p>
    </div>
  )
}

export function MapperPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<IngestionPreview | null>(null)
  const [result, setResult] = useState<IngestionConfirmResult | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previewColumns = useMemo(
    () => Object.keys(preview?.previewRows[0] || {}),
    [preview]
  )

  async function handlePreview() {
    if (!selectedFile) {
      setError("Select a CSV or Excel file to preview.")
      return
    }

    setLoadingPreview(true)
    setError(null)
    setResult(null)

    try {
      const nextPreview = await previewIngestion(selectedFile)
      setPreview(nextPreview)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to preview upload"
      setError(message)
      setPreview(null)
    } finally {
      setLoadingPreview(false)
    }
  }

  async function handleConfirm() {
    if (!preview) {
      return
    }

    setConfirming(true)
    setError(null)

    try {
      const confirmed = await confirmIngestion(preview.previewId)
      setResult(confirmed)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to confirm import"
      setError(message)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[32px] bg-white p-6 card-shadow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7C3AED]">Universal Ingestion</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">AI data mapper</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Upload any hospital CSV or Excel file, preview the mapped schema, review duplicates and missing fields,
              then confirm the import once the preview looks clean.
            </p>
          </div>

          <div className="rounded-3xl bg-[#EEF2FF] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#6366F1]">Accepted files</p>
            <p className="mt-2 text-sm font-semibold text-[#111827]">CSV, XLSX, XLS</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <label className="rounded-2xl border border-dashed border-[#C4B5FD] bg-[#F8FAFC] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#EEF2FF] p-3 text-[#4F46E5]">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  {selectedFile ? selectedFile.name : "Choose an upload file"}
                </p>
                <p className="text-xs text-[#6B7280]">Preview first. Nothing is imported until you confirm.</p>
              </div>
            </div>
            <input
              className="mt-3 block w-full text-sm text-[#6B7280]"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />
          </label>

          <Button
            className="h-11 rounded-full bg-[#111827] px-5 text-white hover:bg-[#1F2937]"
            disabled={!selectedFile || loadingPreview}
            onClick={() => void handlePreview()}
          >
            {loadingPreview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Preview mapping
          </Button>

          <Button
            className="h-11 rounded-full bg-[#7C3AED] px-5 text-white hover:bg-[#6D28D9]"
            disabled={!preview || preview.summary.validRows === 0 || confirming}
            onClick={() => void handleConfirm()}
          >
            {confirming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Confirm import
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      {result ? (
        <div className="flex items-center gap-3 rounded-2xl bg-[#ECFDF5] p-4 text-sm text-[#047857]">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            Imported {result.importedRows} row(s) from {result.filename}. {result.skippedRows} row(s) were skipped.
          </span>
        </div>
      ) : null}

      {preview ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <SummaryCard label="Rows" value={String(preview.summary.totalRows)} detail={preview.filename} />
            <SummaryCard label="Valid" value={String(preview.summary.validRows)} detail={`${preview.sourceMode} mapping`} />
            <SummaryCard label="Invalid" value={String(preview.summary.invalidRows)} detail="Blocking issues found" />
            <SummaryCard
              label="Duplicates"
              value={String(preview.summary.duplicateRows + preview.summary.existingDuplicates)}
              detail="Upload + existing system duplicates"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-[28px] border-0 bg-white p-1 card-shadow">
              <CardHeader className="px-5 pt-5">
                <CardTitle className="text-[18px] font-semibold text-[#111827]">Detected mapping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5">
                {Object.entries(preview.mapping).map(([source, target]) => (
                  <div key={source} className="flex items-center justify-between gap-3 rounded-2xl bg-[#F8FAFC] p-3">
                    <span className="text-sm font-medium text-[#111827]">{source}</span>
                    <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#4338CA]">
                      {target}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-0 bg-white p-1 card-shadow">
              <CardHeader className="px-5 pt-5">
                <CardTitle className="text-[18px] font-semibold text-[#111827]">Validation issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5">
                {preview.issues.length ? (
                  preview.issues.map((issue) => (
                    <div key={`${issue.rowNumber}-${issue.invoiceId || "row"}`} className="rounded-2xl bg-[#FEF2F2] p-4">
                      <p className="text-sm font-semibold text-[#991B1B]">
                        Row {issue.rowNumber} {issue.invoiceId ? `(${issue.invoiceId})` : ""}
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-[#B91C1C]">
                        {issue.issues.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#ECFDF5] p-4 text-sm text-[#047857]">
                    No blocking validation issues detected in the preview sample.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[28px] border-0 bg-white p-1 card-shadow">
            <CardHeader className="px-5 pt-5">
              <CardTitle className="text-[18px] font-semibold text-[#111827]">Preview rows</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB]">
                <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      {previewColumns.map((column) => (
                        <th key={column} className="px-4 py-3 text-left font-semibold text-[#6B7280]">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6] bg-white">
                    {preview.previewRows.map((row, rowIndex) => (
                      <tr key={`preview-row-${rowIndex}`}>
                        {previewColumns.map((column) => (
                          <td key={`${rowIndex}-${column}`} className="px-4 py-3 text-[#111827]">
                            {String(row[column] ?? "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </section>
  )
}
