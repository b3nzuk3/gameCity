import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import Hero from '@/components/Hero'
import FeaturedProducts from '@/components/FeaturedProducts'
import HomepageSections from '@/components/HomepageSections'
import SEO from '@/components/SEO'
import OptimizedImage from '@/components/OptimizedImage'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import GoogleReviews from '@/components/GoogleReviews'
import backendService from '@/services/backendService'

const Index = () => {
  const homepage = useQuery({
    queryKey: ['homepage', 'public'],
    queryFn: () => backendService.homepage.get(),
    staleTime: 60_000,
  })


  // Categories section
  const categories = [
    {
      title: 'PRE-BUILT',
      image:
        'https://pub-5e82d594e79e436e9cfd3a07c9c7eb7d.r2.dev/homepage/categories/pre-built-medium.webp',
      description: 'High-performance custom gaming rigs built to dominate.',
      path: '/category/pre-built',
    },
    {
      title: 'Graphics Cards',
      image:
        'https://pub-5e82d594e79e436e9cfd3a07c9c7eb7d.r2.dev/homepage/categories/graphics-cards-medium.webp',
      description: 'Latest GPUs for gaming, rendering, and creative work.',
      path: '/category/graphics-cards',
    },
    {
      title: 'Monitors',
      image:
        'https://pub-5e82d594e79e436e9cfd3a07c9c7eb7d.r2.dev/homepage/categories/monitors-medium.webp',
      description: 'Ultra-wide, 4K, and high refresh rate gaming monitors.',
      path: '/category/monitors',
    },
    {
      title: 'Processors',
      image:
        'https://pub-5e82d594e79e436e9cfd3a07c9c7eb7d.r2.dev/homepage/categories/processors-medium.webp',
      description:
        'The heart of your PC. Find the latest CPUs from Intel and AMD.',
      path: '/category/processors',
    },
    {
      title: 'Power Supply',
      image:
        'https://pub-5e82d594e79e436e9cfd3a07c9c7eb7d.r2.dev/homepage/categories/power-supply-medium.webp',
      description: 'Reliable and efficient power supplies for your build.',
      path: '/category/power-supply',
    },
    {
      title: 'Accessories',
      image:
        'https://pub-5e82d594e79e436e9cfd3a07c9c7eb7d.r2.dev/homepage/categories/accessories-medium.webp',
      description: 'High-quality keyboards, mice, and other accessories.',
      path: '/category/accessories',
    },
  ]

  const hasConfiguredSections = Boolean(homepage.data?.configured && homepage.data.sections.length > 0)

  return (
    <Layout>
      <SEO
        title="Custom-Built PCs for Gaming & Streaming, Graphics Design, Architectural Design and Machine learning | GameCity Electronics"
        description="Shop gaming PCs, PlayStation 5, Xbox Series X, graphics cards & gaming accessories in Nairobi. Fast delivery across Kenya. Best prices guaranteed!"
        keywords="gaming PCs Nairobi, PlayStation 5 Kenya, Xbox Series X, graphics cards, gaming accessories, RTX 4070, RTX 4080, gaming monitors, Nairobi electronics"
        url="/"
      />
      {/* Hero Section */}
      <Hero config={homepage.data?.hero} />

      <div data-home-sections className="flex flex-col">

        {/* Database-backed merchandising takes precedence once at least one section exists. */}
        {hasConfiguredSections ? <HomepageSections sections={homepage.data?.sections ?? []} /> : <div data-home-featured-section className="order-1 md:order-2"><FeaturedProducts /></div>}

        {/* Google Reviews Section */}
        <div data-home-reviews-section className="order-3 md:order-3">
          <GoogleReviews />
        </div>

        {/* Categories Section */}
        <section
          id="shop-by-category"
          className="order-2 py-8 md:order-4 md:py-20 px-2 md:px-6 bg-gray-900"
        >
          <div
            data-home-category-container
            className="container mx-auto lg:max-w-[1600px] px-0 md:px-8"
          >
          <div className="flex flex-col items-center mb-6 md:mb-12">
            <span
              data-home-category-badge
              className="hidden md:inline-flex md:px-3 md:py-1 text-xs font-medium text-yellow-400 bg-yellow-500/20 rounded-full md:mb-3"
            >
              Browse Categories
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-2 md:mb-4">
              Shop By Category
            </h2>
            <p
              data-home-category-description
              className="hidden text-muted-foreground text-center text-base leading-7 md:block max-w-2xl"
            >
              Find the perfect components for your setup by category. Whether
              you're building a new PC or upgrading your current one.
            </p>
          </div>

          <div
            data-home-category-grid
            className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-8"
          >
            {categories.map((category, index) => (
              <div
                key={index}
                data-home-category-card
                className="group relative min-w-0 md:overflow-hidden md:rounded-xl md:shadow-lg md:hover-scale"
              >
                <Link
                  data-mobile-category-link
                  to={category.path}
                  aria-label={`Shop ${category.title}`}
                  className="absolute inset-0 z-30 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDB813] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 md:hidden"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 z-10 hidden bg-gradient-to-t from-gray-900/90 via-gray-900/60 to-transparent md:block"></div>

                {/* Category image */}
                <div className="aspect-square overflow-hidden rounded-md bg-[#1b1b27] md:h-80 md:aspect-auto md:rounded-none md:bg-transparent">
                  <OptimizedImage
                    src={category.image}
                    alt={`${
                      category.title
                    } - Gaming ${category.title.toLowerCase()} in Nairobi Kenya`}
                    className="h-full w-full bg-[#1b1b27] md:bg-gray-100"
                    imageClassName="!object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03] md:!object-cover md:p-0 md:duration-700 md:group-hover:scale-110"
                    placeholderClassName="bg-[#1b1b27] md:bg-gray-200"
                    errorClassName="bg-[#1b1b27] md:bg-gray-100"
                    sizes="(max-width: 767px) 50vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 3} // Prioritize first 3 images
                  />
                </div>

                <h3
                  data-mobile-category-title
                  className="mt-2 text-sm font-semibold leading-tight text-white md:hidden"
                >
                  {category.title}
                </h3>

                {/* Desktop content */}
                <div
                  data-desktop-category-content
                  className="absolute bottom-0 left-0 right-0 z-20 hidden p-6 md:block"
                >
                  <h3 className="mb-2 text-xl font-bold">{category.title}</h3>
                  <p className="mb-4 line-clamp-2 text-base leading-7 text-muted-foreground">
                    {category.description}
                  </p>
                  <Link to={category.path}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 border-yellow-700 px-3 text-sm text-yellow-400 hover:bg-yellow-900/30"
                    >
                      View {category.title}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          </div>
        </section>
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10"></div>
        <div className="absolute w-96 h-96 bg-yellow-500/5 rounded-full filter blur-3xl -top-48 -right-48 animate-pulse"></div>
        <div
          className="absolute w-96 h-96 bg-yellow-500/5 rounded-full filter blur-3xl bottom-0 -left-48 animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>
    </Layout>
  )
}

export default Index
