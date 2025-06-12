export interface Address {
  _id: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface UserProfile {
  _id: string
  name: string
  email: string
  isAdmin: boolean
  joinDate: string
  avatarUrl?: string
  addresses: Address[]
  token: string
}
