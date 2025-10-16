import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items = [], className }) => {
  const location = useLocation()

  // Generate breadcrumbs based on current path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ name: 'Home', url: '/' }]

    let currentPath = ''

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Convert URL segments to readable names
      let name = segment
      if (segment === 'category') {
        // Skip category segment, the next segment will be the category name
        return
      } else if (segment === 'pre-built') {
        name = 'PRE-BUILT'
      } else if (segment === 'graphics-cards') {
        name = 'Graphics Cards'
      } else if (segment === 'gaming-pcs') {
        name = 'Gaming PCs'
      } else if (segment === 'monitors') {
        name = 'Monitors'
      } else if (segment === 'storage') {
        name = 'Storage'
      } else if (segment === 'motherboards') {
        name = 'Motherboards'
      } else if (segment === 'cases') {
        name = 'Cases'
      } else if (segment === 'power-supply') {
        name = 'Power Supply'
      } else if (segment === 'cpu-cooling') {
        name = 'CPU Cooling'
      } else if (segment === 'memory') {
        name = 'Memory'
      } else if (segment === 'oem') {
        name = 'OEM'
      } else if (segment === 'product') {
        // Skip product segment, the next segment will be the product ID
        return
      } else if (segment === 'search') {
        name = 'Search'
      } else if (segment === 'cart') {
        name = 'Shopping Cart'
      } else if (segment === 'build-pc') {
        name = 'Build PC'
      } else if (segment === 'contact') {
        name = 'Contact'
      } else if (segment === 'favorites') {
        name = 'Favorites'
      } else if (segment === 'profile') {
        name = 'Profile'
      } else if (segment === 'admin') {
        name = 'Admin'
      } else if (segment === 'signin') {
        name = 'Sign In'
      } else if (segment === 'signup') {
        name = 'Sign Up'
      } else if (segment === 'privacy') {
        name = 'Privacy Policy'
      } else if (segment === 'terms') {
        name = 'Terms of Service'
      } else {
        // Capitalize first letter and replace hyphens with spaces
        name = segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
      }

      breadcrumbs.push({ name, url: currentPath })
    })

    return breadcrumbs
  }

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs()

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center space-x-1 text-sm text-muted-foreground mb-6',
        className
      )}
    >
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.url}>
          {index === 0 ? (
            <Link
              to={item.url}
              className="flex items-center hover:text-foreground transition-colors"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to={item.url}
              className="hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          )}
          {index < breadcrumbItems.length - 1 && (
            <ChevronRight className="h-4 w-4" />
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumb
