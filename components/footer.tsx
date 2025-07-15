import Link from "next/link"
import { Music } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coluna 1: Logo e Descrição */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/" className="flex items-center mb-4">
            <Music className="w-8 h-8 text-blue-500 mr-3" />
            <span className="text-2xl font-bold text-white">
              Music Pools <span className="text-blue-500">by Nexor Records</span>
            </span>
          </Link>
          <p className="text-sm text-gray-400 max-w-xs">
            Sua fonte definitiva para os melhores lançamentos e remixes, direto para seus sets.
          </p>
        </div>

        {/* Coluna 2: Links Rápidos */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-lg font-semibold text-white mb-4">Links Rápidos</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-gray-400 hover:text-blue-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/new" className="text-gray-400 hover:text-blue-400 transition-colors">
                Novos Lançamentos
              </Link>
            </li>
            <li>
              <Link href="/trending" className="text-gray-400 hover:text-blue-400 transition-colors">
                Em Alta
              </Link>
            </li>
            <li>
              <Link href="/charts" className="text-gray-400 hover:text-blue-400 transition-colors">
                Charts
              </Link>
            </li>
          </ul>
        </div>

        {/* Coluna 3: Políticas e Contato */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-lg font-semibold text-white mb-4">Informações</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/privacy-policy" className="text-gray-400 hover:text-blue-400 transition-colors">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link href="/content-policy" className="text-gray-400 hover:text-blue-400 transition-colors">
                Política de Conteúdo
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Contato
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <Separator className="my-8 bg-gray-700" />

      <div className="text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Music Pools by Nexor Records. Todos os direitos reservados.
      </div>
    </footer>
  )
}
