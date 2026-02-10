"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Trash2,
  Loader2,
  ChevronDown,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Shield,
  Users,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const parseUsers = (data: any): any[] => {
    if (Array.isArray(data)) return data
    if (data?.users && Array.isArray(data.users)) return data.users
    if (data?.data && Array.isArray(data.data)) return data.data
    if (data?.result && Array.isArray(data.result)) return data.result
    // Try to find any array value in the response
    if (data && typeof data === "object") {
      const arrays = Object.values(data).filter(Array.isArray)
      if (arrays.length > 0) return arrays[0] as any[]
    }
    return []
  }

  const fetchUsers = async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await adminAPI.getAllUsers()
      const parsed = parseUsers(data)
      setUsers(parsed)
      if (parsed.length === 0) {
        setError("The API returned an empty result. Make sure GET /api/admin/users is implemented in your backend and returns user data.")
      }
    } catch (err: any) {
      const status = err.response?.status
      const msg = err.response?.data?.message || err.message || "Could not fetch users"
      if (status === 404) {
        setError(`Backend endpoint GET /api/admin/users returned 404 (Not Found). This endpoint needs to be implemented in your backend. See backend-improvements.txt item #7 and #26.`)
      } else if (status === 401) {
        setError("Unauthorized — your admin session may have expired. Try logging in again.")
      } else {
        setError(`Failed to load users: ${msg} (HTTP ${status || "network error"})`)
      }
      toast({
        title: "Failed to load users",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async (userId: string) => {
    setDeletingId(userId)
    try {
      await adminAPI.deleteUser(userId)
      setUsers((prev) => prev.filter((u) => (u.id || u._id) !== userId))
      toast({ title: "User deleted", description: "User has been removed successfully" })
    } catch (error: any) {
      toast({
        title: "Failed to delete user",
        description: error.response?.data?.message || "Could not delete user",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = users
    .filter((u) => filterRole === "all" || (u.role || "USER").toUpperCase() === filterRole)
    .filter(
      (u) =>
        (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone || "").includes(searchQuery)
    )

  const totalUsers = users.filter((u) => (u.role || "USER").toUpperCase() === "USER").length
  const totalAdmins = users.filter((u) => (u.role || "USER").toUpperCase() === "ADMIN").length

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—"
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  }

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return { date: "—", time: "—" }
    const d = new Date(dateStr)
    return {
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const roleColors: Record<string, string> = {
    USER: "bg-blue-900/40 text-blue-400 border border-blue-700/50",
    ADMIN: "bg-purple-900/40 text-purple-400 border border-purple-700/50",
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        {[...Array(4)].map((_, i) => (
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
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-lg font-bold text-foreground">{users.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <User className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Customers</p>
              <p className="text-lg font-bold text-foreground">{totalUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Shield className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-xs text-muted-foreground">Admins</p>
              <p className="text-lg font-bold text-foreground">{totalAdmins}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles ({users.length})</SelectItem>
            <SelectItem value="USER">Customers ({totalUsers})</SelectItem>
            <SelectItem value="ADMIN">Admins ({totalAdmins})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Banner */}
      {error && (
        <Card className="border-yellow-700/50 bg-yellow-900/20">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-400">Unable to load users</p>
              <p className="mt-1 text-xs text-yellow-400/80">{error}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-yellow-700/50 text-yellow-400 hover:bg-yellow-900/30 bg-transparent"
              onClick={fetchUsers}
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 && !error && (
        <p className="py-10 text-center text-sm text-muted-foreground">No users found</p>
      )}

      {/* User Cards */}
      {filtered.map((user) => {
        const uid = user.id || user._id
        const isExpanded = expandedId === uid
        const role = (user.role || "USER").toUpperCase()
        const dt = user.createdAt ? formatDateTime(user.createdAt) : null
        const addresses = user.addresses || []
        const initials = (user.name || "U")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()

        return (
          <Collapsible key={uid} open={isExpanded} onOpenChange={() => setExpandedId(isExpanded ? null : uid)}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{user.email || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={roleColors[role] || roleColors.USER}>{role}</Badge>
                      <span className="hidden text-xs text-muted-foreground sm:inline">{formatDate(user.createdAt)}</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="border-t border-border px-4 pb-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Basic Info */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact Info</h4>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{user.name || "N/A"}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{user.email || "N/A"}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{user.phone || "Not provided"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Account Details */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account</h4>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-3.5 w-3.5" />
                          <span>Role: </span>
                          <Badge className={`${roleColors[role]} text-xs`}>{role}</Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Joined: {dt?.date || "—"} at {dt?.time || "—"}</span>
                        </div>
                        {user.orderCount !== undefined && (
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>Orders: {user.orderCount}</span>
                          </div>
                        )}
                        <Separator className="my-2" />
                        <p className="text-xs text-muted-foreground">
                          ID: <span className="font-mono text-foreground">{uid}</span>
                        </p>
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Addresses ({addresses.length})
                      </h4>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        {addresses.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No saved addresses</p>
                        ) : (
                          addresses.map((addr: any, i: number) => (
                            <div key={i} className={i > 0 ? "mt-2 border-t border-border pt-2" : ""}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-medium text-foreground">
                                  {addr.label || "Address"} {addr.isDefault && <Badge className="ml-1 bg-emerald-900/40 text-emerald-400 border border-emerald-700/50 text-[10px] px-1 py-0">Default</Badge>}
                                </span>
                              </div>
                              <p className="ml-5 text-xs text-muted-foreground">
                                {[addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ") || "—"}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-700/50 text-red-400 hover:bg-red-900/30 hover:text-red-300 bg-transparent"
                          disabled={deletingId === uid}
                        >
                          {deletingId === uid ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete User
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <strong>{user.name || "this user"}</strong> ({user.email})? This action cannot be undone and will remove all their data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(uid)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
