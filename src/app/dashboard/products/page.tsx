"use client";

import { useState } from "react";
import { useProducts, useDeleteProduct, useBulkDeleteProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search, Package, Trash2, Pencil, Plus, Loader2, MoreVertical, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { ProductFormModal } from "@/components/dashboard/product-form-modal";
import { Product } from "@/types/product";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data, isLoading } = useProducts({ search, categoryId, sortBy, page, limit });
  const { data: categoriesData } = useCategories({ limit: 100 });
  const deleteProduct = useDeleteProduct();
  const bulkDelete = useBulkDeleteProducts();

  const products = data?.data?.data || [];
  const totalItems = data?.data?.total || 0;
  const totalPages = data?.data?.last_page || 0;

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct.mutateAsync(id);
        toast.success("Product deleted successfully");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
      try {
        await bulkDelete.mutateAsync(selectedIds);
        setSelectedIds([]);
        toast.success("Products deleted successfully");
      } catch (error) {
        toast.error("Failed to delete products");
      }
    }
  };

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
              <Button variant="destructive" size="sm" className="gap-2" onClick={handleBulkDelete}>
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
          <div className="relative flex-1">
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
            setCategoryId(val);
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
          <Select value={sortBy} onValueChange={setSortBy}>
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

        {/* Table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-zinc-400">Product</TableHead>
                <TableHead className="text-zinc-400">Category</TableHead>
                <TableHead className="text-zinc-400">Price</TableHead>
                <TableHead className="text-zinc-400">Stock</TableHead>
                <TableHead className="text-right text-zinc-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(product.id)}
                        onCheckedChange={(checked) => handleSelectOne(product.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-zinc-800 flex-shrink-0 overflow-hidden">
                          {product.image ? (
                            <img src={product.image || undefined} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-full w-full p-2 text-zinc-600" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{product.name}</span>
                          <span className="text-xs text-zinc-500 line-clamp-1">{product.description || "No description"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-300">
                        {product.category?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white font-medium">${product.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={product.stock < 5 ? "text-red-500 font-bold" : "text-zinc-300"}>
                          {product.stock}
                        </span>
                        {product.stock < 5 && (
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] h-5">
                            LOW STOCK
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                          <DropdownMenuItem onClick={() => handleEdit(product)} className="gap-2 focus:bg-zinc-800 cursor-pointer">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(product.id)} className="gap-2 text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
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
                <span className="text-sm text-zinc-500">
                  Showing <span className="text-zinc-300 font-bold">{(page - 1) * limit + 1}-{Math.min(page * limit, data.data.total || 0)}</span> of total <span className="text-zinc-300 font-bold">{data.data.total}</span> items
                </span>

                <span className="text-sm text-zinc-500">
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

              <Select value={limit.toString()} onValueChange={(val) => {
                setLimit(parseInt(val));
                setPage(1);
              }}>
                <SelectTrigger className="h-8 w-[130px] border-zinc-800 bg-zinc-900/50 text-zinc-300 text-xs">
                  <SelectValue placeholder="Show 10 rows" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-300">
                  <SelectItem value="5">Show 5 rows</SelectItem>
                  <SelectItem value="10">Show 10 rows</SelectItem>
                  <SelectItem value="20">Show 20 rows</SelectItem>
                  <SelectItem value="50">Show 50 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <ProductFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={editingProduct}
      />
    </div>
  );
}
