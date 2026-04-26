"use client";

import { useState } from "react";
import { useProducts, useDeleteProduct, useBulkDeleteProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search, Package, Trash2, Pencil, Plus, MoreVertical } from "lucide-react";
import { ProductFormModal } from "@/components/dashboard/product-form-modal";
import { Product } from "@/types/product";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DeleteConfirmModal } from "@/components/dashboard/delete-confirm-modal";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const { data, isLoading } = useProducts({ search, categoryId, sortBy, page, limit });
  const { data: categoriesData } = useCategories({ limit: 100 });
  const deleteProduct = useDeleteProduct();
  const bulkDelete = useBulkDeleteProducts();

  const products = data?.data?.data || [];
  const totalPages = data?.data?.last_page || 0;

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setProductToDelete(id);
    setIsBulkDelete(false);
    setDeleteModalOpen(true);
  };

  const openBulkDeleteModal = () => {
    setIsBulkDelete(true);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (isBulkDelete) {
        await bulkDelete.mutateAsync(selectedIds);
        setSelectedIds([]);
        toast.success("Products deleted successfully");
      } else if (productToDelete) {
        await deleteProduct.mutateAsync(productToDelete);
        toast.success("Product deleted successfully");
      }
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch {
      toast.error("An error occurred during deletion");
    }
  };

  const columns: ColumnDef<Product>[] = [
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-zinc-800 flex-shrink-0 overflow-hidden">
            {row.original.image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.original.image || undefined} alt={row.original.name} className="h-full w-full object-cover" />
              </>
            ) : (
              <Package className="h-full w-full p-2 text-zinc-600" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-white">{row.original.name}</span>
            <span className="text-xs text-zinc-500 line-clamp-1">{row.original.description || "No description"}</span>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-300">
          {row.original.category?.name || "Uncategorized"}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
      cell: ({ row }) => <div className="text-white font-medium">${Number(row.getValue("price")).toLocaleString()}</div>,
    },
    {
      accessorKey: "stock",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number;
        return (
          <div className="flex items-center gap-2">
            <span className={stock < 5 ? "text-red-500 font-bold" : "text-zinc-300"}>
              {stock}
            </span>
            {stock < 5 && (
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] h-5 px-1 py-0 border leading-none">
                LOW STOCK
              </Badge>
            )}
          </div>
        )
      },
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
              <DropdownMenuItem onClick={() => handleEdit(row.original)} className="gap-2 focus:bg-zinc-800 cursor-pointer">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDeleteModal(row.original.id)} className="gap-2 text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Products</h1>
            <p className="text-zinc-500">Manage your fleet and inventory details.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" className="gap-2" onClick={openBulkDeleteModal}>
                <Trash2 className="h-4 w-4" /> Delete ({selectedIds.length})
              </Button>
            )}
            <Button className="gap-2" onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Search products..."
              className="border-zinc-800 bg-zinc-900/50 pl-10 text-white"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select value={categoryId} onValueChange={(val) => {
            if (val) setCategoryId(val);
            setPage(1);
          }}>
            <SelectTrigger className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-300 sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-300">
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesData?.data?.data?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(val) => {
            if (val) setSortBy(val);
          }}>
            <SelectTrigger className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-300 sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-300">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A-Z</SelectItem>
              <SelectItem value="stock-low">Low Stock First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          data={products}
          columns={columns}
          isLoading={isLoading}
          onRowSelectionChange={(ids) => setSelectedIds(ids)}
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

      <ProductFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={editingProduct}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        loading={deleteProduct.isPending || bulkDelete.isPending}
        title={isBulkDelete ? "Delete Products" : "Delete Product"}
        description={isBulkDelete 
          ? `Are you sure you want to delete ${selectedIds.length} products? This action cannot be undone.` 
          : "Are you sure you want to delete this product? This action cannot be undone."
        }
      />
    </div>
  );
}
