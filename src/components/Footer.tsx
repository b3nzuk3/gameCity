import React from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black pt-16 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-bold text-yellow-400">
              Gamecity
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              Your premier destination for high-quality gaming components and
              accessories. Building dream setups since day one.
            </p>
            <div className="space-y-3">
              <a
                href="https://www.google.com/maps/place/GAMECITY+ELECTRONICS/@-1.2835,36.8247986,17z/data=!4m6!3m5!1s0x182f11ff319a2a71:0x23dfb4aee72fab6f!8m2!3d-1.2834756!4d36.8245877!16s%2Fg%2F11rcy9p60j?entry=ttu&g_ep=EgoyMDI1MDYwNC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-muted-foreground hover:text-yellow-400 transition-colors"
              >
                <MapPin
                  size={18}
                  className="text-yellow-500 mr-3 flex-shrink-0"
                />
                <span>GAMECITY ELECTRONICS</span>
              </a>
              <a
                href="tel:0712248706"
                className="flex items-center text-sm text-muted-foreground hover:text-yellow-400 transition-colors"
              >
                <Phone size={18} className="text-yellow-500 mr-3" />
                <span>0712248706</span>
              </a>
              <a
                href="mailto:gamecityelectronics@gmail.com"
                className="flex items-center text-sm text-muted-foreground hover:text-yellow-400 transition-colors"
              >
                <Mail size={18} className="text-yellow-500 mr-3" />
                <span>gamecityelectronics@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <div className="space-y-2">
              <Link
                to="/search"
                className="text-muted-foreground hover:text-yellow-400 transition-colors flex items-center"
              >
                Shop All
              </Link>
              <Link
                to="/category/graphics-cards"
                className="text-muted-foreground hover:text-yellow-400 transition-colors flex items-center"
              >
                Graphics Cards
              </Link>
              <Link
                to="/category/processors"
                className="text-muted-foreground hover:text-yellow-400 transition-colors flex items-center"
              >
                Processors
              </Link>
              <Link
                to="/category/motherboards"
                className="text-muted-foreground hover:text-yellow-400 transition-colors flex items-center"
              >
                Motherboards
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Customer Service
            </h4>
            <div className="space-y-2">
              <Link
                to="/contact"
                className="text-muted-foreground hover:text-yellow-400 transition-colors flex items-center"
              >
                Contact Us
              </Link>
              <Link
                to="/returns"
                className="text-muted-foreground hover:text-yellow-400 transition-colors flex items-center"
              >
                Returns & Exchanges
              </Link>
              <Link
                to="/warranty"
                className="text-muted-foreground hover:text-yellow-400 transition-colors flex items-center"
              >
                Warranty Info
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors"
              >
                <Youtube size={20} />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Stay updated with our latest products and exclusive deals!
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 py-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {currentYear} Gamecity. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/privacy"
              className="hover:text-yellow-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-yellow-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/sitemap"
              className="hover:text-yellow-400 transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
