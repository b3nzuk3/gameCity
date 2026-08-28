import DesktopProductCard from '@/components/DesktopProductCard'
import type { Product } from '@/services/backendService'

type DesktopProductGridProps = {
  products: Array<Product & { href?: string }>
}

const DesktopProductGrid = ({ products }: DesktopProductGridProps) => (
  <div
    data-desktop-product-grid
    className="grid grid-cols-3 gap-2 xl:grid-cols-5"
  >
    {products.map((product) => (
      <DesktopProductCard key={product.id} product={product} />
    ))}
  </div>
)

export default DesktopProductGrid
