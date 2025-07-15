"use client"

import { toast as sonnerToast, type ToastOptions } from "sonner"

/**
 * Re-export the `toast` helper from `sonner` so that components can do:
 *   import { toast } from "@/components/ui/use-toast"
 *
 * You can pass any `ToastOptions` accepted by sonner.
 */
export const toast = (message: string, opts?: ToastOptions) => sonnerToast(message, opts)

/**
 * If you need the low-level hook from sonner you can also re-export it here:
 *   import { useToast } from "@/components/ui/use-toast"
 */
export { useToast } from "sonner"
