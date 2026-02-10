"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/api/api-utils"
import { dashboardAPI, adminAPI, adminOrderAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { IndianRupee, TrendingUp, ShoppingCart, Users } from "lucide-react"

export default function AdminReportsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashData, ordersData, suppliersData] = await Promise.all([
          dashboardAPI.getAdminDashboard(),
          adminOrderAPI.getAllOrders().catch(() => []),
          adminAPI.getAllSuppliers().catch(() => []),
        ])
        setDashboard(dashData)
        setOrders(Array.isArray(ordersData) ? ordersData : ordersData?.orders || [])
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : suppliersData?.suppliers || [])
      } catch (error: any) {
        toast({
          title: "Failed to load reports",
          description: error.response?.data?.message || "Could not fetch report data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="mb-3 h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalRevenue = dashboard?.totalRevenue ?? 0
  const totalOrders = dashboard?.totalOrders ?? 0
  const totalUsers = dashboard?.totalUsers ?? 0
  const totalSuppliers = dashboard?.totalSuppliers ?? 0

  // Compute order status breakdown
  const statusBreakdown: Record<string, number> = {}
  orders.forEach((o: any) => {
    const status = o.status?.toUpperCase() || "PENDING"
    statusBreakdown[status] = (statusBreakdown[status] || 0) + 1
  })

  // Top suppliers by # of products or just by name
  const activeSuppliers = suppliers.filter(
    (s: any) => (s.status?.toUpperCase() === "APPROVED" || s.status === "Active")
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold text-card-foreground">{formatPrice(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold text-card-foreground">{totalOrders.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-xl font-bold text-card-foreground">{totalUsers.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Suppliers</p>
              <p className="text-xl font-bold text-card-foreground">{totalSuppliers.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(statusBreakdown).length > 0 ? (
            <>
              <div className="mb-6 flex flex-col gap-3">
                {Object.entries(statusBreakdown).map(([status, count]) => {
                  const maxCount = Math.max(...Object.values(statusBreakdown))
                  const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-xs text-muted-foreground">
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </span>
                      <div className="flex-1">
                        <div className="relative h-6 w-full rounded-sm bg-muted">
                          <div
                            className="absolute left-0 top-0 h-full rounded-sm bg-primary"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-12 shrink-0 text-right text-xs font-medium text-foreground">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
              <Separator className="my-6" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">Status</th>
                      <th className="pb-3 font-medium text-muted-foreground">Count</th>
                      <th className="pb-3 font-medium text-muted-foreground">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(statusBreakdown).map(([status, count]) => (
                      <tr key={status} className="border-b border-border last:border-0">
                        <td className="py-3 font-medium text-foreground">
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </td>
                        <td className="py-3 text-foreground">{count}</td>
                        <td className="py-3 text-foreground">
                          {orders.length > 0 ? ((count / orders.length) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">No order data available</p>
          )}
        </CardContent>
      </Card>

      {/* Active Suppliers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          {activeSuppliers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">#</th>
                    <th className="pb-3 font-medium text-muted-foreground">Supplier</th>
                    <th className="pb-3 font-medium text-muted-foreground">Email</th>
                    <th className="pb-3 font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSuppliers.map((supplier: any, i: number) => (
                    <tr key={supplier.id || supplier._id} className="border-b border-border last:border-0">
                      <td className="py-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-foreground">{supplier.name || "Unknown"}</td>
                      <td className="py-3 text-foreground">{supplier.email || "—"}</td>
                      <td className="py-3 text-muted-foreground">
                        {supplier.createdAt
                          ? new Date(supplier.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">No active suppliers</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
