"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/api/api-utils"
import { supplierPaymentAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { IndianRupee, ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react"

export default function SupplierPaymentsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const [summaryData, txnData] = await Promise.all([
          supplierPaymentAPI.getSummary().catch(() => null),
          supplierPaymentAPI.getTransactions().catch(() => []),
        ])
        setSummary(summaryData)
        setTransactions(Array.isArray(txnData) ? txnData : txnData?.transactions || [])
      } catch (error: any) {
        toast({
          title: "Failed to load payments",
          description: error.response?.data?.message || "Could not fetch payment data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="mb-3 h-10 w-full" />)}</CardContent></Card>
      </div>
    )
  }

  const paymentSummary = {
    totalRevenue: summary?.totalRevenue ?? 0,
    totalCommission: summary?.totalCommission ?? 0,
    netPayout: summary?.netPayout ?? 0,
    pendingPayout: summary?.pendingPayout ?? 0,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold text-card-foreground">{formatPrice(paymentSummary.totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Commission</p>
              <p className="text-xl font-bold text-card-foreground">{formatPrice(paymentSummary.totalCommission)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Payout</p>
              <p className="text-xl font-bold text-card-foreground">{formatPrice(paymentSummary.netPayout)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Payout</p>
              <p className="text-xl font-bold text-card-foreground">{formatPrice(paymentSummary.pendingPayout)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Transaction ID</th>
                    <th className="pb-3 font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 font-medium text-muted-foreground">Description</th>
                    <th className="pb-3 font-medium text-muted-foreground">Amount</th>
                    <th className="pb-3 font-medium text-muted-foreground">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn: any) => (
                    <tr key={txn.id || txn._id} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium text-foreground">{(txn.id || txn._id || "").slice(0, 12)}</td>
                      <td className="py-3 text-muted-foreground">
                        {txn.date || txn.createdAt
                          ? new Date(txn.date || txn.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="py-3 text-foreground">{txn.description || "Transaction"}</td>
                      <td className={`py-3 font-medium ${txn.type === "credit" ? "text-success" : "text-destructive"}`}>
                        {txn.type === "credit" ? "+" : "-"}{formatPrice(txn.amount ?? 0)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            txn.type === "credit" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {txn.type === "credit" ? "Credit" : "Debit"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">No transactions found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
