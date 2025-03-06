
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, MinusCircle, PlusCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  
  const subtotal = getCartTotal();
  const shipping = subtotal > 1000 ? 0 : 29.99;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "greenbits10") {
      setPromoApplied(true);
    }
  };

  // Helper function to get item ID consistently
  const getItemId = (item: any) => {
    return item.product || item._id || item.id;
  };

  const isCartEmpty = cartItems.length === 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 mt-16">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        {isCartEmpty ? (
          <div className="bg-forest-800 rounded-lg p-12 text-center">
            <div className="flex justify-center mb-4">
              <ShoppingBag size={64} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link to="/category/monitors">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-forest-800 rounded-lg border border-forest-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-forest-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-700">
                    {cartItems.map((item) => (
                      <tr key={getItemId(item)} className="hover:bg-forest-700/30">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="h-16 w-16 flex-shrink-0 rounded bg-forest-700 overflow-hidden">
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-muted-foreground"
                              onClick={() => updateQuantity(getItemId(item), item.quantity - 1)}
                            >
                              <MinusCircle size={16} />
                            </Button>
                            <span className="mx-2 w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-muted-foreground"
                              onClick={() => updateQuantity(getItemId(item), item.quantity + 1)}
                            >
                              <PlusCircle size={16} />
                            </Button>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
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
              
              <div className="mt-6 flex flex-wrap gap-4">
                <Link to="/category/monitors">
                  <Button variant="outline" className="border-forest-700 text-muted-foreground hover:text-foreground">
                    Continue Shopping
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-forest-700 text-muted-foreground hover:text-foreground"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-forest-800 rounded-lg border border-forest-700 p-6">
                <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount (10%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-forest-700 pt-4">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Promo Code */}
                <div className="mb-6">
                  <label htmlFor="promo" className="block text-sm font-medium mb-2">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      id="promo" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 bg-forest-900 border-forest-700"
                      disabled={promoApplied}
                    />
                    <Button 
                      onClick={applyPromoCode}
                      disabled={promoApplied || !promoCode}
                      variant={promoApplied ? "outline" : "default"}
                      className={promoApplied ? "border-emerald-700 text-emerald-400" : "bg-emerald-600 hover:bg-emerald-500 text-white"}
                    >
                      {promoApplied ? "Applied" : "Apply"}
                    </Button>
                  </div>
                  {promoApplied && (
                    <p className="mt-2 text-xs text-emerald-400">Promo code "GREENBITS10" applied successfully!</p>
                  )}
                  {!promoApplied && (
                    <p className="mt-2 text-xs text-muted-foreground">Try "GREENBITS10" for 10% off</p>
                  )}
                </div>
                
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Checkout
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
