export interface AvatarOption {
  id: string
  label: string
  image: string
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'cat', label: 'Katze', image: '/avatars/cat.svg' },
  { id: 'fox', label: 'Fuchs', image: '/avatars/fox.svg' },
  { id: 'panda', label: 'Panda', image: '/avatars/panda.svg' },
  { id: 'rocket', label: 'Rakete', image: '/avatars/rocket.svg' },
]

export const getAvatarOption = (avatarId: string): AvatarOption => {
  return AVATAR_OPTIONS.find((item) => item.id === avatarId) ?? AVATAR_OPTIONS[0]
}
