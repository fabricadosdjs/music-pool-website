"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation" // Import usePathname
import { Search, Download, Play, Pause, Heart, Music, Shield, ChevronDown, Check, Plus, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useUser, SignInButton, UserButton } from "@clerk/nextjs"
import { supabase, type Track, type UserAction } from "@/lib/supabase"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import Footer from "@/components/footer" // Import Footer

const genres = ["House", "Techno", "EDM", "Reggaeton", "Hip Hop", "Pop", "FUNK"]
const artists = ["DJ Alex", "Producer Mike", "DJ Sarah", "Producer Carlos", "DAVID GUETTA"]
const months = ["Janeiro 2024", "Dezembro 2023", "Novembro 2023", "Outubro 2023"]
const categories = ["HOME", "NEW", "LIKE", "TRENDING", "CHARTS", "ASSINAR", "ADMIN"] // Added ASSINAR

const TRACKS_PER_DAY_LIMIT = 100

export default function MusicPoolsPage() {
const { isSignedIn, user, isLoaded } = useUser()
const pathname = usePathname() // Get current pathname
const [searchTerm, setSearchTerm] = useState("")
const [searchFilter, setSearchFilter] = useState<"title" | "artist" | "style">("title")
const [selectedGenres, setSelectedGenres] = useState<string[]>([])
const [selectedArtists, setSelectedArtists] = useState<string[]>([])
const [selectedMonths, setSelectedMonths] = useState<string[]>([])
const [activeCategory, setActiveCategory] = useState("HOME") // This will still control the content rendered by app/page.tsx
const [tracks, setTracks] = useState<Track[]>([])
const [userActions, setUserActions] = useState<UserAction[]>([])
const [downloadedTracks, setDownloadedTracks] = useState<Set<number>>(new Set())
const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set())
const [playingTrack, setPlayingTrack] = useState<number | null>(null)
const [showAddTrackForm, setShowAddTrackForm] = useState(false)
const audioRef = useRef<HTMLAudioElement | null>(null)
const [artistsOpen, setArtistsOpen] = useState(false)
const [monthsOpen, setMonthsOpen] = useState(false)
const [visibleTracksCount, setVisibleTracksCount] = useState<{ [key: string]: number }>({})

// Carregar músicas do banco
useEffect(() => {
  loadTracks()
}, [])

// Carregar ações do usuário quando logar
useEffect(() => {
  if (isSignedIn && user) {
    loadUserActions()
  }
}, [isSignedIn, user])

// Initialize activeCategory based on pathname on first load
useEffect(() => {
  const currentPath = pathname.substring(1).toUpperCase() // Remove leading slash and make uppercase
  if (categories.includes(currentPath)) {
    setActiveCategory(currentPath)
  } else if (pathname === "/") {
    setActiveCategory("HOME")
  } else {
    // If it's a new page like /subscribe or /admin, don't set activeCategory
    // This ensures the content area of app/page.tsx doesn't try to render for these external routes
    setActiveCategory("") // Or some default that doesn't render content
  }
}, [pathname]) // Re-run when pathname changes

const loadTracks = async () => {
  const { data, error } = await supabase.from("tracks").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao carregar músicas:", error)
    // Fallback para dados mock se não conseguir conectar
    setTracks([
      {
        id: 1,
        title: "VERSACE ON THE FLOOR (BRUNO MARS VS. DAVID GUETTA)",
        artist: "DAVID GUETTA",
        genre: "FUNK",
        bitrate: 100, // Alterado para bitrate
        style: "Remix",
        category: "NEW",
        thumbnail: "/placeholder.svg?height=60&width=60",
        play_url: "https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV",
        download_url: "https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Summer Vibes",
        artist: "DJ Alex",
        genre: "House",
        bitrate: 128,
        style: "Original",
        category: "NEW",
        thumbnail: "/placeholder.svg?height=60&width=60",
        play_url: "https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV",
        download_url: "https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV",
        created_at: new Date(Date.now() - 86400000).toISOString(), // Ontem
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        title: "Night Drive",
        artist: "Producer Mike",
        genre: "Techno",
        bitrate: 132,
        style: "Extended Mix",
        category: "FEATURED", // Será LIKE
        thumbnail: "/placeholder.svg?height=60&width=60",
        play_url: "https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV",
        download_url: "https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV",
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(), // Dois dias atrás
        updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 4,
        title: "Deep House Session",
        artist: "DJ Sarah",
        genre: "House",
        bitrate: 124,
        style: "Club Mix",
        category: "TRENDING",
        thumbnail: "/placeholder.svg?height=60&width=60",
        play_url: "https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV",
        download_url: "https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV",
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(), // Três dias atrás
        updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 5,
        title: "Tropical Beats",
        artist: "DJ Sarah",
        genre: "Reggaeton",
        bitrate: 95,
        style: "Radio Edit",
        category: "CHARTS",
        thumbnail: "/placeholder.svg?height=60&width=60",
        play_url: "https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV",
        download_url: "https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV",
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(), // Quatro dias atrás
        updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
    ])
  } else {
    setTracks(data || [])
  }
}

const loadUserActions = async () => {
  if (!user) return

  const { data, error } = await supabase.from("user_actions").select("*").eq("user_id", user.id)

  if (!error && data) {
    setUserActions(data)
    const downloads = new Set(data.filter((a) => a.action_type === "download").map((a) => a.track_id))
    const likes = new Set(data.filter((a) => a.action_type === "like").map((a) => a.track_id))
    setDownloadedTracks(downloads)
    setLikedTracks(likes)
  }
}

const getTracksForCategory = useCallback(
  (category: string) => {
    if (category === "HOME" || category === "ADMIN") {
      return tracks
    } else if (category === "LIKE") {
      return tracks.filter((track) => likedTracks.has(track.id))
    }
    return tracks.filter((track) => track.category === category)
  },
  [tracks, likedTracks],
)

const filteredTracks = useMemo(() => {
  const currentTracks = getTracksForCategory(activeCategory)

  return currentTracks.filter((track) => {
    let matchesSearch = true
    if (searchTerm) {
      if (searchFilter === "title") {
        matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase())
      } else if (searchFilter === "artist") {
        matchesSearch = track.artist.toLowerCase().includes(searchTerm.toLowerCase())
      } else if (searchFilter === "style") {
        matchesSearch = track.style.toLowerCase().includes(searchTerm.toLowerCase())
      }
    }

    const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(track.genre)
    const matchesArtist = selectedArtists.length === 0 || selectedArtists.includes(track.artist)
    // const matchesMonth = selectedMonths.length === 0 || selectedMonths.some(month => track.created_at.includes(month.split(' ')[0])) // Lógica simplificada para mês

    return matchesSearch && matchesGenre && matchesArtist // && matchesMonth
  })
}, [searchTerm, searchFilter, selectedGenres, selectedArtists, selectedMonths, activeCategory, getTracksForCategory])

const handleGenreChange = (genre: string, checked: boolean) => {
  if (checked) {
    setSelectedGenres([...selectedGenres, genre])
  } else {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre))
  }
}

const handleArtistSelect = (artist: string) => {
  if (selectedArtists.includes(artist)) {
    setSelectedArtists(selectedArtists.filter((a) => a !== artist))
  } else {
    setSelectedArtists([...selectedArtists, artist])
  }
}

const handleMonthSelect = (month: string) => {
  if (selectedMonths.includes(month)) {
    setSelectedMonths(selectedMonths.filter((m) => m !== month))
  } else {
    setSelectedMonths([...selectedMonths, month])
  }
}

const handleDownload = async (track: Track) => {
  if (!isSignedIn || !user) return

  // Exemplo de verificação de plano pago (assumindo publicMetadata.isPaidUser)
  // Você precisaria configurar isso no Clerk ou via webhook/função Supabase
  const isPaidUser = user.publicMetadata?.isPaidUser === true

  if (!isPaidUser) {
    toast({
      title: "Assinatura Necessária",
      description: "Você precisa assinar um plano para baixar músicas.",
      variant: "destructive",
    })
    return
  }

  const isDownloaded = downloadedTracks.has(track.id)

  if (isDownloaded) {
    // Remover download
    await supabase
      .from("user_actions")
      .delete()
      .eq("user_id", user.id)
      .eq("track_id", track.id)
      .eq("action_type", "download")

    setDownloadedTracks((prev) => {
      const newSet = new Set(prev)
      newSet.delete(track.id)
      return newSet
    })
  } else {
    // Adicionar download
    await supabase.from("user_actions").insert({
      user_id: user.id,
      track_id: track.id,
      action_type: "download",
    })

    setDownloadedTracks((prev) => new Set([...prev, track.id]))

    // Fazer download do arquivo (sem abrir nova aba)
    if (track.download_url && track.download_url !== "#") {
      const link = document.createElement("a")
      link.href = track.download_url
      link.download = `${track.artist} - ${track.title}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}

const handleLike = async (trackId: number) => {
  if (!isSignedIn || !user) return

  const isLiked = likedTracks.has(trackId)

  if (isLiked) {
    // Remover like
    await supabase
      .from("user_actions")
      .delete()
      .eq("user_id", user.id)
      .eq("track_id", trackId)
      .eq("action_type", "like")

    setLikedTracks((prev) => {
      const newSet = new Set(prev)
      newSet.delete(trackId)
      return newSet
    })
  } else {
    // Adicionar like
    await supabase.from("user_actions").insert({
      user_id: user.id,
      track_id: trackId,
      action_type: "like",
    })

    setLikedTracks((prev) => new Set([...prev, trackId]))
  }
}

const handleAddTrack = async (formData: FormData) => {
  if (!isSignedIn || !user) return

  const titles = (formData.get("titles") as string)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
  const playUrls = (formData.get("play_urls") as string)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
  const downloadUrls = (formData.get("download_urls") as string)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
  const thumbnails = (formData.get("thumbnails") as string)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)

  if (
    titles.length === 0 ||
    titles.length !== playUrls.length ||
    titles.length !== downloadUrls.length ||
    titles.length !== thumbnails.length
  ) {
    toast({
      title: "Erro no Formulário",
      description:
        "Certifique-se de que todos os campos de lista (título, play URL, download URL, thumbnail) têm o mesmo número de linhas preenchidas.",
      variant: "destructive",
    })
    return
  }

  const genre = formData.get("genre") as string
  const bitrate = Number.parseInt(formData.get("bitrate") as string)
  const style = formData.get("style") as string

  const tracksToInsert = titles.map((title, index) => ({
    title,
    artist: "Artista Desconhecido", // Artista fixo ou inferir de outro lugar se necessário
    genre,
    bitrate,
    style,
    category: "NEW", // Novas músicas sempre vão para NEW
    thumbnail: thumbnails[index],
    play_url: playUrls[index],
    download_url: downloadUrls[index],
  }))

  const { error } = await supabase.from("tracks").insert(tracksToInsert)

  if (!error) {
    setShowAddTrackForm(false)
    loadTracks() // Recarregar músicas
    toast({
      title: "Sucesso!",
      description: `${titles.length} música(s) adicionada(s) com sucesso.`,
    })
  } else {
    console.error("Erro ao adicionar músicas:", error)
    toast({
      title: "Erro ao Adicionar Música",
      description: error.message,
      variant: "destructive",
    })
  }
}

useEffect(() => {
  return () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }
}, [])

if (!isLoaded) {
  return (
    <div className="min-h-screen bg-white font-kanit flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}

const handlePlay = (track: Track) => {
  if (playingTrack === track.id) {
    // Se a mesma música está tocando, pause
    setPlayingTrack(null)
    if (audioRef.current) {
      audioRef.current.pause()
    }
  } else {
    // Se uma nova música é selecionada
    setPlayingTrack(track.id)
    if (audioRef.current) {
      audioRef.current.src = track.play_url
      audioRef.current.play().catch((error) => {
        console.error("Erro ao reproduzir áudio:", error)
        toast({
          title: "Erro ao Reproduzir",
          description: "Houve um problema ao reproduzir a música.",
          variant: "destructive",
        })
        setPlayingTrack(null) // Limpar o estado de reprodução em caso de erro
      })
    }
  }
}

const TrackRow = ({ track }: { track: Track }) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
    <td className="py-3 px-4">
      <div className="flex items-center gap-3">
        <div className="relative group">
          <img
            src={track.thumbnail || "/placeholder.svg?height=60&width=60"}
            alt={track.title}
            className="w-12 h-12 rounded object-cover"
          />
          <button
            onClick={() => handlePlay(track)}
            className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {playingTrack === track.id ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
        <div className="flex-1">
          <h3 className="font-normal text-gray-900 text-sm leading-tight">{track.title}</h3>
          <p className="text-xs text-gray-500">{track.artist}</p>
        </div>
      </div>
    </td>
    <td className="py-3 px-4 text-sm text-gray-700">{track.genre}</td>
    <td className="py-3 px-4 text-sm text-gray-700">{track.bitrate}</td> {/* Alterado para bitrate */}
    <td className="py-3 px-4 text-sm text-gray-700">{track.style}</td>
    <td className="py-3 px-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleDownload(track)}
          disabled={!isSignedIn}
          className={`p-2 rounded-full transition-colors ${
            downloadedTracks.has(track.id)
              ? "bg-blue-100 text-blue-600"
              : "bg-green-100 text-green-600 hover:bg-green-200"
          } ${!isSignedIn ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleLike(track.id)}
          disabled={!isSignedIn}
          className={`p-2 rounded-full transition-colors ${
            likedTracks.has(track.id) ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          } ${!isSignedIn ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Heart className={`w-4 h-4 ${likedTracks.has(track.id) ? "fill-current" : ""}`} />
        </button>
      </div>
    </td>
  </tr>
)

const AddTrackForm = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Adicionar Nova Música(s)</h2>
      <form action={handleAddTrack} className="space-y-4">
        <div>
          <Label htmlFor="titles">Títulos das Músicas (uma por linha)</Label>
          <Textarea
            id="titles"
            name="titles"
            placeholder="Título da música 1&#10;Título da música 2"
            required
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="artists">Artista (será o mesmo para todas as músicas)</Label>
          <Input id="artists" name="artist" placeholder="Nome do Artista" required />
        </div>
        <div>
          <Label htmlFor="genre">Gênero</Label>
          <Input id="genre" name="genre" placeholder="Gênero" required />
        </div>
        <div>
          <Label htmlFor="bitrate">BITRATE</Label>
          <Input id="bitrate" name="bitrate" type="number" placeholder="BITRATE" required />
        </div>
        <div>
          <Label htmlFor="style">Estilo</Label>
          <Input id="style" name="style" placeholder="Estilo" required />
        </div>
        <div>
          <Label htmlFor="thumbnails">URLs das Thumbnails (uma por linha, na mesma ordem dos títulos)</Label>
          <Textarea
            id="thumbnails"
            name="thumbnails"
            placeholder="URL da thumbnail 1&#10;URL da thumbnail 2"
            required
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="play_urls">URLs para Reprodução (uma por linha, na mesma ordem dos títulos)</Label>
          <Textarea id="play_urls" name="play_urls" placeholder="URL de play 1&#10;URL de play 2" required rows={3} />
        </div>
        <div>
          <Label htmlFor="download_urls">URLs para Download (uma por linha, na mesma ordem dos títulos)</Label>
          <Textarea
            id="download_urls"
            name="download_urls"
            placeholder="URL de download 1&#10;URL de download 2"
            required
            rows={3}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Adicionar
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowAddTrackForm(false)}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  </div>
)

const renderHomeContent = () => {
  const now = new Date()
  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
  const todayDateString = now.toLocaleDateString("pt-BR")

  // Agrupar músicas por dia da semana
  const groupedByDay: { [key: string]: Track[] } = {}
  tracks.forEach((track) => {
    const trackDate = new Date(track.created_at)
    const dayName = dayNames[trackDate.getDay()]
    if (!groupedByDay[dayName]) {
      groupedByDay[dayName] = []
    }
    groupedByDay[dayName].push(track)
  })

  // Ordenar os dias para que o dia atual fique no topo
  const currentDayIndex = now.getDay()
  const orderedDays = []
  for (let i = 0; i < 7; i++) {
    orderedDays.push(dayNames[(currentDayIndex + i) % 7])
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-normal text-gray-900 mb-4">New Music</h2>

      {orderedDays.map((dayName) => {
        const dayTracks = groupedByDay[dayName] || []
        if (dayTracks.length === 0) return null

        const isToday = dayName === dayNames[currentDayIndex]
        const displayTracks = dayTracks.slice(0, visibleTracksCount[dayName] || TRACKS_PER_DAY_LIMIT)

        return (
          <div key={dayName} className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className={`text-2xl ${isToday ? "font-bold" : "font-normal"} text-gray-900`}>
                {isToday ? "Hoje" : dayName}
              </h3>
              {isToday && <span className="text-red-600 text-base">{todayDateString}</span>}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Música
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artista
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gênero
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BITRATE
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estilo
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">{displayTracks.map((track) => (
                  <TrackRow key={track.id} track={track} />
                ))}</tbody>
              </table>
              {dayTracks.length > (visibleTracksCount[dayName] || TRACKS_PER_DAY_LIMIT) && (
                <div className="p-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setVisibleTracksCount((prev) => ({
                        ...prev,
                        [dayName]: (prev[dayName] || TRACKS_PER_DAY_LIMIT) + TRACKS_PER_DAY_LIMIT,
                      }))
                    }
                  >
                    Carregar Mais
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const renderLikeContent = () => {
  const likedTracksList = filteredTracks.filter((track) => likedTracks.has(track.id))
  const groupedByStyle: { [key: string]: Track[] } = {}
  likedTracksList.forEach((track) => {
    if (!groupedByStyle[track.style]) {
      groupedByStyle[track.style] = []
    }
    groupedByStyle[track.style].push(track)
  })

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-normal text-gray-900 mb-4">Músicas Curtidas</h2>
      {Object.keys(groupedByStyle).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma música curtida ainda</h3>
          <p className="text-gray-600">Curta algumas músicas para vê-las aqui!</p>
        </div>
      ) : (
        Object.keys(groupedByStyle).map((style) => (
          <div key={style} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">{style}</h3>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Música
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artista
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gênero
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BITRATE
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estilo
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">{groupedByStyle[style].map((track) => (
                  <TrackRow key={track.id} track={track} />
                ))}</tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

const renderTrendingContent = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-normal text-gray-900 mb-4">Músicas em Alta</h2>
      {filteredTracks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma música em alta encontrada</h3>
          <p className="text-gray-600">Verifique novamente mais tarde!</p>
        </div>
      ) : (
