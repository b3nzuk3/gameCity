import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()

  useEffect(() => {
    // Scroll to top on route change
    if ('scrollRestoration' in window.history) {
      try {
        // Prevent browser restoring scroll on SPA navigations
        ;(window.history as any).scrollRestoration = 'manual'
      } catch {}
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname, location.search, location.hash])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
