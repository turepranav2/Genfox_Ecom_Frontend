"use client"

import { useState, useEffect } from "react"
import { supplierOrderAPI } from "@/lib/api"
import { formatPrice } from "@/lib/api/api-utils"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Truck,
  IndianRupee,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Package,
  User,
  MapPin,
  Phone,
  Calendar,
  Clock,
} from "lucide-react"

const allStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/50",
  PROCESSING: "bg-blue-900/40 text-blue-400 border border-blue-700/50",
  SHIPPED: "bg-purple-900/40 text-purple-400 border border-purple-700/50",
  DELIVERED: "bg-emerald-900/40 text-emerald-400 border border-emerald-700/50",
  CANCELLED: "bg-red-900/40 text-red-400 border border-red-700/50",
}

export default function SupplierOrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Delivery confirmation dialog state
  const [deliveryDialog, setDeliveryDialog] = useState(false)
  const [deliveryOrderId, setDeliveryOrderId] = useState<string | null>(null)
  const [deliveryTotal, setDeliveryTotal] = useState(0)
  const [cashConfirmed, setCashConfirmed] = useState(false)
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false)

  const fetchOrders = async () => {
    try {
      const data = await supplierOrderAPI.getOrders()
      const raw = Array.isArray(data) ? data : data.orders || []
      // Normalize: backend nests confirmation fields under deliveryConfirmation
      const normalized = raw.map((o: any) => {
        const dc = o.deliveryConfirmation || {}
        return {
          ...o,
          supplierConfirmed: o.supplierConfirmed ?? dc.supplierConfirmed ?? false,
          userConfirmed: o.userConfirmed ?? dc.userConfirmed ?? false,
          cashCollected: o.cashCollected ?? dc.cashCollected,
          deliveredAt: o.deliveredAt ?? dc.deliveredAt,
          userConfirmedAt: o.userConfirmedAt ?? dc.userConfirmedAt,
        }
      })
      setOrders(normalized)
    } catch (error: any) {
      toast({
        title: "Failed to load orders",
        description: error.response?.data?.message || "Could not fetch orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = (orderId: string, newStatus: string, total: number) => {
    if (newStatus === "DELIVERED") {
      setDeliveryOrderId(orderId)
      setDeliveryTotal(total)
      setCashConfirmed(false)
      setDeliveryConfirmed(false)
      setDeliveryDialog(true)
    } else {
      updateStatus(orderId, newStatus)
    }
  }

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId)
    try {
      await supplierOrderAPI.updateStatus(orderId, status)
      setOrders((prev) =>
        prev.map((o) =>
          (o.id === orderId || o._id === orderId) ? { ...o, status } : o
        )
      )
      toast({ title: "Order updated", description: `Status changed to ${status}` })
    } catch (error: any) {
      toast({
        title: "Failed to update",
        description: error.response?.data?.message || "Could not update order status",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeliveryConfirm = async () => {
    if (!deliveryOrderId) return
    setUpdatingId(deliveryOrderId)
    try {
      await supplierOrderAPI.confirmDelivery(deliveryOrderId, {
        cashCollected: deliveryTotal,
        supplierConfirmed: true,
      })
      setOrders((prev) =>
        prev.map((o) =>
          (o.id === deliveryOrderId || o._id === deliveryOrderId)
            ? { ...o, status: "DELIVERED", supplierConfirmed: true, cashCollected: deliveryTotal }
            : o
        )
      )
      toast({
        title: "Delivery confirmed",
        description: `Order marked as delivered. Cash ₹${deliveryTotal.toLocaleString("en-IN")} collected.`,
      })
    } catch (error: any) {
      toast({
        title: "Failed to confirm delivery",
        description: error.response?.data?.message || "Could not confirm delivery",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
      setDeliveryDialog(false)
    }
  }

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return {
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const filtered =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status?.toUpperCase() === filterStatus)

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-40" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="mb-3 h-6 w-2/3" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Orders ({filtered.length})</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {allStatuses.map((s) => (
              <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">No orders found</p>
      )}

      {filtered.map((order) => {
        const orderId = order.id || order._id
        const isDelivered = order.status?.toUpperCase() === "DELIVERED"
        const isExpanded = expandedId === orderId
        const dt = order.createdAt ? formatDateTime(order.createdAt) : null

        return (
          <Collapsible key={orderId} open={isExpanded} onOpenChange={() => setExpandedId(isExpanded ? null : orderId)}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Order #{orderId?.slice(-8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.user?.name || order.customer || "Customer"} &middot; {dt?.date || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-foreground">{formatPrice(order.total ?? 0)}</span>
                      <Badge className={statusColors[order.status?.toUpperCase()] || statusColors.PENDING}>
                        {(order.status || "Pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1).toLowerCase()}
                      </Badge>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="border-t border-border px-4 pb-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Customer Details */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer Details</h4>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{order.user?.name || order.customer || "N/A"}</span>
                        </div>
                        {(order.user?.phone || order.phone) && (
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{order.user?.phone || order.phone}</span>
                          </div>
                        )}
                        {order.user?.email && (
                          <p className="mt-1 text-xs text-muted-foreground">{order.user.email}</p>
                        )}
                        <Separator className="my-2" />
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{order.address || "No address provided"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order Info</h4>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Date: {dt?.date || "—"}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Time: {dt?.time || "—"}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <IndianRupee className="h-3.5 w-3.5" />
                          <span>Payment: Cash on Delivery</span>
                        </div>
                        {isDelivered && order.supplierConfirmed && (
                          <div className="mt-1 flex items-center gap-2 text-xs text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Cash ₹{(order.cashCollected ?? order.total ?? 0).toLocaleString("en-IN")} collected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="mt-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Products</h4>
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-secondary/30 text-left">
                            <th className="p-3 font-medium text-muted-foreground">Product</th>
                            <th className="p-3 font-medium text-muted-foreground text-center">Qty</th>
                            <th className="p-3 font-medium text-muted-foreground text-right">Price</th>
                            <th className="p-3 font-medium text-muted-foreground text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items?.map((item: any, i: number) => {
                            const itemPrice = item.price || item.product?.price || 0
                            const qty = item.quantity || item.qty || 1
                            return (
                              <tr key={i} className="border-b border-border last:border-0">
                                <td className="p-3 text-foreground">{item.product?.name || item.name || "Product"}</td>
                                <td className="p-3 text-center text-foreground">{qty}</td>
                                <td className="p-3 text-right text-muted-foreground">{formatPrice(itemPrice)}</td>
                                <td className="p-3 text-right font-medium text-foreground">{formatPrice(itemPrice * qty)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-secondary/30">
                            <td colSpan={3} className="p-3 text-right font-semibold text-foreground">Total</td>
                            <td className="p-3 text-right font-bold text-foreground">{formatPrice(order.total ?? 0)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Status Change */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      {isDelivered ? (
                        <Badge className={statusColors.DELIVERED}>
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Delivered
                        </Badge>
                      ) : (
                        <Select
                          value={order.status?.toUpperCase() || "PENDING"}
                          onValueChange={(v) => handleStatusChange(orderId, v, order.total ?? 0)}
                          disabled={updatingId === orderId}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allStatuses.map((s) => (
                              <SelectItem key={s} value={s}>
                                <Badge className={statusColors[s]}>
                                  {s.charAt(0) + s.slice(1).toLowerCase()}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    {isDelivered && order.supplierConfirmed ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <IndianRupee className="h-3 w-3" /> Cash Collected
                      </span>
                    ) : isDelivered ? (
                      <span className="text-xs text-yellow-400">Cash Pending</span>
                    ) : null}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )
      })}

      {/* Delivery + Cash Confirmation Dialog */}
      <Dialog open={deliveryDialog} onOpenChange={setDeliveryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Confirm Delivery &amp; Cash Collection
            </DialogTitle>
            <DialogDescription>
              You are marking this order as delivered. Please confirm the delivery and cash collection below.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">Order Total (COD)</p>
              <p className="mt-1 text-2xl font-bold text-accent">
                {formatPrice(deliveryTotal)}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="delivery-confirm"
                checked={deliveryConfirmed}
                onCheckedChange={(v) => setDeliveryConfirmed(v === true)}
              />
              <Label htmlFor="delivery-confirm" className="text-sm leading-snug cursor-pointer">
                I confirm that this order has been <strong>delivered to the customer</strong> successfully.
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="cash-confirm"
                checked={cashConfirmed}
                onCheckedChange={(v) => setCashConfirmed(v === true)}
              />
              <Label htmlFor="cash-confirm" className="text-sm leading-snug cursor-pointer">
                I confirm that I have <strong>collected ₹{deliveryTotal.toLocaleString("en-IN")}</strong> in cash from the customer.
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeliveryDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeliveryConfirm}
              disabled={!cashConfirmed || !deliveryConfirmed || updatingId !== null}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {updatingId ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...</>
              ) : (
                <><CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Delivery</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}