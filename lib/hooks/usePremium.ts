import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function usePremium() {
  const { data: session, status } = useSession()
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkPremiumStatus = async () => {
      // Aguardar a sessão estar carregada
      if (status === 'loading') {
        return
      }

      if (!session?.user?.id) {
        console.log('Nenhuma sessão encontrada, definindo premium como false')
        setIsPremium(false)
        setLoading(false)
        return
      }

      try {
        console.log('Verificando status premium para usuário:', session.user.id)
        const response = await fetch('/api/user/premium-status')
        if (response.ok) {
          const data = await response.json()
          console.log('Status premium verificado:', data.isPremium)
          setIsPremium(data.isPremium)
        } else {
          console.log('Erro na resposta da API premium:', response.status)
          setIsPremium(false)
        }
      } catch (error) {
        console.error('Erro ao verificar status premium:', error)
        setIsPremium(false)
      } finally {
        setLoading(false)
      }
    }

    checkPremiumStatus()
  }, [session?.user?.id, status])

  return { isPremium, loading }
} 