import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { type Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  totalCount?: number
  pageSizeOptions?: number[] | string[]
  fromPageIndex?: number
  toPageIndex?: number
  onPaginationChange?: (state: { pageIndex: number; pageSize: number }) => void
}

export function DataTablePagination<TData>({
  table,
  totalCount,
  pageSizeOptions = [5, 10, 20, 50],
  fromPageIndex,
  toPageIndex,
  onPaginationChange,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()

  const handlePageChange = (newPageIndex: number) => {
    if (onPaginationChange) {
      onPaginationChange({ pageIndex: newPageIndex, pageSize })
    } else {
      table.setPageIndex(newPageIndex)
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    if (onPaginationChange) {
      onPaginationChange({ pageIndex: 0, pageSize: newPageSize })
    } else {
      table.setPageSize(newPageSize)
    }
  }

  return (
    <div className="flex items-center justify-end gap-6 border-t border-zinc-800 px-6 py-4 bg-zinc-950/30">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 whitespace-nowrap">Rows per page</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px] border-zinc-800 bg-zinc-900 text-zinc-300">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-300">
              {pageSizeOptions.map((pageSizeOption) => (
                <SelectItem key={pageSizeOption} value={`${pageSizeOption}`}>
                  {pageSizeOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 min-w-[140px] text-right">
            Showing <span className="text-zinc-300 font-bold">{fromPageIndex ?? (pageIndex * pageSize + 1)}</span>-
            <span className="text-zinc-300 font-bold">{toPageIndex ?? Math.min((pageIndex + 1) * pageSize, totalCount ?? 0)}</span> of total <span className="text-zinc-300 font-bold">{totalCount}</span> items
          </span>

          <span className="text-sm text-zinc-500 whitespace-nowrap">
            Page <span className="text-zinc-300 font-bold">{pageIndex + 1}</span> of <span className="text-zinc-300 font-bold">{pageCount || 1}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            className="h-8 w-8 border-zinc-800 bg-zinc-900/50 p-0 text-zinc-400 hover:text-white disabled:opacity-30"
            onClick={() => handlePageChange(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 border-zinc-800 bg-zinc-900/50 p-0 text-zinc-400 hover:text-white disabled:opacity-30"
            onClick={() => handlePageChange(pageIndex - 1)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 border-zinc-800 bg-zinc-900/50 p-0 text-zinc-400 hover:text-white disabled:opacity-30"
            onClick={() => handlePageChange(pageIndex + 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 border-zinc-800 bg-zinc-900/50 p-0 text-zinc-400 hover:text-white disabled:opacity-30"
            onClick={() => handlePageChange(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
