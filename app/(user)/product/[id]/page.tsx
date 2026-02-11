"use client"

import { use, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { productAPI, cartAPI, Product } from "@/lib/api"
import { formatPrice } from "@/lib/api/api-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, ShoppingCart, ArrowLeft, Check, Truck, Shield, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      const data = await productAPI.getById(id)
      setProduct(data)

      // Load all products to find related ones
      const allProducts = await productAPI.getAll()
      const arr = Array.isArray(allProducts) ? allProducts : allProducts.products || []
      const dataId = data.id || (data as any)._id
      const related = arr
        .filter((p: Product) => p.category === data.category && (p.id || (p as any)._id) !== dataId)
        .slice(0, 4)
      setRelatedProducts(related)
    } catch (error: any) {
      toast({
        title: 'Product not found',
        description: 'This product does not exist',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    setAdding(true)
    try {
      await cartAPI.add({
        productId: product.id || (product as any)._id,
        quantity: 1
      })
      
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
      
      toast({
        title: '\u2713 Added to cart!',
        description: `${product.name} \u2014 Proceed to checkout`,
        action: <ToastAction altText="Go to Cart" onClick={() => router.push('/cart')}>Go to Cart</ToastAction>,
      })
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast({
          title: 'Please login first',
          description: 'You need to be logged in to add items to cart',
          variant: 'destructive'
        })
        router.push('/login')
      } else {
        toast({
          title: 'Failed to add to cart',
          description: error.response?.data?.message || 'Please try again',
          variant: 'destructive'
        })
      }
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="text-lg font-medium text-foreground">Product not found</p>
        <Link href="/" className="mt-2 text-sm text-primary hover:underline">
          Back to products
        </Link>
      </div>
    )
  }

  const resolveImage = (images?: string[]) => {
    const img = images?.[0]
    if (!img || (!img.startsWith("http") && !img.startsWith("/"))) return "/placeholder.svg"
    return img
  }

  const inStock = product.stock > 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <div className="grid gap-6 md:grid-cols-2 animate-fade-in-up">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-white transition-transform duration-300 hover:scale-[1.02]">
          <Image
            src={resolveImage(product.images)}
            alt={product.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <h1 className="text-xl font-bold text-foreground md:text-2xl">{product.name}</h1>
          </div>

          <Separator />

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-base text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
                <span className="text-sm font-semibold text-green-500">
                  {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                </span>
              </>
            )}
          </div>

          {product.ratings && product.ratings.count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                {product.ratings.average.toFixed(1)} <Star className="h-3 w-3 fill-current" />
              </div>
              <span className="text-xs text-muted-foreground">{product.ratings.count} rating{product.ratings.count !== 1 && 's'}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground">Stock: {product.stock} available</p>

          {product.description && (
            <>
              <Separator />
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">Description</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col items-center gap-1 rounded-md border border-border bg-card p-3">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-md border border-border bg-card p-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">1 Year Warranty</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-md border border-border bg-card p-3">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">7 Day Return</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!inStock || adding}
              onClick={handleAddToCart}
            >
              {added ? (
                <><Check className="mr-2 h-4 w-4" /> Added!</>
              ) : (
                <><ShoppingCart className="mr-2 h-4 w-4" /> {adding ? 'Adding...' : 'Add to Cart'}</>
              )}
            </Button>
            <Button 
              size="lg" 
              className="flex-1" 
              disabled={!inStock || adding}
              onClick={async () => {
                if (!product) return
                setAdding(true)
                try {
                  await cartAPI.add({
                    productId: product.id || (product as any)._id,
                    quantity: 1
                  })
                  router.push('/checkout')
                } catch (error: any) {
                  if (error.response?.status === 401) {
                    toast({
                      title: 'Please login first',
                      description: 'You need to be logged in to buy',
                      variant: 'destructive'
                    })
                    router.push('/login')
                  } else {
                    toast({
                      title: 'Failed to add to cart',
                      description: error.response?.data?.message || 'Please try again',
                      variant: 'destructive'
                    })
                  }
                } finally {
                  setAdding(false)
                }
              }}
            >
              Buy Now
            </Button>
          </div>

          {!inStock && (
            <p className="text-sm font-medium text-destructive">This item is currently out of stock</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Similar Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {relatedProducts.map((p) => {
                  const pid = p.id || (p as any)._id
                  return (
                  <Link key={pid} href={`/product/${pid}`} className="group">
                    <div className="relative aspect-square overflow-hidden rounded-md bg-white">
                      <Image 
                        src={resolveImage(p.images)} 
                        alt={p.name} 
                        fill 
                        className="object-contain p-2 transition-transform group-hover:scale-105" 
                        sizes="25vw" 
                      />
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-sm font-bold text-foreground">{formatPrice(p.price)}</p>
                  </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}