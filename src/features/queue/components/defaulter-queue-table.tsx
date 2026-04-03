import { useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AgingBucket } from "@/features/queue/components/aging-bucket"
import { CustomerRowActions } from "@/features/queue/components/customer-row-actions"
import { DefaulterFlagBadge } from "@/features/queue/components/defaulter-flag-badge"
import { ModifierBadge } from "@/features/queue/components/modifier-badge"
import type { CustomerAccount } from "@/lib/types"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function DefaulterQueueTable({
  rows,
  onCreateTask,
}: {
  rows: CustomerAccount[]
  onCreateTask: (customerId: string) => void
}) {
  const columns = useMemo<ColumnDef<CustomerAccount>[]>(
    () => [
      {
        accessorKey: "bucket",
        header: "Aging",
        cell: ({ row }) => <AgingBucket bucket={row.original.bucket} days={row.original.agingDays} />,
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-[#1A1A2E]">{row.original.customerName}</p>
            <p className="text-[12px] text-[#5F5E5A]">{row.original.accountRef}</p>
          </div>
        ),
      },
      {
        accessorKey: "outstanding",
        header: "Outstanding",
        cell: ({ row }) => <span className="text-[13px] text-[#1A1A2E]">{formatCurrency(row.original.outstanding)}</span>,
      },
      {
        accessorKey: "riskLevel",
        header: "Risk level",
        cell: ({ row }) => <DefaulterFlagBadge level={row.original.riskLevel} />,
      },
      {
        accessorKey: "modifierValue",
        header: "Modifier",
        cell: ({ row }) => (
          <div className="space-y-1">
            <ModifierBadge type={row.original.modifierType} label={row.original.modifierLabel} />
            <p className="text-[12px] text-[#5F5E5A]">{row.original.modifierValue}</p>
          </div>
        ),
      },
      {
        accessorKey: "lastAction",
        header: "Last action",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="text-[12px] text-[#1A1A2E]">{row.original.lastAction}</p>
            <p className="text-[12px] text-[#5F5E5A]">
              {row.original.reminderCount} reminders · {row.original.lastChannel}
            </p>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <CustomerRowActions
            customerId={row.original.id}
            onTask={() => onCreateTask(row.original.id)}
          />
        ),
      },
    ],
    [onCreateTask]
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E0DED6] bg-white">
      <Table>
        <TableHeader className="bg-[#F1EFE8]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-11 px-4 text-[11px] font-medium uppercase tracking-[0.14em] text-[#5F5E5A]"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="group h-[44px]">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-4 py-3 align-middle">
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
