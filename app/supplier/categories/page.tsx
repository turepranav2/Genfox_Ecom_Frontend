"use client"

import { useState, useEffect } from "react"
import { supplierCategoryAPI, categoryAPI, Category } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Plus, Pencil, Trash2, ChevronDown, FolderTree, Tag, Loader2 } from "lucide-react"

export default function SupplierCategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Category form
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [catName, setCatName] = useState("")
  const [catImage, setCatImage] = useState("")

  // Subcategory form
  const [subDialogOpen, setSubDialogOpen] = useState(false)
  const [subParentId, setSubParentId] = useState<string | null>(null)
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [subName, setSubName] = useState("")

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getAll()
      setCategories(data)
    } catch (error: any) {
      toast({
        title: "Failed to load categories",
        description: error.response?.data?.message || "Could not fetch categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Category CRUD
  const resetCatForm = () => {
    setCatName("")
    setCatImage("")
    setEditingCatId(null)
  }

  const openEditCategory = (cat: Category) => {
    setEditingCatId(cat.id || cat._id || "")
    setCatName(cat.name)
    setCatImage(cat.image || "")
    setCatDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    if (!catName.trim()) return
    setSaving(true)
    try {
      if (editingCatId) {
        const updated = await supplierCategoryAPI.update(editingCatId, { name: catName, image: catImage })
        setCategories((prev) =>
          prev.map((c) => ((c.id || c._id) === editingCatId ? { ...c, name: catName, image: catImage, ...(updated.category || updated) } : c))
        )
        toast({ title: "Category updated" })
      } else {
        const created = await supplierCategoryAPI.create({ name: catName, image: catImage })
        const newCat = created.category || created
        setCategories((prev) => [...prev, newCat])
        toast({ title: "Category created" })
      }
      setCatDialogOpen(false)
      resetCatForm()
    } catch (error: any) {
      toast({
        title: "Failed to save category",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    try {
      await supplierCategoryAPI.delete(catId)
      setCategories((prev) => prev.filter((c) => (c.id || c._id) !== catId))
      toast({ title: "Category deleted" })
    } catch (error: any) {
      toast({
        title: "Failed to delete category",
        description: error.response?.data?.message || "Could not delete",
        variant: "destructive",
      })
    }
  }

  // Subcategory CRUD
  const resetSubForm = () => {
    setSubName("")
    setSubParentId(null)
    setEditingSubId(null)
  }

  const openAddSubcategory = (parentId: string) => {
    setSubParentId(parentId)
    setEditingSubId(null)
    setSubName("")
    setSubDialogOpen(true)
  }

  const openEditSubcategory = (parentId: string, sub: any) => {
    setSubParentId(parentId)
    setEditingSubId(sub.id || sub._id)
    setSubName(sub.name)
    setSubDialogOpen(true)
  }

  const handleSaveSubcategory = async () => {
    if (!subName.trim() || !subParentId) return
    setSaving(true)
    try {
      if (editingSubId) {
        await supplierCategoryAPI.updateSubcategory(subParentId, editingSubId, { name: subName })
        setCategories((prev) =>
          prev.map((c) => {
            if ((c.id || c._id) !== subParentId) return c
            return {
              ...c,
              subcategories: (c.subcategories || []).map((s: any) =>
                (s.id || s._id) === editingSubId ? { ...s, name: subName } : s
              ),
            }
          })
        )
        toast({ title: "Subcategory updated" })
      } else {
        const created = await supplierCategoryAPI.addSubcategory(subParentId, { name: subName })
        const newSub = created.subcategory || created
        setCategories((prev) =>
          prev.map((c) => {
            if ((c.id || c._id) !== subParentId) return c
            return { ...c, subcategories: [...(c.subcategories || []), newSub] }
          })
        )
        toast({ title: "Subcategory added" })
      }
      setSubDialogOpen(false)
      resetSubForm()
    } catch (error: any) {
      toast({
        title: "Failed to save subcategory",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSubcategory = async (parentId: string, subId: string) => {
    try {
      await supplierCategoryAPI.deleteSubcategory(parentId, subId)
      setCategories((prev) =>
        prev.map((c) => {
          if ((c.id || c._id) !== parentId) return c
          return {
            ...c,
            subcategories: (c.subcategories || []).filter((s: any) => (s.id || s._id) !== subId),
          }
        })
      )
      toast({ title: "Subcategory deleted" })
    } catch (error: any) {
      toast({
        title: "Failed to delete subcategory",
        description: error.response?.data?.message || "Could not delete",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-48" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
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
          <h2 className="text-lg font-semibold text-foreground">Categories & Subcategories</h2>
          <p className="text-sm text-muted-foreground">Create categories and subcategories for your products</p>
        </div>
        <Dialog
          open={catDialogOpen}
          onOpenChange={(open) => {
            setCatDialogOpen(open)
            if (!open) resetCatForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCatId ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div>
                <Label className="text-foreground">Category Name</Label>
                <Input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="mt-1"
                  placeholder="e.g. Electronics, Fashion"
                />
              </div>
              <div>
                <Label className="text-foreground">Image URL (optional)</Label>
                <Input
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  className="mt-1"
                  placeholder="https://..."
                />
              </div>
              <Button onClick={handleSaveCategory} disabled={saving || !catName.trim()}>
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  editingCatId ? "Update Category" : "Create Category"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subcategory Dialog */}
      <Dialog
        open={subDialogOpen}
        onOpenChange={(open) => {
          setSubDialogOpen(open)
          if (!open) resetSubForm()
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSubId ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div>
              <Label className="text-foreground">Subcategory Name</Label>
              <Input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="mt-1"
                placeholder="e.g. Smartphones, T-Shirts"
              />
            </div>
            <Button onClick={handleSaveSubcategory} disabled={saving || !subName.trim()}>
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                editingSubId ? "Update Subcategory" : "Add Subcategory"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderTree className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">No categories yet</p>
            <p className="text-sm text-muted-foreground">Create your first category to organize products</p>
          </CardContent>
        </Card>
      ) : (
        categories.map((cat) => {
          const catId = cat.id || cat._id || ""
          const isExpanded = expandedId === catId

          return (
            <Collapsible key={catId} open={isExpanded} onOpenChange={() => setExpandedId(isExpanded ? null : catId)}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FolderTree className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(cat.subcategories || []).length} subcategories
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditCategory(cat)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete &quot;{cat.name}&quot; and all its subcategories? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(catId)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="border-t border-border px-4 pb-4 pt-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Subcategories
                      </h4>
                      <Button variant="outline" size="sm" onClick={() => openAddSubcategory(catId)}>
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add
                      </Button>
                    </div>
                    {(!cat.subcategories || cat.subcategories.length === 0) ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No subcategories yet</p>
                    ) : (
                      <div className="space-y-2">
                        {cat.subcategories.map((sub: any) => {
                          const subId = sub.id || sub._id
                          return (
                            <div
                              key={subId}
                              className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm text-foreground">{sub.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openEditSubcategory(catId, sub)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Delete &quot;{sub.name}&quot;? This cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteSubcategory(catId, subId)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })
      )}
    </div>
  )
}
