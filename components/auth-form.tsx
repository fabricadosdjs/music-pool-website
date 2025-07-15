"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInWithEmailAndPassword } from "@/lib/auth" // Removido verifyOtp
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

interface AuthFormProps {
  onSuccess: () => void
  onClose: () => void
}

export function AuthForm({ onSuccess, onClose }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await signInWithEmailAndPassword(email, password)
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Login realizado com sucesso.",
      })
      onSuccess()
    } else {
      toast({
        title: "Erro no Login",
        description: result.message || "Credenciais inválidas.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Entrar</h2>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Carregando..." : "Entrar"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button variant="link" asChild disabled={loading}>
            <Link href="/signup" onClick={onClose}>
              Não tem uma conta? Crie uma!
            </Link>
          </Button>
          <Button variant="link" onClick={onClose} disabled={loading}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
