export interface ProfileStats {
  views: string
  following: number
  followers: number
  recommendations: number
}

export interface ProfileInfo {
  gender: string
  location: string
  distance: string
  preferences: string
  memberSince: string
  status: string
}

export interface Profile {
  id: string
  username: string
  displayName: string
  avatar: string
  bannerImages: string[]
  stats: ProfileStats
  info: ProfileInfo
  isOnline: boolean
  isVerified: boolean
  isFollowing: boolean
  isOwnProfile?: boolean // Adicionado para indicar se é o perfil do usuário logado
  // Campos adicionais
  interests: string
  fetishes: string
  objectives: string
  city: string
  state: string
} 