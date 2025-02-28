
import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-forest-900 pt-16 border-t border-forest-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <Link to="/" className="text-2xl font-bold text-emerald-400">
                GreenBits
              </Link>
            </div>
            <p className="text-muted-foreground mb-6">
              Premium PC hardware and custom systems for gamers, creators, and professionals.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin size={18} className="text-emerald-500 mr-3" />
                <span className="text-sm">1234 Tech Avenue, Silicon Valley, CA</span>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-emerald-500 mr-3" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="text-emerald-500 mr-3" />
                <span className="text-sm">support@greenbits.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Products
                </Link>
              </li>
              <li>
                <Link to="/build" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Build Your PC
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Support
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-medium mb-6">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Return Policy
                </Link>
              </li>
              <li>
                <Link to="/warranty" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Warranty Info
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-medium mb-6">Newsletter</h3>
            <p className="text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest products, deals and tech news.
            </p>
            <div className="flex flex-col space-y-3">
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="bg-forest-800 border-forest-700 text-foreground placeholder:text-muted-foreground focus-visible:ring-emerald-500"
              />
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                Subscribe
              </Button>
            </div>
            <div className="mt-6">
              <div className="text-sm text-muted-foreground mb-3">Follow Us</div>
              <div className="flex space-x-3">
                <Link 
                  to="/social/facebook" 
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-forest-800 hover:bg-emerald-900/50 text-emerald-400 transition-colors"
                >
                  <Facebook size={18} />
                </Link>
                <Link 
                  to="/social/twitter" 
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-forest-800 hover:bg-emerald-900/50 text-emerald-400 transition-colors"
                >
                  <Twitter size={18} />
                </Link>
                <Link 
                  to="/social/instagram" 
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-forest-800 hover:bg-emerald-900/50 text-emerald-400 transition-colors"
                >
                  <Instagram size={18} />
                </Link>
                <Link 
                  to="/social/youtube" 
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-forest-800 hover:bg-emerald-900/50 text-emerald-400 transition-colors"
                >
                  <Youtube size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-forest-800 mt-12 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div>
            © {currentYear} GreenBits. All rights reserved.
          </div>
          <div className="mt-3 md:mt-0">
            <ul className="flex space-x-6">
              <li>
                <Link to="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="hover:text-emerald-400 transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
