"use client";

import { useState, useMemo } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserFormModal } from "@/components/dashboard/user-form-modal";
import { EditUserModal } from "@/components/dashboard/edit-user-modal";
import { mockUsers, UserData } from "@/lib/data/mock-users";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  
  // Delete Modal State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  // Edit Modal State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleDeleteClick = (user: UserData) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      toast.success("Successfully deleted");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditClick = (user: UserData) => {
    setUserToEdit(user);
    setEditDialogOpen(true);
  };

  const columns: ColumnDef<UserData>[] = [
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
      cell: ({ row }) => <span className="font-semibold text-zinc-100">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <span className="text-zinc-400">{row.getValue("email")}</span>,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
      cell: ({ row }) => <span className="text-zinc-400">{row.getValue("phone")}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={row.getValue("status") === "Active"
            ? "border-green-500/20 bg-green-500/10 text-green-500"
            : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
          }
        >
          {row.getValue("status") as string}
        </Badge>
      ),
    },
    {
      accessorKey: "joiningDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Joining Date" />,
      cell: ({ row }) => <div className="text-zinc-400">{row.getValue("joiningDate")}</div>,
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right pr-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40 border-zinc-800 bg-zinc-900 text-zinc-100">
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer focus:bg-zinc-800 focus:text-white"
                onClick={() => handleEditClick(row.original)}
              >
                <Pencil className="h-4 w-4" /> Edit details
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer focus:bg-destructive/10 focus:text-destructive text-red-500"
                onClick={() => handleDeleteClick(row.original)}
              >
                <Trash2 className="h-4 w-4" /> Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 pb-16">
      {/* Top Nav Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Team Directory</h1>
          <p className="text-sm text-zinc-500">Manage organizational access, user roles, and account permissions.</p>
        </div>
        <UserFormModal />
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        filtersData={{
          searchFields: {
            placeholder: "Search by name, email or phone...",
            value: search,
            onSearchChange: setSearch,
          }
        }}
        paginationPageSizeOptions={[5, 10, 20, 50]}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-zinc-500 pt-2 text-base">
              Are you sure you want to delete <span className="font-bold text-white">{userToDelete?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                toast.error("Deletion cancelled");
              }}
              className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              No
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <EditUserModal
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={userToEdit}
      />
    </div>
  );
}
