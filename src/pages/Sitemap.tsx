import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { ArrowRight } from 'lucide-react'

const sitemapLinks = [
  { to: '/', label: 'Home' },
  { to: '/category/all', label: 'All Products' },
  { to: '/category/monitors', label: 'Monitors' },
  { to: '/category/graphics-cards', label: 'Graphics Cards' },
  { to: '/category/memory', label: 'Memory' },
  { to: '/category/processors', label: 'Processors' },
  { to: '/category/storage', label: 'Storage' },
  { to: '/category/motherboards', label: 'Motherboards' },
  { to: '/category/cases', label: 'Cases' },
  { to: '/category/power-supply', label: 'Power Supply' },
  { to: '/category/gaming-pc', label: 'PRE-BUILT' },
  { to: '/category/accessories', label: 'Accessories' },
  { to: '/build', label: 'Build Your PC' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/cart', label: 'Cart' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
]

const Sitemap = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 mt-16">
      <h1 className="text-3xl font-bold mb-8">Sitemap</h1>
      <ul className="space-y-4">
        {sitemapLinks.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="flex items-center text-lg text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <ArrowRight size={16} className="mr-2" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </Layout>
)

export default Sitemap
