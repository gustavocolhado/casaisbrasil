'use client'

import { ArrowLeft, Check, ArrowRight, Crown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { plans } from '@/lib/plans'

export default function PremiumPage() {
  const router = useRouter()

  const whySubscribe = [
    'Usuários assinantes têm mais credibilidade',
    'Você contribui com a melhoria do serviço',
    'Você tem acesso a recursos exclusivos',
  ]

  const advantages = [
    {
      title: 'Chat privado',
      description: 'Inicie um bate-papo privado com quem você quiser.',
    },
    {
      title: 'Preferência nas pesquisas',
      description: 'Assinantes aparecem antes dos não-assinantes em todas as pesquisas, recebendo mais visitas.',
    },
    {
      title: 'Veja todos que visitaram o seu perfil',
      description: 'Acompanhe quem visitou seu perfil.',
    },
    {
      title: 'Veja todos que curtiram o seu perfil',
      description: 'Descubra quem curtiu seu perfil.',
    },
    {
      title: 'Veja todas as recomendações que você recebeu',
      description: 'Visualize todas as recomendações recebidas.',
    },
    {
      title: 'Curta perfis de forma ilimitada',
      description: 'Sem limites para curtir perfis.',
    },
    {
      title: 'Visualize quantas fotos desejar',
      description: 'Acesso ilimitado a fotos dos perfis.',
    },
  ]

  const handlePlanSelect = async (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    try {
      // Criar sessão de pagamento
      const response = await fetch('/api/payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planId,
          amount: plan.amount
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/premium/payment?plan=${planId}&sessionId=${data.sessionId}`)
      } else {
        console.error('Erro ao criar sessão de pagamento:', data.error)
      }
    } catch (error) {
      console.error('Erro ao criar sessão de pagamento:', error)
    }
  }

  return (
    <div className="min-h-screen bg-dark-gray">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/home"
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-pink-500" />
              <h1 className="text-2xl font-bold text-white">Torne-se Premium</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Planos */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Escolha seu plano</h2>
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700 cursor-pointer transition-all hover:border-pink-500 hover:bg-gray-750"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold">{plan.name}</span>
                        {plan.originalPrice && (
                          <span className="text-gray-400 line-through text-sm">
                            {plan.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-2xl font-bold text-pink-500">{plan.price}</span>
                      <span className="text-gray-400">{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <p className="text-green-400 text-sm mt-1">{plan.savings}</p>
                    )}
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por que assinar */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Por que assinar?</h2>
          <div className="space-y-3">
            {whySubscribe.map((reason, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-300">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vantagens */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Vantagens para assinantes:</h2>
          <div className="space-y-4">
            {advantages.map((advantage, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">{advantage.title}</h3>
                    <p className="text-gray-400 text-sm">{advantage.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informação sobre cancelamento */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Cancelamento a qualquer momento
          </p>
        </div>
      </div>
    </div>
  )
} 