"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cartAPI, CartItem } from "@/lib/api"
import { formatPrice } from "@/lib/api/api-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const data = await cartAPI.get()
      const rawItems = data.items || []
      // Normalize: backend may populate productId as full object
      const normalized = rawItems.map((item: any) => {
        const isPopulated = typeof item.productId === 'object' && item.productId !== null
        return {
          ...item,
          productId: isPopulated ? (item.productId._id || item.productId.id) : item.productId,
          product: item.product || (isPopulated ? item.productId : null),
        }
      })
      setCart(normalized)
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast({
          title: 'Failed to load cart',
          description: error.response?.data?.message || 'Please try again',
          variant: 'destructive'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(productId)
      return
    }

    setUpdating(true)
    try {
      await cartAPI.update({ productId, quantity })
      await loadCart()
    } catch (error: any) {
      toast({
        title: 'Failed to update quantity',
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }

  const removeItem = async (productId: string) => {
    setUpdating(true)
    try {
      await cartAPI.remove(productId)
      await loadCart()
      toast({
        title: 'Item removed from cart'
      })
    } catch (error: any) {
      toast({
        title: 'Failed to remove item',
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }

  const cartTotal = cart.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity
  }, 0)

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <p className="text-lg text-muted-foreground">Loading cart...</p>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-1 text-xl font-semibold text-foreground">Your cart is empty</h2>
        <p className="mb-4 text-sm text-muted-foreground">Add items to get started</p>
        <Button asChild>
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Continue Shopping
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Shopping Cart ({cart.length} item{cart.length !== 1 && "s"})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {cart.map((item, index) => (
                <div key={item.id || (typeof item.productId === 'string' ? item.productId : (item.productId as any)?._id) || `cart-${index}`}>
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image 
                        src={(() => { const img = item.product?.images?.[0]; return img && (img.startsWith('http') || img.startsWith('/')) ? img : '/placeholder.svg' })()} 
                        alt={item.product?.name || 'Product'} 
                        fill 
                        className="object-cover" 
                        sizes="96px" 
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <Link href={`/product/${item.productId}`} className="text-sm font-medium text-foreground hover:text-primary">
                        {item.product?.name}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {formatPrice(item.product?.price || 0)}
                        </span>
                      </div>
                      <div className="mt-auto flex items-center gap-3">
                        <div className="flex items-center gap-0 rounded-md border border-border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={updating}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="flex h-8 w-8 items-center justify-center text-sm font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={updating}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.productId)}
                          disabled={updating}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Price summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base uppercase tracking-wide text-muted-foreground">Price Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Price ({cart.length} items)</span>
                <span className="text-foreground">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Delivery Charges</span>
                <span className="text-success">FREE</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span className="text-foreground">Total Amount</span>
                <span className="text-foreground">{formatPrice(cartTotal)}</span>
              </div>
              <Button size="lg" className="mt-2 w-full" asChild>
                <Link href="/checkout">Place Order</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}