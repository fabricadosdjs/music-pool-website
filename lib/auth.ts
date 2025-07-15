import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"
import { AuthError } from "@supabase/supabase-js"
import type { Profile } from "./supabase" // Importar o tipo Profile

export type AuthUser = User & {
  profile?: Profile // Adicionar o perfil completo do usuário
}

export async function signInWithEmailAndPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    console.error("Erro ao fazer login:", error.message)
    return { success: false, message: error.message }
  }
  return { success: true, user: data.user }
}

interface SignUpData {
  email: string
  password: string
  username: string
  first_name: string
  last_name: string
  marketing_emails: boolean
  milestone_emails: boolean
  recommendation_emails: boolean
  free_download_emails: boolean
}

export async function signUpWithEmailAndPassword({
  email,
  password,
  username,
  first_name,
  last_name,
  marketing_emails,
  milestone_emails,
  recommendation_emails,
  free_download_emails,
}: SignUpData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        first_name,
        last_name,
        marketing_emails,
        milestone_emails,
        recommendation_emails,
        free_download_emails,
      },
    },
  })
  if (error) {
    console.error("Erro ao criar conta:", error.message)
    return { success: false, message: error.message }
  }
  return { success: true, user: data.user }
}

export async function verifyOtp(email: string, token: string, type: "email") {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type })
  if (error) {
    console.error("Erro ao verificar OTP:", error.message)
    return { success: false, message: error.message }
  }
  return { success: true, user: data.user }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Erro ao fazer logout:", error.message)
    return { success: false, message: error.message }
  }
  return { success: true }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error && !(error instanceof AuthError && error.message === "Auth session missing!")) {
    console.error("Erro ao obter usuário atual:", error.message)
  }
  if (!user) return null

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*") // Selecionar todos os campos do perfil
    .eq("id", user.id)
    .single()

  if (profileError && profileError.code !== "PGRST116") {
    console.error("Erro ao obter perfil:", profileError.message)
  }

  return {
    ...user,
    profile: profile || undefined, // Anexar o perfil ao objeto de usuário
  } as AuthUser
}

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return null

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*") // Selecionar todos os campos do perfil
    .eq("id", user.id)
    .single()

  if (profileError && profileError.code !== "PGRST116") {
    console.error("Erro ao obter perfil (server):", profileError.message)
  }

  return {
    ...user,
    profile: profile || undefined,
  } as AuthUser
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const { data, error } = await supabase.from("profiles").select("username").eq("username", username).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 means no rows found
    console.error("Error checking username:", error.message)
    return false // Assume it doesn't exist or handle error appropriately
  }
  return !!data // Returns true if data exists (username found), false otherwise
}
