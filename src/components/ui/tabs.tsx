import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"
import { ContrattiOperatoreComponent } from "@/pages/components/ContrattiOperatoreComponent"

const isDettaglioOperatorePage = () =>
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/admin/dettaglio-operatore/")

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const isDettaglioOperatore = isDettaglioOperatorePage()

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className,
        isDettaglioOperatore &&
          "!mx-auto !h-auto !w-fit !rounded-full !border !border-[#dfe8e5] !bg-[#edf3f1] !p-1.5 !shadow-[0_6px_20px_rgba(0,122,85,0.08)]"
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  style,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const isDettaglioOperatore = isDettaglioOperatorePage()

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
        isDettaglioOperatore &&
          "!h-auto !flex-none !rounded-full !border-0 !px-8 !py-3 !text-[21px] !font-bold !tracking-[-0.02em] !text-[#5e5d5d] !no-underline !shadow-none transition-all duration-200 ease-out hover:!-translate-y-[1px] hover:!bg-white/60 hover:!text-[#007a55] active:!scale-[0.98] data-[state=active]:!scale-[1.02] data-[state=active]:!bg-white data-[state=active]:!font-extrabold data-[state=active]:!text-[#007a55] data-[state=active]:!no-underline data-[state=active]:!shadow-[0_4px_14px_rgba(0,122,85,0.14)]"
      )}
      style={
        isDettaglioOperatore
          ? { ...style, fontFamily: "'Mulish', sans-serif" }
          : style
      }
      {...props}
    />
  )
}

function TabsContent({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  const isDettaglioOperatore = isDettaglioOperatorePage()
  const usaPannelloContratti = isDettaglioOperatore && value === "contratti"

  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      value={value}
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      {usaPannelloContratti ? <ContrattiOperatoreComponent /> : children}
    </TabsPrimitive.Content>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
