'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Head from 'next/head'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage(data.message || 'E-mail enviado com sucesso!')
      } else {
        setError(data.error || 'Erro ao enviar e-mail de recuperação')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isEmailValid = email && validateEmail(email)

  return (
    <>
      <Head>
        <title>Recuperar Senha - Confissões de Corno</title>
        <meta name="description" content="Recupere sua senha da conta Confissões de Corno de forma segura e rápida." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: 'url(/bg.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link 
              href="/login"
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o login
            </Link>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="w-8 h-8 text-pink-500 fill-current" />
              <span className="text-white font-bold text-2xl">Confissões</span>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              Recuperar Senha
            </h1>
            <p className="text-gray-400">
              Digite seu e-mail para receber um link de recuperação
            </p>
          </div>

          {/* Form */}
          <div className="glass rounded-xl p-8">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isEmailValid || isLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed hover-lift"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Enviar E-mail</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    E-mail Enviado!
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {message}
                  </p>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">📧 O que fazer agora?</h4>
                  <ul className="text-blue-300 text-sm space-y-1 text-left">
                    <li>• Verifique sua caixa de entrada</li>
                    <li>• Clique no link de recuperação</li>
                    <li>• Defina uma nova senha</li>
                    <li>• Faça login com a nova senha</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="block w-full bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Voltar para o Login
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsSuccess(false)
                      setEmail('')
                      setMessage('')
                    }}
                    className="block w-full bg-transparent border border-gray-600 text-gray-300 font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Enviar Novamente
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-pink-400 hover:text-pink-300 transition-colors">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 