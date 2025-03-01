
import React from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Truck, Sparkles, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  // Features section data
  const features = [
    {
      icon: <Shield className="h-10 w-10 text-emerald-500" />,
      title: "Premium Quality",
      description: "All our products undergo rigorous quality testing to ensure reliability and performance."
    },
    {
      icon: <Truck className="h-10 w-10 text-emerald-500" />,
      title: "Fast Shipping",
      description: "Free shipping on orders over $100 with expedited delivery options available."
    },
    {
      icon: <Sparkles className="h-10 w-10 text-emerald-500" />,
      title: "Expert Support",
      description: "Our tech specialists are available 24/7 to help with any questions or issues."
    },
    {
      icon: <Zap className="h-10 w-10 text-emerald-500" />,
      title: "Easy Returns",
      description: "30-day hassle-free return policy on all products for your peace of mind."
    }
  ];

  // Categories section
  const categories = [
    {
      title: "Gaming PCs",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80",
      description: "High-performance custom gaming rigs built to dominate.",
      path: "/category/gaming-pcs"
    },
    {
      title: "Graphics Cards",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80",
      description: "Latest GPUs for gaming, rendering, and creative work.",
      path: "/category/graphics-cards"
    },
    {
      title: "Monitors",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80",
      description: "Ultra-wide, 4K, and high refresh rate gaming monitors.",
      path: "/category/monitors"
    },
    {
      title: "Components",
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80",
      description: "Premium PC components for your custom build.",
      path: "/category/components"
    },
    {
      title: "Peripherals",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
      description: "High-quality keyboards, mice, and other accessories.",
      path: "/category/peripherals"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-16 px-4 md:px-6 bg-forest-800">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-6 rounded-xl glass-card bg-forest-700/30 flex flex-col items-center text-center"
              >
                <div className="mb-4 p-3 rounded-full bg-emerald-900/50">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Categories Section */}
      <section className="py-20 px-4 md:px-6 bg-forest-800">
        <div className="container mx-auto">
          <div className="flex flex-col items-center mb-12">
            <span className="px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-900/50 rounded-full mb-3">
              Browse Categories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Shop By Category
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl">
              Find the perfect components for your setup by category.
              Whether you're building a new PC or upgrading your current one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-lg hover-scale"
              >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/60 to-transparent z-10"></div>
                
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
                  <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                  <Link to={category.path}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-emerald-400 border-emerald-700 hover:bg-emerald-900/30"
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

      {/* Newsletter Section */}
      <section className="py-20 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to our newsletter for the latest product releases, exclusive deals, and tech tips.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 h-12 px-4 rounded-lg border border-forest-700 bg-forest-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
              />
              <Button 
                className="bg-emerald-600 hover:bg-emerald-500 text-white h-12 px-6"
              >
                Subscribe
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
