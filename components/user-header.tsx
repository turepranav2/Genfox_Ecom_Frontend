"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useStore } from "@/lib/store"
import { Search, ShoppingCart, User, Package, Menu, X, LogIn, LogOut, UserPlus, Store, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"

export function UserHeader() {
  const { cartCount } = useStore()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")

  // Mark as mounted after first client render to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [])

  // Sync search input with URL param when navigating
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "")
  }, [searchParams])

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
    window.location.href = '/'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push("/")
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 md:gap-6">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <span className="text-xl font-bold tracking-tight md:text-2xl">GenFox</span>
        </Link>

        {/* Search Bar — desktop */}
        <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
          <div className="relative w-full max-w-2xl">
            <Input
              placeholder="Search for products, brands and more"
              className="h-10 w-full rounded-sm border-0 bg-card pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-0 top-0 flex h-10 w-11 items-center justify-center rounded-r-sm text-primary hover:text-primary/80"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* Nav Items — desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {!mounted ? (
            <div className="h-9 w-24" />
          ) : isLoggedIn ? (
            <>
              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 text-primary-foreground hover:bg-primary-foreground/10">
                    <User className="h-4 w-4" />
                    <span className="max-w-[80px] truncate">Profile</span>
                    <ChevronDown className="h-3 w-3 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer gap-2">
                    <User className="h-4 w-4" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/orders')} className="cursor-pointer gap-2">
                    <Package className="h-4 w-4" /> Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Orders direct link */}
              <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/orders">
                  <Package className="mr-1.5 h-4 w-4" />
                  Orders
                </Link>
              </Button>

              {/* Cart */}
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
            </>
          ) : (
            <>
              {/* Login dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 text-primary-foreground hover:bg-primary-foreground/10">
                    <User className="h-4 w-4" />
                    Login
                    <ChevronDown className="h-3 w-3 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-muted-foreground">New customer?</span>
                    <button
                      onClick={() => router.push('/register')}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Sign Up
                    </button>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/login')} className="cursor-pointer gap-2">
                    <User className="h-4 w-4" /> Login as User
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/supplier/login')} className="cursor-pointer gap-2">
                    <Store className="h-4 w-4" /> Login as Supplier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/supplier/register')} className="cursor-pointer gap-2">
                    <Store className="h-4 w-4" /> Become a Seller
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Cart */}
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
            </>
          )}
        </nav>

        {/* Mobile: cart + hamburger */}
        <div className="flex items-center gap-1 md:hidden" suppressHydrationWarning>
          <Button variant="ghost" size="icon" asChild className="relative text-primary-foreground">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent p-0 text-[10px] text-accent-foreground">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile search bar */}
      <form onSubmit={handleSearch} className="border-t border-primary-foreground/10 px-4 py-2 md:hidden">
        <div className="relative">
          <Input
            placeholder="Search for products..."
            className="h-9 w-full border-0 bg-card pl-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" aria-label="Search" className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center text-primary">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-primary-foreground/10 px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {isLoggedIn ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 rounded-md px-3 py-2.5 hover:bg-primary-foreground/10" onClick={() => setMobileMenuOpen(false)}>
                  <User className="h-4 w-4" /> My Profile
                </Link>
                <Link href="/orders" className="flex items-center gap-2 rounded-md px-3 py-2.5 hover:bg-primary-foreground/10" onClick={() => setMobileMenuOpen(false)}>
                  <Package className="h-4 w-4" /> Orders
                </Link>
                <button className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left hover:bg-primary-foreground/10" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 rounded-md px-3 py-2.5 hover:bg-primary-foreground/10" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="h-4 w-4" /> Login as User
                </Link>
                <Link href="/supplier/login" className="flex items-center gap-2 rounded-md px-3 py-2.5 hover:bg-primary-foreground/10" onClick={() => setMobileMenuOpen(false)}>
                  <Store className="h-4 w-4" /> Login as Supplier
                </Link>
                <div className="my-1 border-t border-primary-foreground/10" />
                <Link href="/register" className="flex items-center gap-2 rounded-md px-3 py-2.5 hover:bg-primary-foreground/10" onClick={() => setMobileMenuOpen(false)}>
                  <UserPlus className="h-4 w-4" /> Sign Up as User
                </Link>
                <Link href="/supplier/register" className="flex items-center gap-2 rounded-md px-3 py-2.5 hover:bg-primary-foreground/10" onClick={() => setMobileMenuOpen(false)}>
                  <Store className="h-4 w-4" /> Become a Seller
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
