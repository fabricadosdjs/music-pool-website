"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { updateProfile } from "@/actions/profile"
import { useRouter } from "next/navigation"
import type { AuthUser } from "@/lib/auth"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [milestoneEmails, setMilestoneEmails] = useState(false)
  const [recommendationEmails, setRecommendationEmails] = useState(false)
  const [freeDownloadEmails, setFreeDownloadEmails] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/") // Redireciona para login se não houver usuário
        return
      }
      setUser(currentUser)
      if (currentUser.profile) {
        setFirstName(currentUser.profile.first_name || "")
        setLastName(currentUser.profile.last_name || "")
        setMarketingEmails(currentUser.profile.marketing_emails || false)
        setMilestoneEmails(currentUser.profile.milestone_emails || false)
        setRecommendationEmails(currentUser.profile.recommendation_emails || false)
        setFreeDownloadEmails(currentUser.profile.free_download_emails || false)
      }
      setLoading(false)
    }
    fetchUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("first_name", firstName)
    formData.append("last_name", lastName)
    formData.append("marketing_emails", marketingEmails ? "on" : "off")
    formData.append("milestone_emails", milestoneEmails ? "on" : "off")
    formData.append("recommendation_emails", recommendationEmails ? "on" : "off")
    formData.append("free_download_emails", freeDownloadEmails ? "on" : "off")

    const result = await updateProfile(formData)

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      })
      // Re-fetch user to update local state with latest profile data
      const updatedUser = await getCurrentUser()
      if (updatedUser) {
        setUser(updatedUser)
      }
    } else {
      toast({
        title: "Erro",
        description: result.message || "Não foi possível atualizar o perfil.",
        variant: "destructive",
      })
    }
    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando perfil...</p>
      </div>
    )
  }

  if (!user || !user.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Erro ao carregar perfil. Por favor, tente novamente.</p>
      </div>
    )
  }

  const { profile } = user

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Meu Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email || ""} disabled />
              </div>
              <div>
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input id="username" type="text" value={profile.username || ""} disabled />
              </div>
              <div>
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-700">Preferências de E-mail</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketingEmails"
                  checked={marketingEmails}
                  onCheckedChange={(checked) => setMarketingEmails(checked as boolean)}
                />
                <Label htmlFor="marketingEmails" className="text-sm">
                  Receber e-mails de marketing ocasionais
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="milestoneEmails"
                  checked={milestoneEmails}
                  onCheckedChange={(checked) => setMilestoneEmails(checked as boolean)}
                />
                <Label htmlFor="milestoneEmails" className="text-sm">
                  Receber e-mails sobre os marcos das minhas músicas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommendationEmails"
                  checked={recommendationEmails}
                  onCheckedChange={(checked) => setRecommendationEmails(checked as boolean)}
                />
                <Label htmlFor="recommendationEmails" className="text-sm">
                  Receber recomendações ocasionais de músicas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="freeDownloadEmails"
                  checked={freeDownloadEmails}
                  onCheckedChange={(checked) => setFreeDownloadEmails(checked as boolean)}
                />
                <Label htmlFor="freeDownloadEmails" className="text-sm">
                  Receber e-mails ocasionais para downloads gratuitos
                </Label>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Informações de Pagamento e Acesso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Status de Pagamento</Label>
                <Input value={profile.is_paid_user ? "Pago" : "Não Pago"} disabled />
              </div>
              <div>
                <Label>Limite de Downloads</Label>
                <Input
                  value={
                    profile.download_limit === "listen_only"
                      ? "Apenas Ouvir"
                      : profile.download_limit === "unlimited"
                        ? "Ilimitado"
                        : profile.download_limit === "100_per_day"
                          ? "100 por dia"
                          : profile.download_limit === "200_per_day"
                            ? "200 por dia"
                            : "Não Definido"
                  }
                  disabled
                />
              </div>
              <div>
                <Label>Próximo Vencimento</Label>
                <Input
                  value={profile.next_due_date ? new Date(profile.next_due_date).toLocaleDateString("pt-BR") : "N/A"}
                  disabled
                />
              </div>
              <div>
                <Label>Função</Label>
                <Input value={profile.role === "admin" ? "Administrador" : "Usuário Comum"} disabled />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente Separator (se não estiver em components/ui)
function Separator() {
  return <div className="h-px bg-gray-200 w-full my-4" />
}
