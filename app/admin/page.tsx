"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/api/api-utils"
import { dashboardAPI, type AdminDashboard } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Users, Truck, ShoppingCart, IndianRupee, TrendingUp, Package, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardAPI.getAdminDashboard()
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

  const stats = dashboard
    ? [
        { label: "Total Users", value: dashboard.totalUsers?.toLocaleString("en-IN") ?? "0", icon: <Users className="h-5 w-5" />, color: "text-primary" },
        { label: "Active Suppliers", value: dashboard.totalSuppliers?.toLocaleString("en-IN") ?? "0", icon: <Truck className="h-5 w-5" />, color: "text-success" },
        { label: "Total Orders", value: dashboard.totalOrders?.toLocaleString("en-IN") ?? "0", icon: <ShoppingCart className="h-5 w-5" />, color: "text-accent" },
        { label: "Total Revenue", value: formatPrice(dashboard.totalRevenue ?? 0), icon: <IndianRupee className="h-5 w-5" />, color: "text-primary" },
        { label: "Pending Suppliers", value: dashboard.pendingSuppliers?.toLocaleString("en-IN") ?? "0", icon: <TrendingUp className="h-5 w-5" />, color: "text-success" },
      ]
    : []

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(5)].map((_, i) => (
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

  return (
    <div className="flex flex-col gap-6">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      {dashboard?.recentOrders && dashboard.recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {dashboard.recentOrders.map((order: any, i: number) => (
                <div key={order.id || i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Order #{order.id?.slice(0, 12) || `ORD-${i + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(order.total ?? 0)} — {order.status || "Pending"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
