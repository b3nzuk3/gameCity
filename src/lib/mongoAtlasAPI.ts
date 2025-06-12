// MongoDB Atlas Data API Client
// Browser-compatible HTTP-based database client

const API_URL = import.meta.env.VITE_MONGODB_DATA_API_URL || ''
const DATA_SOURCE = import.meta.env.VITE_MONGODB_DATA_SOURCE || 'Cluster0'
const DATABASE = import.meta.env.VITE_MONGODB_DATABASE || 'gamecity-store'
const API_KEY = import.meta.env.VITE_MONGODB_API_KEY || ''

interface MongoDocument {
  _id?: { $oid?: string } | string
  [key: string]: any
}

interface FindRequest {
  collection: string
  database?: string
  dataSource?: string
  filter?: Record<string, any>
  sort?: Record<string, any>
  limit?: number
}

interface InsertRequest {
  collection: string
  database?: string
  dataSource?: string
  document: Record<string, any>
}

interface UpdateRequest {
  collection: string
  database?: string
  dataSource?: string
  filter: Record<string, any>
  update: { $set: Record<string, any> }
}

interface DeleteRequest {
  collection: string
  database?: string
  dataSource?: string
  filter: Record<string, any>
}

class MongoAtlasAPI {
  private async makeRequest(endpoint: string, data: any): Promise<any> {
    if (!API_URL || !API_KEY) {
      throw new Error(
        'MongoDB Atlas Data API not configured. Please set environment variables.'
      )
    }

    const response = await fetch(`${API_URL}/action/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': API_KEY,
      },
      body: JSON.stringify({
        dataSource: DATA_SOURCE,
        database: DATABASE,
        ...data,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`MongoDB API Error: ${response.status} - ${errorText}`)
    }

    return await response.json()
  }

  async find(request: FindRequest): Promise<MongoDocument[]> {
    try {
      const result = await this.makeRequest('find', request)
      return result.documents || []
    } catch (error) {
      console.error('MongoDB find error:', error)
      throw error
    }
  }

  async findOne(request: FindRequest): Promise<MongoDocument | null> {
    try {
      const result = await this.makeRequest('findOne', request)
      return result.document || null
    } catch (error) {
      console.error('MongoDB findOne error:', error)
      throw error
    }
  }

  async insertOne(request: InsertRequest): Promise<{ insertedId: string }> {
    try {
      const result = await this.makeRequest('insertOne', request)
      return { insertedId: result.insertedId }
    } catch (error) {
      console.error('MongoDB insertOne error:', error)
      throw error
    }
  }

  async updateOne(request: UpdateRequest): Promise<{ modifiedCount: number }> {
    try {
      const result = await this.makeRequest('updateOne', request)
      return { modifiedCount: result.modifiedCount || 0 }
    } catch (error) {
      console.error('MongoDB updateOne error:', error)
      throw error
    }
  }

  async deleteOne(request: DeleteRequest): Promise<{ deletedCount: number }> {
    try {
      const result = await this.makeRequest('deleteOne', request)
      return { deletedCount: result.deletedCount || 0 }
    } catch (error) {
      console.error('MongoDB deleteOne error:', error)
      throw error
    }
  }

  // Helper function to convert MongoDB _id to string
  convertId(doc: MongoDocument): string {
    if (!doc._id) return ''
    if (typeof doc._id === 'string') return doc._id
    if (doc._id.$oid) return doc._id.$oid
    return String(doc._id)
  }

  // Helper function to create ObjectId filter
  createObjectIdFilter(id: string): Record<string, any> {
    return { _id: { $oid: id } }
  }
}

export const mongoAPI = new MongoAtlasAPI()

// Connection test function
export async function testMongoConnection(): Promise<boolean> {
  try {
    await mongoAPI.find({ collection: 'products', limit: 1 })
    return true
  } catch (error) {
    console.error('MongoDB connection test failed:', error)
    return false
  }
}
