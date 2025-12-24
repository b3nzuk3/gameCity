import React, { useEffect, useState, useRef } from 'react'
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
import backendService from '@/services/backendService'
import type { Product, User, Order } from '@/services/backendService'
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
  Plus,
} from 'lucide-react'
import { formatKESPrice, parseKESInput } from '@/lib/currency'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'

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
  { id: 'pre-built', name: 'PRE-BUILT' },
  { id: 'cpu-cooling', name: 'CPU Cooling' },
  { id: 'oem', name: 'OEM' },
  { id: 'accessories', name: 'Accessories' },
]

const CATEGORY_SPECS: Record<string, string[]> = {
  Processors: [
    'CPU Model',
    'CPU Speed',
    'CPU Cores',
    'CPU Threads',
    'CPU Socket',
  ],
  Monitors: [
    'Size in Inches',
    'Resolution',
    'Refresh Rate',
    'Ports',
    'Special Features',
  ],
  'Graphics Cards': [
    'Vram in GB',
    'No. of fans',
    'Video output ports',
    'Power consumption',
    'Memory type',
  ],
  Memory: ['Cas latency', 'Memory Speed', 'No. of modules'],
  Storage: [
    'Model',
    'Capacity',
    'Type',
    'Interface',
    'Connectivity',
    'Special Features',
  ],
  Motherboards: [
    'Model',
    'Form Factor',
    'Cpu socket',
    'Ram type',
    'Ram slots',
    'Nvme slots',
    'Sata ports',
    'Special Features',
  ],
  'Power Supply': [
    'Model',
    'Form Factor',
    'Connectors',
    'Watts',
    'Power Rating',
    'Special Features',
  ],
  Cases: [
    'Motherboard Compatibility',
    'No. of fans',
    'Fan size',
    'Fans Connectivity',
    'Graphics card allowance',
    'Hard drive bays',
    'Special Features',
  ],
  'PRE-BUILT': [
    'Cpu socket',
    'Ram slots',
    'Nvme slots',
    'Psu rating',
    'Sata ports',
    'Warranty Period in Months',
    'No. Of fans included',
    'Accessories included',
  ],
  'CPU Cooling': [
    'Model',
    'Color',
    'Cooling method',
    'Radiator size',
    'No. of fans',
    'Fans size',
    'Special Features',
  ],
  OEM: [
    'Model',
    'Cpu socket',
    'Ram slots',
    'Nvme slots',
    'Power supply wattage',
    'Sata ports',
    'Warranty period in months',
    'Accessories included',
  ],
}

type ProductFormData = {
  id?: string
  name: string
  description: string
  price: number
  category: string
  countInStock: number
  brand: string
  condition?: 'New' | 'Pre-Owned'
  image: string
  images: string[]
  offer?: {
    enabled?: boolean
    type?: 'percentage' | 'fixed'
    amount?: number
    startDate?: string
    endDate?: string
  }
}

type UserFormData = {
  id?: string
  name: string
  email: string
  isAdmin: boolean
}

type ProductWithSpecs = Product & { specifications?: Record<string, string> }

const Admin = () => {
  const navigate = useNavigate()
  const { user, isLoading, logout } = useAuth()

  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<ComboboxOption[]>([])
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

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
    countInStock: 0,
    brand: '',
    condition: 'New',
    image: '',
    images: [],
    offer: { enabled: false, type: 'percentage', amount: 0 },
  })

  // New state for file management
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([])
  const [mainImagePreview, setMainImagePreview] = useState<string>('')
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<
    string[]
  >([])

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
    email: 'gamecityelectronics@gmail.com',
    phone: '0712248706',
    currency: 'KES',
  })

  // Add to Admin component state:
  const [specifications, setSpecifications] = useState<Record<string, string>>(
    {}
  )

  // Add this effect to reset specifications when category changes:
  useEffect(() => {
    if (!isEditing) {
      setSpecifications({})
    }
  }, [currentProduct.category, isEditing])

  // Add this handler:
  const handleSpecificationChange = (key: string, value: string) => {
    setSpecifications((prev) => ({ ...prev, [key]: value }))
  }

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
    loadBrands()
  }, [navigate, user, isLoading])

  // Load products
  const loadProducts = async (page: number = 1) => {
    setProductsLoading(true)
    try {
      const data = await backendService.products.getAll(page)
      console.log('Raw API response:', data)
      const normalized = (data.products || []).map((p: Product) => ({
        ...p,
        countInStock: p.countInStock ?? p.count_in_stock ?? 0,
      }))
      setProducts(normalized)
      setTotalPages(data.pages || 1)
      setCurrentPage(data.page || 1)
      setTotalProducts(data.total || data.count || 0)
      console.log(
        'Admin: Loaded products:',
        normalized.length,
        'Total:',
        data.total || data.count
      )
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

  // Load brands
  const loadBrands = async () => {
    try {
      const brandNames = await backendService.products.getBrands()
      const brandOptions = brandNames.map((name) => ({
        value: name.toLowerCase(),
        label: name,
      }))
      setBrands(brandOptions)
      console.log('Admin: Loaded brands:', brandOptions.length)
    } catch (error) {
      console.error('Admin: Failed to load brands:', error)
      // Non-critical, so no toast needed
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
      countInStock: 0,
      brand: '',
      condition: 'New',
      image: '',
      images: [],
    })
    // Reset file states
    setMainImageFile(null)
    setAdditionalImageFiles([])
    setMainImagePreview('')
    setAdditionalImagePreviews([])
    setProductDialogOpen(true)
    // Reset specifications
    setSpecifications({})
  }

  const handleEditProduct = (product: ProductWithSpecs) => {
    setIsEditing(true)
    const formatDateTimeLocal = (value?: string | Date) => {
      if (!value) return ''
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return ''
      const pad = (n: number) => String(n).padStart(2, '0')
      const yyyy = d.getFullYear()
      const mm = pad(d.getMonth() + 1)
      const dd = pad(d.getDate())
      const hh = pad(d.getHours())
      const min = pad(d.getMinutes())
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`
    }

    const existingOffer = (product as any).offer || {}

    setCurrentProduct({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      countInStock: product.countInStock ?? product.count_in_stock ?? 0,
      brand: product.brand || '',
      condition: product.condition || 'New',
      image: product.image,
      images: product.images || [],
      offer: {
        enabled: !!existingOffer.enabled,
        type: (existingOffer.type as any) || 'percentage',
        amount: existingOffer.amount ?? 0,
        startDate: existingOffer.startDate
          ? formatDateTimeLocal(existingOffer.startDate)
          : '',
        endDate: existingOffer.endDate
          ? formatDateTimeLocal(existingOffer.endDate)
          : '',
      },
    })
    setMainImagePreview(product.image)
    setAdditionalImagePreviews(product.images || [])
    setMainImageFile(null)
    setAdditionalImageFiles([])
    // Robustly map existing specs to expected keys for the selected category
    const expectedSpecs = CATEGORY_SPECS[product.category || ''] || []
    const mappedSpecs: Record<string, string> = {}
    const productSpecs = product.specifications || {}
    expectedSpecs.forEach((key) => {
      mappedSpecs[key] = productSpecs[key] || ''
    })
    setSpecifications(mappedSpecs)
    setTimeout(() => setProductDialogOpen(true), 0)
  }

  const handleDeleteProduct = (product: Product) => {
    setDeleteTarget({ type: 'product', id: product.id, name: product.name })
    setDeleteDialogOpen(true)
  }

  const handleBrandChange = (value: string) => {
    const exists = brands.some(
      (b) => b.value.toLowerCase() === value.toLowerCase()
    )
    if (!exists) {
      setBrands((prev) => [
        ...prev,
        { value: value.toLowerCase(), label: value },
      ])
    }
    setCurrentProduct((prev) => ({
      ...prev,
      brand: value,
    }))
  }

  const handleProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const newValue =
      type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    // Map 'count_in_stock' input to 'countInStock' in state
    const mappedName = name === 'count_in_stock' ? 'countInStock' : name
    setCurrentProduct((prev) => ({
      ...prev,
      [mappedName]: newValue,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)

    let mainImageUrl = currentProduct.image
    let finalAdditionalImageUrls = [...currentProduct.images]

    try {
      // 1. Upload main image if a new one is selected
      if (mainImageFile) {
        const formData = new FormData()
        formData.append('images', mainImageFile)
        const res = await backendService.uploads.upload(formData)
        mainImageUrl = res.urls[0]
      }

      // 2. Upload additional images if new ones are selected
      if (additionalImageFiles.length > 0) {
        const formData = new FormData()
        additionalImageFiles.forEach((file) => {
          formData.append('images', file)
        })
        const res = await backendService.uploads.upload(formData)
        finalAdditionalImageUrls = [...finalAdditionalImageUrls, ...res.urls]
      }

      if (!mainImageUrl) {
        toast({
          title: 'Main image is required',
          description: 'Please select a main image for the product.',
          variant: 'destructive',
        })
        setSubmitLoading(false)
        return
      }

      const productDataToSubmit = {
        ...currentProduct,
        image: mainImageUrl,
        images: finalAdditionalImageUrls,
        specifications,
      }

      if (isEditing) {
        // 3. Update existing product
        await backendService.products.update(
          productDataToSubmit.id,
          productDataToSubmit
        )
        toast({
          title: 'Product updated',
          description: `${productDataToSubmit.name} has been updated.`,
        })
      } else {
        // 3. Create new product
        await backendService.products.create(productDataToSubmit)
        toast({
          title: 'Product created',
          description: `${productDataToSubmit.name} has been created.`,
        })
      }

      setProductDialogOpen(false)
      loadProducts()
    } catch (error) {
      console.error('Failed to save product:', error)
      toast({
        title: 'Save failed',
        description: 'An error occurred while saving the product.',
        variant: 'destructive',
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  // File handling functions
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMainImageFile(file)
      setMainImagePreview(URL.createObjectURL(file))
    }
  }

  const handleAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setAdditionalImageFiles((prev) => [...prev, ...newFiles])
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      setAdditionalImagePreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeAdditionalImage = (indexToRemove: number) => {
    // This function needs to differentiate between newly added files and existing image URLs
    const existingImagesCount = currentProduct.images.length

    if (indexToRemove < existingImagesCount) {
      // It's an existing image URL from the product
      const newImageUrls = currentProduct.images.filter(
        (_, i) => i !== indexToRemove
      )
      setCurrentProduct((prev) => ({ ...prev, images: newImageUrls }))
      setAdditionalImagePreviews(newImageUrls)
    } else {
      // It's a newly added file
      const fileIndex = indexToRemove - existingImagesCount
      const newFiles = additionalImageFiles.filter((_, i) => i !== fileIndex)
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))

      setAdditionalImageFiles(newFiles)
      setAdditionalImagePreviews([...currentProduct.images, ...newPreviews])
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
          setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
          break
        case 'user':
          await backendService.users.delete(deleteTarget.id)
          setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
          break
        case 'order':
          await backendService.orders.delete(deleteTarget.id)
          setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id))
          break
      }
      toast({
        title: 'Deleted successfully',
        description: `${deleteTarget.name} has been deleted.`,
      })
    } catch (error: any) {
      if (error.message === 'Product not found') {
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
        toast({
          title: 'Already deleted',
          description: `${deleteTarget.name} was already removed.`,
        })
      } else {
        toast({
          title: 'Delete failed',
          description: 'An error occurred while deleting.',
          variant: 'destructive',
        })
      }
    } finally {
      setSubmitLoading(false)
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    }
  }

  // Manual cache clear function
  const clearCache = async () => {
    try {
      // Call a backend endpoint to clear cache
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        }/products/clear-cache`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('gamecity_token')}`,
          },
        }
      )
      if (response.ok) {
        toast({
          title: 'Cache cleared',
          description: 'Product cache has been cleared successfully',
        })
        // Reload products after clearing cache
        loadProducts(currentPage)
      }
    } catch (error) {
      console.error('Failed to clear cache:', error)
      toast({
        title: 'Cache clear failed',
        description: 'Failed to clear product cache',
        variant: 'destructive',
      })
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
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
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="flex items-center p-6">
              <div className="p-3 rounded-full bg-yellow-500/20 mr-4">
                <Package className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Products
                </p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="flex items-center p-6">
              <div className="p-3 rounded-full bg-yellow-500/20 mr-4">
                <Users className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="flex items-center p-6">
              <div className="p-3 rounded-full bg-yellow-500/20 mr-4">
                <ShoppingCart className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="flex items-center p-6">
              <div className="p-3 rounded-full bg-yellow-500/20 mr-4">
                <LayoutDashboard className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Revenue
                </p>
                <p className="text-2xl font-bold">
                  {formatKESPrice(
                    orders
                      .filter((order) => order.is_delivered)
                      .reduce((sum, order) => sum + order.total_price, 0)
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-700">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Product Management</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={clearCache}
                      variant="outline"
                      className="border-gray-700 text-muted-foreground hover:text-foreground"
                    >
                      Clear Cache
                    </Button>
                    <Button
                      onClick={handleAddProduct}
                      className="bg-yellow-500 hover:bg-yellow-400 text-black"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                {/* Loading State */}
                {productsLoading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  </div>
                )}

                {/* Products List */}
                {!productsLoading && filteredProducts.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No products found</p>
                  </div>
                )}

                {!productsLoading && filteredProducts.length > 0 && (
                  <>
                    <div className="space-y-4">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <h3 className="font-semibold">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {product.category} •{' '}
                                {formatKESPrice(product.price)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              className="border-gray-700 text-muted-foreground hover:text-foreground"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                        <div className="text-sm text-muted-foreground">
                          Showing {(currentPage - 1) * 50 + 1} to{' '}
                          {Math.min(currentPage * 50, totalProducts)} of{' '}
                          {totalProducts} products
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadProducts(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="border-gray-700"
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground px-2">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadProducts(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="border-gray-700"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                {/* Loading State */}
                {usersLoading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  </div>
                )}

                {/* Users List */}
                {!usersLoading && filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}

                {!usersLoading && filteredUsers.length > 0 && (
                  <div className="space-y-4">
                    {filteredUsers.map((userData) => (
                      <div
                        key={userData.id}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
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
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(userData)}
                            className="border-gray-700 text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(userData)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
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
                      className="pl-8 bg-gray-800 border-gray-700"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg border border-gray-700">
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
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
                            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                          >
                            <div className="flex flex-col space-y-2 flex-1">
                              <div>
                                <h3 className="font-semibold">
                                  Order #{order.id}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {order.user?.name || 'Unknown User'} •{' '}
                                  {formatKESPrice(order.total_price)} •{' '}
                                  {new Date(
                                    order.paid_at || Date.now()
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              {/* Items Ordered */}
                              <div className="mt-2">
                                <span className="font-medium">Items:</span>
                                <ul className="ml-4 list-disc text-sm">
                                  {(order.order_items || []).map((item, i) => (
                                    <li key={item.product || item._id || i}>
                                      {(item.product as Product)?.name ||
                                        item.name}{' '}
                                      x {item.quantity} @{' '}
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
                                  order.is_delivered
                                    ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20'
                                    : 'text-muted-foreground'
                                }
                                onClick={() => {
                                  console.log(
                                    'Status button clicked',
                                    order.id,
                                    order.is_delivered
                                  )
                                  order.id &&
                                    handleOrderStatus(
                                      order.id,
                                      order.is_delivered
                                        ? 'pending'
                                        : 'completed'
                                    )
                                }}
                              >
                                {order.is_delivered ? (
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
            <Card className="bg-gray-900 border-gray-700">
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
                    className="bg-gray-800 border-gray-700"
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
                    className="bg-gray-800 border-gray-700"
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
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="storeCurrency">Currency</Label>
                  <Input
                    id="storeCurrency"
                    value={storeSettings.currency}
                    readOnly
                    className="bg-gray-800 border-gray-700 opacity-70"
                  />
                </div>
                <Button
                  onClick={saveSettings}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black"
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <CardContent>
            <ScrollArea className="h-[70vh]">
              {!isEditing || (currentProduct && currentProduct.name) ? (
                <form onSubmit={handleSubmit} className="p-4 space-y-6">
                  {/* Product Details Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={currentProduct.name}
                        onChange={handleProductChange}
                        className="bg-gray-800"
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Combobox
                        options={brands}
                        value={currentProduct.brand}
                        onChange={handleBrandChange}
                        placeholder="Select a brand..."
                        searchPlaceholder="Search brands or create new..."
                        emptyPlaceholder="No brand found."
                        allowCreation
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
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
                          id="category"
                          className="w-full bg-gray-800 border-gray-700"
                        >
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {CATEGORIES.filter((cat) => cat.id !== 'all').map(
                            (category) => (
                              <SelectItem
                                key={category.id}
                                value={category.name}
                              >
                                {category.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="price">Price (KES)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentProduct.price}
                        onChange={handleProductChange}
                        className="bg-gray-800"
                      />
                    </div>
                    <div>
                      <Label htmlFor="countInStock">Stock</Label>
                      <Input
                        id="countInStock"
                        name="countInStock"
                        type="number"
                        min="0"
                        value={currentProduct.countInStock}
                        onChange={handleProductChange}
                        className="bg-gray-800"
                      />
                    </div>
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select
                        value={currentProduct.condition || 'New'}
                        onValueChange={(value: 'New' | 'Pre-Owned') =>
                          setCurrentProduct({
                            ...currentProduct,
                            condition: value,
                          })
                        }
                      >
                        <SelectTrigger
                          id="condition"
                          className="w-full bg-gray-800 border-gray-700"
                        >
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Pre-Owned">Pre-Owned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={currentProduct.description}
                        onChange={handleProductChange}
                        className="bg-gray-800"
                        rows={6}
                      />
                    </div>
                  </div>

                  {/* Specifications Section */}
                  {CATEGORY_SPECS[currentProduct.category]?.length > 0 && (
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <h4 className="font-semibold mb-2">Specifications</h4>
                      </div>
                      {CATEGORY_SPECS[currentProduct.category]?.map((spec) => (
                        <div key={spec}>
                          <Label htmlFor={`spec-${spec}`}>{spec}</Label>
                          <Input
                            id={`spec-${spec}`}
                            name={spec}
                            value={specifications[spec] || ''}
                            onChange={(e) =>
                              handleSpecificationChange(spec, e.target.value)
                            }
                            className="bg-gray-800"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Offer Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Offer</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          id="offer-enabled"
                          type="checkbox"
                          checked={!!currentProduct.offer?.enabled}
                          onChange={(e) =>
                            setCurrentProduct((prev) => ({
                              ...prev,
                              offer: {
                                ...prev.offer,
                                enabled: e.target.checked,
                              },
                            }))
                          }
                        />
                        <Label htmlFor="offer-enabled">Enable Offer</Label>
                      </div>
                      <div>
                        <Label htmlFor="offer-type">Type</Label>
                        <select
                          id="offer-type"
                          className="w-full bg-gray-800 border-gray-700 rounded-md h-10 px-3"
                          value={currentProduct.offer?.type || 'percentage'}
                          onChange={(e) =>
                            setCurrentProduct((prev) => ({
                              ...prev,
                              offer: {
                                ...prev.offer,
                                type: e.target.value as any,
                              },
                            }))
                          }
                          disabled={!currentProduct.offer?.enabled}
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="offer-amount">Amount</Label>
                        <Input
                          id="offer-amount"
                          type="number"
                          min="0"
                          step="0.01"
                          className="bg-gray-800"
                          value={currentProduct.offer?.amount ?? 0}
                          onChange={(e) =>
                            setCurrentProduct((prev) => ({
                              ...prev,
                              offer: {
                                ...prev.offer,
                                amount: Number(e.target.value || 0),
                              },
                            }))
                          }
                          disabled={!currentProduct.offer?.enabled}
                        />
                      </div>
                      <div>
                        <Label htmlFor="offer-start">
                          Start Date (optional)
                        </Label>
                        <Input
                          id="offer-start"
                          type="datetime-local"
                          className="bg-gray-800"
                          value={currentProduct.offer?.startDate || ''}
                          onChange={(e) =>
                            setCurrentProduct((prev) => ({
                              ...prev,
                              offer: {
                                ...prev.offer,
                                startDate: e.target.value,
                              },
                            }))
                          }
                          disabled={!currentProduct.offer?.enabled}
                        />
                      </div>
                      <div>
                        <Label htmlFor="offer-end">End Date (optional)</Label>
                        <Input
                          id="offer-end"
                          type="datetime-local"
                          className="bg-gray-800"
                          value={currentProduct.offer?.endDate || ''}
                          onChange={(e) =>
                            setCurrentProduct((prev) => ({
                              ...prev,
                              offer: { ...prev.offer, endDate: e.target.value },
                            }))
                          }
                          disabled={!currentProduct.offer?.enabled}
                        />
                      </div>
                    </div>
                    {/* Simple validation hints */}
                    {currentProduct.offer?.enabled && (
                      <p className="text-xs text-muted-foreground">
                        {currentProduct.offer?.type === 'percentage'
                          ? 'Amount is percentage (0-100).'
                          : 'Amount is a fixed value in KES.'}
                      </p>
                    )}
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Main Image</Label>
                      {mainImagePreview && (
                        <div className="relative w-32 h-32">
                          <img
                            src={mainImagePreview}
                            alt="Main preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      )}
                      <Input
                        type="file"
                        onChange={handleMainImageChange}
                        className="bg-gray-800"
                        accept="image/*"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Images</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {additionalImagePreviews.map((preview, index) => (
                          <div key={index} className="relative w-32 h-32">
                            <img
                              src={preview}
                              alt={`Preview ${index}`}
                              className="w-full h-full object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => removeAdditionalImage(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Input
                        type="file"
                        multiple
                        onChange={handleAdditionalImagesChange}
                        className="bg-gray-800"
                        accept="image/*"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setProductDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitLoading}>
                      {submitLoading ? 'Saving...' : 'Save Product'}
                    </Button>
                  </DialogFooter>
                </form>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  Loading...
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
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
                className="bg-gray-800 border-gray-700"
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
                className="bg-gray-800 border-gray-700"
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
                className="rounded border-gray-700"
              />
              <Label htmlFor="userAdmin">Administrator</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserDialogOpen(false)}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={saveUser}
              disabled={submitLoading}
              className="bg-yellow-500 hover:bg-yellow-400 text-black"
            >
              {submitLoading ? 'Saving...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
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
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={submitLoading}
              className="bg-red-500 hover:bg-red-400 text-black"
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
