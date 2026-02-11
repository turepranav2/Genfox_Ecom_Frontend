"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { authAPI, UserAddress } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, User, MapPin, Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [addresses, setAddresses] = useState<UserAddress[]>([])

  // Address dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [addrLabel, setAddrLabel] = useState("")
  const [addrStreet, setAddrStreet] = useState("")
  const [addrCity, setAddrCity] = useState("")
  const [addrState, setAddrState] = useState("")
  const [addrPincode, setAddrPincode] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authAPI.getProfile()
        const user = data.user || data
        setName(user.name || "")
        setEmail(user.email || "")
        setPhone(user.phone || "")
        setAddresses(user.addresses || [])
      } catch (error: any) {
        if (error.response?.status !== 401) {
          toast({
            title: "Failed to load profile",
            description: error.response?.data?.message || "Could not fetch profile",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await authAPI.updateProfile({ name, phone, addresses })
      toast({ title: "✅ Profile updated!", description: "Your changes have been saved successfully." })
    } catch (error: any) {
      toast({
        title: "Failed to save",
        description: error.response?.data?.message || "Could not update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const resetAddressForm = () => {
    setEditingIndex(null)
    setAddrLabel("")
    setAddrStreet("")
    setAddrCity("")
    setAddrState("")
    setAddrPincode("")
  }

  const openEditAddress = (index: number) => {
    const addr = addresses[index]
    setEditingIndex(index)
    setAddrLabel(addr.label || "")
    setAddrStreet(addr.street || "")
    setAddrCity(addr.city || "")
    setAddrState(addr.state || "")
    setAddrPincode(addr.pincode || "")
    setDialogOpen(true)
  }

  const handleSaveAddress = () => {
    if (!addrLabel.trim() || !addrStreet.trim() || !addrCity.trim() || !addrState.trim() || !addrPincode.trim()) {
      toast({ title: "All fields required", variant: "destructive" })
      return
    }

    const newAddr: UserAddress = {
      label: addrLabel,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      isDefault: addresses.length === 0, // first address is default
    }

    if (editingIndex !== null) {
      setAddresses((prev) =>
        prev.map((a, i) => (i === editingIndex ? { ...a, ...newAddr, isDefault: a.isDefault } : a))
      )
    } else {
      setAddresses((prev) => [...prev, newAddr])
    }
    setDialogOpen(false)
    resetAddressForm()
  }

  const handleDeleteAddress = (index: number) => {
    const wasDefault = addresses[index]?.isDefault
    setAddresses((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      // If deleted address was default, make the first one default
      if (wasDefault && updated.length > 0) {
        updated[0] = { ...updated[0], isDefault: true }
      }
      return updated
    })
  }

  const handleSetDefault = (index: number) => {
    setAddresses((prev) =>
      prev.map((a, i) => ({ ...a, isDefault: i === index }))
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-4">
        <h1 className="mb-6 text-xl font-bold text-foreground">My Profile</h1>
        <Card className="mb-6">
          <CardContent className="p-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="mb-3 h-10 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="mb-3 h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-4">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Shopping
      </Link>

      <h1 className="mb-6 text-xl font-bold text-foreground">My Profile</h1>

      {/* Personal Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-foreground">Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-foreground">Email</Label>
            <Input value={email} disabled className="mt-1 bg-muted" />
          </div>
          <div>
            <Label className="text-foreground">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" placeholder="+91 9876543210" />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Manage Addresses
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetAddressForm()
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" /> Add Address
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingIndex !== null ? "Edit Address" : "Add New Address"}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div>
                  <Label className="text-foreground">Label (e.g. Home, Office)</Label>
                  <Input value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} className="mt-1" placeholder="Home" />
                </div>
                <div>
                  <Label className="text-foreground">Street Address</Label>
                  <Input value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} className="mt-1" placeholder="123 MG Road" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-foreground">City</Label>
                    <Input value={addrCity} onChange={(e) => setAddrCity(e.target.value)} className="mt-1" placeholder="Bengaluru" />
                  </div>
                  <div>
                    <Label className="text-foreground">State</Label>
                    <Input value={addrState} onChange={(e) => setAddrState(e.target.value)} className="mt-1" placeholder="Karnataka" />
                  </div>
                </div>
                <div>
                  <Label className="text-foreground">Pincode</Label>
                  <Input value={addrPincode} onChange={(e) => setAddrPincode(e.target.value)} className="mt-1" placeholder="560001" />
                </div>
                <Button onClick={handleSaveAddress}>Save Address</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {addresses.map((addr, index) => (
            <div key={addr._id || `addr-${index}`} className="flex items-start justify-between rounded-md border border-border p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{addr.label}</span>
                  {addr.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
                {!addr.isDefault && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-1 h-auto p-0 text-xs text-primary"
                    onClick={() => handleSetDefault(index)}
                  >
                    Set as default
                  </Button>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEditAddress(index)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteAddress(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {addresses.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No addresses saved. Add one above.</p>
          )}

          {/* Save all address changes to backend */}
          {addresses.length > 0 && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveProfile} disabled={saving} size="sm">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Addresses"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}