"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Search, Download, Play, Pause, Heart, Music, Shield, ChevronDown, Check, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useUser, SignInButton, UserButton } from "@clerk/nextjs"
import { supabase, type Track, type UserAction } from "@/lib/supabase"

const genres = ["House", "Techno", "EDM", "Reggaeton", "Hip Hop", "Pop", "FUNK"]
const artists = ["DJ Alex", "Producer Mike", "DJ Sarah", "Producer Carlos", "DAVID GUETTA"]
const months = ["Janeiro 2024", "Dezembro 2023", "Novembro 2023", "Outubro 2023"]
const categories = ["HOME", "NEW", "FEATURED", "TRENDING", "CHARTS", "ADMIN"]

export default function MusicPoolsPage() {
  const { isSignedIn, user, isLoaded } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedArtists, setSelectedArtists] = useState<string[]>([])
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState("HOME")
  const [tracks, setTracks] = useState<Track[]>([])
  const [userActions, setUserActions] = useState<UserAction[]>([])
  const [downloadedTracks, setDownloadedTracks] = useState<Set<number>>(new Set())
  const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set())
  const [playingTrack, setPlayingTrack] = useState<number | null>(null)
  const [showAddTrackForm, setShowAddTrackForm] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [artistsOpen, setArtistsOpen] = useState(false)
  const [monthsOpen, setMonthsOpen] = useState(false)

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
          bpm: 100,
          style: "Remix",
          category: "NEW",
          thumbnail: "/placeholder.svg?height=60&width=60",
          play_url: "https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV",
          download_url: "https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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

  const getCurrentWeekTracks = () => {
    const now = new Date()
    const currentDay = now.getDay() // 0 = domingo, 1 = segunda, etc.
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - currentDay + 1) // Segunda-feira
    startOfWeek.setHours(0, 0, 0, 0)

    const weekTracks = tracks.filter((track) => {
      const trackDate = new Date(track.created_at)
      return trackDate >= startOfWeek
    })

    // Agrupar por dia da semana
    const groupedByDay: { [key: string]: Track[] } = {}
    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

    weekTracks.forEach((track) => {
      const trackDate = new Date(track.created_at)
      const dayName = dayNames[trackDate.getDay()]
      if (!groupedByDay[dayName]) {
        groupedByDay[dayName] = []
      }
      groupedByDay[dayName].push(track)
    })

    // Ordenar para que o dia atual fique no topo
    const todayName = dayNames[currentDay]
    const orderedDays = [todayName, ...dayNames.filter((day) => day !== todayName)]

    return { groupedByDay, orderedDays, todayName }
  }

  const filteredTracks = useMemo(() => {
    let currentTracks = tracks

    if (activeCategory !== "HOME" && activeCategory !== "ADMIN") {
      currentTracks = tracks.filter((track) => track.category === activeCategory)
    }

    return currentTracks.filter((track) => {
      const matchesSearch =
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(track.genre)
      const matchesArtist = selectedArtists.length === 0 || selectedArtists.includes(track.artist)

      return matchesSearch && matchesGenre && matchesArtist
    })
  }, [searchTerm, selectedGenres, selectedArtists, tracks, activeCategory])

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

      // Fazer download do arquivo
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

  const handlePlay = (track: Track) => {
    if (!track.play_url || track.play_url === "#") return

    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.crossOrigin = "anonymous"
    }

    if (playingTrack === track.id) {
      audioRef.current.pause()
      setPlayingTrack(null)
      return
    }

    try {
      audioRef.current.pause()
      audioRef.current.src = track.play_url
      audioRef.current.load()
      audioRef.current.play().catch(console.error)
      setPlayingTrack(track.id)
    } catch (err) {
      console.error("Falha ao reproduzir o áudio:", err)
      setPlayingTrack(null)
    }
  }

  const handleAddTrack = async (formData: FormData) => {
    if (!isSignedIn || !user) return

    const trackData = {
      title: formData.get("title") as string,
      artist: formData.get("artist") as string,
      genre: formData.get("genre") as string,
      bpm: Number.parseInt(formData.get("bpm") as string),
      style: formData.get("style") as string,
      category: formData.get("category") as string,
      play_url: formData.get("play_url") as string,
      download_url: formData.get("download_url") as string,
    }

    const { error } = await supabase.from("tracks").insert(trackData)

    if (!error) {
      setShowAddTrackForm(false)
      loadTracks() // Recarregar músicas
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
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-700">{track.artist}</td>
      <td className="py-3 px-4 text-sm text-gray-700">{track.genre}</td>
      <td className="py-3 px-4 text-sm text-gray-700">{track.bpm}</td>
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
        <h2 className="text-xl font-bold mb-4">Adicionar Nova Música</h2>
        <form action={handleAddTrack} className="space-y-4">
          <Input name="title" placeholder="Título da música" required />
          <Input name="artist" placeholder="Artista" required />
          <Input name="genre" placeholder="Gênero" required />
          <Input name="bpm" type="number" placeholder="BPM" required />
          <Input name="style" placeholder="Estilo" required />
          <select name="category" className="w-full p-2 border rounded" required>
            <option value="">Selecionar categoria</option>
            <option value="NEW">NEW</option>
            <option value="FEATURED">FEATURED</option>
            <option value="TRENDING">TRENDING</option>
            <option value="CHARTS">CHARTS</option>
          </select>
          <Input name="play_url" placeholder="URL para reprodução" />
          <Input name="download_url" placeholder="URL para download" />
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
    const { groupedByDay, orderedDays, todayName } = getCurrentWeekTracks()
    const today = new Date().toLocaleDateString("pt-BR")

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-normal text-gray-900">New Music</h2>
        </div>

        {orderedDays.map((dayName, index) => {
          const dayTracks = groupedByDay[dayName] || []
          if (dayTracks.length === 0) return null

          return (
            <div key={dayName} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className={`text-lg ${index === 0 ? "font-bold" : "font-normal"} text-gray-900`}>
                  {index === 0 ? "Hoje" : dayName}
                </h3>
                {index === 0 && <span className="text-red-600 text-sm">{today}</span>}
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
                        BPM
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estilo
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dayTracks.map((track) => (
                      <TrackRow key={track.id} track={track} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-kanit">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Music className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Music Pools <span className="text-blue-600">by Nexor Records</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar músicas ou artistas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              {isSignedIn ? (
                <div className="flex items-center gap-3">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <SignInButton>
                    <Button variant="outline" size="sm">
                      Entrar
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button size="sm">Criar Conta</Button>
                  </SignInButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeCategory === category
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } ${category === "ADMIN" && (!isSignedIn || user?.publicMetadata?.role !== "admin") ? "hidden" : ""}`}
              >
                {category === "ADMIN" && <Shield className="w-4 h-4 inline mr-1" />}
                {category}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4">
          {/* Sidebar com Filtros */}
          <div className="w-48 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg p-4 sticky top-32">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Filtros</h2>

              {/* Filtro por Gênero */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2 text-sm">Gênero</h3>
                <div className="space-y-1">
                  {genres.map((genre) => (
                    <div key={genre} className="flex items-center space-x-2">
                      <Checkbox
                        id={`genre-${genre}`}
                        checked={selectedGenres.includes(genre)}
                        onCheckedChange={(checked) => handleGenreChange(genre, checked as boolean)}
                      />
                      <Label htmlFor={`genre-${genre}`} className="text-xs text-gray-700">
                        {genre}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-3" />

              {/* Filtro por Artista/DJ - Dropdown */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2 text-sm">DJs & Produtores</h3>
                <Popover open={artistsOpen} onOpenChange={setArtistsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={artistsOpen}
                      className="w-full justify-between text-xs h-8 bg-transparent"
                    >
                      {selectedArtists.length > 0 ? `${selectedArtists.length} selecionado(s)` : "Selecionar artistas"}
                      <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0">
                    <Command>
                      <CommandInput placeholder="Buscar artista..." className="h-8 text-xs" />
                      <CommandList>
                        <CommandEmpty>Nenhum artista encontrado.</CommandEmpty>
                        <CommandGroup>
                          {artists.map((artist) => (
                            <CommandItem
                              key={artist}
                              value={artist}
                              onSelect={() => handleArtistSelect(artist)}
                              className="text-xs"
                            >
                              <Check
                                className={`mr-2 h-3 w-3 ${
                                  selectedArtists.includes(artist) ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {artist}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Separator className="my-3" />

              {/* Filtro por Mês - Dropdown */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2 text-sm">Atualizações</h3>
                <Popover open={monthsOpen} onOpenChange={setMonthsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={monthsOpen}
                      className="w-full justify-between text-xs h-8 bg-transparent"
                    >
                      {selectedMonths.length > 0 ? `${selectedMonths.length} selecionado(s)` : "Selecionar período"}
                      <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0">
                    <Command>
                      <CommandInput placeholder="Buscar período..." className="h-8 text-xs" />
                      <CommandList>
                        <CommandEmpty>Nenhum período encontrado.</CommandEmpty>
                        <CommandGroup>
                          {months.map((month) => (
                            <CommandItem
                              key={month}
                              value={month}
                              onSelect={() => handleMonthSelect(month)}
                              className="text-xs"
                            >
                              <Check
                                className={`mr-2 h-3 w-3 ${
                                  selectedMonths.includes(month) ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {month}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Área Principal */}
          <div className="flex-1">
            {activeCategory === "ADMIN" && isSignedIn && user?.publicMetadata?.role === "admin" && (
              <div className="mb-4">
                <Button onClick={() => setShowAddTrackForm(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Música
                </Button>
              </div>
            )}

            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                {filteredTracks.length} músicas em <span className="font-medium">{activeCategory}</span>
              </p>
              {!isSignedIn && (
                <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  Faça login para baixar e curtir músicas
                </div>
              )}
            </div>

            {activeCategory === "HOME" ? (
              renderHomeContent()
            ) : (
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
                        BPM
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estilo
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTracks.map((track) => (
                      <TrackRow key={track.id} track={track} />
                    ))}
                  </tbody>
                </table>

                {filteredTracks.length === 0 && (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma música encontrada</h3>
                    <p className="text-gray-600">Tente ajustar os filtros ou termo de busca</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddTrackForm && <AddTrackForm />}
    </div>
  )
}
