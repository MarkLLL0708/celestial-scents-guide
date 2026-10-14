import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("nn-button", {
  variants: {
    variant: {
      default: "nn-primary",
      primary: "nn-primary",
      secondary: "nn-secondary",
      outline: "nn-secondary",
      text: "nn-text",
      link: "nn-text",
      ghost: "nn-text",
      destructive: "nn-primary",
    },
    size: { default: "", sm: "chip", lg: "", icon: "nn-icon" },
  },
  defaultVariants: { variant: "default", size: "default" },
});
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {children}
            {loading && (
              <span className="loading-dots" aria-hidden="true">
                ...
              </span>
            )}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
export { Button, buttonVariants };
