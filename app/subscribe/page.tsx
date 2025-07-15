import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Escolha seu Plano de Assinatura</h1>
        <p className="text-lg text-gray-600">
          Desbloqueie downloads ilimitados, acesso exclusivo a novos lançamentos e muito mais!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Plano Básico */}
        <Card className="flex flex-col justify-between border-2 border-gray-200 hover:border-blue-500 transition-colors duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center">Básico</CardTitle>
            <CardDescription className="text-center text-gray-500">Perfeito para iniciantes</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="text-5xl font-extrabold text-gray-900 mb-2">
              R$29<span className="text-xl font-medium text-gray-600">/mês</span>
            </div>
            <ul className="text-left text-gray-700 space-y-2 mt-4">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Acesso a 100 downloads/mês</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Músicas em MP3 (128kbps)</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Suporte por e-mail</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Button className="w-full">Assinar Básico</Button>
          </CardFooter>
        </Card>

        {/* Plano Premium */}
        <Card className="flex flex-col justify-between border-2 border-blue-500 shadow-lg scale-105">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center text-blue-600">Premium</CardTitle>
            <CardDescription className="text-center text-gray-500">Para DJs e produtores sérios</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="text-5xl font-extrabold text-gray-900 mb-2">
              R$79<span className="text-xl font-medium text-gray-600">/mês</span>
            </div>
            <ul className="text-left text-gray-700 space-y-2 mt-4">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Downloads ilimitados</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Músicas em FLAC/WAV (alta qualidade)</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Acesso antecipado a lançamentos</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Suporte prioritário</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Assinar Premium</Button>
          </CardFooter>
        </Card>

        {/* Plano Profissional */}
        <Card className="flex flex-col justify-between border-2 border-gray-200 hover:border-blue-500 transition-colors duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center">Profissional</CardTitle>
            <CardDescription className="text-center text-gray-500">Para estúdios e gravadoras</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="text-5xl font-extrabold text-gray-900 mb-2">
              R$199<span className="text-xl font-medium text-gray-600">/mês</span>
            </div>
            <ul className="text-left text-gray-700 space-y-2 mt-4">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Todos os benefícios do Premium</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Licenciamento comercial</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Gerenciamento de equipe</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Consultoria exclusiva</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Button className="w-full">Assinar Profissional</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 text-center text-gray-600">
        <p>
          Dúvidas?{" "}
          <Link href="#" className="text-blue-600 hover:underline">
            Entre em contato
          </Link>
        </p>
      </div>
    </div>
  )
}
