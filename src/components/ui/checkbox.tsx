"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "checked"> {
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    React.useEffect(() => {
      if (combinedRef.current) {
        combinedRef.current.indeterminate = checked === "indeterminate";
      }
    }, [checked, combinedRef]);

    const handleClick = () => {
      if (onCheckedChange) {
        onCheckedChange(checked === "indeterminate" ? true : !checked);
      }
    };

    return (
      <div 
        onClick={handleClick}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-zinc-700 ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center overflow-hidden",
          checked === true && "bg-primary border-primary text-zinc-900",
          checked === "indeterminate" && "bg-primary border-primary text-zinc-900",
          className
        )}
      >
        {checked === true && <Check className="h-3 w-3 stroke-[3]" />}
        {checked === "indeterminate" && <Minus className="h-3 w-3 stroke-[3]" />}
        <input
          type="checkbox"
          ref={combinedRef}
          className="sr-only"
          checked={checked === true}
          onChange={() => {}} // Controlled via div click for better custom styling
          {...props}
        />
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
