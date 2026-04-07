import { useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table"
import { Send } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CustomerAccount } from "@/lib/types"
import { cn } from "@/lib/utils"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

const bucketStyles = {
  "30 days": "bg-[#DBEAFE] text-[#1E40AF]",
  "45 days": "bg-[#FEF3C7] text-[#92400E]",
  "60+ days": "bg-[#FEE2E2] text-[#991B1B]",
} as const

const riskStyles = {
  "High Risk": "bg-[#FEE2E2] text-[#991B1B]",
  Watch: "bg-[#FEF3C7] text-[#92400E]",
  Normal: "bg-[#DBEAFE] text-[#1E40AF]",
} as const

const modifierStyles = {
  Penalty: "bg-[#FEF3C7] text-[#92400E]",
  Incentive: "bg-[#D1FAE5] text-[#065F46]",
} as const

export function DefaulterQueueTable({
  rows,
  onCreateTask,
  onSelectionChange,
}: {
  rows: CustomerAccount[]
  onCreateTask: (customerId: string) => void
  onSelectionChange: (count: number) => void
}) {
  const navigate = useNavigate()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const columns = useMemo<ColumnDef<CustomerAccount>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="h-4 w-4 rounded border-[#D1D5DB] text-[#7C3AED] focus:ring-[#7C3AED]"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-[#D1D5DB] text-[#7C3AED] focus:ring-[#7C3AED]"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-[#111827]">{row.original.customerName}</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">{row.original.accountRef}</p>
          </div>
        ),
      },
      {
        accessorKey: "outstanding",
        header: "Outstanding",
        cell: ({ row }) => <span>{formatCurrency(row.original.outstanding)}</span>,
      },
      {
        accessorKey: "agingDays",
        header: "Aging",
        cell: ({ row }) => <span>{row.original.agingDays} days</span>,
      },
      {
        accessorKey: "bucket",
        header: "Bucket",
        cell: ({ row }) => (
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", bucketStyles[row.original.bucket])}>
            {row.original.bucket}
          </span>
        ),
      },
      {
        accessorKey: "riskLevel",
        header: "Risk Level",
        cell: ({ row }) => (
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", riskStyles[row.original.riskLevel])}>
            {row.original.riskLevel}
          </span>
        ),
      },
      {
        accessorKey: "modifierLabel",
        header: "Modifier",
        cell: ({ row }) => (
          <div>
            <span
              className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", modifierStyles[row.original.modifierType])}
            >
              {row.original.modifierLabel}
            </span>
            <p className="mt-1 text-xs text-[#9CA3AF]">{row.original.modifierValue}</p>
          </div>
        ),
      },
      {
        accessorKey: "lastAction",
        header: "Last Action",
        cell: ({ row }) => (
          <div>
            <p className="text-sm text-[#111827]">{row.original.lastAction}</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">{row.original.lastChannel}</p>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              variant="outline"
              className="h-8 rounded-full border-[#7C3AED] px-3 text-xs font-medium text-[#7C3AED] hover:bg-[#F5F3FF]"
              onClick={() => navigate(`/reminders?customer=${row.original.id}`)}
            >
              Send <Send className="ml-1 h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              className="h-8 rounded-full px-3 text-xs font-medium text-[#6B7280] hover:bg-[#F5F3FF] hover:text-[#111827]"
              onClick={() => onCreateTask(row.original.id)}
            >
              Task
            </Button>
          </div>
        ),
      },
    ],
    [navigate, onCreateTask]
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  })

  useMemo(() => {
    onSelectionChange(Object.keys(rowSelection).length)
  }, [onSelectionChange, rowSelection])

  return (
    <div className="overflow-hidden rounded-2xl bg-white card-shadow">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b border-[#E5E7EB] hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-12 px-4 text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]"
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="group h-12 border-b border-[#F3F4F6] hover:bg-[#F5F3FF]">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-4 py-3 align-middle text-sm text-[#111827]">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
