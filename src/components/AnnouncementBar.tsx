import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

type AnnouncementBarProps = {
  isVisible: boolean
}

const AnnouncementBar = ({ isVisible }: AnnouncementBarProps) => (
  <aside
    aria-label="Store announcement"
    aria-hidden={!isVisible}
    className={`fixed inset-x-0 top-0 z-50 flex h-10 items-center justify-center border-b border-yellow-300/40 bg-[#FDB813] px-3 text-center text-xs font-semibold text-black shadow-sm sm:text-sm ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}
  >
    <p className="flex min-w-0 items-center justify-center gap-2 truncate leading-none">
      <span className="truncate sm:hidden">Delivery across Kenya</span>
      <span className="hidden truncate sm:inline">
        Gaming PCs, components &amp; accessories • Delivery across Kenya
      </span>
      <Link
        to="/category/all"
        className="inline-flex shrink-0 items-center gap-1 underline decoration-black/40 underline-offset-2 transition-colors hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
      >
        Shop now
        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
      </Link>
    </p>
  </aside>
)

export default AnnouncementBar