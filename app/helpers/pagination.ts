/**
 * Builds the page range array to display in pagination UI.
 * Returns numbers and nulls (nulls = ellipsis).
 * Example: [1, null, 4, 5, 6, null, 10]
 */
export function buildPageRange(currentPage: number, lastPage: number): (number | null)[] {
  const delta = 2
  const range: number[] = []

  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i)
    }
  }

  const result: (number | null)[] = []
  let prev: number | null = null
  for (const p of range) {
    if (prev !== null && p - prev > 1) result.push(null)
    result.push(p)
    prev = p
  }

  return result
}
