"use client"

/*
A tiny wrapper around Sonner’s `toast` so the rest of the codebase can do

  import { toast } from "@/components/ui/use-toast"
  toast.success("Hello!")

or

  import { useToast } from "@/components/ui/use-toast"
  const { toast } = useToast()

Sonner is pre-installed in Next.js, so no extra deps are required.
*/

import { toast as sonnerToast, type ToasterToast } from "sonner"

export type Toast = ToasterToast

// Named helper (back-compat with existing imports)
export const toast = sonnerToast

// Optional hook – returns the same helper.
// This avoids the `"sonner" module does not provide an export named "useToast"` error.
export function useToast() {
  return { toast: sonnerToast }
}
