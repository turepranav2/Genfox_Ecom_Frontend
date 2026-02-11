"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { productAPI, uploadAPI, categoryAPI, Category } from "@/lib/api"
import { formatPrice } from "@/lib/api/api-utils"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Plus, Pencil, Trash2, Search, Upload, Loader2, ImagePlus, X as XIcon } from "lucide-react"

const fallbackCategories = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
  "Toys",
  "Grocery",
]

export default function SupplierProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([])

  // Form state
  const [formName, setFormName] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formStock, setFormStock] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formSubcategory, setFormSubcategory] = useState("")
  const [formImages, setFormImages] = useState("")
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])

  const categories = dynamicCategories.length > 0 ? dynamicCategories : fallbackCategories

  // Get subcategories for the selected category
  const currentSubcategories = allCategories.find((c) => c.name === formCategory)?.subcategories || []

  const fetchProducts = async () => {
    try {
      const [prodData, catData] = await Promise.allSettled([
        productAPI.getSupplierProducts(),
        categoryAPI.getAll(),
      ])
      if (prodData.status === "fulfilled") {
        const d = prodData.value
        setProducts(Array.isArray(d) ? d : d.products || [])
      }
      if (catData.status === "fulfilled") {
        const cats = catData.value
        setAllCategories(cats)
        setDynamicCategories(cats.map((c: Category) => c.name))
      }
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

  const resetForm = () => {
    setFormName("")
    setFormPrice("")
    setFormStock("")
    setFormCategory("")
    setFormSubcategory("")
    setFormImages("")
    setUploadedImageUrls([])
    setEditingId(null)
  }

  const openEdit = (p: any) => {
    const pid = p.id || p._id
    setEditingId(pid)
    setFormName(p.name || "")
    setFormPrice(String(p.price || ""))
    setFormStock(String(p.stock ?? ""))
    setFormCategory(p.category || "")
    setFormSubcategory(p.subcategory || "")
    setFormImages((p.images || []).join(", "))
    setUploadedImageUrls(p.images || [])
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formName || !formPrice) return
    setSaving(true)

    const productData = {
      name: formName,
      price: Number(formPrice),
      stock: Number(formStock) || 0,
      category: formCategory,
      subcategory: formSubcategory || undefined,
      images: uploadedImageUrls.length > 0
        ? uploadedImageUrls
        : formImages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
    }

    try {
      if (editingId) {
        const updated = await productAPI.update(editingId, productData)
        setProducts((prev) =>
          prev.map((p) =>
            (p.id === editingId || p._id === editingId) ? { ...p, ...productData, ...(updated.product || updated) } : p
          )
        )
        toast({ title: "Product updated", description: `${formName} has been updated` })
      } else {
        const created = await productAPI.create(productData)
        const newProduct = created.product || created
        setProducts((prev) => [...prev, newProduct])
        toast({ title: "✅ Product created", description: `${formName} has been submitted for admin approval` })
      }
      setDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast({
        title: editingId ? "Failed to update product" : "Failed to create product",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (productId: string) => {
    setDeletingId(productId)
    try {
      await productAPI.delete(productId)
      setProducts((prev) => prev.filter((p) => (p.id || p._id) !== productId))
      toast({ title: "Product deleted", description: "Product has been removed" })
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.response?.data?.message || "Could not delete product",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = products.filter((p) =>
    (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card>
          <CardContent className="p-4">
            {[...Array(5)].map((_, i) => (
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
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div>
                <Label className="text-foreground">Product Name</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1" placeholder="e.g. Wireless Earbuds" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">{"Price (INR)"}</Label>
                  <Input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="mt-1" placeholder="1999" />
                </div>
                <div>
                  <Label className="text-foreground">Stock</Label>
                  <Input type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)} className="mt-1" placeholder="100" />
                </div>
              </div>
              <div>
                <Label className="text-foreground">Category</Label>
                <Select value={formCategory} onValueChange={(v) => { setFormCategory(v); setFormSubcategory(""); }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {currentSubcategories.length > 0 && (
                <div>
                  <Label className="text-foreground">Subcategory</Label>
                  <Select value={formSubcategory} onValueChange={setFormSubcategory}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select subcategory (optional)" /></SelectTrigger>
                    <SelectContent>
                      {currentSubcategories.map((s: any) => (
                        <SelectItem key={s.id || s._id || s.name} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-foreground">Product Images</Label>
                <div className="mt-1 flex flex-col gap-2">
                  {/* Uploaded image previews */}
                  {uploadedImageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {uploadedImageUrls.map((url, idx) => (
                        <div key={idx} className="group relative h-16 w-16 overflow-hidden rounded-md border border-border">
                          <Image src={url} alt={`Uploaded ${idx + 1}`} fill className="object-cover" sizes="64px" />
                          <button
                            type="button"
                            aria-label={`Remove image ${idx + 1}`}
                            title={`Remove image ${idx + 1}`}
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => setUploadedImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            <XIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Upload button */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => document.getElementById('image-upload-input')?.click()}
                    >
                      {uploading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                      ) : (
                        <><ImagePlus className="mr-2 h-4 w-4" /> Upload Images</>
                      )}
                    </Button>
                    <input
                      id="image-upload-input"
                      type="file"
                      accept="image/*"
                      multiple
                      aria-label="Upload product images"
                      title="Upload product images"
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files
                        if (!files || files.length === 0) return
                        setUploading(true)
                        try {
                          const urls = await uploadAPI.uploadMultiple(Array.from(files))
                          setUploadedImageUrls((prev) => [...prev, ...urls])
                          toast({ title: `${urls.length} image(s) uploaded` })
                        } catch (err: any) {
                          toast({
                            title: "Upload failed",
                            description: err.response?.data?.message || "Could not upload images",
                            variant: "destructive",
                          })
                        } finally {
                          setUploading(false)
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                  {/* Fallback: manual URL input */}
                  <Textarea
                    value={formImages}
                    onChange={(e) => setFormImages(e.target.value)}
                    rows={2}
                    placeholder="Or paste image URLs (comma separated)"
                    className="text-xs"
                  />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  editingId ? "Update Product" : "Add Product"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Products ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Product</th>
                  <th className="pb-3 font-medium text-muted-foreground">Category</th>
                  <th className="pb-3 font-medium text-muted-foreground">Price</th>
                  <th className="pb-3 font-medium text-muted-foreground">Stock</th>
                  <th className="pb-3 font-medium text-muted-foreground">Approval</th>
                  <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const pid = product.id || product._id
                  return (
                    <tr key={pid} className="border-b border-border last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                            {product.images?.[0] ? (
                              <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="40px" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                N/A
                              </div>
                            )}
                          </div>
                          <p className="line-clamp-1 font-medium text-foreground">{product.name || "Unnamed"}</p>
                        </div>
                      </td>
                      <td className="py-3 text-foreground">{product.category || "—"}</td>
                      <td className="py-3 font-medium text-foreground">{formatPrice(product.price ?? 0)}</td>
                      <td className="py-3">
                        <Badge variant={(product.stock ?? 0) > 0 ? "default" : "destructive"} className={(product.stock ?? 0) > 0 ? "bg-success text-success-foreground" : ""}>
                          {(product.stock ?? 0) > 0 ? `${product.stock} in stock` : "Out of Stock"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {(() => {
                          const approvalStatus = (product.approvalStatus || "PENDING").toUpperCase()
                          const colors: Record<string, string> = {
                            APPROVED: "bg-emerald-900/40 text-emerald-400 border border-emerald-700/50",
                            PENDING: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/50",
                            REJECTED: "bg-red-900/40 text-red-400 border border-red-700/50",
                          }
                          const labels: Record<string, string> = {
                            APPROVED: "✅ Approved",
                            PENDING: "⏳ Awaiting Approval",
                            REJECTED: "❌ Rejected",
                          }
                          return (
                            <Badge className={colors[approvalStatus] || colors.PENDING}>
                              {labels[approvalStatus] || "Pending"}
                            </Badge>
                          )
                        })()}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                disabled={deletingId === pid}
                              >
                                {deletingId === pid ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {product.name || "this product"}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(pid)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
