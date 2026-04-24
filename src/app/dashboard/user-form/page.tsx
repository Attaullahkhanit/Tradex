"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Email is invalid",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function UserFormPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setIsSuccess(true);
    toast.success("Form submitted successfully!");
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSuccess(false), 5000);
  }

  return (
    <div className="p-8 pb-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">User Registration</h1>
          <p className="text-zinc-500">Add a new user to the system with full validation.</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <CardTitle className="mt-4 text-xl">User Details</CardTitle>
            <CardDescription>
              Please enter the required information below. All fields are mandatory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">Success!</h3>
                  <p className="text-zinc-500">The user has been registered successfully.</p>
                </div>
                <Button 
                  onClick={() => {
                    form.reset();
                    setIsSuccess(false);
                  }}
                  variant="outline"
                  className="border-zinc-800"
                >
                  Register Another User
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Alex Johnson" 
                            {...field} 
                            className="border-zinc-800 bg-zinc-950 text-white focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Email</FormLabel>
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
                      name="phoneNumber"
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
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="••••••••" 
                            {...field} 
                            className="border-zinc-800 bg-zinc-950 text-white focus:ring-primary"
                          />
                        </FormControl>
                        <FormDescription className="text-zinc-500">
                          Create a secure password with at least 6 characters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    Submit Registration
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
