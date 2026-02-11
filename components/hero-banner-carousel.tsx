"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Banner {
  id?: string
  _id?: string
  imageUrl: string
  link: string
  title?: string
}

interface HeroBannerCarouselProps {
  banners: Banner[]
}

export function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [banners.length, next])

  if (banners.length === 0) return null

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-muted">
      <div className="relative aspect-[3/1] w-full sm:aspect-[4/1]">
        {banners.map((banner, idx) => (
          <Link
            key={banner.id || banner._id || idx}
            href={banner.link || "#"}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              idx === current ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title || `Banner ${idx + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={idx === 0}
            />
          </Link>
        ))}
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/60 text-foreground hover:bg-background/80 h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              prev()
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/60 text-foreground hover:bg-background/80 h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              next()
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current ? "w-6 bg-primary" : "w-2 bg-primary/40"
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  setCurrent(idx)
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
