"use client";

import { useState } from "react";
import { useOrders, useUpdateOrderStatus, Order } from "@/hooks/use-orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { MoreVertical, ShoppingCart, Calendar, User, CreditCard, ChevronRight, Loader2, ChevronLeft, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusConfig = {
  PENDING: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  PAID: { label: "Paid", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  SHIPPED: { label: "Shipped", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  DELIVERED: { label: "Delivered", className: "bg-green-500/10 text-green-500 border-green-500/20" },
};

export default function OrdersPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const { data, isLoading } = useOrders({ status, page, limit });
  const orders = data?.data?.data || [];
  const totalPages = data?.data?.last_page || 0;
  const updateStatus = useUpdateOrderStatus();

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
      toast.success(`Order marked as ${newStatus.toLowerCase()}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const selectedOrder = orders?.find(o => o.id === selectedOrderId);

  return (
    <div className="p-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-zinc-500">Track and manage customer transactions.</p>
        </div>

        <Tabs value={status} onValueChange={setStatus} className="w-full">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-zinc-800">All</TabsTrigger>
            <TabsTrigger value="PENDING" className="data-[state=active]:bg-zinc-800">Pending</TabsTrigger>
            <TabsTrigger value="PAID" className="data-[state=active]:bg-zinc-800">Paid</TabsTrigger>
            <TabsTrigger value="SHIPPED" className="data-[state=active]:bg-zinc-800">Shipped</TabsTrigger>
            <TabsTrigger value="DELIVERED" className="data-[state=active]:bg-zinc-800">Delivered</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Order ID</TableHead>
                <TableHead className="text-zinc-400">Customer</TableHead>
                <TableHead className="text-zinc-400">Date</TableHead>
                <TableHead className="text-zinc-400">Items</TableHead>
                <TableHead className="text-zinc-400">Total</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-right text-zinc-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-zinc-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-zinc-500">
                    <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow 
                    key={order.id} 
                    className="border-zinc-800 hover:bg-zinc-900/50 cursor-pointer group"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <TableCell className="font-mono text-xs text-zinc-400">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{order.customer.name}</span>
                        <span className="text-xs text-zinc-500">{order.customer.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {order._count?.orderItems || 0} items
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      ${order.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border", statusConfig[order.status as keyof typeof statusConfig]?.className)}>
                        {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white w-40">
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <DropdownMenuItem 
                              key={key}
                              onClick={() => handleUpdateStatus(order.id, key)}
                              className="focus:bg-zinc-800 cursor-pointer"
                            >
                              Mark as {config.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {data?.data && data.data.total > 0 && (
            <div className="flex items-center justify-end gap-6 border-t border-zinc-800 px-6 py-4 bg-zinc-950/30">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500 whitespace-nowrap">Rows per page</span>
                  <Select value={limit.toString()} onValueChange={(val) => {
                    setLimit(parseInt(val));
                    setPage(1);
                  }}>
                    <SelectTrigger className="h-8 w-[70px] border-zinc-800 bg-zinc-900 text-zinc-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-300">
                      {[5, 10, 20, 50].map((v) => (
                        <SelectItem key={v} value={v.toString()}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-500 min-w-[140px] text-right">
                    Showing <span className="text-zinc-300 font-bold">{(page - 1) * limit + 1}-{Math.min(page * limit, data.data.total || 0)}</span> of total <span className="text-zinc-300 font-bold">{data.data.total}</span> items
                  </span>

                  <span className="text-sm text-zinc-500 whitespace-nowrap">
                    Page <span className="text-zinc-300 font-bold">{page}</span> of <span className="text-zinc-300 font-bold">{totalPages || 1}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white disabled:opacity-30"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white disabled:opacity-30"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white disabled:opacity-30"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white disabled:opacity-30"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
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
