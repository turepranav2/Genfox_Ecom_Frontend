"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { supplierProfileAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Building2, Loader2 } from "lucide-react"

export default function SupplierProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [gstin, setGstin] = useState("")
  const [address, setAddress] = useState("")
  const [bankHolder, setBankHolder] = useState("")
  const [bankAccount, setBankAccount] = useState("")
  const [bankIfsc, setBankIfsc] = useState("")
  const [bankName, setBankName] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await supplierProfileAPI.getProfile()
        const profile = data.supplier || data
        setName(profile.name || "")
        setEmail(profile.email || "")
        setPhone(profile.phone || "")
        setGstin(profile.gstin || "")
        setAddress(profile.address || "")
        if (profile.bankDetails) {
          setBankHolder(profile.bankDetails.accountHolderName || "")
          setBankAccount(profile.bankDetails.accountNumber || "")
          setBankIfsc(profile.bankDetails.ifscCode || "")
          setBankName(profile.bankDetails.bankName || "")
        }
      } catch (error: any) {
        toast({
          title: "Failed to load profile",
          description: error.response?.data?.message || "Could not fetch profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await supplierProfileAPI.updateProfile({
        name,
        phone,
        gstin,
        address,
        bankDetails: {
          accountHolderName: bankHolder,
          accountNumber: bankAccount,
          ifscCode: bankIfsc,
          bankName: bankName,
        },
      } as any)
      toast({ title: "✅ Profile updated!", description: "Your business details have been saved successfully." })
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description: error.response?.data?.message || "Could not save profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl flex flex-col gap-6">
        <Card><CardContent className="p-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="mb-3 h-10 w-full" />)}</CardContent></Card>
        <Card><CardContent className="p-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="mb-3 h-10 w-full" />)}</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-6">
        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-foreground">Business Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-foreground">GSTIN</Label>
                <Input value={gstin} onChange={(e) => setGstin(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-foreground">Email</Label>
                <Input value={email} disabled className="mt-1 bg-muted" />
              </div>
              <div>
                <Label className="text-foreground">Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-foreground">Business Address</Label>
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bank Account Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-foreground">Account Holder Name</Label>
                <Input value={bankHolder} onChange={(e) => setBankHolder(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-foreground">Account Number</Label>
                <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-foreground">IFSC Code</Label>
                <Input value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-foreground">Bank Name</Label>
                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
