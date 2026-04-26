import { X } from "lucide-react"
import { type Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ReactNode } from "react"

export type filtersDataType = {
  searchFields?: {
    placeholder: string
    value?: string
    onSearchChange?: (value: string) => void
  }
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filtersData?: filtersDataType
  actionButtons?: ReactNode
}

export function DataTableToolbar<TData>({
  table,
  filtersData,
  actionButtons,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!filtersData?.searchFields?.value

  return (
    <div className="flex items-center justify-between mb-4 mt-2">
      <div className="flex flex-1 items-center space-x-2">
        {filtersData?.searchFields && (
          <Input
            placeholder={filtersData.searchFields.placeholder}
            value={filtersData.searchFields.value ?? ""}
            onChange={(event) => {
              if (filtersData.searchFields?.onSearchChange) {
                filtersData.searchFields.onSearchChange(event.target.value)
              }
            }}
            className="h-8 w-[150px] lg:w-[250px] bg-zinc-950 border-zinc-800 text-white"
          />
        )}
        {/* Additional select filters can go here */}
        
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              if (filtersData?.searchFields?.onSearchChange) {
                filtersData.searchFields.onSearchChange("")
              }
            }}
            className="h-8 px-2 lg:px-3 text-zinc-400 hover:text-white"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actionButtons}
      </div>
    </div>
  )
}
