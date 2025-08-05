'use client'

import { useEffect, useState } from 'react'
import { Check, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function CardPaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'error'>('pending')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const sessionId = searchParams.get('session_id')
  const stripeSessionId = searchParams.get('session_id')
  const stripePaymentIntent = searchParams.get('payment_intent')
  const displaySessionId = stripeSessionId || sessionId

  useEffect(() => {
    console.log('🔍 CardPaymentSuccessPage - sessionId:', sessionId)
    console.log('🔍 CardPaymentSuccessPage - searchParams:', Object.fromEntries(searchParams.entries()))

    // Verificar se veio do Stripe com parâmetros corretos
    const stripeSessionId = searchParams.get('session_id')
    const stripePaymentIntent = searchParams.get('payment_intent')
    
    if (stripeSessionId) {
      console.log('✅ Session ID do Stripe encontrado:', stripeSessionId)
      // Usar o session_id do Stripe
      const checkPaymentStatus = async () => {
        try {
          console.log('🔍 Verificando status do pagamento para sessionId:', stripeSessionId)
          const response = await fetch(`/api/stripe/status?sessionId=${stripeSessionId}`)
          const data = await response.json()

          console.log('🔍 Resposta da API de status:', data)

          if (response.ok) {
            if (data.status === 'complete') {
              console.log('✅ Pagamento completo')
              setPaymentStatus('success')
            } else if (data.status === 'pending') {
              console.log('⏳ Pagamento pendente')
              setPaymentStatus('pending')
            } else {
              console.log('❌ Pagamento com erro')
              setPaymentStatus('error')
              setErrorMessage(data.error || 'Status de pagamento desconhecido')
            }
          } else {
            console.log('❌ Erro na API de status:', data.error)
            setPaymentStatus('error')
            setErrorMessage(data.error || 'Erro ao verificar status do pagamento')
          }
        } catch (error) {
          console.error('❌ Erro ao verificar status do pagamento:', error)
          setPaymentStatus('error')
          setErrorMessage('Erro de conexão ao verificar pagamento')
        } finally {
          setIsLoading(false)
        }
      }

      checkPaymentStatus()
    } else if (stripePaymentIntent) {
      console.log('✅ Payment Intent do Stripe encontrado:', stripePaymentIntent)
      // Se temos payment_intent mas não session_id, tentar buscar por payment_intent
      setPaymentStatus('pending')
      setIsLoading(false)
    } else if (!sessionId) {
      console.log('❌ CardPaymentSuccessPage - sessionId não encontrado, redirecionando para /premium')
      router.push('/premium')
      return
    } else {
      // Usar o sessionId original (fallback)
      const checkPaymentStatus = async () => {
        try {
          console.log('🔍 Verificando status do pagamento para sessionId:', sessionId)
          const response = await fetch(`/api/stripe/status?sessionId=${sessionId}`)
          const data = await response.json()

          console.log('🔍 Resposta da API de status:', data)

          if (response.ok) {
            if (data.status === 'complete') {
              console.log('✅ Pagamento completo')
              setPaymentStatus('success')
            } else if (data.status === 'pending') {
              console.log('⏳ Pagamento pendente')
              setPaymentStatus('pending')
            } else {
              console.log('❌ Pagamento com erro')
              setPaymentStatus('error')
              setErrorMessage(data.error || 'Status de pagamento desconhecido')
            }
          } else {
            console.log('❌ Erro na API de status:', data.error)
            setPaymentStatus('error')
            setErrorMessage(data.error || 'Erro ao verificar status do pagamento')
          }
        } catch (error) {
          console.error('❌ Erro ao verificar status do pagamento:', error)
          setPaymentStatus('error')
          setErrorMessage('Erro de conexão ao verificar pagamento')
        } finally {
          setIsLoading(false)
        }
      }

      checkPaymentStatus()
    }
  }, [sessionId, router, searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <div className="text-white">Verificando pagamento...</div>
          <div className="text-gray-400 text-sm mt-2">Session ID: {displaySessionId}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gray">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">
          {paymentStatus === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-green-500 rounded-full p-4">
                  <Check className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Pagamento Aprovado!
              </h1>
              <p className="text-gray-300 mb-8">
                Sua assinatura Premium foi ativada com sucesso. Agora você tem acesso a todos os recursos exclusivos.
              </p>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-white font-semibold mb-4">O que você ganhou:</h2>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">Chat privado ilimitado</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">Preferência nas pesquisas</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">Ver quem visitou seu perfil</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">Ver quem curtiu seu perfil</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">Curtidas ilimitadas</span>
                  </div>
                </div>
              </div>

              <Link
                href="/home"
                className="inline-flex items-center space-x-2 bg-pink-500 text-white px-8 py-4 rounded-lg hover:bg-pink-600 transition-colors font-semibold text-lg"
              >
                <span>Começar a usar</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </>
          )}

          {paymentStatus === 'pending' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-yellow-500 rounded-full p-4">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Pagamento em Processamento
              </h1>
              <p className="text-gray-300 mb-8">
                Seu pagamento está sendo processado. Você receberá uma confirmação em breve.
              </p>
              
              <div className="bg-gray-800 rounded-lg p-4 mb-8">
                <p className="text-gray-400 text-sm">
                  <strong>Session ID:</strong> {displaySessionId}
                </p>
              </div>
              
              <Link
                href="/home"
                className="inline-flex items-center space-x-2 bg-gray-600 text-white px-8 py-4 rounded-lg hover:bg-gray-700 transition-colors font-semibold text-lg"
              >
                <span>Voltar ao início</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </>
          )}

          {paymentStatus === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-red-500 rounded-full p-4">
                  <AlertCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Erro no Pagamento
              </h1>
              <p className="text-gray-300 mb-8">
                {errorMessage || 'Houve um problema com seu pagamento. Tente novamente ou entre em contato com o suporte.'}
              </p>
              
              <div className="bg-gray-800 rounded-lg p-4 mb-8">
                <p className="text-gray-400 text-sm">
                  <strong>Session ID:</strong> {displaySessionId}
                </p>
                {errorMessage && (
                  <p className="text-red-400 text-sm mt-2">
                    <strong>Erro:</strong> {errorMessage}
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                <Link
                  href="/premium"
                  className="inline-flex items-center space-x-2 bg-pink-500 text-white px-8 py-4 rounded-lg hover:bg-pink-600 transition-colors font-semibold text-lg"
                >
                  <span>Tentar novamente</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <Link
                  href="/home"
                  className="block text-gray-400 hover:text-white transition-colors mt-4"
                >
                  Voltar ao início
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 