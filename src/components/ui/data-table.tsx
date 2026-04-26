"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { RowSelectionState, Updater } from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type Table as TanstackTable,
} from "@tanstack/react-table"
import { FileSearch, Loader2 } from "lucide-react"
import { useEffect, useMemo, useState, ReactNode } from "react"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar, filtersDataType } from "./data-table-toolbar"

interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  isLoading?: boolean
  filtersData?: filtersDataType
  actionButtons?: ReactNode
  pageCount?: number
  pageSize?: number
  pageIndex?: number
  fromPageIndex?: number
  toPageIndex?: number
  totalCount?: number
  DataTableTitle?: string
  enableRowDrag?: boolean
  enableSorting?: boolean
  resetSelectionTrigger?: boolean
  onPaginationChange?: (props: { pageIndex: number; pageSize: number }) => void
  onSortingChange?: (sorting: SortingState) => void
  onRowOrderChange?: (newData: TData[]) => void
  onRowSelectionChange?: (selectedIds: string[]) => void
  onTableReady?: (table: TanstackTable<TData>) => void
  paginationPageSizeOptions?: number[] | string[]
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData> | undefined) => string
}

interface PaginationState {
  pageIndex: number
  pageSize: number
}

const fuzzyFilter = (row: Row<unknown>, columnId: string, filterValue: string) => {
  const value = String(row.getValue(columnId) ?? "").toLowerCase()
  const filter = String(filterValue).toLowerCase()
  return value.includes(filter)
}

function SortableRow<TData>({
  row,
  children,
  enableDrag,
}: {
  row: Row<TData>
  children: React.ReactNode
  enableDrag: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: row.id,
  })

  const style = enableDrag
    ? {
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }
    : undefined

  return (
    <TableRow
      ref={enableDrag ? setNodeRef : undefined}
      style={style}
      {...(enableDrag ? attributes : {})}
      {...(enableDrag ? listeners : {})}
      className="border-zinc-800 hover:bg-zinc-900/50"
      data-state={row.getIsSelected() && "selected"}
    >
      {children}
    </TableRow>
  )
}

export function DataTable<TData>({
  data,
  columns,
  actionButtons,
  isLoading,
  filtersData,
  onPaginationChange,
  pageCount,
  totalCount,
  pageSize,
  pageIndex,
  fromPageIndex,
  toPageIndex,
  DataTableTitle = "",
  onRowOrderChange,
  onSortingChange,
  enableRowDrag = false,
  onRowSelectionChange,
  resetSelectionTrigger,
  onTableReady,
  paginationPageSizeOptions,
  enableSorting = true,
  getRowId,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [tableData, setTableData] = useState<TData[]>(data)

  const changeRowSelection = (updater: Updater<RowSelectionState>) => {
    if (typeof updater !== "function") return
    const newSelection = typeof updater === "function" ? updater(rowSelection) : updater
    setRowSelection(newSelection)
    queueMicrotask(() => {
      const selectedIds = table.getSelectedRowModel().rows.map((r) => r.id)
      onRowSelectionChange?.(selectedIds)
    })
  }

  const memoizedColumns = useMemo(() => columns, [columns])
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TData>({
    data: tableData,
    columns: memoizedColumns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnFilters,
      pagination: {
        pageSize: pageSize ?? 10,
        pageIndex: pageIndex ?? 0,
      },
    },
    manualPagination: !!onPaginationChange,
    pageCount,
    enableSorting,
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: (updater) => {
      setSorting(updater)
      const newSorting = typeof updater === "function" ? updater(sorting) : updater
      onSortingChange?.(newSorting)
    },
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: getRowId ? getRowId : (row: unknown, index) => ((row as Record<string, unknown>).id != null ? String((row as Record<string, unknown>).id) : String(index)),
    onRowSelectionChange: changeRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  useEffect(() => {
    setRowSelection({})
    table.resetRowSelection()
  }, [table, resetSelectionTrigger])

  useEffect(() => {
    if (onTableReady) onTableReady(table)
  }, [onTableReady, table])

  const handlePaginationChange = (updater: PaginationState) => {
    onPaginationChange?.(updater)
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setTableData((items) => {
        const oldIndex = table.getRowModel().rows.findIndex((r) => r.id === active.id)
        const newIndex = table.getRowModel().rows.findIndex((r) => r.id === over?.id)
        const newData = arrayMove(items, oldIndex, newIndex)
        onRowOrderChange?.(newData)
        return newData
      })
    }
  }

  useEffect(() => {
    setTableData(data)
  }, [data])

  const renderTableBody = () => (
    <TableBody>
      {isLoading ? (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-64 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-500" />
          </TableCell>
        </TableRow>
      ) : table.getRowModel().rows?.length > 0 ? (
        table.getRowModel().rows.map((row) => (
          <SortableRow key={row.id} row={row} enableDrag={enableRowDrag}>
            {row.getVisibleCells().map((cell) => (
              <TableCell className="py-4" key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </SortableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-48 text-center text-zinc-500">
            <FileSearch className="h-10 w-10 mx-auto mb-2 opacity-20" />
            No results found
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  )

  return (
    <div className="w-full flex flex-col gap-4">
      {DataTableTitle && (
        <div className="mb-2">
          <h3 className="font-semibold text-xl text-white">{DataTableTitle}</h3>
        </div>
      )}

      {(filtersData || actionButtons) && (
        <DataTableToolbar
          table={table}
          filtersData={filtersData}
          actionButtons={actionButtons}
        />
      )}
      
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          {enableRowDrag ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={table.getRowModel().rows.map((row) => row.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table>
                  <TableHeader className="bg-zinc-900 border-b border-zinc-800">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow className="border-zinc-800 hover:bg-transparent" key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead className="py-3 text-zinc-400" key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  {renderTableBody()}
                </Table>
              </SortableContext>
            </DndContext>
          ) : (
            <Table>
              <TableHeader className="bg-zinc-900 border-b border-zinc-800">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow className="border-zinc-800 hover:bg-transparent" key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead className="py-3 text-zinc-400" key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              {renderTableBody()}
            </Table>
          )}
        </div>

        {onPaginationChange && totalCount !== undefined && totalCount > 0 && (
          <DataTablePagination
            table={table}
            totalCount={totalCount}
            pageSizeOptions={paginationPageSizeOptions}
            fromPageIndex={fromPageIndex}
            toPageIndex={toPageIndex}
            onPaginationChange={handlePaginationChange}
          />
        )}
      </div>
    </div>
  )
}
