"use client";

import { useCustomers } from "@/hooks/use-customers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Mail, Calendar, DollarSign, ShoppingBag, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const { data, isLoading } = useCustomers({ page, limit });
  const customers = data?.data?.data || [];
  const totalPages = data?.data?.last_page || 0;

  const filteredCustomers = customers?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Customers</h1>
          <p className="text-zinc-500">Manage your user base and track their engagement.</p>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search by name or email..."
            className="border-zinc-800 bg-zinc-900/50 pl-10 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Customer</TableHead>
                <TableHead className="text-zinc-400">Joined</TableHead>
                <TableHead className="text-zinc-400">Orders</TableHead>
                <TableHead className="text-zinc-400">Total Spend</TableHead>
                <TableHead className="text-right text-zinc-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-zinc-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-zinc-500">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers?.map((customer) => (
                  <TableRow key={customer.id} className="border-zinc-800 hover:bg-zinc-900/50 group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-zinc-800">
                          <AvatarImage src={`https://avatar.vercel.sh/${customer.email}`} />
                          <AvatarFallback className="bg-zinc-800 text-zinc-400">
                            {customer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{customer.name}</span>
                          <span className="text-xs text-zinc-500">{customer.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3 w-3" />
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                        <ShoppingBag className="h-3 w-3 text-zinc-500" />
                        {customer.orderCount} orders
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium text-primary">
                        <DollarSign className="h-3.5 w-3.5" />
                        {customer.totalSpend.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="border-zinc-700 bg-transparent h-8">
                        View Profile
                      </Button>
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
    </div>
  );
}
