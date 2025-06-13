import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import DebugInfo from '@/components/DebugInfo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import backendService, {
  type Product,
  type User,
  type Order,
} from '@/services/backendService'
import {
  Package,
  ShoppingCart,
  Users,
  Settings,
  LayoutDashboard,
  Search,
  LogOut,
  PlusCircle,
  Edit,
  Trash2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { formatKESPrice, parseKESInput } from '@/lib/currency'

// Define available categories
const CATEGORIES = [
  { id: 'all', name: 'All Products' },
  { id: 'monitors', name: 'Monitors' },
  { id: 'graphics-cards', name: 'Graphics Cards' },
  { id: 'memory', name: 'Memory' },
  { id: 'processors', name: 'Processors' },
  { id: 'storage', name: 'Storage' },
  { id: 'motherboards', name: 'Motherboards' },
  { id: 'cases', name: 'Cases' },
  { id: 'power-supply', name: 'Power Supply' },
  { id: 'gaming-pc', name: 'Gaming PC' },
  { id: 'accessories', name: 'Accessories' },
]

type ProductFormData = {
  id?: string
  name: string
  description: string
  price: number
  category: string
  count_in_stock: number
  brand: string
  image: string
  imageFile?: File | null
}

type UserFormData = {
  id?: string
  name: string
  email: string
  isAdmin: boolean
}

const Admin = () => {
  const navigate = useNavigate()
  const { user, isLoading, logout } = useAuth()

  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  // Loading states
  const [productsLoading, setProductsLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)

  // Search states
  const [productSearch, setProductSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')

  // Dialog states
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'user' | 'order'
    id: string
    name: string
  } | null>(null)

  // Form states
  const [currentProduct, setCurrentProduct] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    count_in_stock: 0,
    brand: '',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
    imageFile: null,
  })

  const [currentUser, setCurrentUser] = useState<UserFormData>({
    name: '',
    email: '',
    isAdmin: false,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  // Settings
  const [storeSettings, setStoreSettings] = useState({
    name: 'Gamecity',
    email: 'support@gamecity.com',
    phone: '+1 (555) 123-4567',
    currency: 'USD ($)',
  })

  // Authentication and authorization check
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      navigate('/signin')
      toast({
        title: 'Authentication required',
        description: 'Please sign in to access the admin area',
        variant: 'destructive',
      })
      return
    }

    if (!user.isAdmin) {
      navigate('/')
      toast({
        title: 'Access Denied',
        description: "You don't have permission to access the admin area",
        variant: 'destructive',
      })
      return
    }

    // Load data
    loadProducts()
    loadUsers()
    loadOrders()
  }, [navigate, user, isLoading])

  // Load products
  const loadProducts = async () => {
    setProductsLoading(true)
    try {
      const data = await backendService.products.getAll()
      const normalized = (data.products || []).map((p) => ({
        ...p,
        count_in_stock: p.count_in_stock ?? 0,
      }))
      setProducts(normalized)
      console.log('Admin: Loaded products:', normalized.length)
    } catch (error) {
      console.error('Admin: Failed to load products:', error)
      toast({
        title: 'Error loading products',
        description: 'Failed to load products from server',
        variant: 'destructive',
      })
    } finally {
      setProductsLoading(false)
    }
  }

  // Load users
  const loadUsers = async () => {
    setUsersLoading(true)
    try {
      const data = await backendService.users.getAll()
      setUsers(data)
      console.log('Admin: Loaded users:', data.length)
    } catch (error) {
      console.error('Admin: Failed to load users:', error)
      toast({
        title: 'Error loading users',
        description: 'Failed to load users from server',
        variant: 'destructive',
      })
    } finally {
      setUsersLoading(false)
    }
  }

  // Load orders
  const loadOrders = async () => {
    setOrdersLoading(true)
    try {
      const data = await backendService.orders.getAll()
      // Map _id to id for each order
      const normalized = data.map((order: any) => ({
        ...order,
        id: order.id || order._id, // prefer id, fallback to _id
      }))
      setOrders(normalized)
      console.log('Admin: Loaded orders:', normalized.length)
    } catch (error) {
      console.error('Admin: Failed to load orders:', error)
      toast({
        title: 'Error loading orders',
        description: 'Failed to load orders from server',
        variant: 'destructive',
      })
    } finally {
      setOrdersLoading(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Filter functions
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (product.category &&
        product.category.toLowerCase().includes(productSearch.toLowerCase())) ||
      (product.brand &&
        product.brand.toLowerCase().includes(productSearch.toLowerCase()))
  )

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (user.isAdmin ? 'administrator' : 'customer')
        .toLowerCase()
        .includes(userSearch.toLowerCase())
  )

  // Product management functions
  const handleAddProduct = () => {
    setIsEditing(false)
    setCurrentProduct({
      name: '',
      description: '',
      price: 0,
      category: '',
      count_in_stock: 0,
      brand: '',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      imageFile: null,
    })
    setProductDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setIsEditing(true)
    setCurrentProduct({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      count_in_stock: product.count_in_stock,
      brand: product.brand || '',
      image: product.image,
      imageFile: null,
    })
    setProductDialogOpen(true)
  }

  const handleDeleteProduct = (product: Product) => {
    setDeleteTarget({ type: 'product', id: product.id, name: product.name })
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      let imageUrl = currentProduct.image
      // If a new image file is selected, upload it first
      if (currentProduct.imageFile) {
        const uploadData = new FormData()
        uploadData.append('image', currentProduct.imageFile)
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        })
        if (!uploadResponse.ok) throw new Error('Image upload failed')
        const uploadResult = await uploadResponse.json()
        imageUrl = uploadResult.url
      }

      const formData = new FormData()
      formData.append('name', currentProduct.name)
      formData.append('price', currentProduct.price.toString())
      formData.append('description', currentProduct.description || '')
      formData.append('category', currentProduct.category || '')
      formData.append('brand', currentProduct.brand || '')
      formData.append(
        'count_in_stock',
        currentProduct.count_in_stock?.toString() || '0'
      )
      formData.append('image', imageUrl)

      let response
      if (isEditing && currentProduct.id) {
        // UPDATE (PUT)
        response = await fetch(`/api/products/${currentProduct.id}`, {
          method: 'PUT',
          body: formData,
        })
      } else {
        // CREATE (POST)
        response = await fetch('/api/products', {
          method: 'POST',
          body: formData,
        })
      }

      if (!response.ok) throw new Error('Failed to save product')
      await loadProducts()
      setProductDialogOpen(false)
    } catch (error) {
      console.error('Product creation error:', error)
      // ...toast or error handling...
    } finally {
      setSubmitLoading(false)
    }
  }

  // User management functions
  const handleEditUser = (user: User) => {
    setIsEditing(true)
    setCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    })
    setUserDialogOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    if (user.id === user.id) {
      toast({
        title: 'Cannot delete yourself',
        description: 'You cannot delete your own account',
        variant: 'destructive',
      })
      return
    }
    setDeleteTarget({ type: 'user', id: user.id, name: user.name })
    setDeleteDialogOpen(true)
  }

  const saveUser = async () => {
    if (!currentUser.name || !currentUser.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    if (!currentUser.id) return

    setSubmitLoading(true)
    try {
      await backendService.users.update(currentUser.id, {
        name: currentUser.name,
        email: currentUser.email,
        isAdmin: currentUser.isAdmin,
      })

      toast({
        title: 'User updated',
        description: 'User has been updated successfully',
      })
      setUserDialogOpen(false)
      loadUsers() // Reload users
    } catch (error) {
      console.error('Save user error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save user'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  // Update order status
  const handleOrderStatus = async (
    orderId: string,
    status: 'pending' | 'completed'
  ) => {
    if (!orderId) return
    console.log('handleOrderStatus called with:', orderId, status)
    try {
      await backendService.orders.updateStatus(orderId, status)
      loadOrders() // Reload orders after update
      toast({
        title: 'Order updated',
        description: `Order status changed to ${status}`,
      })
    } catch (error) {
      console.error('Admin: Failed to update order:', error)
      toast({
        title: 'Error updating order',
        description: 'Failed to update order status',
        variant: 'destructive',
      })
    }
  }

  // Delete order
  const handleDeleteOrder = (order: Order) => {
    console.log('handleDeleteOrder called with:', order.id)
    setDeleteTarget({
      type: 'order',
      id: order.id,
      name: `Order #${order.id}`,
    })
    setDeleteDialogOpen(true)
  }

  // Delete confirmation
  const confirmDelete = async () => {
    if (!deleteTarget) return

    setSubmitLoading(true)
    try {
      switch (deleteTarget.type) {
        case 'product':
          await backendService.products.delete(deleteTarget.id)
          loadProducts()
          break
        case 'user':
          await backendService.users.delete(deleteTarget.id)
          loadUsers()
          break
        case 'order':
          await backendService.orders.delete(deleteTarget.id)
          loadOrders()
          break
      }

      toast({
        title: 'Deleted successfully',
        description: `${deleteTarget.name} has been deleted.`,
      })
    } catch (error) {
      console.error('Delete failed:', error)
      toast({
        title: 'Delete failed',
        description: 'An error occurred while deleting.',
        variant: 'destructive',
      })
    } finally {
      setSubmitLoading(false)
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    }
  }

  const saveSettings = () => {
    toast({
      title: 'Settings Saved',
      description: 'Store settings have been successfully updated',
    })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading admin dashboard...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-16 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your store, products, and users
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-forest-700 text-muted-foreground hover:text-foreground"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-forest-800 border-forest-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-emerald-900/50 mr-4">
                  <Package className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Products
                  </p>
                  <h3 className="text-2xl font-bold">{products.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-forest-800 border-forest-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-emerald-900/50 mr-4">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Users</p>
                  <h3 className="text-2xl font-bold">{users.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-forest-800 border-forest-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-emerald-900/50 mr-4">
                  <ShoppingCart className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Orders</p>
                  <h3 className="text-2xl font-bold">{orders.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-forest-800 border-forest-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-emerald-900/50 mr-4">
                  <LayoutDashboard className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Revenue</p>
                  <h3 className="text-2xl font-bold">$0.00</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package size={16} />
              Products
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users size={16} />
              Users
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart size={16} />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="bg-forest-800 border-forest-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Product Management</CardTitle>
                  <Button
                    onClick={handleAddProduct}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10 bg-forest-900 border-forest-600"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No products found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 bg-forest-900 rounded-lg border border-forest-600"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-16 w-16 object-cover rounded-md"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src =
                                '/placeholder.svg'
                            }}
                          />
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {product.category} •{' '}
                              {formatKESPrice(product.price)} • Stock:{' '}
                              {product.count_in_stock ?? 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleEditProduct(product)}
                            variant="outline"
                            size="sm"
                            className="border-forest-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteProduct(product)}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-forest-800 border-forest-700">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 bg-forest-900 border-forest-600"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((userData) => (
                      <div
                        key={userData.id}
                        className="flex items-center justify-between p-4 bg-forest-900 rounded-lg border border-forest-600"
                      >
                        <div>
                          <h3 className="font-semibold">{userData.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {userData.email} •{' '}
                            {userData.isAdmin ? 'Administrator' : 'Customer'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleEditUser(userData)}
                            variant="outline"
                            size="sm"
                            className="border-forest-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(userData)}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Orders</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search orders..."
                      className="pl-8 bg-forest-900 border-forest-700"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-forest-800 rounded-lg border border-forest-700">
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders
                      .filter((order) =>
                        (order.id || '')
                          .toLowerCase()
                          .includes(orderSearch.toLowerCase())
                      )
                      .map((order, idx) => {
                        console.log('Rendering order:', order)
                        return (
                          <div
                            key={order.id || `order-${idx}`}
                            className="flex items-center justify-between p-4 bg-forest-900 rounded-lg border border-forest-600"
                          >
                            <div className="flex flex-col space-y-2 flex-1">
                              <div>
                                <h3 className="font-semibold">
                                  Order #{order.id}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {order.user.name} •{' '}
                                  {formatKESPrice(order.totalPrice)} •{' '}
                                  {new Date(
                                    order.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              {/* Items Ordered */}
                              <div className="mt-2">
                                <span className="font-medium">Items:</span>
                                <ul className="ml-4 list-disc text-sm">
                                  {(order.orderItems || []).map((item, i) => (
                                    <li key={i}>
                                      {item.name || item.product} x
                                      {item.quantity} @{' '}
                                      {formatKESPrice(item.price)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={
                                  order.status === 'completed'
                                    ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20'
                                    : 'text-muted-foreground'
                                }
                                onClick={() => {
                                  console.log(
                                    'Status button clicked',
                                    order.id,
                                    order.status
                                  )
                                  order.id &&
                                    handleOrderStatus(
                                      order.id,
                                      order.status === 'completed'
                                        ? 'pending'
                                        : 'completed'
                                    )
                                }}
                              >
                                {order.status === 'completed' ? (
                                  <CheckCircle2 size={20} />
                                ) : (
                                  <XCircle size={20} />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                onClick={() => {
                                  console.log('Delete button clicked', order.id)
                                  order.id && handleDeleteOrder(order)
                                }}
                              >
                                <Trash2 size={20} />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-forest-800 border-forest-700">
              <CardHeader>
                <CardTitle>Store Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.name}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        name: e.target.value,
                      })
                    }
                    className="bg-forest-900 border-forest-600"
                  />
                </div>
                <div>
                  <Label htmlFor="storeEmail">Support Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        email: e.target.value,
                      })
                    }
                    className="bg-forest-900 border-forest-600"
                  />
                </div>
                <div>
                  <Label htmlFor="storePhone">Support Phone</Label>
                  <Input
                    id="storePhone"
                    value={storeSettings.phone}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        phone: e.target.value,
                      })
                    }
                    className="bg-forest-900 border-forest-600"
                  />
                </div>
                <div>
                  <Label htmlFor="storeCurrency">Currency</Label>
                  <Select
                    value={storeSettings.currency}
                    onValueChange={(value) =>
                      setStoreSettings({ ...storeSettings, currency: value })
                    }
                  >
                    <SelectTrigger className="bg-forest-900 border-forest-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-forest-900 border-forest-600">
                      <SelectItem value="USD ($)">USD ($)</SelectItem>
                      <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                      <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={saveSettings}
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <DebugInfo />
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="bg-forest-800 border-forest-700 max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div
              className="space-y-4"
              role="dialog"
              aria-label={isEditing ? 'Edit Product Form' : 'Add Product Form'}
            >
              <div>
                <Label htmlFor="productName">Name</Label>
                <Input
                  id="productName"
                  value={currentProduct.name}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      name: e.target.value,
                    })
                  }
                  className="bg-forest-900 border-forest-600"
                />
              </div>
              <div>
                <Label htmlFor="productDescription">Description</Label>
                <Input
                  id="productDescription"
                  value={currentProduct.description}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      description: e.target.value,
                    })
                  }
                  className="bg-forest-900 border-forest-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productPrice">Price (KES)</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentProduct.price}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        price: parseKESInput(e.target.value),
                      })
                    }
                    className="bg-forest-900 border-forest-600"
                  />
                </div>
                <div>
                  <Label htmlFor="productStock">Stock</Label>
                  <Input
                    id="productStock"
                    type="number"
                    min="0"
                    value={currentProduct.count_in_stock}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        count_in_stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="bg-forest-900 border-forest-600"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="productCategory">Category</Label>
                <Select
                  value={currentProduct.category}
                  onValueChange={(value) =>
                    setCurrentProduct({
                      ...currentProduct,
                      category: value,
                    })
                  }
                >
                  <SelectTrigger
                    id="productCategory"
                    className="w-full bg-forest-900 border-forest-600"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-forest-800 border-forest-600">
                    {CATEGORIES.filter((cat) => cat.id !== 'all').map(
                      (category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="productBrand">Brand</Label>
                <Input
                  id="productBrand"
                  value={currentProduct.brand}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      brand: e.target.value,
                    })
                  }
                  className="bg-forest-900 border-forest-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productImage">Product Image</Label>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden bg-forest-900 border border-forest-600">
                      {currentProduct.imageFile ? (
                        <img
                          src={URL.createObjectURL(currentProduct.imageFile)}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                      ) : currentProduct.image ? (
                        <img
                          src={currentProduct.image}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src =
                              '/placeholder.svg'
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-forest-600 flex-1"
                          onClick={() =>
                            document.getElementById('fileInput')?.click()
                          }
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </Button>
                        <input
                          type="file"
                          id="fileInput"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setCurrentProduct({
                                ...currentProduct,
                                imageFile: file,
                                image: '', // Clear URL when file is selected
                              })
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Or enter an image URL:
                      </p>
                      <Input
                        value={currentProduct.image}
                        onChange={(e) =>
                          setCurrentProduct({
                            ...currentProduct,
                            image: e.target.value,
                            imageFile: null, // Clear file when URL is entered
                          })
                        }
                        placeholder="https://example.com/image.jpg"
                        className="bg-forest-900 border-forest-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setProductDialogOpen(false)}
                className="border-forest-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitLoading}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                {submitLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="bg-forest-800 border-forest-700 max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4" role="dialog" aria-label="Edit User Form">
            <div>
              <Label htmlFor="userName">Name</Label>
              <Input
                id="userName"
                value={currentUser.name}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, name: e.target.value })
                }
                className="bg-forest-900 border-forest-600"
              />
            </div>
            <div>
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                value={currentUser.email}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, email: e.target.value })
                }
                className="bg-forest-900 border-forest-600"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="userAdmin"
                checked={currentUser.isAdmin}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, isAdmin: e.target.checked })
                }
                className="rounded border-forest-600"
              />
              <Label htmlFor="userAdmin">Administrator</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserDialogOpen(false)}
              className="border-forest-600"
            >
              Cancel
            </Button>
            <Button
              onClick={saveUser}
              disabled={submitLoading}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              {submitLoading ? 'Saving...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-forest-800 border-forest-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div role="dialog" aria-label="Delete Confirmation">
            <p className="text-muted-foreground">
              Are you sure you want to delete {deleteTarget?.type} "
              {deleteTarget?.name}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-forest-600"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={submitLoading}
              className="bg-red-600 hover:bg-red-500"
            >
              {submitLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

export default Admin
