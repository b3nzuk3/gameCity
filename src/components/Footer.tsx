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
    <footer className="bg-forest-900 pt-16 border-t border-forest-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <Link to="/" className="text-2xl font-bold text-emerald-400">
                Gamecity
              </Link>
            </div>
            <p className="text-muted-foreground mb-6">
              Premium PC hardware and custom systems for gamers, creators, and
              professionals.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin size={18} className="text-emerald-500 mr-3" />
                <a
                  href="https://www.google.com/maps/place/GAMECITY+ELECTRONICS/@-1.2835,36.8247986,17z/data=!4m6!3m5!1s0x182f11ff319a2a71:0x23dfb4aee72fab6f!8m2!3d-1.2834756!4d36.8245877!16s%2Fg%2F11rcy9p60j?entry=ttu&g_ep=EgoyMDI1MDYwNC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-400 hover:text-emerald-300"
                >
                  GAMECITY ELECTRONICS
                </a>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-emerald-500 mr-3" />
                <span className="text-sm">0712248706</span>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="text-emerald-500 mr-3" />
                <span className="text-sm">gamecityelectronics@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {/* Remove About Us link */}
              {/*
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center"
                >
                  <ArrowRight size={14} className="mr-2" />
                  About Us
                </Link>
              </li>
              */}
              <li>
                <Link
                  to="/products"
                  className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center"
                >
                  <ArrowRight size={14} className="mr-2" />
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/build"
                  className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center"
                >
                  <ArrowRight size={14} className="mr-2" />
                  Build Your PC
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center"
                >
                  <ArrowRight size={14} className="mr-2" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 py-6 border-t border-forest-800 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div>© {currentYear} Gamecity. All rights reserved.</div>
          <div className="mt-3 md:mt-0">
            <ul className="flex space-x-6">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/sitemap"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
