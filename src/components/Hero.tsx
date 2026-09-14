import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react'
import type { HomepageHero } from '@/services/backendService'

const DEFAULT_HERO: HomepageHero = {
  eyebrow: 'GameCity Electronics',
  title: 'Build Your Ultimate Dream Machine',
  highlightText: 'Dream Machine',
  description: 'Discover premium computer components, cutting-edge peripherals, and expert-curated builds for a setup made to perform.',
  primaryCtaLabel: 'Shop Now',
  primaryCtaHref: '/category/all',
  secondaryCtaLabel: 'Build Your PC',
  secondaryCtaHref: '/build-pc',
  imageUrl: 'https://pub-5e82d594e79e436e9cfd3a07c9c7eb7d.r2.dev/homepage/hero/gamecity-hero-poster.webp',
  imageAlt: 'Premium GameCity gaming PC components and electronics',
  enabled: true,
}

function CtaLink({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  const className = primary
    ? 'neo-button w-full bg-yellow-500 text-black hover:bg-yellow-400 sm:w-auto'
    : 'w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 sm:w-auto'
  const content = <>{children}{primary && <ChevronRight className="ml-2 h-4 w-4" />}</>
  if (href.startsWith('/')) {
    return <Button asChild size="lg" variant={primary ? 'default' : 'outline'} className={className}><Link to={href}>{content}</Link></Button>
  }
  return <Button asChild size="lg" variant={primary ? 'default' : 'outline'} className={className}><a href={href} target="_blank" rel="noreferrer">{content}</a></Button>
}

function renderTitle(title: string, highlightText: string) {
  const highlight = highlightText.trim()
  if (!highlight) return title
  const start = title.toLowerCase().lastIndexOf(highlight.toLowerCase())
  if (start < 0) return title
  return <>{title.slice(0, start)}<span className="block text-yellow-400">{title.slice(start, start + highlight.length)}</span>{title.slice(start + highlight.length)}</>
}

export default function Hero({ config }: { config?: HomepageHero | null }) {
  if (config === null || config?.enabled === false) return null
  const hero = config || DEFAULT_HERO

  return <section className="relative overflow-hidden border-b border-slate-800 bg-[#09090f]">
    <div className="mx-auto grid min-h-0 max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:max-w-[1600px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-8 lg:py-20 xl:py-24">
      <div className="relative z-10 max-w-2xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-400 sm:mb-6">{hero.eyebrow}</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.04] tracking-tight text-white">{renderTitle(hero.title, hero.highlightText)}</h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">{hero.description}</p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          <CtaLink href={hero.primaryCtaHref} primary>{hero.primaryCtaLabel}</CtaLink>
          {hero.secondaryCtaLabel && hero.secondaryCtaHref && <CtaLink href={hero.secondaryCtaHref}>{hero.secondaryCtaLabel}</CtaLink>}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-800 pt-5 text-xs text-slate-400 sm:mt-10 sm:pt-6">
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-yellow-400" /> Curated hardware</span>
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-yellow-400" /> Delivery across Kenya</span>
        </div>
      </div>
      <div className="relative min-w-0">
        <div className="absolute -inset-8 rounded-full bg-yellow-500/10 blur-3xl" aria-hidden="true" />
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/40 sm:aspect-[5/4] lg:aspect-[4/3]">
          <img src={hero.imageUrl} alt={hero.imageAlt} width="1200" height="900" loading="eager" decoding="async" fetchPriority="high" className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-yellow-500/10" aria-hidden="true" />
          <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur-sm">Performance starts here</span>
        </div>
      </div>
    </div>
    <ArrowRight className="pointer-events-none absolute -bottom-8 left-[47%] hidden h-28 w-28 text-yellow-500/5 lg:block" aria-hidden="true" />
  </section>
}
