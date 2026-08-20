import { Check, ChevronDown } from "lucide-react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Select({ ...props }: ComponentProps<typeof SelectPrimitive.Root<string>>) {
  return <SelectPrimitive.Root {...props} />
}

function SelectTrigger({ className, children, ...props }: SelectPrimitive.Trigger.Props) {
  return <SelectPrimitive.Trigger className={cn("flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50", className)} {...props}>{children}<SelectPrimitive.Icon render={<ChevronDown className="size-4 text-muted-foreground" />} /></SelectPrimitive.Trigger>
}

function SelectValue({ ...props }: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value {...props} />
}

function SelectContent({ className, children, ...props }: SelectPrimitive.Popup.Props) {
  return <SelectPrimitive.Portal><SelectPrimitive.Positioner sideOffset={6}><SelectPrimitive.Popup className={cn("z-50 min-w-32 overflow-hidden rounded-xl border border-border bg-card p-1 text-card-foreground shadow-xl", className)} {...props}>{children}</SelectPrimitive.Popup></SelectPrimitive.Positioner></SelectPrimitive.Portal>
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return <SelectPrimitive.Item className={cn("relative flex w-full cursor-default select-none items-center rounded-lg py-2 pl-3 pr-8 text-sm outline-none data-highlighted:bg-muted data-highlighted:text-foreground", className)} {...props}>{children}<SelectPrimitive.ItemIndicator className="absolute right-2"><Check className="size-4" /></SelectPrimitive.ItemIndicator></SelectPrimitive.Item>
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
