"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { supplierAuthAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store, Loader2 } from "lucide-react"

export default function SupplierRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      await supplierAuthAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      toast({
        title: 'Registration successful!',
        description: 'Your supplier account is pending approval. You can now login.',
      })
      router.push('/supplier/login')
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'Could not register. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Supplier Registration</CardTitle>
          <CardDescription>
            Register your business and start selling on GenFox
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label className="text-foreground">Business Name</Label>
              <Input
                placeholder="GenFox Electronics Pvt Ltd"
                className="mt-1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label className="text-foreground">Email</Label>
              <Input
                type="email"
                placeholder="supplier@genfox.com"
                className="mt-1"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label className="text-foreground">Password</Label>
              <Input
                type="password"
                placeholder="Create password"
                className="mt-1"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div>
              <Label className="text-foreground">Confirm Password</Label>
              <Input
                type="password"
                placeholder="Re-enter password"
                className="mt-1"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : 'Register as Supplier'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link href="/supplier/login" className="font-medium text-primary hover:underline">
                Supplier Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}