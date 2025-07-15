import { Shield } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12 bg-gray-50 rounded-lg w-full max-w-md">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Página de Administração</h1>
        <p className="text-gray-600">
          Esta é a página de administração. O conteúdo real será exibido apenas para usuários com permissões de
          administrador.
        </p>
      </div>
    </div>
  )
}
