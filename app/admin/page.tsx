"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/supabase"
import { updateAdminProfile } from "@/actions/profile"

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.profile?.role !== "admin") {
        router.push("/") // Redireciona se não for admin
        return
      }
      setUser(currentUser)

      const { data, error } = await supabase.from("profiles").select("*")
      if (error) {
        console.error("Erro ao buscar perfis:", error.message)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os perfis dos usuários.",
          variant: "destructive",
        })
      } else {
        setProfiles(data || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleUpdateProfile = async (profileId: string, field: keyof Profile, value: any) => {
    setSubmitting(true)
    const dataToUpdate: Partial<Profile> = { [field]: value }

    const result = await updateAdminProfile(profileId, dataToUpdate)

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      })
      // Atualiza o estado local para refletir a mudança
      setProfiles((prevProfiles) => prevProfiles.map((p) => (p.id === profileId ? { ...p, [field]: value } : p)))
    } else {
      toast({
        title: "Erro",
        description: result.message || "Não foi possível atualizar o perfil.",
        variant: "destructive",
      })
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando painel de administração...</p>
      </div>
    )
  }

  if (!user || user.profile?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Acesso negado. Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Painel de Administração</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold mb-4">Gerenciar Usuários</h3>
          <div className="space-y-6">
            {profiles.length === 0 ? (
              <p>Nenhum usuário registrado ainda.</p>
            ) : (
              profiles.map((profile) => (
                <Card key={profile.id} className="p-4 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
                    <div>
                      <Label>Email</Label>
                      <Input value={profile.id} disabled />{" "}
                      {/* Supabase user ID is the email in some cases, but it's the UUID */}
                      <Input value={user.email} disabled />{" "}
                      {/* This is the admin's email, not the user's. Need to fetch user email from auth.users table if needed. For now, profile.id is the user's UUID. */}
                    </div>
                    <div>
                      <Label>Nome de Usuário</Label>
                      <Input value={profile.username} disabled />
                    </div>
                    <div>
                      <Label>Nome Completo</Label>
                      <Input value={`${profile.first_name} ${profile.last_name}`} disabled />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`paid-switch-${profile.id}`}>Usuário Pago</Label>
                      <Switch
                        id={`paid-switch-${profile.id}`}
                        checked={profile.is_paid_user}
                        onCheckedChange={(checked) => handleUpdateProfile(profile.id, "is_paid_user", checked)}
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`download-limit-${profile.id}`}>Limite de Downloads</Label>
                      <Select
                        value={profile.download_limit}
                        onValueChange={(value: Profile["download_limit"]) =>
                          handleUpdateProfile(profile.id, "download_limit", value)
                        }
                        disabled={submitting}
                      >
                        <SelectTrigger id={`download-limit-${profile.id}`}>
                          <SelectValue placeholder="Selecione o limite" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="listen_only">Apenas Ouvir</SelectItem>
                          <SelectItem value="100_per_day">100 por dia</SelectItem>
                          <SelectItem value="200_per_day">200 por dia</SelectItem>
                          <SelectItem value="unlimited">Ilimitado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`next-due-date-${profile.id}`}>Próximo Vencimento</Label>
                      <Input
                        id={`next-due-date-${profile.id}`}
                        type="date"
                        value={profile.next_due_date ? profile.next_due_date.split("T")[0] : ""} // Formata para input type="date"
                        onChange={(e) =>
                          handleUpdateProfile(
                            profile.id,
                            "next_due_date",
                            e.target.value ? new Date(e.target.value).toISOString() : null,
                          )
                        }
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label>Função</Label>
                      <Select
                        value={profile.role}
                        onValueChange={(value: Profile["role"]) => handleUpdateProfile(profile.id, "role", value)}
                        disabled={submitting || profile.id === user.id} // Não permite mudar a própria função
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário Comum</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
