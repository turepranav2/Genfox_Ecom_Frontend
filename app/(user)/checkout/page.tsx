"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cartAPI, orderAPI, authAPI, UserAddress } from "@/lib/api"
import { formatPrice } from "@/lib/api/api-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, CheckCircle2, MapPin, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState("")

  // Address state
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([])
  const [selectedAddressIdx, setSelectedAddressIdx] = useState<string>("new")
  const [newAddrDialog, setNewAddrDialog] = useState(false)
  const [addrLabel, setAddrLabel] = useState("")
  const [addrStreet, setAddrStreet] = useState("")
  const [addrCity, setAddrCity] = useState("")
  const [addrState, setAddrState] = useState("")
  const [addrPincode, setAddrPincode] = useState("")
  const [manualAddress, setManualAddress] = useState("")
  const [savingAddr, setSavingAddr] = useState(false)

  useEffect(() => {
    loadCart()
    loadAddresses()
  }, [])

  const loadCart = async () => {
    try {
      const data = await cartAPI.get()
      const rawItems = data.items || []
      // Normalize: backend may populate productId as full object
      const normalized = rawItems.map((item: any) => {
        const isPopulated = typeof item.productId === 'object' && item.productId !== null
        return {
          ...item,
          productId: isPopulated ? (item.productId._id || item.productId.id) : item.productId,
          product: item.product || (isPopulated ? item.productId : null),
        }
      })
      setCart(normalized)
    } catch (error: any) {
      toast({ title: "Failed to load cart", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const loadAddresses = async () => {
    try {
      const data = await authAPI.getProfile()
      const user = data.user || data
      const addrs: UserAddress[] = user.addresses || []
      setSavedAddresses(addrs)
      // Pre-select default address
      const defaultIdx = addrs.findIndex((a) => a.isDefault)
      if (defaultIdx >= 0) {
        setSelectedAddressIdx(String(defaultIdx))
      } else if (addrs.length > 0) {
        setSelectedAddressIdx("0")
      }
    } catch {
      // Profile fetch failed — user can still type address manually
    }
  }

  const getSelectedAddress = (): string => {
    if (selectedAddressIdx === "new") return manualAddress.trim()
    const idx = parseInt(selectedAddressIdx, 10)
    const addr = savedAddresses[idx]
    if (!addr) return manualAddress.trim()
    return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`
  }

  const handleAddNewAddress = async () => {
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
      isDefault: savedAddresses.length === 0,
    }
    setSavingAddr(true)
    try {
      const updated = [...savedAddresses, newAddr]
      await authAPI.updateProfile({ addresses: updated })
      setSavedAddresses(updated)
      setSelectedAddressIdx(String(updated.length - 1))
      setNewAddrDialog(false)
      setAddrLabel("")
      setAddrStreet("")
      setAddrCity("")
      setAddrState("")
      setAddrPincode("")
      toast({ title: "Address saved" })
    } catch {
      toast({ title: "Failed to save address", variant: "destructive" })
    } finally {
      setSavingAddr(false)
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

  const handlePlaceOrder = async () => {
    const finalAddress = getSelectedAddress()
    if (!finalAddress) {
      toast({ title: "Address required", description: "Please select or enter a delivery address", variant: "destructive" })
      return
    }

    setPlacing(true)
    try {
      const items = cart.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      const order = await orderAPI.create({ items, address: finalAddress })
      setOrderId(order.id || order._id || `GF-${Date.now()}`)
      setOrderPlaced(true)
      toast({ title: "Order placed successfully!", description: "Your order has been placed via COD" })
    } catch (error: any) {
      toast({ title: "Failed to place order", description: error.response?.data?.message || "Please try again", variant: "destructive" })
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4">
        <CheckCircle2 className="mb-4 h-20 w-20 text-success" />
        <h2 className="mb-1 text-2xl font-bold text-foreground">Order Placed Successfully!</h2>
        <p className="mb-1 text-muted-foreground">Your order has been placed via Cash on Delivery.</p>
        <p className="mb-6 text-sm text-muted-foreground">Order ID: {orderId}</p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/orders">View Orders</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4">
        <p className="mb-4 text-lg font-medium text-foreground">Your cart is empty</p>
        <Button asChild>
          <Link href="/">Shop Now</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <Link href="/cart" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedAddresses.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <RadioGroup value={selectedAddressIdx} onValueChange={setSelectedAddressIdx}>
                    {savedAddresses.map((addr, idx) => (
                      <div
                        key={addr._id || `addr-${idx}`}
                        className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                          selectedAddressIdx === String(idx)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                        onClick={() => setSelectedAddressIdx(String(idx))}
                      >
                        <RadioGroupItem value={String(idx)} id={`addr-${idx}`} className="mt-0.5" />
                        <Label htmlFor={`addr-${idx}`} className="flex-1 cursor-pointer">
                          <span className="text-sm font-semibold text-foreground">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="ml-2 text-[10px] font-medium text-primary bg-primary/10 rounded px-1.5 py-0.5">
                              Default
                            </span>
                          )}
                          <p className="mt-1 text-sm text-muted-foreground">
                            {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </Label>
                      </div>
                    ))}

                    {/* Enter manually option */}
                    <div
                      className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                        selectedAddressIdx === "new"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                      onClick={() => setSelectedAddressIdx("new")}
                    >
                      <RadioGroupItem value="new" id="addr-new" className="mt-0.5" />
                      <Label htmlFor="addr-new" className="flex-1 cursor-pointer">
                        <span className="text-sm font-semibold text-foreground">Enter a new address</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {selectedAddressIdx === "new" && (
                    <Textarea
                      placeholder="Enter your complete delivery address..."
                      className="mt-1"
                      rows={3}
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                    />
                  )}

                  <Button variant="outline" size="sm" className="self-start" onClick={() => setNewAddrDialog(true)}>
                    <Plus className="mr-1 h-4 w-4" /> Add &amp; Save New Address
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">No saved addresses. Enter one below or save a new address.</p>
                  <Textarea
                    placeholder="Enter your complete delivery address..."
                    rows={3}
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    required
                  />
                  <Button variant="outline" size="sm" className="self-start" onClick={() => setNewAddrDialog(true)}>
                    <Plus className="mr-1 h-4 w-4" /> Save Address to Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 rounded-md border-2 border-primary bg-primary/5 p-4">
                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Cash on Delivery (COD)</p>
                  <p className="text-xs text-muted-foreground">Pay when your order is delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base uppercase tracking-wide text-muted-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {cart.map((item, index) => (
                <div key={item.id || item.productId || `item-${index}`} className="flex justify-between text-sm">
                  <span className="line-clamp-1 flex-1 text-foreground">
                    {item.product?.name} x{item.quantity}
                  </span>
                  <span className="ml-2 shrink-0 text-foreground">
                    {formatPrice((item.product?.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Subtotal</span>
                <span className="text-foreground">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Delivery</span>
                <span className="text-success">FREE</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{formatPrice(cartTotal)}</span>
              </div>
              <Button
                size="lg"
                className="mt-2 w-full"
                onClick={handlePlaceOrder}
                disabled={placing || (!getSelectedAddress())}
              >
                {placing ? "Placing Order..." : "Place Order (COD)"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add New Address Dialog */}
      <Dialog open={newAddrDialog} onOpenChange={setNewAddrDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
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
            <Button onClick={handleAddNewAddress} disabled={savingAddr}>
              {savingAddr ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}