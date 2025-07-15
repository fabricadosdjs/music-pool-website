import { createClient } from "@supabase/supabase-js"

// Tipos para as tabelas do banco de dados
export type Track = {
  id: number
  title: string
  artist: string
  genre: string
  bitrate: number // Alterado de bpm para bitrate
  style: string
  category: string // NEW, FEATURED, TRENDING, CHARTS
  thumbnail?: string // URL da imagem
  play_url?: string
  download_url?: string
  created_at: string
  updated_at: string
}

export type UserAction = {
  id: number
  user_id: string
  track_id: number
  action_type: "download" | "like"
  created_at: string
}

// Configuração do cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
