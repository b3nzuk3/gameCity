import { useEffect } from 'react'

const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    const measurePerformance = () => {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          console.log('LCP:', lastEntry.startTime)

          // Report to analytics if needed
          if (lastEntry.startTime > 2500) {
            console.warn('LCP is slow:', lastEntry.startTime)
          }
        })

        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        } catch (e) {
          // Fallback for browsers that don't support LCP
        }

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            console.log('FID:', entry.processingStart - entry.startTime)

            if (entry.processingStart - entry.startTime > 100) {
              console.warn(
                'FID is slow:',
                entry.processingStart - entry.startTime
              )
            }
          })
        })

        try {
          fidObserver.observe({ entryTypes: ['first-input'] })
        } catch (e) {
          // Fallback for browsers that don't support FID
        }

        // Cumulative Layout Shift (CLS)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          console.log('CLS:', clsValue)

          if (clsValue > 0.1) {
            console.warn('CLS is poor:', clsValue)
          }
        })

        try {
          clsObserver.observe({ entryTypes: ['layout-shift'] })
        } catch (e) {
          // Fallback for browsers that don't support CLS
        }
      }

      // Monitor page load time
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming
        const loadTime = navigation.loadEventEnd - navigation.fetchStart
        console.log('Page Load Time:', loadTime)

        if (loadTime > 3000) {
          console.warn('Page load is slow:', loadTime)
        }
      })
    }

    measurePerformance()

    // Monitor image loading performance
    const monitorImages = () => {
      const images = document.querySelectorAll('img')
      images.forEach((img) => {
        img.addEventListener('load', () => {
          const loadTime = performance.now()
          console.log(`Image loaded: ${img.src} in ${loadTime}ms`)
        })

        img.addEventListener('error', () => {
          console.error(`Image failed to load: ${img.src}`)
        })
      })
    }

    // Monitor after a short delay to ensure images are in DOM
    setTimeout(monitorImages, 1000)

    // Monitor resource loading
    const monitorResources = () => {
      const resources = performance.getEntriesByType('resource')
      resources.forEach((resource) => {
        if (resource.duration > 1000) {
          console.warn(
            `Slow resource: ${resource.name} took ${resource.duration}ms`
          )
        }
      })
    }

    // Monitor resources after page load
    window.addEventListener('load', monitorResources)

    return () => {
      // Cleanup if needed
    }
  }, [])

  return null // This component doesn't render anything
}

export default PerformanceMonitor
