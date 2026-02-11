"use client"

import { useState, useEffect } from "react"
import { adminAPI, productAPI } from "@/lib/api"
import { formatPrice } from "@/lib/api/api-utils"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, Package, Check, X, Loader2, ShieldCheck, Clock, AlertTriangle } from "lucide-react"
import Image from "next/image"

function isValidImageUrl(url: string) {
  return url && (url.startsWith("http://") || url.startsWith("https://"))
}

const approvalStatusColors: Record<string, string> = {
  APPROVED: "bg-emerald-900/40 text-emerald-400 border border-emerald-700/50",
  PENDING: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/50",
  REJECTED: "bg-red-900/40 text-red-400 border border-red-700/50",
}

export default function AdminProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      // Try admin endpoint first, fallback to public
      let data: any
      try {
        data = await adminAPI.getAllProducts()
      } catch {
        data = await productAPI.getAll()
      }
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

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleApprove = async (productId: string) => {
    setActionLoading(productId)
    try {
      await adminAPI.approveProduct(productId)
      setProducts((prev) =>
        prev.map((p) =>
          (p.id === productId || p._id === productId) ? { ...p, approvalStatus: "APPROVED" } : p
        )
      )
      toast({ title: "✅ Product approved", description: "Product is now visible on the store" })
    } catch (error: any) {
      toast({
        title: "Failed to approve",
        description: error.response?.data?.message || "Could not approve product",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (productId: string) => {
    setActionLoading(productId)
    try {
      await adminAPI.rejectProduct(productId)
      setProducts((prev) =>
        prev.map((p) =>
          (p.id === productId || p._id === productId) ? { ...p, approvalStatus: "REJECTED" } : p
        )
      )
      toast({ title: "Product rejected", description: "Product has been rejected" })
    } catch (error: any) {
      toast({
        title: "Failed to reject",
        description: error.response?.data?.message || "Could not reject product",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getApprovalStatus = (product: any) => {
    return (product.approvalStatus || "APPROVED").toUpperCase()
  }

  const filtered = products
    .filter((p) => filterStatus === "all" || getApprovalStatus(p) === filterStatus)
    .filter(
      (p) =>
        (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.supplier?.name || p.supplierName || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

  const totalApproved = products.filter((p) => getApprovalStatus(p) === "APPROVED").length
  const totalPending = products.filter((p) => getApprovalStatus(p) === "PENDING").length
  const totalRejected = products.filter((p) => getApprovalStatus(p) === "REJECTED").length

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
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-foreground">{products.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-lg font-bold text-foreground">{totalApproved}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-foreground">{totalPending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="text-lg font-bold text-foreground">{totalRejected}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, category, or supplier..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products ({products.length})</SelectItem>
            <SelectItem value="APPROVED">Approved ({totalApproved})</SelectItem>
            <SelectItem value="PENDING">Pending ({totalPending})</SelectItem>
            <SelectItem value="REJECTED">Rejected ({totalRejected})</SelectItem>
          </SelectContent>
        </Select>
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
                  <th className="p-4 font-medium text-muted-foreground">Status</th>
                  <th className="p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const productId = product.id || product._id
                  const imgSrc =
                    product.images?.length > 0 && isValidImageUrl(product.images[0])
                      ? product.images[0]
                      : "/placeholder.svg"
                  const status = getApprovalStatus(product)

                  return (
                    <tr key={productId} className="border-b border-border last:border-0 transition-colors hover:bg-secondary/30">
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
                      <td className="p-4">
                        <Badge className={approvalStatusColors[status] || approvalStatusColors.PENDING}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/30 bg-transparent px-2"
                                onClick={() => handleApprove(productId)}
                                disabled={actionLoading === productId}
                              >
                                {actionLoading === productId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="mr-1 h-3.5 w-3.5" /> Approve</>}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 border-red-700/50 text-red-400 hover:bg-red-900/30 bg-transparent px-2"
                                    disabled={actionLoading === productId}
                                  >
                                    <X className="mr-1 h-3.5 w-3.5" /> Reject
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Product</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to reject &quot;{product.name}&quot;? The supplier will be notified.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleReject(productId)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                          {status === "APPROVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 border-red-700/50 text-red-400 hover:bg-red-900/30 bg-transparent px-2"
                              onClick={() => handleReject(productId)}
                              disabled={actionLoading === productId}
                            >
                              {actionLoading === productId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><X className="mr-1 h-3.5 w-3.5" /> Revoke</>}
                            </Button>
                          )}
                          {status === "REJECTED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/30 bg-transparent px-2"
                              onClick={() => handleApprove(productId)}
                              disabled={actionLoading === productId}
                            >
                              {actionLoading === productId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="mr-1 h-3.5 w-3.5" /> Re-Approve</>}
                            </Button>
                          )}
                        </div>
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
