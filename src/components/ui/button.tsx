import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:     "bg-[#FF7A00] text-black uppercase hover:opacity-90",
        outline:     "border border-[#FF7A00] bg-transparent text-[#FF7A00] hover:bg-[#FF7A00] hover:text-black",
        secondary:   "bg-[#1e1e1e] text-white hover:bg-[#2a2a2a]",
        ghost:       "text-white hover:text-[#FF7A00]",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        link:        "text-[#FF7A00] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs:      "h-6 px-2 text-xs",
        sm:      "h-8 px-3 text-xs",
        lg:      "h-11 px-8 text-base",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && "w-full",
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {children}
          </span>
        ) : children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
