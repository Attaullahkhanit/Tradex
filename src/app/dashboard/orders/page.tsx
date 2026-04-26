"use client";

import { useState } from "react";
import { useOrders, useUpdateOrderStatus, Order } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, ShoppingCart, Calendar, User, Eye, Download, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

const statusConfig = {
  PENDING: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  PAID: { label: "Paid", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  SHIPPED: { label: "Shipped", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  DELIVERED: { label: "Delivered", className: "bg-green-500/10 text-green-500 border-green-500/20" },
};

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export default function OrdersPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const { data, isLoading } = useOrders({ status, page, limit });
  const orders = data?.data?.data || [];
  const totalPages = data?.data?.last_page || 0;
  const updateStatus = useUpdateOrderStatus();

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
      toast.success(`Order marked as ${newStatus.toLowerCase()}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    if (!orders || orders.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const exportData = orders.map(order => ({
        'Order ID': `#${order.id.slice(0, 8).toUpperCase()}`,
        'Customer Name': order.customer.name || 'N/A',
        'Customer Email': order.customer.email || 'N/A',
        'Date': new Date(order.createdAt).toLocaleDateString(),
        'Items': order._count?.orderItems || 0,
        'Total': `${Number(order.total).toFixed(2)}`,
        'Status': order.status
      }));

      const isCsv = format === 'csv';
      const separator = isCsv ? ',' : '\t';
      const extension = isCsv ? 'csv' : 'xls';
      const mimeType = isCsv ? 'text/csv;charset=utf-8' : 'application/vnd.ms-excel';

      // Build content with headers
      const headers = Object.keys(exportData[0]).join(separator);
      const rows = exportData.map(obj => 
        Object.values(obj).map(val => `"${val}"`).join(separator)
      ).join('\n');
      
      const content = isCsv ? "\uFEFF" + headers + "\n" + rows : headers + "\n" + rows;
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      
      // Create hidden link and click it
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.download = `orders-export-${new Date().getTime()}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      
      // Extended cleanup to ensure browser sees the click
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 200);

      toast.success(`Successfully exported as ${extension.toUpperCase()}`);
    } catch (error) {
      console.error("Export failure:", error);
      toast.error("Failed to download export file");
    }
  };

  const selectedOrder = orders?.find((o: Order) => o.id === selectedOrderId);

  const columns: ColumnDef<Order>[] = [
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
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order ID" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-zinc-400">
          #{String(row.getValue("id")).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      id: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{row.original.customer.name}</span>
          <span className="text-xs text-zinc-500">{row.original.customer.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => <span className="text-zinc-300">{new Date(row.getValue("createdAt") as string).toLocaleDateString()}</span>,
    },
    {
      id: "items",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Items" />,
      cell: ({ row }) => <span className="text-zinc-400">{row.original._count?.orderItems || 0} items</span>,
    },
    {
      accessorKey: "total",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
      cell: ({ row }) => <span className="text-white font-medium">${Number(row.getValue("total")).toLocaleString()}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={cn("border", statusConfig[status as keyof typeof statusConfig]?.className)}>
            {statusConfig[status as keyof typeof statusConfig]?.label || status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white w-40">
              <DropdownMenuItem 
                onClick={() => setSelectedOrderId(row.original.id)}
                className="focus:bg-zinc-800 cursor-pointer gap-2"
              >
                <Eye className="h-3.5 w-3.5" /> View Details
              </DropdownMenuItem>
              <div className="h-px bg-zinc-800 my-1" />
              {Object.entries(statusConfig).map(([key, config]) => (
                <DropdownMenuItem 
                  key={key}
                  onClick={() => handleUpdateStatus(row.original.id, key)}
                  className="focus:bg-zinc-800 cursor-pointer"
                >
                  Mark as {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-zinc-500">Track and manage customer transactions.</p>
        </div>

        <div className="flex items-center justify-between">
          <Tabs value={status} onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }} className="w-auto">
            <TabsList className="bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="all" className="data-[state=active]:bg-zinc-800">All</TabsTrigger>
              <TabsTrigger value="PENDING" className="data-[state=active]:bg-zinc-800">Pending</TabsTrigger>
              <TabsTrigger value="PAID" className="data-[state=active]:bg-zinc-800">Paid</TabsTrigger>
              <TabsTrigger value="SHIPPED" className="data-[state=active]:bg-zinc-800">Shipped</TabsTrigger>
              <TabsTrigger value="DELIVERED" className="data-[state=active]:bg-zinc-800">Delivered</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => {
                if (confirm(`Delete ${selectedIds.length} orders?`)) {
                  toast.info("Bulk delete not implemented for orders yet");
                }
              }}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete ({selectedIds.length})
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 text-zinc-300 gap-2 hover:bg-zinc-800 hover:text-white">
                    <Download className="h-4 w-4" /> Export Orders
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white w-40">
                <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2 focus:bg-zinc-800 cursor-pointer">
                  <FileText className="h-4 w-4 text-zinc-400" /> Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('xlsx')} className="gap-2 focus:bg-zinc-800 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4 text-zinc-400" /> Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <DataTable
          data={orders}
          columns={columns}
          isLoading={isLoading}
          onRowSelectionChange={setSelectedIds}
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

      <Sheet open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <SheetContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription className="text-zinc-500">
              ID: #{selectedOrderId?.toUpperCase()}
            </SheetDescription>
          </SheetHeader>
          
          {selectedOrder && (
            <div className="space-y-8">
              {/* Status Section */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Current Status</span>
                  <Badge className={cn("border w-fit", statusConfig[selectedOrder.status as keyof typeof statusConfig]?.className)}>
                    {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.label || selectedOrder.status}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="outline" size="sm" className="border-zinc-700 bg-transparent">Update</Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <DropdownMenuItem 
                        key={key}
                        onClick={() => handleUpdateStatus(selectedOrder.id, key)}
                        className="focus:bg-zinc-800"
                      >
                        {config.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Customer & Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <User className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium uppercase">Customer</span>
                  </div>
                  <p className="font-medium">{selectedOrder.customer.name}</p>
                  <p className="text-xs text-zinc-500">{selectedOrder.customer.email}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium uppercase">Date</span>
                  </div>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-zinc-500">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-2">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium uppercase">Order Items</span>
                </div>
                <div className="space-y-3">
                   {/* In a real app, items would be fetched or passed. Showing placeholders if items not loaded */}
                   <p className="text-sm text-zinc-400 italic">Item breakdown will appear here.</p>
                </div>
              </div>

              {/* Summary */}
              <div className="pt-6 border-t border-zinc-800 space-y-2">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Subtotal</span>
                  <span>${selectedOrder.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white pt-2">
                  <span>Total</span>
                  <span className="text-primary">${selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              <Button className="w-full gap-2" variant="outline" onClick={() => toast.info("Receipt generation coming soon")}>
                 Print Receipt
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
