import React, { useState } from 'react'
import { z } from 'zod'

const ImageGallerySchema = z.object({
  images: z.array(z.object({
    src: z.string(),
    alt: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional()
  })),
  layout: z.enum(['grid', 'masonry', 'carousel']).optional(),
  columns: z.number().optional(),
  showTitles: z.boolean().optional(),
  enableLightbox: z.boolean().optional(),
  className: z.string().optional()
})

type ImageGalleryData = z.infer<typeof ImageGallerySchema>

interface ImageGalleryProps {
  data: ImageGalleryData
}

export function ImageGallery({ data }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({})

  const layout = data.layout || 'grid'
  const columns = data.columns || 3
  const enableLightbox = data.enableLightbox ?? true
  const showTitles = data.showTitles ?? true

  const handleImageClick = (index: number) => {
    if (enableLightbox) {
      setCurrentImage(index)
      setLightboxOpen(true)
    }
  }

  const handleImageLoad = (index: number) => {
    setLoadingStates(prev => ({ ...prev, [index]: false }))
  }

  const handleImageError = (index: number) => {
    setLoadingStates(prev => ({ ...prev, [index]: false }))
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % data.images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + data.images.length) % data.images.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setLightboxOpen(false)
    } else if (e.key === 'ArrowRight') {
      nextImage()
    } else if (e.key === 'ArrowLeft') {
      prevImage()
    }
  }

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }

  const gridClass = gridClasses[Math.min(columns, 6) as keyof typeof gridClasses] || gridClasses[3]

  return (
    <div className={`image-gallery ${data.className || ''}`}>
      <div className={`grid ${gridClass} gap-4`}>
        {data.images.map((image, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-lg ${
              enableLightbox ? 'cursor-pointer hover:opacity-90' : ''
            } transition-opacity duration-200`}
            onClick={() => handleImageClick(index)}
          >
            {loadingStates[index] && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
            )}
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-auto object-cover"
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageError(index)}
              loading="lazy"
            />
            {showTitles && image.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                <p className="text-sm font-medium">{image.title}</p>
                {image.description && (
                  <p className="text-xs opacity-90">{image.description}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && enableLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-label="Image lightbox"
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
              aria-label="Close lightbox"
            >
              ×
            </button>

            {data.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 z-10"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 z-10"
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            )}

            <img
              src={data.images[currentImage].src}
              alt={data.images[currentImage].alt}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {data.images[currentImage].title && (
              <div className="absolute bottom-4 left-4 right-4 text-white text-center">
                <p className="text-lg font-medium">{data.images[currentImage].title}</p>
                {data.images[currentImage].description && (
                  <p className="text-sm opacity-90 mt-1">{data.images[currentImage].description}</p>
                )}
              </div>
            )}

            {data.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {currentImage + 1} / {data.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}