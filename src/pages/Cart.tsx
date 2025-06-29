import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Trash2,
  MinusCircle,
  PlusCircle,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatKESPrice } from '@/lib/currency'
import MpesaPayment from '@/components/MpesaPayment'
import { toast } from '@/components/ui/use-toast'
import backendService from '@/services/backendService'
import { useAuth } from '@/contexts/AuthContext'

const Cart = () => {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, clearCart, total } =
    useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const subtotal = total
  const shipping = subtotal > 1000 ? 0 : 29.99
  const finalTotal = subtotal + shipping

  // Helper function to get item ID consistently
  const getItemId = (item: any) => {
    return item.product || item._id || item.id
  }

  const isCartEmpty = cartItems.length === 0

  const handlePaymentSuccess = async () => {
    try {
      setLoading(true)

      // Create order items from cart
      const orderItems = cartItems.map((item) => ({
        product: item.product?._id || item.product || item._id || item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      }))

      // Create order in database
      await backendService.orders.create({
        orderItems,
        paymentMethod: 'M-Pesa',
        itemsPrice: subtotal,
        totalPrice: finalTotal,
      })

      // Clear cart and show success message
      clearCart()
      toast({
        title: 'Order placed successfully',
        description: 'Thank you for your purchase!',
      })

      // Redirect to success page or home
      navigate('/')
    } catch (error) {
      console.error('Failed to create order:', error)
      toast({
        title: 'Order creation failed',
        description:
          'There was an error creating your order. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentError = (error: string) => {
    toast({
      title: 'Payment failed',
      description: error,
      variant: 'destructive',
    })
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 mt-16">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {isCartEmpty ? (
          <div className="bg-gray-900 rounded-lg p-12 text-center">
            <div className="flex justify-center mb-4">
              <ShoppingBag size={64} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link to="/category/monitors">
              <Button className="bg-yellow-500 hover:bg-yellow-400 text-black">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left">Product</th>
                        <th className="px-4 py-3 text-left">Price</th>
                        <th className="px-4 py-3 text-center">Quantity</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {cartItems.map((item) => (
                        <tr
                          key={getItemId(item)}
                          className="hover:bg-gray-800/30"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="h-16 w-16 flex-shrink-0 rounded bg-gray-700 overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium">
                                  {item.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-yellow-400">
                                {formatKESPrice(item.price)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Subtotal:{' '}
                                {formatKESPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                            <div className="flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground"
                                onClick={() =>
                                  updateQuantity(
                                    getItemId(item),
                                    item.quantity - 1
                                  )
                                }
                              >
                                <MinusCircle size={16} />
                              </Button>
                              <span className="mx-2 w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground"
                                onClick={() =>
                                  updateQuantity(
                                    getItemId(item),
                                    item.quantity + 1
                                  )
                                }
                              >
                                <PlusCircle size={16} />
                              </Button>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              onClick={() => removeFromCart(getItemId(item))}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link to="/category/monitors" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-muted-foreground hover:text-foreground"
                  >
                    Continue Shopping
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-muted-foreground hover:text-foreground"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-8 lg:mt-0">
              <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 sm:p-6">
                <h2 className="text-lg font-medium mb-4">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-2">
                    <span>Subtotal</span>
                    <span>{formatKESPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-700">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? 'Free' : formatKESPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between py-4 border-t border-gray-700">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-yellow-400">
                      {formatKESPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {!user ? (
                  <div className="mb-4 p-4 bg-yellow-900/40 border border-yellow-700 rounded text-yellow-200 text-center">
                    <p className="mb-2 font-semibold">
                      You must be signed in to checkout.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button
                        className="bg-yellow-500 hover:bg-yellow-400 text-black"
                        onClick={() => navigate('/signin')}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="outline"
                        className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                        onClick={() => navigate('/signup')}
                      >
                        Create Account
                      </Button>
                    </div>
                  </div>
                ) : null}

                {/* M-Pesa Payment */}
                {user && (
                  <>
                    {/* WhatsApp Order Button */}
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white w-full mb-4 flex items-center justify-center gap-2"
                      onClick={() => {
                        const phone = '254712248706'
                        const itemsList = cartItems
                          .map(
                            (item) =>
                              `- ${item.name} x${
                                item.quantity
                              } @ KES ${item.price.toLocaleString()}`
                          )
                          .join('%0A')
                        const message = `Hello, I would like to order:%0A${itemsList}%0A%0ATotal: KES ${finalTotal.toLocaleString()}`
                        const url = `https://wa.me/${phone}?text=${message}`
                        window.open(url, '_blank')
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.25 12c0-4.556-3.694-8.25-8.25-8.25S3.75 7.444 3.75 12c0 1.396.34 2.71.94 3.86L3 21l5.29-1.67A8.19 8.19 0 0012 20.25c4.556 0 8.25-3.694 8.25-8.25z"
                        />
                      </svg>
                      Order on WhatsApp
                    </Button>
                    <div className="text-center text-muted-foreground text-sm mb-4">
                      or
                    </div>
                    <MpesaPayment
                      amount={finalTotal}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Cart
