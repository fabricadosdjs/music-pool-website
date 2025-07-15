"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Workaround for https://github.com/recharts/recharts/issues/3615
const Tooltip = ({
  active,
  payload,
  label,
  formatter,
  content,
  className,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  formatter?: (value: number | string, name: string, props: RechartsPrimitive.TooltipProps<any, any>) => React.ReactNode
  content?: React.ComponentProps<typeof ChartTooltipContent>["content"]
}) => {
  if (active && payload && payload.length) {
    return (
      <ChartTooltipContent
        className={className}
        label={label}
        payload={payload}
        formatter={formatter}
        content={content}
      />
    )
  }

  return null
}

const ChartContext = React.createContext<
  | {
      config: Record<string, { label?: string; color?: string }>
    }
  | undefined
>(undefined)

type ChartConfig = Record<string, { label?: string; color?: string }>

function ChartContainer({
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  config: ChartConfig
}) {
  const id = React.useId()
  if (!config || typeof config !== "object") {
    throw new Error("ChartContainer requires a `config` prop.")
  }

  const colorVariables = Object.entries(config)
    .map(([key, value]) => `--color-${key}: ${value.color}`)
    .join(";")

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        style={
          {
            [id]: "",
            ...Object.fromEntries(Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color])),
          } as React.CSSProperties
        }
        className={cn(
          "h-[350px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-dot[stroke='#8884d8']]:fill-primary",
          className,
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartTooltip({
  className,
  label,
  payload,
  formatter,
  content,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  formatter?: (value: number | string, name: string, props: RechartsPrimitive.TooltipProps<any, any>) => React.ReactNode
  content?: React.ComponentProps<typeof ChartTooltipContent>["content"]
}) {
  const { config } = useChart()

  return <Tooltip className={className} label={label} payload={payload} formatter={formatter} content={content} />
}

function ChartTooltipContent({
  className,
  label,
  payload,
  formatter,
  content,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  formatter?: (value: number | string, name: string, props: RechartsPrimitive.TooltipProps<any, any>) => React.ReactNode
  content?: React.ComponentProps<typeof ChartTooltipContent>["content"]
}) {
  const { config } = useChart()

  if (!payload || payload.length === 0) {
    return null
  }

  const displayedPayload = payload[0]

  return (
    <div className={cn("rounded-md border border-muted bg-background p-2 text-sm shadow-md", className)}>
      {content ? (
        content({ label, payload, formatter })
      ) : (
        <div className="grid gap-1.5">
          <div className="font-medium">{label}</div>
          <div className="flex items-center gap-2">
            {displayedPayload.fill && (
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: displayedPayload.fill,
                }}
              />
            )}
            {config[displayedPayload.dataKey as keyof typeof config]?.label || displayedPayload.dataKey}:{" "}
            {formatter
              ? formatter(displayedPayload.value as number | string, displayedPayload.name as string, displayedPayload)
              : displayedPayload.value}
          </div>
        </div>
      )}
    </div>
  )
}

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, useChart }
