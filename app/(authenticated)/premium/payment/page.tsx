'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, CreditCard, QrCode, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { plans, Plan } from '@/lib/plans'

// Carregar o Stripe com a chave pública
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51PxIJgE3svUHC7YVZDksFn7AHcDwaELIl2eiNiI2mgAByBvn5EfHtugxhwQgzcP7mc3bHWD3Pndd5FVqlQ4BYW1u008dgFbK6j')

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const planId = searchParams.get('plan')
  const sessionId = searchParams.get('sessionId')

  const selectedPlan = plans.find(p => p.id === planId)

  const paymentMethods = [
    {
      id: 'pix',
      name: 'PIX',
      icon: QrCode,
      description: 'Simples, rápido e seguro. Sua assinatura será confirmada imediatamente.',
      recommended: true
    },
    {
      id: 'card',
      name: 'Cartão de crédito',
      icon: CreditCard,
      description: 'Rápido e seguro. Na sua fatura irá aparecer "ATAM INF. LTDA"',
      recommended: false
    }
  ]

  useEffect(() => {
    if (!planId || !selectedPlan) {
      router.push('/premium')
    }
  }, [planId, selectedPlan, router])

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
    setError(null)
  }

  const handlePayment = async () => {
    if (!selectedMethod || !selectedPlan || !session?.user?.id) {
      setError('Selecione um método de pagamento')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (selectedMethod === 'pix') {
        // Usar API do Mercado Pago para PIX
        const response = await fetch('/api/mercado-pago', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            amount: selectedPlan.amount,
            payerEmail: session.user.email,
            paymentType: selectedPlan.id,
            sessionId: sessionId
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao processar pagamento PIX')
        }

        // Redirecionar para página de PIX com QR Code
        router.push(`/premium/pix-payment?paymentId=${data.paymentId}&qrCode=${encodeURIComponent(data.qrCodeUrl)}`)
      } else if (selectedMethod === 'card') {
        // Usar API do Stripe para cartão de crédito
        const response = await fetch('/api/stripe/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            amount: Math.round(selectedPlan.amount * 100), // Converter para centavos
            payerEmail: session.user.email,
            paymentType: selectedPlan.id,
            sessionId: sessionId
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          console.error('❌ Erro na API do Stripe:', data)
          if (data.error?.includes('Configuração do Stripe não encontrada')) {
            throw new Error('Configuração do Stripe não encontrada. Verifique as variáveis de ambiente.')
          } else if (data.error?.includes('URL do host não configurada')) {
            throw new Error('URL do host não configurada. Verifique a variável HOST_URL.')
          } else {
            throw new Error(data.error || 'Erro ao processar pagamento com cartão')
          }
        }

        // Redirecionar para checkout do Stripe usando a biblioteca
        if (data.sessionId) {
          console.log('✅ Redirecionando para checkout do Stripe:', data.sessionId)
          
          const stripe = await stripePromise
          if (!stripe) {
            throw new Error('Erro ao carregar o Stripe')
          }
          
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId
          })
          
          if (error) {
            console.error('❌ Erro ao redirecionar para checkout:', error)
            throw new Error(error.message)
          }
        } else {
          throw new Error('SessionId não recebido do servidor')
        }
      }
    } catch (error) {
      console.error('Erro no pagamento:', error)
      setError(error instanceof Error ? error.message : 'Erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gray">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/premium"
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Torne-se um D4 Premium</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Plano selecionado */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">{selectedPlan.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-2xl font-bold text-pink-500">{selectedPlan.price}</span>
                  <span className="text-gray-400">{selectedPlan.period}</span>
                </div>
                {selectedPlan.savings && (
                  <p className="text-green-400 text-sm mt-1">{selectedPlan.savings}</p>
                )}
              </div>
              <button 
                onClick={() => router.push('/premium')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                ALTERAR
              </button>
            </div>
          </div>
        </div>

        {/* Métodos de pagamento */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Escolha a forma de pagamento:</h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => handlePaymentMethodSelect(method.id)}
                className={`bg-gray-800 rounded-lg p-4 border-2 cursor-pointer transition-all hover:border-pink-500 ${
                  selectedMethod === method.id ? 'border-pink-500 bg-gray-750' : 'border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <method.icon className="w-8 h-8 text-gray-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold">{method.name}</span>
                        {method.recommended && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            RECOMENDADO
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{method.description}</p>
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <Check className="w-6 h-6 text-pink-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Botão de pagamento */}
        <div className="text-center">
          <button
            onClick={handlePayment}
            disabled={!selectedMethod || isLoading}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
              selectedMethod && !isLoading
                ? 'bg-pink-500 text-white hover:bg-pink-600'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Processando...' : 'Continuar com pagamento'}
          </button>
          <p className="text-gray-400 text-sm mt-2">
            Cancelamento a qualquer momento
          </p>
        </div>
      </div>
    </div>
  )
} 