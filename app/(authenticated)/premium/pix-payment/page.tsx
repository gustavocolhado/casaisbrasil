'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Copy, Check, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { plans, getDefaultPlan } from '@/lib/plans'

// Função para gerar QR Code a partir de uma string
function generateQRCodeURL(text: string): string {
  const qrCodeAPI = 'https://api.qrserver.com/v1/create-qr-code/'
  const params = new URLSearchParams({
    size: '200x200',
    data: text,
    format: 'png'
  })
  return `${qrCodeAPI}?${params.toString()}`
}

interface PaymentStatus {
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  message: string
}

export default function PixPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'pending',
    message: 'Aguardando pagamento...'
  })
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutos em segundos

  const paymentId = searchParams.get('paymentId')
  const qrCodeUrl = searchParams.get('qrCode')

  useEffect(() => {
    if (!paymentId || !qrCodeUrl) {
      router.push('/premium')
      return
    }

    // Timer para expiração do PIX
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentStatus({
            status: 'cancelled',
            message: 'Tempo expirado. Gere um novo PIX.'
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Verificar status do pagamento a cada 5 segundos
    const statusCheck = setInterval(async () => {
      try {
        const response = await fetch(`/api/mercado-pago/status?paymentId=${paymentId}`)
        const data = await response.json()

        if (response.ok && data.status) {
          if (data.status === 'approved') {
            setPaymentStatus({
              status: 'approved',
              message: 'Pagamento aprovado! Redirecionando...'
            })
            clearInterval(statusCheck)
            clearInterval(timer)
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
              router.push('/home?payment=success')
            }, 2000)
          } else if (data.status === 'rejected' || data.status === 'cancelled') {
            setPaymentStatus({
              status: 'rejected',
              message: 'Pagamento rejeitado ou cancelado.'
            })
            clearInterval(statusCheck)
            clearInterval(timer)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error)
      }
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(statusCheck)
    }
  }, [paymentId, qrCodeUrl, router])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const copyPixCode = async () => {
    try {
      // Copiar o código PIX diretamente
      await navigator.clipboard.writeText(qrCodeUrl || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar código PIX:', error)
    }
  }

  const generateNewPix = async () => {
    try {
      // Buscar informações do plano atual
      const currentPlan = getDefaultPlan()
      
      const response = await fetch('/api/mercado-pago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          amount: currentPlan.amount,
          payerEmail: session?.user?.email,
          paymentType: currentPlan.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/premium/pix-payment?paymentId=${data.paymentId}&qrCode=${encodeURIComponent(data.qrCodeUrl)}`)
      }
    } catch (error) {
      console.error('Erro ao gerar novo PIX:', error)
    }
  }

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'approved':
        return <Check className="w-8 h-8 text-green-500" />
      case 'rejected':
      case 'cancelled':
        return <AlertCircle className="w-8 h-8 text-red-500" />
      default:
        return <Clock className="w-8 h-8 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'approved':
        return 'text-green-500'
      case 'rejected':
      case 'cancelled':
        return 'text-red-500'
      default:
        return 'text-yellow-500'
    }
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
              <h1 className="text-2xl font-bold text-white">Pagamento PIX</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Status do pagamento */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h2 className={`text-xl font-semibold mb-2 ${getStatusColor()}`}>
            {paymentStatus.message}
          </h2>
          {paymentStatus.status === 'pending' && (
            <p className="text-gray-400">
              Tempo restante: {formatTime(timeLeft)}
            </p>
          )}
        </div>

        {/* QR Code */}
        {paymentStatus.status === 'pending' && qrCodeUrl && (
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-6">
            <div className="text-center">
              <h3 className="text-white font-semibold mb-4">Escaneie o QR Code</h3>
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg">
                  <Image
                    src={generateQRCodeURL(qrCodeUrl)}
                    alt="QR Code PIX"
                    width={200}
                    height={200}
                    className="w-48 h-48"
                    unoptimized
                  />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Use o app do seu banco para escanear o QR Code
              </p>
              
              {/* Botão para copiar código PIX */}
              <button
                onClick={copyPixCode}
                className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors mx-auto"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Código copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar código PIX</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Instruções */}
        {paymentStatus.status === 'pending' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <h3 className="text-white font-semibold mb-4">Como pagar:</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>Abra o app do seu banco</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                  2
                </span>
                <p>Escaneie o QR Code ou cole o código PIX</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                  3
                </span>
                <p>Confirme o pagamento</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                  4
                </span>
                <p>Sua assinatura será ativada automaticamente</p>
              </div>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="text-center space-y-4">
          {paymentStatus.status === 'cancelled' && (
            <button
              onClick={generateNewPix}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-semibold"
            >
              Gerar novo PIX
            </button>
          )}
          
          <Link
            href="/premium"
            className="block text-gray-400 hover:text-white transition-colors"
          >
            Voltar para planos
          </Link>
        </div>
      </div>
    </div>
  )
} 