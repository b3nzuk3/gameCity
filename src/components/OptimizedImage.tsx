import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  quality?: number
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  loading = 'lazy',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority, isInView])

  // Generate optimized image URL
  const getOptimizedSrc = (
    originalSrc: string,
    width?: number,
    quality?: number
  ) => {
    if (!originalSrc) return ''

    // If it's a Cloudinary URL, optimize it
    if (originalSrc.includes('cloudinary.com')) {
      const baseUrl = originalSrc.split('/upload/')[0] + '/upload/'
      const path = originalSrc.split('/upload/')[1]

      const transformations = []
      if (width) transformations.push(`w_${width}`)
      if (quality) transformations.push(`q_${quality}`)
      transformations.push('f_auto') // Auto format (WebP, AVIF)
      transformations.push('c_limit') // Limit dimensions
      transformations.push('fl_progressive') // Progressive JPEG
      transformations.push('dpr_auto') // Device pixel ratio optimization

      return `${baseUrl}${transformations.join(',')}/${path}`
    }

    return originalSrc
  }

  // Generate srcset for responsive images
  const generateSrcSet = (originalSrc: string) => {
    if (!originalSrc || !originalSrc.includes('cloudinary.com'))
      return undefined

    const baseUrl = originalSrc.split('/upload/')[0] + '/upload/'
    const path = originalSrc.split('/upload/')[1]

    const sizes = [320, 640, 768, 1024, 1280, 1536]
    return sizes
      .map((size) => `${getOptimizedSrc(originalSrc, size, quality)} ${size}w`)
      .join(', ')
  }

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setIsError(true)
    onError?.()
  }

  const optimizedSrc = isInView ? getOptimizedSrc(src, width, quality) : ''
  const srcSet = isInView ? generateSrcSet(src) : undefined

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden bg-gray-100', className)}
      style={{ width, height }}
    >
      {/* Placeholder/Blur */}
      {!isLoaded && !isError && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 animate-pulse',
            placeholder === 'blur' && blurDataURL && 'blur-sm'
          )}
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Error State */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}

      {/* Actual Image */}
      {isInView && !isError && (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  )
}

export default OptimizedImage
