"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { productAPI, cartAPI, Product, categoryAPI, Category, bannerAPI, Banner } from "@/lib/api"
import { formatPrice } from "@/lib/api/api-utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingBag, ShoppingCart, ArrowRight, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { HeroBannerCarousel } from "@/components/hero-banner-carousel"

function HomePageContent() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const searchParams = useSearchParams()
  const search = searchParams.get("q") || ""
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
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
    const fetchData = async () => {
      try {
        const [productsData, bannersData, categoriesData] = await Promise.allSettled([
          productAPI.getAll(),
          bannerAPI.getActive(),
          categoryAPI.getAll(),
        ])
        if (productsData.status === "fulfilled") {
          const d = productsData.value
          setProducts(Array.isArray(d) ? d : d.products || [])
        }
        if (bannersData.status === "fulfilled") {
          setBanners(bannersData.value)
        }
        if (categoriesData.status === "fulfilled") {
          setCategories(categoriesData.value)
        }
      } catch (error: any) {
        toast({
          title: "Failed to load data",
          description: error.response?.data?.message || "Please try again",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Build category names from API + fallback
  const fallbackCategories = ["Electronics", "Fashion", "Home & Kitchen", "Beauty", "Sports", "Books", "Toys", "Grocery"]
  const dynamicCategoryNames = categories.length > 0 ? categories.map((c) => c.name) : fallbackCategories
  const allCategoryNames = ["All", ...dynamicCategoryNames]

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory
    const matchesSubcategory = !selectedSubcategory || (p as any).subcategory === selectedSubcategory
    return matchesSearch && matchesCategory && matchesSubcategory
  })

  const resolveImage = (images?: string[]) => {
    const img = images?.[0]
    if (!img || (!img.startsWith("http") && !img.startsWith("/"))) return "/placeholder.svg"
    return img
  }

  // Get subcategories for selected category
  const activeCategorySubs =
    selectedCategory !== "All"
      ? categories.find((c) => c.name === selectedCategory)?.subcategories || []
      : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      {/* Hero Banner Carousel */}
      {banners.length > 0 && (
        <div className="mb-6 animate-fade-in">
          <HeroBannerCarousel banners={banners} />
        </div>
      )}

      {/* Promo Banner Box */}
      <div className="mb-6 animate-fade-in overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 md:p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
              Welcome to GenFox
            </p>
            <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
              Shop the Best Deals on Electronics, Fashion & More
            </h2>
            <p className="text-sm text-primary-foreground/80 md:text-base">
              Discover amazing products at unbeatable prices. Free delivery on orders above Rs. 499.
            </p>
          </div>
          <Button
            size="lg"
            className="mt-3 w-fit bg-accent text-accent-foreground hover:bg-accent/90 font-semibold md:mt-0"
            onClick={() => {
              const el = document.getElementById('products-section')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Shop Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Categories</h3>
        </div>
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {allCategoryNames.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              className="transition-all duration-200 hover:scale-105"
              onClick={() => {
                setSelectedCategory(cat)
                setSelectedSubcategory(null)
              }}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Subcategories (when a category with subs is selected) */}
      {activeCategorySubs.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2 animate-fade-in">
          <Button
            variant={!selectedSubcategory ? "secondary" : "ghost"}
            size="sm"
            className="text-xs"
            onClick={() => setSelectedSubcategory(null)}
          >
            All {selectedCategory}
          </Button>
          {activeCategorySubs.map((sub: any) => (
            <Button
              key={sub.id || sub._id || sub.name}
              variant={selectedSubcategory === sub.name ? "secondary" : "ghost"}
              size="sm"
              className="text-xs"
              onClick={() => setSelectedSubcategory(sub.name)}
            >
              {sub.name}
            </Button>
          ))}
        </div>
      )}

      {/* Products Header */}
      <div className="mb-4 flex items-center justify-between" id="products-section">
        <h2 className="text-lg font-bold text-foreground">
          {selectedCategory === "All" ? "All Products" : selectedCategory}
          {selectedSubcategory && ` / ${selectedSubcategory}`}
        </h2>
        <span className="text-sm text-muted-foreground">{filteredProducts.length} products</span>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(10)].map((_, i) => (
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 stagger-children">
          {filteredProducts.map((product) => {
            const pid = product.id || (product as any)._id
            const mrp = (product as any).mrp || 0
            const discount = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0
            return (
              <Link key={pid} href={`/product/${pid}`}>
                <Card className="group h-full overflow-hidden border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden bg-white">
                      <Image
                        src={resolveImage(product.images)}
                        alt={product.name}
                        fill
                        className="object-contain p-3 transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                      {discount > 0 && (
                        <Badge className="absolute left-2 top-2 bg-accent text-accent-foreground text-xs font-bold">
                          {discount}% OFF
                        </Badge>
                      )}
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
                        {mrp > product.price && (
                          <span className="text-xs text-muted-foreground line-through">{formatPrice(mrp)}</span>
                        )}
                      </div>
                      {product.stock > 0 && product.stock <= 5 && (
                        <Badge variant="secondary" className="w-fit text-xs">Only {product.stock} left</Badge>
                      )}
                      {product.stock > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-1.5 w-full text-xs transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                          disabled={addingToCart === pid}
                          onClick={(e) => handleQuickAddToCart(e, product)}
                        >
                          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                          {addingToCart === pid ? 'Adding...' : 'Add to Cart'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  )
}