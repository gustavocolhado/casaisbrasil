'use client'

interface ProfileTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  photosCount?: number
}

export default function ProfileTabs({ activeTab, setActiveTab, photosCount = 0 }: ProfileTabsProps) {
  const tabs = [
    { id: 'main', label: 'Principal' },
    { id: 'photos', label: 'Fotos', badge: photosCount }
  ]

  return (
    <div className="border-b border-gray-700">
      <div className="flex px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center pb-3 px-4 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id 
                ? 'border-white text-white' 
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <div className="ml-2 bg-gray-600 text-white text-xs rounded-full px-2 py-1">
                {tab.badge}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
} 