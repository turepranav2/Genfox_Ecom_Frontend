"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { productAPI, cartAPI, Product } from "@/lib/api"
import { formatPrice } from "@/lib/api/api-utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingBag, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

const categories = ["All", "Electronics", "Fashion", "Home & Kitchen", "Beauty", "Sports", "Books", "Toys", "Grocery", "Mobiles"]

export default function HomePage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const search = searchParams.get("q") || ""
  const [selectedCategory, setSelectedCategory] = useState("All")
  const router = useRouter()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  const handleQuickAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    const pid = product.id || (product as any)._id
    setAddingToCart(pid)
    try {
      await cartAPI.add({ productId: pid, quantity: 1 })
      toast({
        title: '\u2713 Added to cart!',
        description: product.name,
        action: <ToastAction altText="Go to Cart" onClick={() => router.push('/cart')}>Go to Cart</ToastAction>,
      })
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast({ title: 'Please login first', description: 'Login to add items to cart', variant: 'destructive' })
        router.push('/login')
      } else {
        toast({ title: 'Failed to add to cart', variant: 'destructive' })
      }
    } finally {
      setAddingToCart(null)
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productAPI.getAll()
        setProducts(Array.isArray(data) ? data : data.products || [])
      } catch (error: any) {
        toast({
          title: "Failed to load products",
          description: error.response?.data?.message || "Please try again",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const resolveImage = (images?: string[]) => {
    const img = images?.[0]
    if (!img || (!img.startsWith("http") && !img.startsWith("/"))) return "/placeholder.svg"
    return img
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      {/* Category pills */}
      <div className="mb-6 flex flex-wrap gap-2 animate-fade-in">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            className="transition-all duration-200 hover:scale-105"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-3">
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">No products found</p>
          <p className="text-sm text-muted-foreground">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 stagger-children">
          {filteredProducts.map((product) => (
            <Link key={product.id || (product as any)._id} href={`/product/${product.id || (product as any)._id}`}>
              <Card className="group h-full overflow-hidden border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden bg-white">
                    <Image
                      src={resolveImage(product.images)}
                      alt={product.name}
                      fill
                      className="object-contain p-3 transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
                        <span className="rounded-md bg-card px-3 py-1 text-sm font-medium text-card-foreground">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 p-3">
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    <h3 className="line-clamp-2 text-sm font-medium text-card-foreground leading-snug">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-card-foreground">{formatPrice(product.price)}</span>
                    </div>
                    {product.stock > 0 && product.stock <= 5 && (
                      <Badge variant="secondary" className="w-fit text-xs">Only {product.stock} left</Badge>
                    )}
                    {product.stock > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1.5 w-full text-xs transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                        disabled={addingToCart === (product.id || (product as any)._id)}
                        onClick={(e) => handleQuickAddToCart(e, product)}
                      >
                        <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                        {addingToCart === (product.id || (product as any)._id) ? 'Adding...' : 'Add to Cart'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}