'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Camera, Save, X, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface EditProfilePageProps {
  params: Promise<{ username: string }>
}

interface UserData {
  username: string
  name: string | null
  bio: string | null
  age: number | null
  city: string | null
  state: string | null
  instagram: string | null
  privacy: string | null
  twitter: string | null
  onlyfans: string | null
  buupe: string | null
  sexlog: string | null
  role: string | null
  image: string | null
  banner1: string | null
  banner2: string | null
  interests: string[]
  objectives: string[]
  fetishes: string[]
  coupleDetails?: {
    him?: any
    her?: any
  }
  personDetails?: any
}

const ROLES = [
  { value: 'homem', label: 'Homem' },
  { value: 'mulher', label: 'Mulher' },
  { value: 'transex', label: 'Transex' },
  { value: 'travesti', label: 'Travesti' },
  { value: 'casal_homem_mulher', label: 'Casal (Homem + Mulher)' },
  { value: 'casal_homens', label: 'Casal (Homens)' },
  { value: 'casal_mulheres', label: 'Casal (Mulheres)' }
]

const INTERESTS = [
  'Amizade', 'Relacionamento', 'Sexo casual', 'Casamento', 'Poliamor',
  'BDSM', 'Fetiches', 'Roleplay', 'Exibicionismo', 'Voyeurismo',
  'Swing', 'Trocas', 'Fantasias', 'Experiências', 'Aventuras'
]

const OBJECTIVES = [
  'Conhecer pessoas', 'Encontrar amor', 'Sexo casual', 'Relacionamento sério',
  'Amizade colorida', 'Casamento', 'Poliamor', 'Experiências novas'
]

const FETISHES = [
  'BDSM', 'Roleplay', 'Exibicionismo', 'Voyeurismo', 'Fantasias',
  'Fetiches de pés', 'Fetiches de roupa', 'Fetiches de cheiro',
  'Fetiches de som', 'Fetiches visuais', 'Outros'
]

const SEXUAL_ORIENTATIONS = [
  'Heterossexual', 'Homossexual', 'Bissexual', 'Pansexual', 'Assexuado'
]

const MARITAL_STATUS = [
  'Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'Em relacionamento'
]

const ZODIAC_SIGNS = [
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
]

const ETHNICITIES = [
  'Branco', 'Negro', 'Pardo', 'Amarelo', 'Indígena', 'Outro'
]

const HAIR_COLORS = [
  'Preto', 'Castanho', 'Loiro', 'Ruivo', 'Grisalho', 'Outro'
]

const EYE_COLORS = [
  'Castanho', 'Azul', 'Verde', 'Cinza', 'Preto', 'Outro'
]

const BODY_TYPES = [
  'Magro', 'Atlético', 'Mediano', 'Gordo', 'Musculoso', 'Outro'
]

export default function EditProfilePage({ params }: EditProfilePageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [username, setUsername] = useState('')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: '',
    age: '',
    city: '',
    state: '',
    instagram: '',
    twitter: '',
    privacy: '',
    sexlog: '',
    buupe: '',
    onlyfans: '',
    role: '',
    interests: [] as string[],
    objectives: [] as string[],
    fetishes: [] as string[]
  })

  // PersonDetails data (para pessoas individuais)
  const [personDetails, setPersonDetails] = useState({
    name: '',
    age: '',
    sexualOrientation: '',
    profession: '',
    maritalStatus: '',
    zodiacSign: '',
    ethnicity: '',
    hair: '',
    eyes: '',
    height: '',
    bodyType: '',
    smokes: false,
    drinks: false
  })

  // CoupleDetails data (para casais)
  const [coupleDetails, setCoupleDetails] = useState({
    him: {
      name: '',
      age: '',
      sexualOrientation: '',
      profession: '',
      maritalStatus: '',
      zodiacSign: '',
      ethnicity: '',
      hair: '',
      eyes: '',
      height: '',
      bodyType: '',
      smokes: false,
      drinks: false
    },
    her: {
      name: '',
      age: '',
      sexualOrientation: '',
      profession: '',
      maritalStatus: '',
      zodiacSign: '',
      ethnicity: '',
      hair: '',
      eyes: '',
      height: '',
      bodyType: '',
      smokes: false,
      drinks: false
    }
  })

  // Image upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  // Banner uploads
  const [selectedBanner1, setSelectedBanner1] = useState<File | null>(null)
  const [banner1Preview, setBanner1Preview] = useState('')
  const [selectedBanner2, setSelectedBanner2] = useState<File | null>(null)
  const [banner2Preview, setBanner2Preview] = useState('')

  useEffect(() => {
    const getParams = async () => {
      const { username: user } = await params
      setUsername(user)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (username && session?.user?.username === username) {
      fetchUserData()
    }
  }, [username, session])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/edit-profile/${username}`)
      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
        
        // Preencher formulário com dados existentes
        setFormData({
          username: data.user.username || '',
          name: data.user.name || '',
          bio: data.user.bio || '',
          age: data.user.age?.toString() || '',
          city: data.user.city || '',
          state: data.user.state || '',
          instagram: data.user.instagram || '',
          twitter: data.user.twitter || '',
          privacy: data.user.privacy || '',
          sexlog: data.user.sexlog || '',
          buupe: data.user.buupe || '',
          onlyfans: data.user.onlyfans || '',
          role: data.user.role || '',
          interests: data.user.interests || [],
          objectives: data.user.objectives || [],
          fetishes: data.user.fetishes || []
        })
        
        // Preencher PersonDetails se existir
        if (data.user.personDetails) {
          setPersonDetails({
            name: data.user.personDetails.name || '',
            age: data.user.personDetails.age?.toString() || '',
            sexualOrientation: data.user.personDetails.sexualOrientation || '',
            profession: data.user.personDetails.profession || '',
            maritalStatus: data.user.personDetails.maritalStatus || '',
            zodiacSign: data.user.personDetails.zodiacSign || '',
            ethnicity: data.user.personDetails.ethnicity || '',
            hair: data.user.personDetails.hair || '',
            eyes: data.user.personDetails.eyes || '',
            height: data.user.personDetails.height?.toString() || '',
            bodyType: data.user.personDetails.bodyType || '',
            smokes: data.user.personDetails.smokes || false,
            drinks: data.user.personDetails.drinks || false
          })
        }

        // Preencher CoupleDetails se existir
        if (data.user.coupleDetails) {
          if (data.user.coupleDetails.him) {
            setCoupleDetails(prev => ({
              ...prev,
              him: {
                name: data.user.coupleDetails.him.name || '',
                age: data.user.coupleDetails.him.age?.toString() || '',
                sexualOrientation: data.user.coupleDetails.him.sexualOrientation || '',
                profession: data.user.coupleDetails.him.profession || '',
                maritalStatus: data.user.coupleDetails.him.maritalStatus || '',
                zodiacSign: data.user.coupleDetails.him.zodiacSign || '',
                ethnicity: data.user.coupleDetails.him.ethnicity || '',
                hair: data.user.coupleDetails.him.hair || '',
                eyes: data.user.coupleDetails.him.eyes || '',
                height: data.user.coupleDetails.him.height?.toString() || '',
                bodyType: data.user.coupleDetails.him.bodyType || '',
                smokes: data.user.coupleDetails.him.smokes || false,
                drinks: data.user.coupleDetails.him.drinks || false
              }
            }))
          }
          if (data.user.coupleDetails.her) {
            setCoupleDetails(prev => ({
              ...prev,
              her: {
                name: data.user.coupleDetails.her.name || '',
                age: data.user.coupleDetails.her.age?.toString() || '',
                sexualOrientation: data.user.coupleDetails.her.sexualOrientation || '',
                profession: data.user.coupleDetails.her.profession || '',
                maritalStatus: data.user.coupleDetails.her.maritalStatus || '',
                zodiacSign: data.user.coupleDetails.her.zodiacSign || '',
                ethnicity: data.user.coupleDetails.her.ethnicity || '',
                hair: data.user.coupleDetails.her.hair || '',
                eyes: data.user.coupleDetails.her.eyes || '',
                height: data.user.coupleDetails.her.height?.toString() || '',
                bodyType: data.user.coupleDetails.her.bodyType || '',
                smokes: data.user.coupleDetails.her.smokes || false,
                drinks: data.user.coupleDetails.her.drinks || false
              }
            }))
          }
        }
        
        if (data.user.image) {
          setImagePreview(data.user.image)
        }
        
        // Carregar banners se existirem
        if (data.user.banner1) {
          setBanner1Preview(data.user.banner1)
        }
        if (data.user.banner2) {
          setBanner2Preview(data.user.banner2)
        }
      } else {
        setError('Erro ao carregar dados do perfil')
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      setError('Erro ao carregar dados do perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBanner1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedBanner1(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setBanner1Preview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBanner2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedBanner2(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setBanner2Preview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field: 'interests' | 'objectives' | 'fetishes', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handlePersonDetailsChange = (field: string, value: string | boolean) => {
    setPersonDetails(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCoupleDetailsChange = (person: 'him' | 'her', field: string, value: string | boolean) => {
    setCoupleDetails(prev => ({
      ...prev,
      [person]: {
        ...prev[person],
        [field]: value
      }
    }))
  }

  const isIndividualRole = () => {
    return ['homem', 'mulher', 'transex', 'travesti'].includes(formData.role)
  }

  const isCoupleRole = () => {
    return ['casal_homem_mulher', 'casal_homens', 'casal_mulheres'].includes(formData.role)
  }

  const needsHim = () => {
    return formData.role === 'casal_homem_mulher' || formData.role === 'casal_homens'
  }

  const needsHer = () => {
    return formData.role === 'casal_homem_mulher' || formData.role === 'casal_mulheres'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const formDataToSend = new FormData()
      
      // Adicionar campos básicos
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(item => formDataToSend.append(key, item))
        } else if (value) {
          formDataToSend.append(key, value)
        }
      })

      // Adicionar PersonDetails se for papel individual
      if (isIndividualRole()) {
        Object.entries(personDetails).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            formDataToSend.append(`person${key.charAt(0).toUpperCase() + key.slice(1)}`, value.toString())
          }
        })
      }

      // Adicionar CoupleDetails se for papel de casal
      if (isCoupleRole()) {
        if (needsHim()) {
          Object.entries(coupleDetails.him).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
              formDataToSend.append(`him${key.charAt(0).toUpperCase() + key.slice(1)}`, value.toString())
            }
          })
        }
        if (needsHer()) {
          Object.entries(coupleDetails.her).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
              formDataToSend.append(`her${key.charAt(0).toUpperCase() + key.slice(1)}`, value.toString())
            }
          })
        }
      }

      // Adicionar imagem se selecionada
      if (selectedImage) {
        formDataToSend.append('image', selectedImage)
      }

      // Adicionar banners se selecionados
      if (selectedBanner1) {
        formDataToSend.append('banner1', selectedBanner1)
      }
      if (selectedBanner2) {
        formDataToSend.append('banner2', selectedBanner2)
      }

      const response = await fetch(`/api/users/edit-profile/${username}`, {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        setSuccess('Perfil atualizado com sucesso!')
        setTimeout(() => {
          router.push(`/${username}`)
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao atualizar perfil')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setError('Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const renderPersonDetailsForm = (prefix: string, data: any, onChange: (field: string, value: string | boolean) => void) => (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        {prefix === 'person' ? 'Informações Pessoais' : 
         prefix === 'him' ? 'Informações do Homem' : 'Informações da Mulher'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Nome
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
            placeholder="Nome"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Idade
          </label>
          <input
            type="number"
            value={data.age}
            onChange={(e) => onChange('age', e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
            placeholder="Idade"
            min="18"
            max="100"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Orientação Sexual
          </label>
          <select
            value={data.sexualOrientation}
            onChange={(e) => onChange('sexualOrientation', e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
          >
            <option value="">Selecione</option>
            {SEXUAL_ORIENTATIONS.map(orientation => (
              <option key={orientation} value={orientation}>
                {orientation}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Profissão
          </label>
          <input
            type="text"
            value={data.profession}
            onChange={(e) => onChange('profession', e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
            placeholder="Profissão"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Estado Civil
          </label>
          <select
            value={data.maritalStatus}
            onChange={(e) => onChange('maritalStatus', e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
          >
            <option value="">Selecione</option>
            {MARITAL_STATUS.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Signo
          </label>
          <select
            value={data.zodiacSign}
            onChange={(e) => onChange('zodiacSign', e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
          >
            <option value="">Selecione</option>
            {ZODIAC_SIGNS.map(sign => (
              <option key={sign} value={sign}>
                {sign}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Etnia
          </label>
          <select
            value={data.ethnicity}
            onChange={(e) => onChange('ethnicity', e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
          >
            <option value="">Selecione</option>
            {ETHNICITIES.map(ethnicity => (
              <option key={ethnicity} value={ethnicity}>
                {ethnicity}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Cor do Cabelo
          </label>
          <select
            value={data.hair}
            onChange={(e) => onChange('hair', e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
          >
            <option value="">Selecione</option>
            {HAIR_COLORS.map(color => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Cor dos Olhos
          </label>
          <select
            value={data.eyes}
            onChange={(e) => onChange('eyes', e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
          >
            <option value="">Selecione</option>
            {EYE_COLORS.map(color => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Altura (cm)
          </label>
          <input
            type="number"
            value={data.height}
            onChange={(e) => onChange('height', e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
            placeholder="Altura em cm"
            min="100"
            max="250"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Tipo de Corpo
          </label>
          <select
            value={data.bodyType}
            onChange={(e) => onChange('bodyType', e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
          >
            <option value="">Selecione</option>
            {BODY_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.smokes}
              onChange={(e) => onChange('smokes', e.target.checked)}
              className="w-4 h-4 text-pink-500 bg-gray-700 border-gray-600 rounded focus:ring-pink-500"
            />
            <span className="text-gray-300 text-sm">Fuma</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.drinks}
              onChange={(e) => onChange('drinks', e.target.checked)}
              className="w-4 h-4 text-pink-500 bg-gray-700 border-gray-600 rounded focus:ring-pink-500"
            />
            <span className="text-gray-300 text-sm">Bebe</span>
          </label>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!session?.user || session.user.username !== username) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Você não tem permissão para editar este perfil.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gray">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/${username}`}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-white">Editar Perfil</h1>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Alertas */}
          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-900 border border-green-700 rounded-lg p-4">
              <p className="text-green-200">{success}</p>
            </div>
          )}

          {/* Foto do Perfil */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Foto do Perfil</h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-600 rounded-full overflow-hidden">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full cursor-pointer hover:bg-pink-600 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <p className="text-gray-300 text-sm mb-2">
                  Clique no ícone da câmera para alterar sua foto
                </p>
                <p className="text-gray-400 text-xs">
                  Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Banners do Perfil */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Banners do Perfil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Banner 1 */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Banner 1</h3>
                <div className="relative">
                  <div className="w-full h-32 bg-gray-600 rounded-lg overflow-hidden">
                    {banner1Preview ? (
                      <img 
                        src={banner1Preview} 
                        alt="Banner 1 Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 bg-pink-500 p-2 rounded-full cursor-pointer hover:bg-pink-600 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBanner1Change}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  Clique no ícone para adicionar o banner 1
                </p>
              </div>

              {/* Banner 2 */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Banner 2</h3>
                <div className="relative">
                  <div className="w-full h-32 bg-gray-600 rounded-lg overflow-hidden">
                    {banner2Preview ? (
                      <img 
                        src={banner2Preview} 
                        alt="Banner 2 Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 bg-pink-500 p-2 rounded-full cursor-pointer hover:bg-pink-600 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBanner2Change}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  Clique no ícone para adicionar o banner 2
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-700 rounded-lg">
              <p className="text-gray-300 text-sm">
                <strong>Dica:</strong> Os banners aparecem no topo do seu perfil. Use imagens de alta qualidade com proporção 2:1 para melhor resultado.
              </p>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Nome de usuário
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
                  placeholder="Seu nome de usuário"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Nome de exibição
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
                  placeholder="Nome que aparecerá no seu perfil"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Idade
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
                  placeholder="Sua idade"
                  min="18"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Eu sou / Somos
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
                >
                  <option value="">Selecione seu papel</option>
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
                  placeholder="Sua cidade"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Estado
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
                  placeholder="Seu estado"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Biografia
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
                placeholder="Conte um pouco sobre você..."
              />
            </div>
          </div>

          {/* PersonDetails - Apenas para papéis individuais */}
          {isIndividualRole() && renderPersonDetailsForm('person', personDetails, handlePersonDetailsChange)}

          {/* CoupleDetails - Apenas para papéis de casal */}
          {isCoupleRole() && (
            <>
              {needsHim() && renderPersonDetailsForm('him', coupleDetails.him, (field, value) => handleCoupleDetailsChange('him', field, value))}
              {needsHer() && renderPersonDetailsForm('her', coupleDetails.her, (field, value) => handleCoupleDetailsChange('her', field, value))}
            </>
          )}

          {/* Redes Sociais */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Redes Sociais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
                  placeholder="@seuinstagram"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Twitter
                </label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
                  placeholder="@seutwitter"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  OnlyFans
                </label>
                <input
                  type="text"
                  value={formData.onlyfans}
                  onChange={(e) => handleInputChange('onlyfans', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
                  placeholder="Seu OnlyFans"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Sexlog
                </label>
                <input
                  type="text"
                  value={formData.sexlog}
                  onChange={(e) => handleInputChange('sexlog', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
                  placeholder="Seu Sexlog"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Buupe
                </label>
                <input
                  type="text"
                  value={formData.buupe}
                  onChange={(e) => handleInputChange('buupe', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
                  placeholder="Seu Buupe"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Privacidade
                </label>
                <select
                  value={formData.privacy}
                  onChange={(e) => handleInputChange('privacy', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
                >
                  <option value="">Selecione a privacidade</option>
                  <option value="public">Público</option>
                  <option value="private">Privado</option>
                  <option value="friends">Apenas amigos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interesses */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Interesses</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INTERESTS.map(interest => (
                <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleArrayChange('interests', interest)}
                    className="w-4 h-4 text-pink-500 bg-gray-700 border-gray-600 rounded focus:ring-pink-500"
                  />
                  <span className="text-gray-300 text-sm">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Objetivos */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Objetivos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {OBJECTIVES.map(objective => (
                <label key={objective} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.objectives.includes(objective)}
                    onChange={() => handleArrayChange('objectives', objective)}
                    className="w-4 h-4 text-pink-500 bg-gray-700 border-gray-600 rounded focus:ring-pink-500"
                  />
                  <span className="text-gray-300 text-sm">{objective}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fetiches */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Fetiches</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FETISHES.map(fetish => (
                <label key={fetish} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.fetishes.includes(fetish)}
                    onChange={() => handleArrayChange('fetishes', fetish)}
                    className="w-4 h-4 text-pink-500 bg-gray-700 border-gray-600 rounded focus:ring-pink-500"
                  />
                  <span className="text-gray-300 text-sm">{fetish}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 