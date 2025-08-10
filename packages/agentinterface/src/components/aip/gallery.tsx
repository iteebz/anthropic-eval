import React, { useState } from 'react';
import { z } from 'zod';
import { register } from '../../registry';

export const GallerySchema = {
  type: 'object',
  properties: {
    images: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          src: { type: 'string' },
          alt: { type: 'string' },
          title: { type: 'string' },
        },
        required: ['src', 'alt'],
      },
    },
    columns: { type: 'number', minimum: 1, maximum: 4 },
    className: { type: 'string' },
  },
  required: ['images'],
} as const;

export const metadata = {
  type: 'gallery',
  description:
    'Display a grid of images with lightbox functionality and customizable layout',
  schema: GallerySchema,
  category: 'interface',
  tags: ['images', 'visual', 'grid'],
} as const;

const GalleryValidator = z.object({
  images: z.array(
    z.object({
      src: z.string(),
      alt: z.string(),
      title: z.string().optional(),
    }),
  ),
  columns: z.number().optional(),
  className: z.string().optional(),
});

type GalleryData = z.infer<typeof GalleryValidator>;

export function Gallery(props: GalleryData) {
  const { images, columns = 3, className } = props;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const gridClass =
    {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    }[columns] || 'grid-cols-3';

  return (
    <div className={className}>
      <div className={`grid ${gridClass} gap-4`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="relative cursor-pointer overflow-hidden rounded-lg hover:opacity-90"
            onClick={() => {
              setCurrentImage(index);
              setLightboxOpen(true);
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="h-auto w-full object-cover"
              loading="lazy"
            />
            {image.title && (
              <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 p-2 text-white">
                <p className="text-sm">{image.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-h-full max-w-4xl">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 text-2xl text-white hover:text-gray-300"
            >
              ×
            </button>
            <img
              src={images[currentImage].src}
              alt={images[currentImage].alt}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Register with unified registry
register({
  type: 'gallery',
  schema: GalleryValidator,
  render: Gallery,
});
