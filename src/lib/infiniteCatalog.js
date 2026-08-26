const SNAPSHOT_VERSION = 1

export function catalogPagePath(category, page) {
  return `/category/${encodeURIComponent(category)}/page/${Math.max(1, Number(page) || 1)}`
}

export function snapshotKey(category, catalogueState) {
  return `gamecity:catalog:${encodeURIComponent(category)}:${catalogueState}`
}

export function mergeCatalogPage(pages, page, products) {
  if (pages.some((batch) => batch.page === page)) return pages

  const seen = new Set(
    pages.flatMap((batch) => batch.products.map((product) => product.id))
  )
  const uniqueProducts = products.filter((product) => {
    if (!product?.id || seen.has(product.id)) return false
    seen.add(product.id)
    return true
  })

  return [...pages, { page, products: uniqueProducts }].sort(
    (left, right) => left.page - right.page
  )
}

export function nextCatalogPage(pages, totalPages, requestedPages) {
  const lastLoadedPage = Math.max(...pages.map((batch) => batch.page), 0)
  const nextPage = lastLoadedPage + 1
  if (
    nextPage < 1 ||
    nextPage > totalPages ||
    requestedPages.has(nextPage)
  ) {
    return null
  }
  return nextPage
}

export function parseCatalogSnapshot(value, expectedKey) {
  try {
    const snapshot = JSON.parse(value)
    if (
      snapshot?.version !== SNAPSHOT_VERSION ||
      snapshot.key !== expectedKey ||
      !Array.isArray(snapshot.pages) ||
      snapshot.pages.length === 0 ||
      !Number.isInteger(snapshot.totalPages) ||
      snapshot.totalPages < 1 ||
      !Number.isInteger(snapshot.activePage) ||
      snapshot.activePage < 1 ||
      snapshot.activePage > snapshot.totalPages ||
      typeof snapshot.scrollY !== 'number' ||
      snapshot.scrollY < 0
    ) {
      return null
    }

    const seenPages = new Set()
    const seenProducts = new Set()
    for (const batch of snapshot.pages) {
      if (
        !Number.isInteger(batch?.page) ||
        batch.page < 1 ||
        batch.page > snapshot.totalPages ||
        seenPages.has(batch.page) ||
        !Array.isArray(batch.products)
      ) {
        return null
      }
      seenPages.add(batch.page)
      for (const product of batch.products) {
        if (!product?.id || seenProducts.has(product.id)) return null
        seenProducts.add(product.id)
      }
    }
    if (!seenPages.has(snapshot.activePage)) return null

    return snapshot
  } catch {
    return null
  }
}

export function createCatalogSnapshot({
  key,
  pages,
  scrollY,
  activePage,
  totalPages,
}) {
  return JSON.stringify({
    version: SNAPSHOT_VERSION,
    key,
    pages,
    scrollY,
    activePage,
    totalPages,
  })
}
