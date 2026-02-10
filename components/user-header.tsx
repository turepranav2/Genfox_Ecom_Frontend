"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useStore } from "@/lib/store"
import { Search, ShoppingCart, User, Package, Menu, X, LogIn, LogOut, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

export function UserHeader() {
  const { cartCount } = useStore()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Re-check auth on every route change and on custom auth-change events
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [pathname])

  useEffect(() => {
    const handleAuthChange = () => setIsLoggedIn(!!localStorage.getItem('token'))
    window.addEventListener('auth-change', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)
    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">
          GenFox
        </Link>

        <div className="hidden flex-1 md:flex">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for products, brands and more..."
              className="w-full rounded-sm border-0 bg-card pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/profile">
                  <User className="mr-1.5 h-4 w-4" />
                  Profile
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/orders">
                  <Package className="mr-1.5 h-4 w-4" />
                  Orders
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="relative text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/cart">
                  <ShoppingCart className="mr-1.5 h-4 w-4" />
                  Cart
                  {cartCount > 0 && (
                    <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent p-0 text-xs text-accent-foreground">
                      {cartCount}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/login">
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/register">
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-primary-foreground/10 px-4 pb-4 md:hidden">
          <div className="relative mb-3 mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="w-full border-0 bg-card pl-10 text-foreground"
            />
          </div>
          <div className="flex flex-col gap-1">
            {isLoggedIn ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary-foreground/10" onClick={() => setMobileMenuOpen(false)}>
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link href="/orders" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary-foreground/10" onClick={() => setMobileMenuOpen(false)}>
                  <Package className="h-4 w-4" /> Orders
                </Link>
                <Link href="/cart" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary-foreground/10" onClick={() => setMobileMenuOpen(false)}>
                  <ShoppingCart className="h-4 w-4" /> Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
                <button className="flex items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-primary-foreground/10" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary-foreground/10" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="h-4 w-4" /> Login
                </Link>
                <Link href="/register" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary-foreground/10" onClick={() => setMobileMenuOpen(false)}>
                  <UserPlus className="h-4 w-4" /> Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
