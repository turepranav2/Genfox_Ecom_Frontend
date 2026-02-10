"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { orderAPI, Order } from "@/lib/api"
import { formatPrice, formatDate, getOrderStatusColor } from "@/lib/api/api-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Package, CheckCircle2, Loader2, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderAPI.getMyOrders()
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
        if (error.response?.status !== 401) {
          toast({
            title: "Failed to load orders",
            description: error.response?.data?.message || "Please try again",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const openConfirmDialog = (order: Order) => {
    setSelectedOrder(order)
    setConfirmDialog(true)
  }

  const handleConfirmReceipt = async () => {
    if (!selectedOrder) return
    const oid = selectedOrder.id || selectedOrder._id
    if (!oid) return

    setConfirmingId(oid)
    try {
      await orderAPI.confirmReceipt(oid)
      setOrders((prev) =>
        prev.map((o) =>
          (o.id === oid || o._id === oid)
            ? { ...o, userConfirmed: true, userConfirmedAt: new Date().toISOString() }
            : o
        )
      )
      toast({
        title: "Receipt confirmed",
        description: "Thank you! Your order receipt has been confirmed.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to confirm",
        description: error.response?.data?.message || "Could not confirm receipt",
        variant: "destructive",
      })
    } finally {
      setConfirmingId(null)
      setConfirmDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4">
        <h1 className="mb-4 text-xl font-bold text-foreground">My Orders</h1>
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="mb-3 h-5 w-1/3" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Shopping
      </Link>

      <h1 className="mb-4 text-xl font-bold text-foreground">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="mb-4 h-16 w-16 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">No orders yet</p>
          <p className="mb-4 text-sm text-muted-foreground">Place your first order to see it here</p>
          <Button asChild>
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const oid = order.id || order._id
            const isDelivered = order.status?.toUpperCase() === "DELIVERED"
            const supplierConfirmed = (order as any).supplierConfirmed
            const userConfirmed = (order as any).userConfirmed

            return (
              <Card key={oid || Math.random()}>
                <CardHeader className="flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-sm font-semibold">Order #{oid?.slice(-8)}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getOrderStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-foreground">
                          {item.product?.name || "Product"}{" "}
                          <span className="text-muted-foreground">x{item.quantity}</span>
                        </span>
                        <span className="font-medium text-foreground">
                          {formatPrice((item.price || 0) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Delivered to: {order.address}</p>
                      <p className="text-xs text-muted-foreground">Payment: Cash on Delivery</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{formatPrice(order.total)}</p>
                    </div>
                  </div>

                  {/* Delivery / Receipt confirmation section */}
                  {isDelivered && (
                    <div className="mt-3 border-t border-border pt-3">
                      {userConfirmed ? (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <ShieldCheck className="h-4 w-4" />
                          <span className="text-sm font-medium">Receipt Confirmed</span>
                          {(order as any).userConfirmedAt && (
                            <span className="text-xs text-muted-foreground">
                              — {formatDate((order as any).userConfirmedAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-yellow-400">
                            {supplierConfirmed
                              ? "Supplier has confirmed delivery. Please confirm you received the order."
                              : "Order marked as delivered. Awaiting confirmation."}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => openConfirmDialog(order)}
                            disabled={confirmingId === oid}
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                          >
                            {confirmingId === oid ? (
                              <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Confirming</>
                            ) : (
                              <><CheckCircle2 className="mr-1 h-3 w-3" /> Confirm Receipt</>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Confirm Receipt Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Confirm Order Receipt
            </DialogTitle>
            <DialogDescription>
              Please confirm that you have received this order and the items are in good condition.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="py-4">
              <div className="rounded-lg border border-border bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">
                  Order #{(selectedOrder.id || selectedOrder._id)?.slice(-8)}
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {formatPrice(selectedOrder.total)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedOrder.items.length} item{selectedOrder.items.length > 1 ? "s" : ""}
                </p>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                By confirming, you acknowledge that you have received all items in this order.
                This action cannot be undone.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReceipt}
              disabled={confirmingId !== null}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {confirmingId ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...</>
              ) : (
                <><CheckCircle2 className="mr-2 h-4 w-4" /> Yes, I Received It</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
