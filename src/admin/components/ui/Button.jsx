import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Define button variants using class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
      },
      size: {
        xs: "h-7 rounded-md px-2 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 rounded-md px-8 text-lg",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const Button = forwardRef(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Component = motion.button;
    
    return (
      <Component
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileTap={{ scale: 0.97 }}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants }; 