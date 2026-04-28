import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  className?: string;
}

export function PageLoader({ className }: PageLoaderProps) {
  return (
    <div className={cn("flex h-[80vh] items-center justify-center", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
