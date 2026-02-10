"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/api"
import { formatPrice } from "@/lib/api/api-utils"

function resolveImage(images?: string[]) {
  const img = images?.[0]
  if (!img || (!img.startsWith("http") && !img.startsWith("/"))) return "/placeholder.svg"
  return img
}

export function ProductCard({ product }: { product: Product }) {
  const pid = product.id || (product as any)._id

  return (
    <Link href={`/product/${pid}`}>
      <Card className="group h-full overflow-hidden border-border transition-shadow hover:shadow-lg">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={resolveImage(product.images)}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {product.stock <= 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
                <span className="rounded-md bg-card px-3 py-1 text-sm font-medium text-card-foreground">Out of Stock</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 p-3">
            <p className="text-xs text-muted-foreground">{product.category}</p>
            <h3 className="line-clamp-2 text-sm font-medium text-card-foreground leading-snug">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-card-foreground">{formatPrice(product.price)}</span>
            </div>
            {product.stock > 0 && product.stock <= 5 && (
              <Badge variant="secondary" className="w-fit text-xs">Only {product.stock} left</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
