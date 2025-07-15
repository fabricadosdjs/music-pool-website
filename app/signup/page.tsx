"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUpWithEmailAndPassword, checkUsernameExists } from "@/lib/auth" // Removido verifyOtp
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)

  // Email preferences
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [milestoneEmails, setMilestoneEmails] = useState(false)
  const [recommendationEmails, setRecommendationEmails] = useState(false)
  const [freeDownloadEmails, setFreeDownloadEmails] = useState(false)

  const handleUsernameChange = useCallback(async (value: string) => {
    setUsername(value)
    if (value.length >= 3) {
      setLoading(true)
      const exists = await checkUsernameExists(value)
      if (exists) {
        setUsernameError("Nome de usuário já existe.")
      } else {
        setUsernameError(null)
      }
      setLoading(false)
    } else {
      setUsernameError(null)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (usernameError) {
      setLoading(false)
      return
    }
    const result = await signUpWithEmailAndPassword({
      email,
      password,
      username,
      first_name: firstName,
      last_name: lastName,
      marketing_emails: marketingEmails,
      milestone_emails: milestoneEmails,
      recommendation_emails: recommendationEmails,
      free_download_emails: freeDownloadEmails,
    })
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Conta criada com sucesso! Você já está logado.",
      })
      router.push("/") // Redireciona para a página inicial após o sucesso
    } else {
      toast({
        title: "Erro ao Criar Conta",
        description: result.message || "Não foi possível criar a conta.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Criar Conta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="username">Nome de Usuário (ex: seu Instagram)</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              required
            />
            {usernameError && <p className="text-red-500 text-xs mt-1">{usernameError}</p>}
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
            <Input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Preferências de E-mail (Opcional)</h3>
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
          <Button type="submit" className="w-full" disabled={loading || !!usernameError}>
            {loading ? "Carregando..." : "Criar Conta"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button variant="link" asChild disabled={loading}>
            <Link href="/">Já tem uma conta? Faça login!</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
