"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserFormModal } from "@/components/dashboard/user-form-modal";
import { EditUserModal } from "@/components/dashboard/edit-user-modal";
import { mockUsers, UserData } from "@/lib/data/mock-users";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

type SortColumn = keyof UserData | null;
type SortDirection = "asc" | "desc";

const SortIcon = ({ column, currentSort }: { column: SortColumn; currentSort: SortColumn }) => {
  if (currentSort !== column) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
  return <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />;
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete Modal State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  // Edit Modal State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);

  // Selection State
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());

  // Sorting Logic
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  // Sorted and Paginated Users
  const processedUsers = useMemo(() => {
    const sorted = [...filteredUsers];
    if (sortColumn) {
      sorted.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, sortColumn, sortDirection, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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

  // Selection Handlers
  const handleToggleUser = (userId: number) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleSelectAll = () => {
    const newSelected = new Set(selectedUserIds);
    const allOnPageSelected = processedUsers.every(user => selectedUserIds.has(user.id));

    if (allOnPageSelected) {
      processedUsers.forEach(user => newSelected.delete(user.id));
    } else {
      processedUsers.forEach(user => newSelected.add(user.id));
    }
    setSelectedUserIds(newSelected);
  };

  const allSelectedOnPage = processedUsers.length > 0 && processedUsers.every(user => selectedUserIds.has(user.id));
  const someSelectedOnPage = processedUsers.some(user => selectedUserIds.has(user.id)) && !allSelectedOnPage;

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 pb-16">
      {/* Top Nav Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Team Directory</h1>
          <p className="text-sm text-zinc-500">Manage organizational access, user roles, and account permissions.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
            className="border-zinc-800 bg-zinc-900/50 pl-10 text-white focus:ring-primary"
          />
        </div>
        <UserFormModal />
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-zinc-800 bg-zinc-800/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 px-4">
                  <Checkbox
                    checked={allSelectedOnPage ? true : someSelectedOnPage ? "indeterminate" : false}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer transition-colors hover:text-white"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Name <SortIcon column="name" currentSort={sortColumn} />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer transition-colors hover:text-white"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center">
                    Email <SortIcon column="email" currentSort={sortColumn} />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer transition-colors hover:text-white"
                  onClick={() => handleSort("phone")}
                >
                  <div className="flex items-center">
                    Phone <SortIcon column="phone" currentSort={sortColumn} />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer transition-colors hover:text-white"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status <SortIcon column="status" currentSort={sortColumn} />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer transition-colors hover:text-white text-right pr-8"
                  onClick={() => handleSort("joiningDate")}
                >
                  <div className="flex items-center justify-end">
                    Joining Date <SortIcon column="joiningDate" currentSort={sortColumn} />
                  </div>
                </TableHead>
                <TableHead className="w-16 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedUsers.length > 0 ? (
                processedUsers.map((user, index) => (
                  <TableRow
                    key={user.id}
                    className={cn(
                      "border-zinc-800 transition-colors",
                      selectedUserIds.has(user.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-zinc-800/20"
                    )}
                  >
                    <TableCell className="px-4">
                      <Checkbox
                        checked={selectedUserIds.has(user.id)}
                        onCheckedChange={() => handleToggleUser(user.id)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-zinc-100">{user.name}</TableCell>
                    <TableCell className="text-zinc-400">{user.email}</TableCell>
                    <TableCell className="text-zinc-400">{user.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={user.status === "Active"
                          ? "border-green-500/20 bg-green-500/10 text-green-500"
                          : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-zinc-400 pr-8">{user.joiningDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-40 border-zinc-800 bg-zinc-900 text-zinc-100">
                          <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer focus:bg-zinc-800 focus:text-white"
                            onClick={() => handleEditClick(user)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-zinc-800" />
                          <DropdownMenuItem
                            variant="destructive"
                            className="flex items-center gap-2 cursor-pointer focus:bg-destructive/10 focus:text-destructive"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination Controls */}
        <div className="flex flex-col items-center justify-between border-t border-zinc-800 p-4 gap-4 sm:flex-row">
          <div className="text-sm text-zinc-500">
            Showing <span className="text-zinc-300">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="text-zinc-300">
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
            </span>{" "}
            of <span className="text-zinc-300">{filteredUsers.length}</span> users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={currentPage === page
                    ? "bg-primary text-primary-foreground"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                  }
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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
