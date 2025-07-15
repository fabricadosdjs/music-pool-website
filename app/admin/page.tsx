"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { getCurrentUser, type AuthUser } from "@/lib/auth"
import { supabase, type Profile } from "@/lib/supabase"

// Tipos para o limite de download
type DownloadLimit = "100_per_day" | "200_per_day" | "unlimited" | "listen_only"

// Server Action placeholder for updating user status
// You will need to implement this on your server (e.g., in a separate file like actions/user.ts)
// This function should update the 'profiles' table in Supabase
async function updateUserProfile(
  userId: string,
  updates: { is_paid_user?: boolean; download_limit?: DownloadLimit; role?: "user" | "admin" },
) {
  // In a real application, this would be a server action or API route
  // that verifies admin role and updates the Supabase 'profiles' table.
  // For now, this is a client-side mock.
  console.log(`Mock: Updating user ${userId} with:`, updates)
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId)

  if (error) {
    console.error("Error updating user profile:", error.message)
    return { success: false, message: `Failed to update profile: ${error.message}` }
  }

  return { success: true, message: `Perfil do usuário ${userId} atualizado com sucesso.` }
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [filterUsername, setFilterUsername] = useState("")

  const fetchCurrentUser = useCallback(async () => {
    setLoadingUser(true)
    const user = await getCurrentUser()
    setCurrentUser(user)
    setLoadingUser(false)
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true)
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("Erro ao carregar usuários:", error.message)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      })
      setUsers([])
    } else {
      setUsers(data || [])
    }
    setLoadingUsers(false)
  }, [])

  useEffect(() => {
    fetchCurrentUser()
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchCurrentUser()
    })
    return () => {
      authListener.unsubscribe()
    }
  }, [fetchCurrentUser])

  useEffect(() => {
    if (currentUser?.profile?.role === "admin") {
      fetchUsers()
    }
  }, [currentUser, fetchUsers])

  const handlePaidStatusChange = async (userId: string, isPaid: boolean) => {
    const result = await updateUserProfile(userId, { is_paid_user: isPaid })
    if (result.success) {
      toast({ title: "Sucesso!", description: result.message })
      fetchUsers() // Recarregar usuários para refletir a mudança
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" })
    }
  }

  const handleDownloadLimitChange = async (userId: string, limit: DownloadLimit) => {
    const result = await updateUserProfile(userId, { download_limit: limit })
    if (result.success) {
      toast({ title: "Sucesso!", description: result.message })
      fetchUsers()
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" })
    }
  }

  if (loadingUser || loadingUsers) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const isAdmin = currentUser?.profile?.role === "admin"

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

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(filterUsername.toLowerCase()) ||
      user.first_name.toLowerCase().includes(filterUsername.toLowerCase()) ||
      user.last_name.toLowerCase().includes(filterUsername.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Gerenciar Usuários</h1>

        <div className="mb-4">
          <Label htmlFor="user-filter" className="sr-only">
            Filtrar Usuários
          </Label>
          <Input
            id="user-filter"
            type="text"
            placeholder="Filtrar por nome de usuário, nome ou sobrenome..."
            value={filterUsername}
            onChange={(e) => setFilterUsername(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome Completo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Limite Download
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((userProfile) => (
                <tr key={userProfile.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {userProfile.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userProfile.first_name} {userProfile.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Switch
                      checked={userProfile.is_paid_user}
                      onCheckedChange={(checked) => handlePaidStatusChange(userProfile.id, checked)}
                      disabled={userProfile.role === "admin"} // Admins cannot change their own paid status via this UI
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={userProfile.download_limit}
                      onChange={(e) => handleDownloadLimitChange(userProfile.id, e.target.value as DownloadLimit)}
                      className="p-2 border rounded text-sm"
                      disabled={userProfile.role === "admin"} // Admins cannot change their own download limit via this UI
                    >
                      <option value="listen_only">Apenas Ouvir</option>
                      <option value="100_per_day">100/dia</option>
                      <option value="200_per_day">200/dia</option>
                      <option value="unlimited">Ilimitado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userProfile.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Adicione botões de ação adicionais aqui, se necessário */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado.</div>
          )}
        </div>
      </div>
    </div>
  )
}
