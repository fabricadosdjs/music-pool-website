"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Shield, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { updateUserPaidStatus } from "@/actions/admin" // Importa a nova ação de servidor
import { useActionState } from "react" // Hook para usar Server Actions em Client Components

export default function AdminPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const [targetUserId, setTargetUserId] = useState("")
  const [isPaid, setIsPaid] = useState(false)

  // Usa useActionState para gerenciar o estado da submissão do formulário com a Server Action
  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const userId = formData.get("userId") as string
    // O valor do Switch é 'on' se estiver marcado, caso contrário, não é enviado no formData
    const paidStatus = formData.get("isPaid") === "on"

    if (!userId) {
      toast({
        title: "Erro",
        description: "ID do usuário é obrigatório.",
        variant: "destructive",
      })
      return { success: false, message: "ID do usuário é obrigatório." }
    }

    const result = await updateUserPaidStatus(userId, paidStatus)
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      })
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      })
    }
    return result
  }, null) // O estado inicial é null

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Verifica se o usuário atual é um administrador
  const isAdmin = isSignedIn && user?.publicMetadata?.role === "admin"

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 bg-gray-50 rounded-lg w-full max-w-md">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Gerenciar Permissões de Usuário</h1>
        <form action={formAction} className="space-y-6">
          <div>
            <Label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              ID do Usuário Clerk
            </Label>
            <Input
              id="userId"
              name="userId"
              type="text"
              placeholder="user_2aBcDeF1gH..."
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Você pode encontrar o ID do usuário no painel do Clerk (clerk.com/dashboard).
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isPaid" className="text-sm font-medium text-gray-700">
              Usuário Pago (Acesso a Downloads)
            </Label>
            <Switch
              id="isPaid"
              name="isPaid"
              checked={isPaid}
              onCheckedChange={setIsPaid}
              disabled={isPending} // Desabilita o switch enquanto a ação está pendente
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Atualizando..." : "Atualizar Status"}
          </Button>
        </form>

        {state && state.success && (
          <div className="mt-6 flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>{state.message}</span>
          </div>
        )}
        {state && !state.success && (
          <div className="mt-6 flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span>{state.message}</span>
          </div>
        )}
      </div>
    </div>
  )
}
