"use client"

import { usePathname } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { LayoutDashboard, Users, Truck, ShoppingCart, Package, BarChart3, LogOut, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Suppliers", href: "/admin/suppliers", icon: <Truck className="h-4 w-4" /> },
  { label: "Products", href: "/admin/products", icon: <Package className="h-4 w-4" /> },
  { label: "Orders", href: "/admin/orders", icon: <ShoppingCart className="h-4 w-4" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
  { label: "Banners", href: "/admin/banners", icon: <ImageIcon className="h-4 w-4" /> },
  { label: "Reports", href: "/admin/reports", icon: <BarChart3 className="h-4 w-4" /> },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            localStorage.clear()
            document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
            window.location.href = "/admin/login"
          }}
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          Logout
        </Button>
      </div>
      <DashboardShell title="Admin" navItems={adminNav}>
        {children}
      </DashboardShell>
    </>
  )
}