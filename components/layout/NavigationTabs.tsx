'use client'

interface NavigationTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  variant?: 'desktop' | 'mobile'
}

export default function NavigationTabs({ activeTab, setActiveTab, variant = 'desktop' }: NavigationTabsProps) {
  const tabs = ['Seguindo', 'Para você', 'Todos']
  
  const containerClass = variant === 'mobile' 
    ? 'bg-darker-gray px-4 py-2 border-b border-gray-700'
    : ''

  const handleTabClick = (tab: string) => {
    // Remover acentos e espaços, converter para minúsculas
    const tabId = tab.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/\s+/g, '') // Remove espaços
    console.log('🔍 NavigationTabs - Clique na aba:', tab, 'tabId:', tabId)
    setActiveTab(tabId)
  }

  return (
    <div className={containerClass}>
      <div className="flex space-x-8 justify-between items-center">
        {tabs.map((tab) => {
          const tabId = tab.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/\s+/g, '') // Remove espaços
          
          return (
            <button
              key={tab}
              className={`flex pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tabId
                  ? 'border-white text-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          )
        })}
      </div>
    </div>
  )
} 