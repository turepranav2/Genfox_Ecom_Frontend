"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { adminBannerAPI, uploadAPI, Banner } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Plus, Pencil, Trash2, Loader2, ImagePlus, ExternalLink, GripVertical, Eye, EyeOff } from "lucide-react"

export default function AdminBannersPage() {
  const { toast } = useToast()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState("")
  const [formImageUrl, setFormImageUrl] = useState("")
  const [formLink, setFormLink] = useState("")
  const [formIsActive, setFormIsActive] = useState(true)
  const [formOrder, setFormOrder] = useState(0)
  const [uploading, setUploading] = useState(false)

  const fetchBanners = async () => {
    try {
      const data = await adminBannerAPI.getAll()
      setBanners(data)
    } catch (error: any) {
      toast({
        title: "Failed to load banners",
        description: error.response?.data?.message || "Could not fetch banners",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const resetForm = () => {
    setFormTitle("")
    setFormImageUrl("")
    setFormLink("")
    setFormIsActive(true)
    setFormOrder(0)
    setEditingId(null)
  }

  const openEdit = (banner: Banner) => {
    const bid = banner.id || banner._id || ""
    setEditingId(bid)
    setFormTitle(banner.title || "")
    setFormImageUrl(banner.imageUrl)
    setFormLink(banner.link)
    setFormIsActive(banner.isActive)
    setFormOrder(banner.order || 0)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formImageUrl || !formLink) {
      toast({ title: "Image URL and Link are required", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const bannerData = {
        title: formTitle,
        imageUrl: formImageUrl,
        link: formLink,
        isActive: formIsActive,
        order: formOrder,
      }
      if (editingId) {
        const updated = await adminBannerAPI.update(editingId, bannerData)
        setBanners((prev) =>
          prev.map((b) =>
            (b.id || b._id) === editingId ? { ...b, ...bannerData, ...(updated.banner || updated) } : b
          )
        )
        toast({ title: "Banner updated" })
      } else {
        const created = await adminBannerAPI.create(bannerData)
        const newBanner = created.banner || created
        setBanners((prev) => [...prev, newBanner])
        toast({ title: "Banner created" })
      }
      setDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast({
        title: "Failed to save banner",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (bannerId: string) => {
    try {
      await adminBannerAPI.delete(bannerId)
      setBanners((prev) => prev.filter((b) => (b.id || b._id) !== bannerId))
      toast({ title: "Banner deleted" })
    } catch (error: any) {
      toast({
        title: "Failed to delete banner",
        description: error.response?.data?.message || "Could not delete",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (banner: Banner) => {
    const bid = banner.id || banner._id || ""
    const newActive = !banner.isActive
    try {
      await adminBannerAPI.update(bid, { isActive: newActive })
      setBanners((prev) =>
        prev.map((b) => ((b.id || b._id) === bid ? { ...b, isActive: newActive } : b))
      )
      toast({ title: newActive ? "Banner activated" : "Banner deactivated" })
    } catch (error: any) {
      toast({ title: "Failed to update banner", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-48" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Banner Carousel</h2>
          <p className="text-sm text-muted-foreground">
            Manage auto-sliding banners shown on the homepage. Each banner is an image with a hyperlink.
          </p>
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
              <Plus className="mr-2 h-4 w-4" /> Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Banner" : "Add New Banner"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div>
                <Label className="text-foreground">Title (optional)</Label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="mt-1"
                  placeholder="e.g. Summer Sale"
                />
              </div>
              <div>
                <Label className="text-foreground">Banner Image</Label>
                <div className="mt-1 flex flex-col gap-2">
                  {formImageUrl && (
                    <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg border border-border bg-muted">
                      <Image src={formImageUrl} alt="Preview" fill className="object-cover" sizes="400px" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => document.getElementById('banner-upload-input')?.click()}
                    >
                      {uploading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                      ) : (
                        <><ImagePlus className="mr-2 h-4 w-4" /> Upload Image</>
                      )}
                    </Button>
                    <input
                      id="banner-upload-input"
                      type="file"
                      accept="image/*"
                      title="Upload banner image"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploading(true)
                        try {
                          const result = await uploadAPI.uploadImage(file)
                          setFormImageUrl(result.url)
                          toast({ title: "Image uploaded" })
                        } catch (err: any) {
                          toast({ title: "Upload failed", variant: "destructive" })
                        } finally {
                          setUploading(false)
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                  <Input
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="Or paste image URL"
                    className="text-xs"
                  />
                </div>
              </div>
              <div>
                <Label className="text-foreground">Hyperlink URL</Label>
                <Input
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  className="mt-1"
                  placeholder="https://example.com/sale or /product/123"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Display Order</Label>
                  <Input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="mt-1"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                  <Label className="text-foreground">Active</Label>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving || !formImageUrl || !formLink}>
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  editingId ? "Update Banner" : "Create Banner"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <ImagePlus className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-foreground">{banners.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Eye className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-lg font-bold text-foreground">{banners.filter((b) => b.isActive).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <EyeOff className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-xs text-muted-foreground">Inactive</p>
              <p className="text-lg font-bold text-foreground">{banners.filter((b) => !b.isActive).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banners List */}
      {banners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImagePlus className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">No banners yet</p>
            <p className="text-sm text-muted-foreground">Add your first banner to show on the homepage carousel</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {banners
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((banner) => {
              const bid = banner.id || banner._id || ""
              return (
                <Card key={bid} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      {/* Image preview */}
                      <div className="relative w-48 shrink-0 bg-muted sm:w-64">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title || "Banner"}
                          fill
                          className="object-cover"
                          sizes="256px"
                        />
                      </div>
                      {/* Details */}
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-foreground">
                              {banner.title || `Banner #${(banner.order || 0) + 1}`}
                            </h3>
                            <Badge className={banner.isActive
                              ? "bg-emerald-900/40 text-emerald-400 border border-emerald-700/50"
                              : "bg-yellow-900/40 text-yellow-400 border border-yellow-700/50"
                            }>
                              {banner.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{banner.link}</span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">Order: {banner.order || 0}</p>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Switch
                            checked={banner.isActive}
                            onCheckedChange={() => handleToggleActive(banner)}
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(banner)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete this banner? This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(bid)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}
    </div>
  )
}
