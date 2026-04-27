"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateSupplier, useUpdateSupplier, Supplier } from "@/hooks/use-suppliers";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
  readOnly?: boolean;
}

export function SupplierFormModal({ open, onOpenChange, supplier, readOnly }: SupplierFormModalProps) {
  const isEditing = !!supplier;
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (supplier) {
      form.reset({
        name: supplier.name,
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        isActive: supplier.isActive,
      });
    } else {
      form.reset({ name: "", email: "", phone: "", address: "", isActive: true });
    }
  }, [supplier, form]);

  const onSubmit = async (values: SupplierFormValues) => {
    try {
      const payload = {
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
        isActive: values.isActive,
      };
      if (isEditing && supplier) {
        await updateSupplier.mutateAsync({ id: supplier.id, data: payload });
        toast.success("Supplier updated successfully");
      } else {
        await createSupplier.mutateAsync(payload);
        toast.success("Supplier added successfully");
      }
      onOpenChange(false);
    } catch {
      toast.error("An error occurred. Please try again.");
    }
  };

  const isPending = createSupplier.isPending || updateSupplier.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {readOnly ? "View Supplier" : isEditing ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Company Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={readOnly}
                      placeholder="e.g. Ali Traders"
                      className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={readOnly}
                        type="email"
                        placeholder="contact@example.com"
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400">Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={readOnly}
                        placeholder="+92 300 0000000"
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={readOnly}
                      placeholder="Supplier address"
                      className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Status</FormLabel>
                  <Select
                    disabled={readOnly}
                    value={field.value ? "active" : "inactive"}
                    onValueChange={(val) => field.onChange(val === "active")}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white focus:ring-primary">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!readOnly && (
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-zinc-400 hover:text-white"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="min-w-[100px]">
                  {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Supplier"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
