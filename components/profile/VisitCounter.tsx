import { Eye } from 'lucide-react'
import Link from 'next/link'

interface VisitCounterProps {
  count: number
  username: string
}

export default function VisitCounter({ count, username }: VisitCounterProps) {
  return (
    <Link
      href="/visits"
      className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
    >
      <Eye className="w-4 h-4" />
      <span className="text-sm">
        {count} {count === 1 ? 'visita' : 'visitas'}
      </span>
    </Link>
  )
} 