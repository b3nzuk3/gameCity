export const MOBILE_HEADER_TOP_THRESHOLD = 12
export const MOBILE_HEADER_DIRECTION_THRESHOLD = 8

const MOBILE_HEADER_STATES = new Set(['top', 'compact', 'hidden'])

export function isMobileHeaderAtTop(
  scrollY,
  threshold = MOBILE_HEADER_TOP_THRESHOLD
) {
  const normalizedScrollY = Number.isFinite(scrollY) ? Math.max(0, scrollY) : 0
  return normalizedScrollY <= threshold
}

export function isMobileHeaderState(value) {
  return MOBILE_HEADER_STATES.has(value)
}

export function nextMobileHeaderScrollState({
  scrollY,
  anchorScrollY,
  currentState,
  topThreshold = MOBILE_HEADER_TOP_THRESHOLD,
  directionThreshold = MOBILE_HEADER_DIRECTION_THRESHOLD,
}) {
  const normalizedScrollY = Number.isFinite(scrollY) ? Math.max(0, scrollY) : 0
  const normalizedAnchor = Number.isFinite(anchorScrollY)
    ? Math.max(0, anchorScrollY)
    : normalizedScrollY

  if (isMobileHeaderAtTop(normalizedScrollY, topThreshold)) {
    return { state: 'top', anchorScrollY: normalizedScrollY }
  }

  const delta = normalizedScrollY - normalizedAnchor
  if (Math.abs(delta) < directionThreshold) {
    return {
      state: isMobileHeaderState(currentState) ? currentState : 'compact',
      anchorScrollY: normalizedAnchor,
    }
  }

  return {
    state: delta > 0 ? 'hidden' : 'compact',
    anchorScrollY: normalizedScrollY,
  }
}
