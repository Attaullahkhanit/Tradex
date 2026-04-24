"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/data/mock-users";
import { UserPen } from "lucide-react";
import { toast } from "sonner";

const editSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Email is invalid" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  status: z.enum(["Active", "Inactive"]),
});

type EditFormValues = z.infer<typeof editSchema>;

interface EditUserModalProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserModal({ user, open, onOpenChange }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "Active",
    },
  });

  // Re-fill form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
      });
    }
  }, [user, form]);

  const onSubmit = (values: EditFormValues) => {
    setLoading(true);
    console.log("Saving changes:", values);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onOpenChange(false);
      toast.success(`User "${values.name}" updated successfully!`);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPen className="h-5 w-5 text-primary" />
            Edit User Details
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Update the information for <span className="text-white font-medium">{user?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter name" 
                      {...field} 
                      className="border-zinc-800 bg-zinc-950 text-white focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="name@example.com" 
                      {...field} 
                      className="border-zinc-800 bg-zinc-950 text-white focus:ring-primary"
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
                  <FormLabel className="text-zinc-300">Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+1 (555) 000-0000" 
                      {...field} 
                      className="border-zinc-800 bg-zinc-950 text-white focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Account Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border-zinc-800 bg-zinc-950 text-white focus:ring-primary">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-zinc-800 bg-zinc-900 text-white">
                      <SelectItem value="Active" className="focus:bg-zinc-800 focus:text-white">Active</SelectItem>
                      <SelectItem value="Inactive" className="focus:bg-zinc-800 focus:text-white">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
