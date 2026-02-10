"use client"

import { useState, useEffect } from "react"
import { adminOrderAPI } from "@/lib/api"
import { formatPrice } from "@/lib/api/api-utils"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Search,
  Package,
  User,
  MapPin,
  Phone,
  Calendar,
  Clock,
  IndianRupee,
  ChevronDown,
  CheckCircle2,
  Store,
} from "lucide-react"

const COMMISSION_RATE = 0.1

const allStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/50",
  PROCESSING: "bg-blue-900/40 text-blue-400 border border-blue-700/50",
  SHIPPED: "bg-purple-900/40 text-purple-400 border border-purple-700/50",
  DELIVERED: "bg-emerald-900/40 text-emerald-400 border border-emerald-700/50",
  CANCELLED: "bg-red-900/40 text-red-400 border border-red-700/50",
}

export default function AdminOrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      const data = await adminOrderAPI.getAllOrders()
      const parsed = Array.isArray(data) ? data : (data.orders || data.data || data.result || [])
      setOrders(parsed)
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

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return {
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const filtered = orders
    .filter((o) => filterStatus === "all" || o.status?.toUpperCase() === filterStatus)
    .filter(
      (o) =>
        (o.id || o._id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.user?.name || o.customer || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or customer..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders ({orders.length})</SelectItem>
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
        const isExpanded = expandedId === orderId
        const total = order.total ?? 0
        const commission = Math.round(total * COMMISSION_RATE)
        const dt = order.createdAt ? formatDateTime(order.createdAt) : null
        const isDelivered = order.status?.toUpperCase() === "DELIVERED"

        // Gather unique supplier names
        const supplierNames = order.items
          ?.map((i: any) => i.product?.supplier?.name || i.supplier?.name || i.supplierName)
          .filter(Boolean)
          .filter((v: string, idx: number, arr: string[]) => arr.indexOf(v) === idx)

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
                      <span className="text-sm font-bold text-foreground">{formatPrice(total)}</span>
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
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Customer Details */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</h4>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{order.user?.name || order.customer || "N/A"}</span>
                        </div>
                        {order.user?.email && (
                          <p className="mt-1 text-xs text-muted-foreground">{order.user.email}</p>
                        )}
                        {(order.user?.phone || order.phone) && (
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{order.user?.phone || order.phone}</span>
                          </div>
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
                        {isDelivered && (order as any).supplierConfirmed && (
                          <div className="mt-1 flex items-center gap-2 text-xs text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Cash collected by supplier</span>
                          </div>
                        )}
                        {isDelivered && (order as any).userConfirmed && (
                          <div className="mt-1 flex items-center gap-2 text-xs text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Receipt confirmed by user</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Financials */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Financials</h4>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Order Total</span>
                          <span className="font-bold text-foreground">{formatPrice(total)}</span>
                        </div>
                        <div className="mt-1 flex justify-between text-sm">
                          <span className="text-muted-foreground">Commission (10%)</span>
                          <span className="font-medium text-emerald-400">{formatPrice(commission)}</span>
                        </div>
                        <div className="mt-1 flex justify-between text-sm">
                          <span className="text-muted-foreground">Supplier Payout</span>
                          <span className="font-medium text-foreground">{formatPrice(total - commission)}</span>
                        </div>
                        {supplierNames && supplierNames.length > 0 && (
                          <>
                            <Separator className="my-2" />
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Store className="h-3.5 w-3.5" />
                              <span>{supplierNames.join(", ")}</span>
                            </div>
                          </>
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
                            <th className="p-3 font-medium text-muted-foreground">Supplier</th>
                            <th className="p-3 font-medium text-muted-foreground text-center">Qty</th>
                            <th className="p-3 font-medium text-muted-foreground text-right">Price</th>
                            <th className="p-3 font-medium text-muted-foreground text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items?.map((item: any, i: number) => {
                            const itemPrice = item.price || item.product?.price || 0
                            const qty = item.quantity || item.qty || 1
                            const supplierName = item.product?.supplier?.name || item.supplier?.name || item.supplierName || "—"
                            return (
                              <tr key={i} className="border-b border-border last:border-0">
                                <td className="p-3 text-foreground">{item.product?.name || item.name || "Product"}</td>
                                <td className="p-3 text-muted-foreground">{supplierName}</td>
                                <td className="p-3 text-center text-foreground">{qty}</td>
                                <td className="p-3 text-right text-muted-foreground">{formatPrice(itemPrice)}</td>
                                <td className="p-3 text-right font-medium text-foreground">{formatPrice(itemPrice * qty)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-secondary/30">
                            <td colSpan={4} className="p-3 text-right font-semibold text-foreground">Total</td>
                            <td className="p-3 text-right font-bold text-foreground">{formatPrice(total)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Status (read-only) */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge className={statusColors[order.status?.toUpperCase()] || statusColors.PENDING}>
                      {(order.status || "Pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1).toLowerCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">(read-only)</span>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )
      })}
    </div>
  )
}
