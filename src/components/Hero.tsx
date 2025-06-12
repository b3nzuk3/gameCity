import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

const Hero = () => {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-forest-900/50 via-forest-900/80 to-background"></div>

      {/* Floating elements */}
      <div className="absolute w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl -top-20 -right-20 animate-pulse"></div>
      <div
        className="absolute w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl top-1/3 -left-32 animate-pulse"
        style={{ animationDelay: '1s', animationDuration: '8s' }}
      ></div>

      <div className="container mx-auto px-4 relative z-10 pt-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-6 px-3 py-1 rounded-full bg-emerald-900/50 backdrop-blur-sm border border-emerald-800">
            <span className="text-xs font-medium text-emerald-400">
              Premium PC Components • Free Shipping
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-enter">
            <span className="text-foreground">Build Your</span>
            <span className="block text-emerald-400"> Dream Machine</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            High-quality components for gamers, creators, and professionals.
            Custom builds with premium performance and unmatched aesthetics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/category/all">
              <Button
                size="lg"
                className="neo-button bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto"
              >
                Shop Components
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </Link>
            <Link to="/build">
              <Button
                variant="outline"
                size="lg"
                className="border-emerald-700 text-emerald-400 hover:bg-emerald-900/30 w-full sm:w-auto"
              >
                Build Your PC
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom decorative curve */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-20 text-background"
          fill="currentColor"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C0,0,20,20,20,20"></path>
        </svg>
      </div>
    </div>
  )
}

export default Hero
