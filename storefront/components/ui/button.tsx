import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center font-medium uppercase tracking-widest text-xs transition-all duration-200 outline-none select-none disabled:pointer-events-none disabled:opacity-40 focus-visible:ring-1 focus-visible:ring-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "bg-[#111111] text-[#FFFFFF] hover:bg-[#000000] active:bg-[#111111] border border-[#111111]",
        outline:
          "border border-[#111111] bg-transparent text-[#111111] hover:bg-[#111111] hover:text-[#FFFFFF]",
        secondary:
          "bg-[#EBEBE7] text-[#111111] hover:bg-[#E5E5E5] border border-[#E5E5E5]",
        ghost:
          "bg-transparent text-[#111111] hover:bg-black/5 dark:hover:bg-white/5",
        destructive:
          "bg-[#111111] text-[#FFFFFF] hover:bg-[#000000] border border-[#111111]",
        link: "text-[#111111] underline-offset-4 hover:underline lowercase tracking-normal text-sm",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        xs: "h-7 px-3 text-[10px]",
        sm: "h-9 px-4 text-[11px]",
        lg: "h-13 px-8 text-xs",
        icon: "size-10",
        "icon-xs": "size-7",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <ButtonPrimitive
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
