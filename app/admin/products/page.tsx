"use client"

import { useState, useEffect } from "react"
import { productAPI } from "@/lib/api"
import { formatPrice } from "@/lib/api/api-utils"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Package } from "lucide-react"
import Image from "next/image"

function isValidImageUrl(url: string) {
  return url && (url.startsWith("http://") || url.startsWith("https://"))
}

export default function AdminProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productAPI.getAll()
        setProducts(Array.isArray(data) ? data : data.products || [])
      } catch (error: any) {
        toast({
          title: "Failed to load products",
          description: error.response?.data?.message || "Could not fetch products",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filtered = products.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.supplier?.name || p.supplierName || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card>
          <CardContent className="p-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="mb-3 h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          All Products ({filtered.length})
        </h2>
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, category, or supplier..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-4 font-medium text-muted-foreground">Image</th>
                  <th className="p-4 font-medium text-muted-foreground">Name</th>
                  <th className="p-4 font-medium text-muted-foreground">Category</th>
                  <th className="p-4 font-medium text-muted-foreground">Price</th>
                  <th className="p-4 font-medium text-muted-foreground">Stock</th>
                  <th className="p-4 font-medium text-muted-foreground">Supplier</th>
                  <th className="p-4 font-medium text-muted-foreground">Added</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const productId = product.id || product._id
                  const imgSrc =
                    product.images?.length > 0 && isValidImageUrl(product.images[0])
                      ? product.images[0]
                      : "/placeholder.svg"

                  return (
                    <tr key={productId} className="border-b border-border last:border-0">
                      <td className="p-4">
                        <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                          {imgSrc === "/placeholder.svg" ? (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          ) : (
                            <Image
                              src={imgSrc}
                              alt={product.name || "Product"}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-foreground">{product.name || "Untitled"}</td>
                      <td className="p-4">
                        <Badge variant="outline">{product.category || "Uncategorized"}</Badge>
                      </td>
                      <td className="p-4 font-medium text-foreground">{formatPrice(product.price ?? 0)}</td>
                      <td className="p-4">
                        <Badge
                          className={
                            (product.stock ?? 0) > 10
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : (product.stock ?? 0) > 0
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }
                        >
                          {product.stock ?? 0}
                        </Badge>
                      </td>
                      <td className="p-4 text-foreground">
                        {product.supplier?.name || product.supplierName || <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {product.createdAt
                          ? new Date(product.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No products found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
