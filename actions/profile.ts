"use server"

import { getAuthenticatedUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { Profile } from "@/lib/supabase"

export async function updateProfile(formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/") // Redireciona para login se não estiver autenticado
  }

  const first_name = formData.get("first_name") as string
  const last_name = formData.get("last_name") as string
  const marketing_emails = formData.get("marketing_emails") === "on"
  const milestone_emails = formData.get("milestone_emails") === "on"
  const recommendation_emails = formData.get("recommendation_emails") === "on"
  const free_download_emails = formData.get("free_download_emails") === "on"

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name,
      last_name,
      marketing_emails,
      milestone_emails,
      recommendation_emails,
      free_download_emails,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Erro ao atualizar perfil:", error.message)
    return { success: false, message: error.message }
  }

  revalidatePath("/profile")
  return { success: true, message: "Perfil atualizado com sucesso!" }
}

export async function updateAdminProfile(profileId: string, data: Partial<Profile>) {
  const adminUser = await getAuthenticatedUser()

  if (!adminUser || adminUser.profile?.role !== "admin") {
    return { success: false, message: "Acesso negado." }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", profileId)

  if (error) {
    console.error("Erro ao atualizar perfil do admin:", error.message)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin")
  return { success: true, message: "Perfil do usuário atualizado pelo admin!" }
}
