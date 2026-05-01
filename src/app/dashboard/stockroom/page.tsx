"use client";

import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { Search, Plus, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DeleteConfirmModal } from "@/components/dashboard/delete-confirm-modal";
import { SupplierFormModal } from "@/components/dashboard/supplier-form-modal";
import { useSuppliers, useDeleteSupplier, Supplier } from "@/hooks/use-suppliers";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageLoader } from "@/components/ui/page-loader";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6b7280"];

interface StockStats {
  totalSkus: number;
  inventoryValue: number;
  healthyCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  lowStockAlert: number;
}

interface MovementItem {
  date: string;
  stockIn: number;
  stockOut: number;
}

export default function StockroomPage() {
  const [stats, setStats] = useState<StockStats | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [movement, setMovement] = useState<MovementItem[]>([]);

  // Supplier table state
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy] = useState("name-asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({
    search,
    status: filter,
    sortBy,
    page,
    limit,
  });
  const deleteSupplier = useDeleteSupplier();

  const suppliers: Supplier[] = suppliersData?.data || [];
  const totalPages = suppliersData?.last_page || 0;
  const total = suppliersData?.total || 0;

  useEffect(() => {
    fetch("/api/stockroom/stats").then(res => res.json()).then(setStats);
    fetch("/api/stockroom/low-stock").then(res => res.json()).then(setLowStock);
    fetch("/api/stockroom/movement").then(res => res.json()).then(setMovement);
  }, []);

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setViewingSupplier(null);
    setIsFormOpen(true);
  };

  const handleView = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setSupplierToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (supplierToDelete) {
        await deleteSupplier.mutateAsync(supplierToDelete);
        toast.success("Supplier deleted successfully");
      }
      setDeleteModalOpen(false);
      setSupplierToDelete(null);
    } catch {
      toast.error("Failed to delete supplier");
    }
  };

  const columns: ColumnDef<Supplier>[] = [
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
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{row.original.name}</span>
          <span className="text-xs text-zinc-500">{row.original.email || "No email"}</span>
        </div>
      ),
    },
    {
      accessorKey: "skuCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Products" />,
      cell: ({ row }) => (
        <span className="text-zinc-300">{row.original.skuCount} SKUs</span>
      ),
    },
    {
      accessorKey: "leadDays",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Lead Time" />,
      cell: ({ row }) => (
        <span className="text-zinc-300">{row.original.leadDays} days</span>
      ),
    },
    {
      accessorKey: "minOrderQty",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Min Order" />,
      cell: ({ row }) => (
        <span className="text-zinc-300">{row.original.minOrderQty} units</span>
      ),
    },
    {
      accessorKey: "lastOrderDaysAgo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Order" />,
      cell: ({ row }) => (
        <span className="text-zinc-300">{row.original.lastOrderDaysAgo} days ago</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          row.original.isActive
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
        }`}>
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
              <DropdownMenuItem
                onClick={() => handleView(row.original)}
                className="gap-2 focus:bg-zinc-800 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" /> View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEdit(row.original)}
                className="gap-2 focus:bg-zinc-800 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteModal(row.original.id)}
                className="gap-2 text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

if (!stats) {
    return <PageLoader />;
  }
  const healthData = [
    { name: "Healthy", value: stats.healthyCount },
    { name: "Low", value: stats.lowStockCount },
    { name: "Out", value: stats.outOfStockCount },
    { name: "Overstock", value: 0 },
  ];

  return (
    <div className="p-8 text-zinc-100">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Stockroom</h1>
          <p className="text-zinc-400">Manage inventory levels, suppliers and stock movements</p>
        </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <p className="text-sm font-medium text-zinc-400 mb-1 uppercase">Total SKUs</p>
          <h2 className="text-3xl font-light text-emerald-400">{stats.totalSkus}</h2>
          <p className="text-xs text-emerald-500/80 mt-2">{stats.healthyCount} healthy</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <p className="text-sm font-medium text-zinc-400 mb-1 uppercase">Inventory Value</p>
          <h2 className="text-3xl font-light text-white">${stats.inventoryValue?.toLocaleString() || 0}</h2>
          <p className="text-xs text-zinc-500 mt-2">cost price basis</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <p className="text-sm font-medium text-zinc-400 mb-1 uppercase">Low Stock</p>
          <h2 className="text-3xl font-light text-amber-500">{stats.lowStockCount}</h2>
          <p className="text-xs text-amber-600 mt-2">below threshold</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <p className="text-sm font-medium text-zinc-400 mb-1 uppercase">Out of Stock</p>
          <h2 className="text-3xl font-light text-red-500">{stats.outOfStockCount}</h2>
          <p className="text-xs text-red-500/80 mt-2">needs restocking</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut Chart */}
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col">
          <h3 className="text-lg font-medium text-white">Stock health</h3>
          <p className="text-sm text-zinc-400 mb-6">Distribution across all SKUs</p>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={healthData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {healthData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} itemStyle={{ color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{stats.totalSkus}</p>
                <p className="text-xs text-zinc-500">SKUs</p>
              </div>
            </div>
            <div className="absolute right-0 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-zinc-300">Healthy — {stats.healthyCount}</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-zinc-300">Low — {stats.lowStockCount}</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-zinc-300">Out — {stats.outOfStockCount}</span></div>
            </div>
          </div>
        </div>

        {/* Top 5 Low Stock */}
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col">
          <h3 className="text-lg font-medium text-white">Top 5 low stock</h3>
          <p className="text-sm text-zinc-400 mb-6">Critical items needing restock</p>
          <div className="flex-1 flex flex-col gap-4">
            {lowStock.map((item, idx) => {
              const percent = Math.min((item.stock / 50) * 100, 100);
              const isOut = item.stock === 0;
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">{item.name}</span>
                    <span className={isOut ? "text-red-400" : "text-amber-400"}>{item.stock} left</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isOut ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stock Movement */}
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col">
          <h3 className="text-lg font-medium text-white">Stock movement</h3>
          <p className="text-sm text-zinc-400 mb-6">Last 30 days — in vs out</p>
          <div className="flex-1 w-full h-[200px] relative mt-2">
            <div className="absolute -top-6 left-0 flex gap-4 text-xs z-10">
              <div className="flex items-center gap-2"><span className="w-2 h-1 bg-emerald-500 rounded-full" /><span className="text-zinc-400">Stock in</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-1 bg-red-500 rounded-full" /><span className="text-zinc-400">Stock out</span></div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={movement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} minTickGap={20} />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} itemStyle={{ color: "#fff" }} />
                <Line type="monotone" dataKey="stockIn" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="stockOut" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Suppliers Section */}
      <div className="mt-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Suppliers</h2>
            <p className="text-zinc-500">Manage your supply chain partners.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete ({selectedIds.length})
              </Button>
            )}
            <Button className="gap-2" onClick={() => { setEditingSupplier(null); setViewingSupplier(null); setIsFormOpen(true); }}>
              <Plus className="h-4 w-4" /> Add Supplier
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Search suppliers..."
              className="border-zinc-800 bg-zinc-900/50 pl-10 text-white"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "inactive"].map((f) => (
              <Button
                key={f}
                variant="outline"
                className={`rounded-full px-5 border-zinc-800 capitalize ${filter === f ? "bg-zinc-800 text-white" : "bg-transparent text-zinc-400 hover:bg-zinc-800/50"}`}
                onClick={() => { setFilter(f); setPage(1); }}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          data={suppliers}
          columns={columns}
          isLoading={suppliersLoading}
          onRowSelectionChange={(ids) => setSelectedIds(ids)}
          pageCount={totalPages}
          totalCount={total}
          pageSize={limit}
          pageIndex={page - 1}
          onPaginationChange={({ pageIndex, pageSize }) => {
            setPage(pageIndex + 1);
            setLimit(pageSize);
          }}
          fromPageIndex={(page - 1) * limit + 1}
          toPageIndex={Math.min(page * limit, total)}
        />
      </div>
      </div>

      {/* Modals */}
      <SupplierFormModal
        open={isFormOpen}
        onOpenChange={(open) => { setIsFormOpen(open); if (!open) { setEditingSupplier(null); setViewingSupplier(null); } }}
        supplier={editingSupplier || viewingSupplier}
        readOnly={!!viewingSupplier && !editingSupplier}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        loading={deleteSupplier.isPending}
        title="Delete Supplier"
        description="Are you sure you want to delete this supplier? This action cannot be undone."
      />
    </div>
  );
}

