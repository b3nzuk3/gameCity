import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from '@/components/Layout'
import SEO from '@/components/SEO'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname
    )
    // Set HTTP status to 404 for crawlers
    if (typeof document !== 'undefined') {
      document.title = '404 - Page Not Found | GameCity Electronics'
    }
  }, [location.pathname])

  return (
    <Layout>
      <SEO
        title="404 - Page Not Found | GameCity Electronics"
        description="The page you're looking for doesn't exist. Browse our gaming electronics collection in Nairobi, Kenya."
        type="website"
        url="/404"
      />
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold mb-4 text-white">404</h1>
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved. Please
            check the URL or return to our homepage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/search">
                <Search className="mr-2 h-4 w-4" />
                Search Products
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default NotFound
