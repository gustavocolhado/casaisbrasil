export interface Plan {
  id: string
  name: string
  price: string
  period: string
  originalPrice: string | null
  savings: string | null
  amount: number
}

export const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Mensal',
    price: 'R$ 9,90',
    period: '/ mês',
    originalPrice: null,
    savings: null,
    amount: 9.90
  },
  {
    id: 'quarterly',
    name: '3 Meses',
    price: 'R$ 19,90',
    period: '/ 3 meses',
    originalPrice: 'R$ 29,70',
    savings: 'Equivalente à R$ 6,63 mensais',
    amount: 19.90
  },
  {
    id: 'semiannual',
    name: '6 Meses',
    price: 'R$ 39,90',
    period: '/ 6 meses',
    originalPrice: 'R$ 59,40',
    savings: 'Equivalente à R$ 6,65 mensais',
    amount: 39.90
  },
]

export function getPlanById(id: string): Plan | undefined {
  return plans.find(plan => plan.id === id)
}

export function getDefaultPlan(): Plan {
  return plans[0] // Plano mensal como padrão
} 