import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import type { HomepageSection } from '@/services/backendService'

export default function HomepageProductSection({ section }: { section: HomepageSection }) {
  if (!section.enabled || section.products.length === 0) return null
  const products = section.products
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((reference) => reference.product)
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
  if (products.length === 0) return null
  const layout = section.layout === 'carousel' ? 'carousel' : 'grid'

  return <section className="border-b border-slate-800/80 bg-[#0d0d16] py-14 sm:py-16 md:py-20" aria-labelledby={`homepage-section-${section.id}`}>
    <div className="container mx-auto lg:max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">Curated for your setup</p>
          <h2 id={`homepage-section-${section.id}`} className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">{section.title}</h2>
          {section.subtitle && <p className="mt-3 text-base leading-7 text-slate-400">{section.subtitle}</p>}
        </div>
        {section.viewAllHref && section.viewAllLabel && (section.viewAllHref.startsWith('/') ? <Link to={section.viewAllHref} className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-yellow-400 hover:text-yellow-300">{section.viewAllLabel}<ArrowUpRight className="h-4 w-4" /></Link> : <a href={section.viewAllHref} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-yellow-400 hover:text-yellow-300">{section.viewAllLabel}<ArrowUpRight className="h-4 w-4" /></a>)}
      </div>
      <div
        data-homepage-product-layout={layout}
        className={layout === 'carousel' ? 'homepage-product-carousel' : 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5'}
        role={layout === 'carousel' ? 'region' : undefined}
        aria-label={layout === 'carousel' ? `${section.title} products` : undefined}
        tabIndex={layout === 'carousel' ? 0 : undefined}
      >
        {products.map((product) => layout === 'carousel' ? <div className="homepage-product-carousel-item" key={product.id}><ProductCard product={product} hideViewButton /></div> : <ProductCard key={product.id} product={product} hideViewButton />)}
      </div>
    </div>
  </section>
}
