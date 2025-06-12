import { toast } from '@/hooks/use-toast'
import { mongoAPI } from '@/lib/mongoAtlasAPI'

export type User = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export type CreateUserData = {
  email: string
  full_name?: string
  avatar_url?: string
  is_admin?: boolean
}

export type UpdateUserData = Partial<CreateUserData>

// Convert MongoDB document to User
function documentToUser(doc: any): User {
  return {
    id: mongoAPI.convertId(doc),
    email: doc.email,
    full_name: doc.full_name,
    avatar_url: doc.avatar_url,
    is_admin: doc.is_admin,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  }
}

export const atlasUserService = {
  async getUsers(): Promise<User[]> {
    try {
      console.log('AtlasUserService: Fetching users from MongoDB Atlas...')

      // Try to fetch from real database
      const documents = await mongoAPI.find({
        collection: 'users',
        sort: { created_at: -1 },
      })

      if (documents.length === 0) {
        console.log(
          'AtlasUserService: No users found in database, using demo data'
        )
        return []
      }

      const users = documents.map(documentToUser)
      console.log(
        `AtlasUserService: Successfully loaded ${users.length} users from MongoDB Atlas`
      )

      return users
    } catch (error) {
      console.error(
        'AtlasUserService: Database query failed, using fallback data:',
        error
      )

      toast({
        title: 'Database Connection',
        description:
          'Using demo data - MongoDB Atlas not configured or unreachable',
        variant: 'destructive',
      })

      return []
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      console.log('AtlasUserService: Fetching user by ID:', id)

      // Try real database
      const doc = await mongoAPI.findOne({
        collection: 'users',
        filter: mongoAPI.createObjectIdFilter(id),
      })

      if (!doc) {
        console.log('AtlasUserService: User not found')
        return null
      }

      const user = documentToUser(doc)
      console.log('AtlasUserService: User found:', user.email)
      return user
    } catch (error) {
      console.error('AtlasUserService: Get user by ID failed:', error)
      return null
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      console.log('AtlasUserService: Fetching user by email:', email)

      // Try real database
      const doc = await mongoAPI.findOne({
        collection: 'users',
        filter: { email },
      })

      if (!doc) {
        console.log('AtlasUserService: User not found')
        return null
      }

      const user = documentToUser(doc)
      console.log('AtlasUserService: User found:', user.email)
      return user
    } catch (error) {
      console.error('AtlasUserService: Get user by email failed:', error)
      return null
    }
  },

  async createUser(userData: CreateUserData): Promise<User | null> {
    try {
      console.log('AtlasUserService: Creating user:', userData.email)

      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email)
      if (existingUser) {
        console.log('AtlasUserService: User already exists')
        return existingUser
      }

      const now = new Date().toISOString()
      const newUserDoc = {
        email: userData.email,
        full_name: userData.full_name || null,
        avatar_url: userData.avatar_url || null,
        is_admin: userData.is_admin || false,
        created_at: now,
        updated_at: now,
      }

      // Try to insert to real database
      const result = await mongoAPI.insertOne({
        collection: 'users',
        document: newUserDoc,
      })

      const createdUser: User = {
        id: result.insertedId,
        ...newUserDoc,
      }

      console.log(
        'AtlasUserService: User created successfully in MongoDB Atlas:',
        createdUser.id
      )
      toast({
        title: 'User created',
        description: 'User has been created successfully in MongoDB Atlas',
      })

      return createdUser
    } catch (error) {
      console.error(
        'AtlasUserService: Create user failed, falling back to demo mode:',
        error
      )

      // Fallback to demo creation
      const now = new Date().toISOString()
      const newUser: User = {
        id: `demo-${Date.now()}`,
        email: userData.email,
        full_name: userData.full_name || null,
        avatar_url: userData.avatar_url || null,
        is_admin: userData.is_admin || false,
        created_at: now,
        updated_at: now,
      }

      toast({
        title: 'User created',
        description: 'User created in demo mode (MongoDB Atlas not configured)',
      })

      return newUser
    }
  },

  async updateUser(id: string, userData: UpdateUserData): Promise<User | null> {
    try {
      console.log('AtlasUserService: Updating user:', id)

      // Try real database update
      const updateData = {
        ...userData,
        updated_at: new Date().toISOString(),
      }

      const result = await mongoAPI.updateOne({
        collection: 'users',
        filter: mongoAPI.createObjectIdFilter(id),
        update: { $set: updateData },
      })

      if (result.modifiedCount === 0) {
        throw new Error('User not found or no changes made')
      }

      // Fetch the updated user
      const updatedDoc = await mongoAPI.findOne({
        collection: 'users',
        filter: mongoAPI.createObjectIdFilter(id),
      })

      if (!updatedDoc) {
        throw new Error('Failed to fetch updated user')
      }

      const updatedUser = documentToUser(updatedDoc)

      console.log(
        'AtlasUserService: User updated successfully in MongoDB Atlas'
      )
      toast({
        title: 'User updated',
        description: 'User has been updated successfully in MongoDB Atlas',
      })

      return updatedUser
    } catch (error) {
      console.error('AtlasUserService: Update user failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      })
      return null
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      console.log('AtlasUserService: Deleting user:', id)

      // Try real database delete
      const result = await mongoAPI.deleteOne({
        collection: 'users',
        filter: mongoAPI.createObjectIdFilter(id),
      })

      if (result.deletedCount === 0) {
        throw new Error('User not found')
      }

      console.log(
        'AtlasUserService: User deleted successfully from MongoDB Atlas'
      )
      toast({
        title: 'User deleted',
        description: 'User has been deleted successfully from MongoDB Atlas',
      })

      return true
    } catch (error) {
      console.error('AtlasUserService: Delete user failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      })
      return false
    }
  },

  async setAdminStatus(id: string, isAdmin: boolean): Promise<boolean> {
    try {
      console.log('AtlasUserService: Setting admin status:', id, isAdmin)

      const result = await this.updateUser(id, { is_admin: isAdmin })

      if (!result) {
        return false
      }

      const modeText = id.startsWith('demo-')
        ? ' (demo mode)'
        : ' in MongoDB Atlas'

      toast({
        title: 'Admin status updated',
        description: `User is ${
          isAdmin ? 'now' : 'no longer'
        } an admin${modeText}`,
      })

      return true
    } catch (error) {
      console.error('AtlasUserService: Set admin status failed:', error)
      return false
    }
  },
}
