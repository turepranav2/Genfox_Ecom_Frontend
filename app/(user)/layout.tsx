"use client"

import { Suspense } from "react"
import { UserHeader } from "@/components/user-header"
import type { ReactNode } from "react"

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <UserHeader />
      </Suspense>
      {children}
    </div>
  )
}