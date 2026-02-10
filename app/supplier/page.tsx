"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/api/api-utils"
import { dashboardAPI, type SupplierDashboard } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, ShoppingCart, IndianRupee, TrendingUp } from "lucide-react"

export default function SupplierDashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<SupplierDashboard | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardAPI.getSupplierDashboard()
        setDashboard(data)
      } catch (error: any) {
        toast({
          title: "Failed to load dashboard",
          description: error.response?.data?.message || "Could not fetch dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const stats = dashboard
    ? [
        { label: "Total Products", value: dashboard.productsCount?.toLocaleString("en-IN") ?? "0", icon: <Package className="h-5 w-5" />, color: "text-primary" },
        { label: "Total Orders", value: dashboard.ordersCount?.toLocaleString("en-IN") ?? "0", icon: <ShoppingCart className="h-5 w-5" />, color: "text-success" },
        { label: "Revenue", value: formatPrice(dashboard.revenue ?? 0), icon: <IndianRupee className="h-5 w-5" />, color: "text-accent" },
        { label: "Commission Paid", value: formatPrice(dashboard.commissionPaid ?? 0), icon: <TrendingUp className="h-5 w-5" />, color: "text-primary" },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      {dashboard?.recentOrders && dashboard.recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Order ID</th>
                    <th className="pb-3 font-medium text-muted-foreground">Customer</th>
                    <th className="pb-3 font-medium text-muted-foreground">Amount</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentOrders.map((order: any, i: number) => (
                    <tr key={order.id || order._id || i} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium text-foreground">
                        {(order.id || order._id || "").slice(0, 12)}
                      </td>
                      <td className="py-3 text-foreground">{order.user?.name || order.customer || "N/A"}</td>
                      <td className="py-3 text-foreground">{formatPrice(order.total ?? 0)}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            order.status?.toUpperCase() === "DELIVERED"
                              ? "bg-success/10 text-success"
                              : order.status?.toUpperCase() === "PENDING"
                                ? "bg-accent/10 text-accent"
                                : order.status?.toUpperCase() === "SHIPPED"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
