"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";
import { KeyRound, Loader2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const forgotSchema = z.object({
  email: z.string().email({ message: "Email is invalid" }),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset link");
      }

      setSubmitted(true);
      toast.success("Reset link sent! Please check your email (and console).");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 rotate-3">
            <KeyRound className="h-7 w-7 text-white -rotate-3" />
          </div>
          <h2 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900">
            Reset password
          </h2>
          <p className="mt-3 text-slate-500 font-medium">
            Enter your email to receive a recovery link
          </p>
        </div>

        <Card className="border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl overflow-hidden border">
          {!submitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <CardHeader className="pt-8 px-8">
                  <CardTitle className="text-2xl font-bold text-slate-800">Forgot password?</CardTitle>
                  <CardDescription className="text-slate-400">
                    No worries, we&apos;ll send you reset instructions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-8 pb-8">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2.5">
                        <FormLabel className="text-slate-700 font-semibold">Email address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            className="h-12 border-slate-200 bg-slate-50 text-slate-900 focus:ring-slate-900 focus:border-slate-900 transition-all rounded-xl shadow-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex flex-col space-y-6 px-8 pb-8 bg-transparent border-none">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base rounded-xl transition-all shadow-lg active:scale-[0.98]"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    {loading ? "Sending..." : "Reset Password"}
                  </Button>
                  <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="h-4 w-4" /> Back to login
                  </Link>
                </CardFooter>
              </form>
            </Form>
          ) : (
            <div className="p-8 text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">Check your email</h3>
                <p className="text-slate-500 font-medium">
                  We&apos;ve sent a password reset link to <span className="text-slate-900 font-bold">{form.getValues("email")}</span>.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full h-12 border-slate-200 text-slate-700 font-bold rounded-xl"
                onClick={() => setSubmitted(false)}
              >
                Resend link
              </Button>
              <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
