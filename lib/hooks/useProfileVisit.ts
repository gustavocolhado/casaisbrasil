import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export const useProfileVisit = (username: string) => {
  const { data: session } = useSession()

  useEffect(() => {
    const registerVisit = async () => {
      if (!session?.user?.id || !username) return

      try {
        await fetch(`/api/users/${username}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        console.error('Erro ao registrar visita:', error)
      }
    }

    // Registrar visita após um pequeno delay para garantir que a página carregou
    const timeoutId = setTimeout(registerVisit, 1000)

    return () => clearTimeout(timeoutId)
  }, [session?.user?.id, username])
} 