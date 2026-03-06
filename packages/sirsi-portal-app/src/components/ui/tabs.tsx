/**
 * Tabs — shadcn/ui wrapper for @radix-ui/react-tabs
 *
 * has @types/react@18 hoisted to the root (consumed by other workspace packages)
 * while this package uses @types/react@19. Radix UI's ForwardRefExoticComponent
 * types reference the root @types/react@18, creating a type mismatch at JSX
 * surface as errors when the root @types/react is upgraded to v19, prompting
 * their removal. See: https://github.com/radix-ui/primitives/issues/2900
 */
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({ ...props }: React.ComponentProps<"div"> & { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; orientation?: "horizontal" | "vertical"; dir?: "ltr" | "rtl"; activationMode?: "automatic" | "manual" }) {
  // @ts-expect-error - Radix ref type incompatibility with React 19
  return <TabsPrimitive.Root {...props} />
}
Tabs.displayName = "Tabs"

function TabsList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    // @ts-expect-error - Radix ref type incompatibility with React 19
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
TabsList.displayName = "TabsList"

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  return (
    // @ts-expect-error - Radix ref type incompatibility with React 19
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
        className
      )}
      {...props}
    />
  )
}
TabsTrigger.displayName = "TabsTrigger"

function TabsContent({
  className,
  ...props
}: React.ComponentProps<"div"> & { value: string; forceMount?: true }) {
  return (
    // @ts-expect-error - Radix ref type incompatibility with React 19
    <TabsPrimitive.Content
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
}
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
