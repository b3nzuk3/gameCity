import DesktopSearchResultItem from '@/components/DesktopSearchResultItem'
import type { Product } from '@/services/backendService'

const DesktopSearchResultList = ({ products }: { products: Product[] }) => {
  return (
    <div data-desktop-search-results className="divide-y divide-gray-800 border-y border-gray-800">
      {products.map((product) => (
        <DesktopSearchResultItem key={product.id} product={product} />
      ))}
    </div>
  )
}

export default DesktopSearchResultList
