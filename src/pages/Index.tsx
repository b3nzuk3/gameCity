import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import Hero from '@/components/Hero'
import FeaturedProducts from '@/components/FeaturedProducts'
import SEO from '@/components/SEO'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Truck, Sparkles, Zap } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const Index = () => {
  // Features section data
  const features = [
    {
      title: 'Premium Quality',
      description: 'Hand-picked components from trusted brands',
      icon: <Shield className="h-10 w-10 text-yellow-500" />,
    },
    {
      title: 'Fast Shipping',
      description: 'Free delivery on orders over KES 50,000',
      icon: <Truck className="h-10 w-10 text-yellow-500" />,
    },
    {
      title: 'Expert Support',
      description: '24/7 technical assistance and guidance',
      icon: <Sparkles className="h-10 w-10 text-yellow-500" />,
    },
    {
      title: 'Performance',
      description: 'Optimized builds for maximum performance',
      icon: <Zap className="h-10 w-10 text-yellow-500" />,
    },
  ]

  // Categories section
  const categories = [
    {
      title: 'PRE-BUILT',
      image:
        'https://res.cloudinary.com/dq3jxutxg/image/upload/v1750431696/greenbits-store/GamingPcs_euewim.jpg',
      description: 'High-performance custom gaming rigs built to dominate.',
      path: '/category/pre-built',
    },
    {
      title: 'Graphics Cards',
      image:
        'https://res.cloudinary.com/dq3jxutxg/image/upload/v1750432917/greenbits-store/AdobeStock_848719298_Preview_ag8zqj.jpg',
      description: 'Latest GPUs for gaming, rendering, and creative work.',
      path: '/category/graphics-cards',
    },
    {
      title: 'Monitors',
      image:
        'https://res.cloudinary.com/dq3jxutxg/image/upload/v1750432934/greenbits-store/AdobeStock_1452111894_Preview_hsqona.jpg',
      description: 'Ultra-wide, 4K, and high refresh rate gaming monitors.',
      path: '/category/monitors',
    },
    {
      title: 'Processors',
      image:
        'https://res.cloudinary.com/dq3jxutxg/image/upload/v1750433035/greenbits-store/AdobeStock_1479635189_Preview_kjbjw0.jpg',
      description:
        'The heart of your PC. Find the latest CPUs from Intel and AMD.',
      path: '/category/processors',
    },
    {
      title: 'Power Supply',
      image:
        'https://res.cloudinary.com/dq3jxutxg/image/upload/v1750433413/greenbits-store/andrey-matveev-vfXpYMzmSew-unsplash_nkpbwf.jpg',
      description: 'Reliable and efficient power supplies for your build.',
      path: '/category/power-supply',
    },
    {
      title: 'Accessories',
      image:
        'https://res.cloudinary.com/dq3jxutxg/image/upload/v1750433029/greenbits-store/AdobeStock_772458668_Preview_nonsm8.jpg',
      description: 'High-quality keyboards, mice, and other accessories.',
      path: '/category/accessories',
    },
  ]

  return (
    <Layout>
      <SEO
        title="Gaming PCs, PS5, Xbox & Graphics Cards in Nairobi | GameCity Electronics"
        description="Shop gaming PCs, PlayStation 5, Xbox Series X, graphics cards & gaming accessories in Nairobi. Fast delivery across Kenya. Best prices guaranteed!"
        keywords="gaming PCs Nairobi, PlayStation 5 Kenya, Xbox Series X, graphics cards, gaming accessories, RTX 4070, RTX 4080, gaming monitors, Nairobi electronics"
        url="/"
      />
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-16 px-4 md:px-6 bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Why Choose Gamecity?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to delivering the best gaming experience with
              premium components and exceptional service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl glass-card bg-gray-800/30 flex flex-col items-center text-center"
              >
                <div className="mb-4 p-3 rounded-full bg-yellow-500/20">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Categories Section */}
      <section className="py-20 px-4 md:px-6 bg-gray-900">
        <div className="container mx-auto">
          <div className="flex flex-col items-center mb-12">
            <span className="px-3 py-1 text-xs font-medium text-yellow-400 bg-yellow-500/20 rounded-full mb-3">
              Browse Categories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Shop By Category
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl">
              Find the perfect components for your setup by category. Whether
              you're building a new PC or upgrading your current one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-lg hover-scale"
              >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/60 to-transparent z-10"></div>

                {/* Background image */}
                <div className="h-80 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {category.description}
                  </p>
                  <Link to={category.path}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-yellow-400 border-yellow-700 hover:bg-yellow-900/30"
                    >
                      Browse
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
