"use client"

import { toast as sonnerToast, type ToasterToast } from "sonner"

export type Toast = ToasterToast
export const toast = sonnerToast

export function useToast() {
  return { toast: sonnerToast }
}
