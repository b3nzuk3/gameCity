
import React from "react";
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
              <a href="/" className="text-2xl font-bold text-emerald-400">
                GreenBits
              </a>
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
                <a href="#" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Products
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Build Your PC
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-medium mb-6">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Return Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Warranty Info
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-emerald-400 transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Track Order
                </a>
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
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-forest-800 hover:bg-emerald-900/50 text-emerald-400 transition-colors"
                >
                  <Facebook size={18} />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-forest-800 hover:bg-emerald-900/50 text-emerald-400 transition-colors"
                >
                  <Twitter size={18} />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-forest-800 hover:bg-emerald-900/50 text-emerald-400 transition-colors"
                >
                  <Instagram size={18} />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-forest-800 hover:bg-emerald-900/50 text-emerald-400 transition-colors"
                >
                  <Youtube size={18} />
                </a>
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
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
