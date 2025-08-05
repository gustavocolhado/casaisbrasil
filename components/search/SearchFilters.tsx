'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Filter, X, MapPin } from 'lucide-react'

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void
  onBack: () => void
  activeFilters?: any
  onClearFilters?: () => void
}

export default function SearchFilters({ onFiltersChange, onBack, activeFilters, onClearFilters }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    userTypes: [] as string[],
    lookingFor: '',
    distance: 'até 50km',
    location: 'São Paulo/SP',
    ageRange: { min: 18, max: 80 },
    lastAccess: 'Nos últimos 30 dias',
    sortBy: 'Recomendados',
    interests: [] as string[],
    fetishes: [] as string[],
    objectives: [] as string[]
  })

  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false)
  const [showLookingForDropdown, setShowLookingForDropdown] = useState(false)
  const [showLastAccessDropdown, setShowLastAccessDropdown] = useState(false)
  const [showSortByDropdown, setShowSortByDropdown] = useState(false)
  const [locationInput, setLocationInput] = useState('')

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Carregar filtros ativos quando o componente é montado
  useEffect(() => {
    if (activeFilters) {
      setFilters({
        userTypes: activeFilters.userTypes || [],
        lookingFor: activeFilters.lookingFor || '',
        distance: activeFilters.distance || 'até 50km',
        location: activeFilters.location || 'São Paulo/SP',
        ageRange: activeFilters.ageRange || { min: 18, max: 80 },
        lastAccess: activeFilters.lastAccess || 'Nos últimos 30 dias',
        sortBy: activeFilters.sortBy || 'Recomendados',
        interests: activeFilters.interests || [],
        fetishes: activeFilters.fetishes || [],
        objectives: activeFilters.objectives || []
      })
    }
  }, [activeFilters])

  // Fechar dropdowns quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDistanceDropdown(false)
        setShowLookingForDropdown(false)
        setShowLastAccessDropdown(false)
        setShowSortByDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const userTypeOptions = [
    { label: 'Casal (Homem/Mulher)', value: 'casal_homem_mulher' },
    { label: 'Casal (2 Mulheres)', value: 'casal_mulheres' },
    { label: 'Casal (2 Homens)', value: 'casal_homens' },
    { label: 'Homem', value: 'homem' },
    { label: 'Mulher', value: 'mulher' },
    { label: 'Transex', value: 'transex' },
    { label: 'Travesti', value: 'travesti' }
  ]

  const lookingForOptions = [
    'Homens',
    'Mulheres',
    'Casais',
    'Todos'
  ]

  const distanceOptions = [
    'até 10km',
    'até 25km',
    'até 50km',
    'até 100km'
  ]

  const lastAccessOptions = [
    'Nos últimos 7 dias',
    'Nos últimos 30 dias',
    'Nos últimos 3 meses',
    'Nos últimos 6 meses'
  ]

  const sortOptions = [
    'Recomendados',
    'Mais recentes',
    'Mais populares'
  ]

  const handleUserTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      userTypes: prev.userTypes.includes(type)
        ? prev.userTypes.filter(t => t !== type)
        : [...prev.userTypes, type]
    }))
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleDistanceSelect = (distance: string) => {
    setFilters(prev => ({
      ...prev,
      distance
    }))
    setShowDistanceDropdown(false)
  }

  const handleLookingForSelect = (lookingFor: string) => {
    setFilters(prev => ({
      ...prev,
      lookingFor
    }))
    setShowLookingForDropdown(false)
  }

  const handleLastAccessSelect = (lastAccess: string) => {
    setFilters(prev => ({
      ...prev,
      lastAccess
    }))
    setShowLastAccessDropdown(false)
  }

  const handleSortBySelect = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy
    }))
    setShowSortByDropdown(false)
  }

  const handleLocationChange = () => {
    if (locationInput.trim()) {
      setFilters(prev => ({
        ...prev,
        location: locationInput.trim()
      }))
    }
    setShowLocationModal(false)
    setLocationInput('')
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      userTypes: [],
      lookingFor: '',
      distance: 'até 50km',
      location: 'São Paulo/SP',
      ageRange: { min: 18, max: 80 },
      lastAccess: 'Nos últimos 30 dias',
      sortBy: 'Recomendados',
      interests: [],
      fetishes: [],
      objectives: []
    }
    setFilters(clearedFilters)
    
    // Chamar a função de limpar filtros do componente pai se fornecida
    if (onClearFilters) {
      onClearFilters()
    }
  }

  const handleApplyFilters = () => {
    onFiltersChange(filters)
  }

  return (
    <>
      <div className="bg-gray-800 p-6 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-white">Filtrar perfis</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Filtrar
            </button>
          </div>
        </div>

        {/* Buscar por */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Buscar por</h3>
          <div className="flex flex-wrap gap-2">
            {userTypeOptions.map((type) => (
              <button
                key={type.value}
                onClick={() => handleUserTypeToggle(type.value)}
                className={`
                  px-3 py-1 rounded-full text-sm transition-colors
                  ${filters.userTypes.includes(type.value)
                    ? 'bg-white text-gray-800'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Que buscam por */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Que buscam por</h3>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowLookingForDropdown(!showLookingForDropdown)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 text-left flex items-center justify-between"
            >
              <span>{filters.lookingFor || 'Selecione...'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showLookingForDropdown && (
              <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg mt-1 z-10">
                {lookingForOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleLookingForSelect(option)}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-600 transition-colors
                      ${filters.lookingFor === option ? 'bg-blue-500 text-white' : 'text-gray-300'}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Com distância de até */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Com distância de até</h3>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDistanceDropdown(!showDistanceDropdown)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 text-left flex items-center justify-between"
            >
              <span>{filters.distance}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDistanceDropdown && (
              <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg mt-1 z-10">
                {distanceOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleDistanceSelect(option)}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-600 transition-colors
                      ${filters.distance === option ? 'bg-blue-500 text-white' : 'text-gray-300'}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <p className="text-gray-400 text-sm mt-2">
            de {filters.location} 
            <button 
              onClick={() => setShowLocationModal(true)}
              className="text-blue-400 hover:underline ml-1"
            >
              alterar
            </button>
          </p>
        </div>

        {/* Com idade entre */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Com idade entre</h3>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={filters.ageRange.min}
              onChange={(e) => handleFilterChange('ageRange', { ...filters.ageRange, min: parseInt(e.target.value) || 18 })}
              className="w-20 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500"
            />
            <span className="text-gray-400">e</span>
            <input
              type="number"
              value={filters.ageRange.max}
              onChange={(e) => handleFilterChange('ageRange', { ...filters.ageRange, max: parseInt(e.target.value) || 80 })}
              className="w-20 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500"
            />
            <span className="text-gray-400">anos</span>
          </div>
        </div>

        {/* Com acesso feito */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Com acesso feito</h3>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowLastAccessDropdown(!showLastAccessDropdown)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 text-left flex items-center justify-between"
            >
              <span>{filters.lastAccess}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showLastAccessDropdown && (
              <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg mt-1 z-10">
                {lastAccessOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleLastAccessSelect(option)}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-600 transition-colors
                      ${filters.lastAccess === option ? 'bg-blue-500 text-white' : 'text-gray-300'}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ordenar por */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Ordenar por</h3>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSortByDropdown(!showSortByDropdown)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 text-left flex items-center justify-between"
            >
              <span>{filters.sortBy}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSortByDropdown && (
              <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg mt-1 z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSortBySelect(option)}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-600 transition-colors
                      ${filters.sortBy === option ? 'bg-blue-500 text-white' : 'text-gray-300'}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Localização */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Pesquisar local</h2>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Digite a cidade/estado"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 mb-4"
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={handleLocationChange}
                className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Alterar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 