"use client";

import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, Category } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, Loader2, MoreVertical } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DeleteConfirmModal } from "@/components/dashboard/delete-confirm-modal";

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const { data, isLoading } = useCategories({ page, limit });
  const categories = data?.data?.data || [];
  const totalPages = data?.data?.last_page || 0;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...formData });
        toast.success("Category updated successfully");
      } else {
        await createCategory.mutateAsync(formData);
        toast.success("Category created successfully");
      }
      setIsOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", slug: "" });
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug });
    setIsOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setCategoryToDelete(id);
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
        // Bulk delete logic (needs hook implementation if missing, but for now we follow single)
        // If bulk delete category hook exists, use it.
        toast.info("Bulk delete logic following single delete pattern for now");
        for (const id of selectedIds) {
          await deleteCategory.mutateAsync(id);
        }
        setSelectedIds([]);
        toast.success("Categories deleted successfully");
      } else if (categoryToDelete) {
        await deleteCategory.mutateAsync(categoryToDelete);
        toast.success("Category deleted successfully");
      }
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch {
      toast.error("An error occurred during deletion");
    }
  };

  const columns: ColumnDef<Category>[] = [
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <div className="font-medium text-white">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "slug",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
      cell: ({ row }) => <div className="text-zinc-400">{row.getValue("slug")}</div>,
    },
    {
      id: "products",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Products" />,
      cell: ({ row }) => <div className="text-zinc-400">{row.original._count?.products || 0}</div>,
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Categories</h1>
          <p className="text-zinc-500">Manage product categories for your store.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={openBulkDeleteModal}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete ({selectedIds.length})
            </Button>
          )}
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingCategory(null);
              setFormData({ name: "", slug: "" });
            }
          }}>
            <DialogTrigger
              render={
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Add Category
                </Button>
              }
            />
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-zinc-400 font-bold">Category Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter category name..."
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({ 
                        name, 
                        slug: name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") 
                      });
                    }}
                    className="bg-zinc-800 border-zinc-800 h-11 focus:ring-zinc-700"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="slug" className="text-zinc-400 font-bold">Category Slug</Label>
                  <Input
                    id="slug"
                    placeholder="category-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="bg-zinc-800 border-zinc-800 h-11 focus:ring-zinc-700"
                    required
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full h-11 font-bold" disabled={createCategory.isPending || updateCategory.isPending}>
                    {(createCategory.isPending || updateCategory.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingCategory ? "Update Category" : "Create Category"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable
        data={categories}
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

      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        loading={deleteCategory.isPending}
        title={isBulkDelete ? "Delete Categories" : "Delete Category"}
        description={isBulkDelete 
          ? `Are you sure you want to delete ${selectedIds.length} categories? This will affect any products linked to them.` 
          : "Are you sure you want to delete this category? This will affect any products linked to it."
        }
      />
    </div>
  );
}
