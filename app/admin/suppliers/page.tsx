"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Search,
  Check,
  X,
  Loader2,
  ChevronDown,
  Store,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Landmark,
  FileText,
  Package,
  IndianRupee,
  ShieldCheck,
  Clock,
  Users,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"

const statusColors: Record<string, string> = {
  APPROVED: "bg-emerald-900/40 text-emerald-400 border border-emerald-700/50",
  PENDING: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/50",
  REJECTED: "bg-red-900/40 text-red-400 border border-red-700/50",
}

export default function AdminSuppliersPage() {
  const { toast } = useToast()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const parseList = (data: any): any[] => {
    if (Array.isArray(data)) return data
    if (data?.suppliers && Array.isArray(data.suppliers)) return data.suppliers
    if (data?.data && Array.isArray(data.data)) return data.data
    if (data?.result && Array.isArray(data.result)) return data.result
    if (data && typeof data === "object") {
      const arrays = Object.values(data).filter(Array.isArray)
      if (arrays.length > 0) return arrays[0] as any[]
    }
    return []
  }

  const fetchSuppliers = async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await adminAPI.getAllSuppliers()
      const parsed = parseList(data)
      setSuppliers(parsed)
      if (parsed.length === 0) {
        setError("The API returned an empty result. Make sure GET /api/admin/suppliers returns supplier data with full details.")
      }
    } catch (err: any) {
      const status = err.response?.status
      const msg = err.response?.data?.message || err.message || "Could not fetch suppliers"
      if (status === 404) {
        setError("Backend endpoint GET /api/admin/suppliers returned 404. This endpoint needs to be implemented.")
      } else {
        setError(`Failed to load suppliers: ${msg} (HTTP ${status || "network error"})`)
      }
      toast({
        title: "Failed to load suppliers",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const handleApprove = async (supplierId: string) => {
    setActionLoading(supplierId)
    try {
      await adminAPI.approveSupplier(supplierId)
      setSuppliers((prev) =>
        prev.map((s) =>
          (s.id === supplierId || s._id === supplierId) ? { ...s, status: "APPROVED" } : s
        )
      )
      toast({ title: "Supplier approved", description: "Supplier can now list products" })
    } catch (error: any) {
      toast({
        title: "Failed to approve",
        description: error.response?.data?.message || "Could not approve supplier",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (supplierId: string) => {
    setActionLoading(supplierId)
    try {
      await adminAPI.rejectSupplier(supplierId)
      setSuppliers((prev) =>
        prev.map((s) =>
          (s.id === supplierId || s._id === supplierId) ? { ...s, status: "REJECTED" } : s
        )
      )
      toast({ title: "Supplier rejected", description: "Supplier has been rejected" })
    } catch (error: any) {
      toast({
        title: "Failed to reject",
        description: error.response?.data?.message || "Could not reject supplier",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = suppliers
    .filter((s) => filterStatus === "all" || (s.status || "PENDING").toUpperCase() === filterStatus)
    .filter(
      (s) =>
        (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.phone || "").includes(searchQuery) ||
        (s.gstin || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

  const totalApproved = suppliers.filter((s) => (s.status || "PENDING").toUpperCase() === "APPROVED").length
  const totalPending = suppliers.filter((s) => (s.status || "PENDING").toUpperCase() === "PENDING").length
  const totalRejected = suppliers.filter((s) => (s.status || "PENDING").toUpperCase() === "REJECTED").length

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return { date: "—", time: "—" }
    const d = new Date(dateStr)
    return {
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    }
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-foreground">{suppliers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-lg font-bold text-foreground">{totalApproved}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-foreground">{totalPending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <X className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="text-lg font-bold text-foreground">{totalRejected}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, GSTIN..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers ({suppliers.length})</SelectItem>
            <SelectItem value="APPROVED">Approved ({totalApproved})</SelectItem>
            <SelectItem value="PENDING">Pending ({totalPending})</SelectItem>
            <SelectItem value="REJECTED">Rejected ({totalRejected})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Banner */}
      {error && (
        <Card className="border-yellow-700/50 bg-yellow-900/20">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-400">Unable to load suppliers</p>
              <p className="mt-1 text-xs text-yellow-400/80">{error}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-yellow-700/50 text-yellow-400 hover:bg-yellow-900/30 bg-transparent"
              onClick={fetchSuppliers}
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 && !error && (
        <p className="py-10 text-center text-sm text-muted-foreground">No suppliers found</p>
      )}

      {/* Supplier Cards */}
      {filtered.map((supplier) => {
        const sid = supplier.id || supplier._id
        const isExpanded = expandedId === sid
        const status = (supplier.status || "PENDING").toUpperCase()
        const dt = supplier.createdAt ? formatDateTime(supplier.createdAt) : null
        const bank = supplier.bankDetails || {}
        const hasBankDetails = bank.accountNumber || bank.ifscCode || bank.bankName

        return (
          <Collapsible key={sid} open={isExpanded} onOpenChange={() => setExpandedId(isExpanded ? null : sid)}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{supplier.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{supplier.email || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[status] || statusColors.PENDING}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </Badge>
                      {status === "PENDING" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/30 bg-transparent px-2"
                            onClick={(e) => { e.stopPropagation(); handleApprove(sid) }}
                            disabled={actionLoading === sid}
                          >
                            {actionLoading === sid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 border-red-700/50 text-red-400 hover:bg-red-900/30 bg-transparent px-2"
                            onClick={(e) => { e.stopPropagation(); handleReject(sid) }}
                            disabled={actionLoading === sid}
                          >
                            {actionLoading === sid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      )}
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="border-t border-border px-4 pb-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Contact Info */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact Info</h4>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Store className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{supplier.name || "N/A"}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{supplier.email || "N/A"}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{supplier.phone || "Not provided"}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{supplier.address || "No address provided"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Business Details */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Business Details</h4>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          <span>GSTIN: <span className="font-mono text-foreground">{supplier.gstin || "Not provided"}</span></span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <IndianRupee className="h-3.5 w-3.5" />
                          <span>Commission: {supplier.commissionRate ?? 10}%</span>
                        </div>
                        {supplier.productCount !== undefined && (
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Package className="h-3.5 w-3.5" />
                            <span>Products: {supplier.productCount}</span>
                          </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Joined: {dt?.date || "—"} at {dt?.time || "—"}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          ID: <span className="font-mono text-foreground">{sid}</span>
                        </p>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bank Details</h4>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        {!hasBankDetails ? (
                          <p className="text-sm text-muted-foreground">No bank details provided</p>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Landmark className="h-3.5 w-3.5" />
                              <span>{bank.bankName || "—"}</span>
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              <span>Account: </span>
                              <span className="font-mono text-foreground">{bank.accountNumber || "—"}</span>
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              <span>IFSC: </span>
                              <span className="font-mono text-foreground">{bank.ifscCode || "—"}</span>
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              <span>Holder: </span>
                              <span className="text-foreground">{bank.accountHolderName || "—"}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for non-pending */}
                  {status !== "PENDING" && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge className={statusColors[status] || statusColors.PENDING}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </Badge>
                      {status === "REJECTED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-2 h-7 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/30 bg-transparent"
                          onClick={() => handleApprove(sid)}
                          disabled={actionLoading === sid}
                        >
                          {actionLoading === sid ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1 h-3.5 w-3.5" />}
                          Re-Approve
                        </Button>
                      )}
                      {status === "APPROVED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-2 h-7 border-red-700/50 text-red-400 hover:bg-red-900/30 bg-transparent"
                          onClick={() => handleReject(sid)}
                          disabled={actionLoading === sid}
                        >
                          {actionLoading === sid ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <X className="mr-1 h-3.5 w-3.5" />}
                          Revoke
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )
      })}
    </div>
  )
}
