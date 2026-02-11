"use client"

import { usePathname } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { LayoutDashboard, Package, ShoppingCart, CreditCard, User, LogOut, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

const supplierNav = [
  { label: "Dashboard", href: "/supplier", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Products", href: "/supplier/products", icon: <Package className="h-4 w-4" /> },
  { label: "Categories", href: "/supplier/categories", icon: <FolderTree className="h-4 w-4" /> },
  { label: "Orders", href: "/supplier/orders", icon: <ShoppingCart className="h-4 w-4" /> },
  { label: "Payments", href: "/supplier/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Profile", href: "/supplier/profile", icon: <User className="h-4 w-4" /> },
]

export default function SupplierLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/supplier/login" || pathname === "/supplier/register") {
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
            window.location.href = "/supplier/login"
          }}
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          Logout
        </Button>
      </div>
      <DashboardShell title="Supplier" navItems={supplierNav}>
        {children}
      </DashboardShell>
    </>
  )
}