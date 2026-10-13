import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { HomepageAnnouncement } from '@/services/backendService'

type AnnouncementBarProps = {
  config: HomepageAnnouncement
  isVisible: boolean
}

function getSafeAnnouncementHref(href: string) {
  const trimmedHref = href.trim()
  const hasUnsafeCharacters = [...trimmedHref].some((character) => {
    const code = character.charCodeAt(0)
    return code < 0x20 || code === 0x7f || character === '\\'
  })
  if (!trimmedHref || trimmedHref.length > 500 || hasUnsafeCharacters) {
    return null
  }

  if (trimmedHref.startsWith('/') && !trimmedHref.startsWith('//')) {
    return { href: trimmedHref, external: false }
  }

  try {
    const url = new URL(trimmedHref)
    if (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      !url.username &&
      !url.password
    ) {
      return { href: trimmedHref, external: true }
    }
  } catch {
    // Invalid CMS URLs do not get rendered as links.
  }

  return null
}

const AnnouncementBar = ({ config, isVisible }: AnnouncementBarProps) => {
  if (!config.enabled) return null

  const safeHref = getSafeAnnouncementHref(config.linkHref)
  const linkLabel = config.linkLabel.trim()
  const mobileText = config.mobileText.trim() || config.text
  const cta = safeHref && linkLabel ? (
    safeHref.external ? (
      <a
        href={safeHref.href}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={isVisible ? 0 : -1}
        className="inline-flex shrink-0 items-center gap-1 underline decoration-black/40 underline-offset-2 transition-colors hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
      >
        {linkLabel}
        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
      </a>
    ) : (
      <Link
        to={safeHref.href}
        tabIndex={isVisible ? 0 : -1}
        className="inline-flex shrink-0 items-center gap-1 underline decoration-black/40 underline-offset-2 transition-colors hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
      >
        {linkLabel}
        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
      </Link>
    )
  ) : null

  return (
    <aside
      aria-label="Store announcement"
      aria-hidden={!isVisible}
      className={`fixed inset-x-0 top-0 z-50 flex h-8 items-center justify-center border-b border-yellow-300/40 bg-[#FDB813] px-3 text-center text-xs font-semibold text-black shadow-sm sm:text-sm ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <p className="flex min-w-0 items-center justify-center gap-2 truncate leading-5">
        <span className="truncate sm:hidden">{mobileText}</span>
        <span className="hidden truncate sm:inline">{config.text}</span>
        {cta}
      </p>
    </aside>
  )
}

export default AnnouncementBar