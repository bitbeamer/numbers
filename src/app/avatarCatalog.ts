export interface AvatarOption {
  id: string
  image: string
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'cat', image: '/avatars/cat.svg' },
  { id: 'fox', image: '/avatars/fox.svg' },
  { id: 'panda', image: '/avatars/panda.svg' },
  { id: 'rocket', image: '/avatars/rocket.svg' },
]

export const getAvatarOption = (avatarId: string): AvatarOption => {
  return AVATAR_OPTIONS.find((item) => item.id === avatarId) ?? AVATAR_OPTIONS[0]
}
