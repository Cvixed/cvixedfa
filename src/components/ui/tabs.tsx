"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "flex flex-col gap-3 w-full",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "inline-flex h-11 w-full items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent border-b border-border rounded-none h-10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-full flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
        "text-muted-foreground hover:text-foreground",
        "data-active:bg-card data-active:text-foreground data-active:shadow-xs",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("w-full outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
