const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'at', 'for', 'from', 'in', 'is', 'of', 'on',
  'the', 'to', 'was', 'were', 'with',
])

export const HIGH_DUPLICATE_THRESHOLD = 80
export const POSSIBLE_DUPLICATE_THRESHOLD = 65

function tokenize(value, { removeStopWords = false } = {}) {
  const tokens = value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  return new Set(removeStopWords ? tokens.filter((token) => !STOP_WORDS.has(token)) : tokens)
}

function locationMarker(location, marker) {
  const normalized = location.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ')
  const match = normalized.match(new RegExp(`\\b${marker}\\s+([a-z0-9]+)\\b`, 'u'))
  return match?.[1] || null
}

function tokenDiceSimilarity(left, right, options) {
  const leftTokens = tokenize(left, options)
  const rightTokens = tokenize(right, options)
  if (!leftTokens.size || !rightTokens.size) return 0
  let common = 0
  for (const token of leftTokens) if (rightTokens.has(token)) common += 1
  return (2 * common) / (leftTokens.size + rightTokens.size)
}

export function locationSimilarity(left, right) {
  const markers = ['block', 'room', 'hostel', 'building', 'floor', 'lab']
  for (const marker of markers) {
    const leftValue = locationMarker(left, marker)
    const rightValue = locationMarker(right, marker)
    if (leftValue && rightValue && leftValue !== rightValue) return 0
  }
  return tokenDiceSimilarity(left, right)
}

export function scoreDuplicateReports(left, right) {
  if (left.category !== right.category) return 0
  const location = locationSimilarity(left.location, right.location)
  if (location < 0.5) return 0

  const title = tokenDiceSimilarity(left.title, right.title, { removeStopWords: true })
  const description = tokenDiceSimilarity(left.description, right.description, { removeStopWords: true })
  return Math.round((location * 40) + 20 + (title * 20) + (description * 20))
}
