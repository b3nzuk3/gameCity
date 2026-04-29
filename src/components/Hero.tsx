import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

const Hero = () => {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Fallback Background (shows if video fails or buffers) */}
      <div className="absolute top-0 left-0 w-full h-full hero-gradient z-0"></div>

      {/* Background Video */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="https://res.cloudinary.com/dq3jxutxg/video/upload/f_auto,q_auto/v1777433582/greenbits-store/0429_1_kjyl0t.jpg"
          className="object-cover w-full h-full opacity-80"
        >
          <source 
            src="https://res.cloudinary.com/dq3jxutxg/video/upload/f_auto,q_auto/v1777433582/greenbits-store/0429_1_kjyl0t.mov" 
            type="video/mp4" 
          />
        </video>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>

      {/* Floating elements */}
      <div className="absolute w-64 h-64 bg-yellow-500/5 rounded-full filter blur-3xl -top-20 -right-20 animate-pulse"></div>
      <div
        className="absolute w-64 h-64 bg-yellow-500/10 rounded-full filter blur-3xl top-1/3 -left-32 animate-pulse"
        style={{ animationDelay: '1s', animationDuration: '8s' }}
      ></div>

      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-block mb-6 px-3 py-1 rounded-full bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30">
          <span className="text-xs font-medium text-yellow-400">
            ✨ Welcome to Gamecity
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Build Your Ultimate
          <span className="block text-yellow-400"> Dream Machine</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Discover premium computer components, cutting-edge peripherals, and
          expert-curated builds. Transform your setup with our carefully
          selected hardware collection.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="neo-button bg-yellow-500 hover:bg-yellow-400 text-black w-full sm:w-auto"
          >
            <Link to="/category/all">
              Shop Now <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 w-full sm:w-auto"
          >
            <Link to="/build-pc">Build Your PC</Link>
          </Button>
        </div>
      </div>

    </div>
  )
}

export default Hero
