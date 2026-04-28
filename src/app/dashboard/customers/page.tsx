"use client";

import { useCustomers, Customer } from "@/hooks/use-customers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, ShoppingBag, UserPen, Trash2 } from "lucide-react";
import { useState } from "react";
import { CustomerEditModal } from "@/components/dashboard/customer-edit-modal";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { PageLoader } from "@/components/ui/page-loader";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const { data, isLoading } = useCustomers({ page, limit });
  const customers = data?.data?.data || [];
  const totalPages = data?.data?.last_page || 0;

  if (!data) {
    return <PageLoader />;
  }
  const filteredCustomers = customers?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<Customer>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-zinc-500 data-[state=checked]:bg-zinc-100 data-[state=checked]:text-zinc-900 ml-2"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-zinc-600 data-[state=checked]:bg-zinc-100 data-[state=checked]:text-zinc-900 ml-2"
        />
      ),
      enableSorting: false,
    },
    {
      id: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-zinc-800">
            <AvatarImage src={`https://avatar.vercel.sh/${row.original.email}`} />
            <AvatarFallback className="bg-zinc-800 text-zinc-400">
              {row.original.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-white">{row.original.name}</span>
            <span className="text-xs text-zinc-500">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Calendar className="h-3 w-3" />
          {new Date(row.getValue("createdAt") as string).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "orderCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Orders" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <ShoppingBag className="h-3 w-3 text-zinc-500" />
          {row.getValue("orderCount") as number} orders
        </div>
      ),
    },
    {
      accessorKey: "totalSpend",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Spend" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-medium text-primary">
          <DollarSign className="h-3.5 w-3.5" />
          {Number(row.getValue("totalSpend")).toLocaleString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-zinc-700 bg-transparent h-8 gap-2 hover:bg-zinc-800"
            onClick={() => {
              setSelectedCustomer(row.original);
              setIsEditModalOpen(true);
            }}
          >
            <UserPen className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Customers</h1>
            <p className="text-zinc-500">Manage your user base and track their engagement.</p>
          </div>
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" /> Delete ({selectedIds.length})
            </Button>
          )}
        </div>

        <DataTable
          data={filteredCustomers}
          columns={columns}
          isLoading={isLoading}
          onRowSelectionChange={setSelectedIds}
          filtersData={{
            searchFields: {
              placeholder: "Search by name or email...",
              value: search,
              onSearchChange: setSearch,
            }
          }}
          pageCount={totalPages}
          totalCount={data?.data?.total || 0}
          pageSize={limit}
          pageIndex={page - 1}
          onPaginationChange={({ pageIndex, pageSize }) => {
            setPage(pageIndex + 1);
            setLimit(pageSize);
          }}
          fromPageIndex={(page - 1) * limit + 1}
          toPageIndex={Math.min(page * limit, data?.data?.total || 0)}
        />
      </div>
      <CustomerEditModal 
        customer={selectedCustomer}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </div>
  );
}
