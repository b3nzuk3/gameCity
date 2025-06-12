import React, { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Check,
  Plus,
  ChevronRight,
  Package,
  PcCase,
  Cpu,
  Smartphone,
  Monitor,
  HardDrive,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCart } from '@/contexts/CartContext'
import { formatKESPrice } from '@/lib/currency'
import atlasProductService, { Product } from '@/services/atlasProductService'

// Remove the hardcoded partCategories and instead define the categories to fetch
const PART_CATEGORIES = [
  {
    id: 'cpu',
    name: 'CPU',
    icon: <Cpu className="w-5 h-5" />,
    dbCategory: 'Processors',
  },
  {
    id: 'motherboard',
    name: 'Motherboard',
    icon: <PcCase className="w-5 h-5" />,
    dbCategory: 'Motherboards',
  },
  {
    id: 'gpu',
    name: 'Graphics Card',
    icon: <Smartphone className="w-5 h-5" />,
    dbCategory: 'Graphics Cards',
  },
  {
    id: 'ram',
    name: 'Memory (RAM)',
    icon: <HardDrive className="w-5 h-5" />,
    dbCategory: 'Memory',
  },
  {
    id: 'storage',
    name: 'Storage',
    icon: <HardDrive className="w-5 h-5" />,
    dbCategory: 'Storage',
  },
  {
    id: 'case',
    name: 'PC Case',
    icon: <Package className="w-5 h-5" />,
    dbCategory: 'Cases',
  },
  {
    id: 'cooling',
    name: 'CPU Cooling',
    icon: <Monitor className="w-5 h-5" />,
    dbCategory: 'Accessories',
  },
  {
    id: 'psu',
    name: 'Power Supply',
    icon: <HardDrive className="w-5 h-5" />,
    dbCategory: 'Power Supply',
  },
]

const BuildPC = () => {
  const { toast } = useToast()
  const { addToCart } = useCart()
  const [selectedParts, setSelectedParts] = useState<
    Record<string, Product | null>
  >({})
  const [categoryProducts, setCategoryProducts] = useState<
    Record<string, Product[]>
  >({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      const results: Record<string, Product[]> = {}
      for (const cat of PART_CATEGORIES) {
        try {
          results[cat.id] = await atlasProductService.getProductsByCategory(
            cat.dbCategory
          )
        } catch {
          results[cat.id] = []
        }
      }
      setCategoryProducts(results)
      setLoading(false)
    }
    fetchAll()
  }, [])

  const handlePartSelect = (categoryId: string, part: Product) => {
    setSelectedParts((prev) => ({
      ...prev,
      [categoryId]: {
        ...part,
        categoryId,
        categoryName: PART_CATEGORIES.find((cat) => cat.id === categoryId)
          ?.name,
      },
    }))

    toast({
      title: 'Part selected',
      description: `${part.name} added to your build`,
    })
  }

  const totalPrice = Object.values(selectedParts)
    .filter((part): part is Product => part !== null)
    .reduce((sum, part) => sum + part.price, 0)

  const selectedPartsCount = Object.values(selectedParts).filter(Boolean).length

  const addAllToCart = () => {
    const selectedPartsArray = Object.values(selectedParts).filter(
      (part): part is Product => part !== null
    )

    if (selectedPartsArray.length === 0) {
      return
    }

    // Add each selected part to the cart
    selectedPartsArray.forEach((part) => {
      addToCart({
        id: part.id,
        name: part.name,
        price: part.price,
        image: '/placeholder.svg', // Default image for PC parts
        category: part.categoryName,
      })
    })

    toast({
      title: 'Added to cart',
      description: 'All selected components have been added to your cart',
    })
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Component selection */}
          <div className="w-full md:w-2/3">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Build Your Custom PC</h1>
              <p className="text-muted-foreground">
                Select components for your custom build and see real-time
                compatibility and performance insights.
              </p>
            </div>

            <Tabs defaultValue={PART_CATEGORIES[0].id} className="w-full">
              <TabsList className="w-full flex overflow-x-auto bg-forest-800 border border-forest-700 rounded-lg p-1 mb-8 justify-start">
                {PART_CATEGORIES.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex-shrink-0 data-[state=active]:bg-forest-700 data-[state=active]:text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span>{category.name}</span>
                      {selectedParts[category.id] && (
                        <Check size={14} className="text-emerald-400" />
                      )}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {PART_CATEGORIES.map((category) => (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryProducts[category.id]?.map((part) => (
                      <Card
                        key={part.id}
                        className={`bg-forest-800 border ${
                          selectedParts[category.id]?.id === part.id
                            ? 'border-emerald-500'
                            : 'border-forest-700'
                        } hover:border-emerald-500/70 transition-colors cursor-pointer`}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{part.name}</CardTitle>
                          <CardDescription>{part.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{part.name}</h3>
                            <p className="text-xl font-bold text-emerald-400">
                              {formatKESPrice(part.price)}
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                          <Button
                            onClick={() => handlePartSelect(category.id, part)}
                            variant={
                              selectedParts[category.id]?.id === part.id
                                ? 'default'
                                : 'outline'
                            }
                            className={
                              selectedParts[category.id]?.id === part.id
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white w-full'
                                : 'border-forest-700 w-full'
                            }
                          >
                            {selectedParts[category.id]?.id === part.id ? (
                              <Check size={16} className="mr-2" />
                            ) : (
                              <Plus size={16} className="mr-2" />
                            )}
                            {selectedParts[category.id]?.id === part.id
                              ? 'Selected'
                              : 'Select'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Build summary */}
          <div className="w-full md:w-1/3 sticky top-24">
            <Card className="bg-forest-800 border-forest-700">
              <CardHeader>
                <CardTitle>Your Build Summary</CardTitle>
                <CardDescription>
                  {selectedPartsCount} of 8 components selected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(selectedParts).map(([categoryId, part]) => (
                  <div
                    key={categoryId}
                    className="flex justify-between items-center py-2 border-b border-forest-700 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {
                          PART_CATEGORIES.find((cat) => cat.id === categoryId)
                            ?.name
                        }
                      </p>
                      {part ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm">{part.name}</p>
                            <p className="text-sm text-emerald-400">
                              {formatKESPrice(part.price)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm italic text-muted-foreground">
                          Not selected
                        </p>
                      )}
                    </div>
                    {part && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => {
                          setSelectedParts((prev) => ({
                            ...prev,
                            [categoryId]: null,
                          }))
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}

                <div className="pt-4 border-t border-forest-700">
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-forest-600">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl text-emerald-400">
                      {formatKESPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                  disabled={selectedPartsCount === 0}
                  onClick={addAllToCart}
                >
                  Add All to Cart
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-forest-700 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSelectedParts({
                      cpu: null,
                      motherboard: null,
                      gpu: null,
                      ram: null,
                      storage: null,
                      case: null,
                      cooling: null,
                      psu: null,
                    })
                    toast({
                      title: 'Build cleared',
                      description: 'Your PC build has been reset',
                    })
                  }}
                >
                  Clear Build
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default BuildPC
