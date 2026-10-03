// Tiny linear-algebra helpers. Matrices are arrays of rows: number[][].

export const matmul = (A, B) =>
  A.map((row) => B[0].map((_, j) => row.reduce((sum, v, k) => sum + v * B[k][j], 0)))

export const transpose = (M) => M[0].map((_, j) => M.map((row) => row[j]))

export const add = (A, B) => A.map((row, i) => row.map((v, j) => v + B[i][j]))

export const scale = (M, s) => M.map((row) => row.map((v) => v * s))

export const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0)

export const softmaxRow = (row) => {
  const max = Math.max(...row)
  const exps = row.map((v) => Math.exp(v - max)) // exp(-Infinity) = 0, so masks work
  const total = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / total)
}

export const softmax = (M) => M.map(softmaxRow)

// Hide the future: position j > i gets -Infinity before the softmax.
export const causalMask = (scores) =>
  scores.map((row, i) => row.map((v, j) => (j > i ? -Infinity : v)))

export const layerNormRow = (row, eps = 1e-5) => {
  const mean = row.reduce((a, b) => a + b, 0) / row.length
  const variance = row.reduce((a, b) => a + (b - mean) ** 2, 0) / row.length
  return row.map((v) => (v - mean) / Math.sqrt(variance + eps))
}

export const relu = (M) => M.map((row) => row.map((v) => Math.max(0, v)))

export const concatColumns = (mats) => mats[0].map((_, i) => mats.flatMap((m) => m[i]))

// Scaled dot-product attention, returning every intermediate step.
export const attention = (X, Wq, Wk, Wv, { masked = false } = {}) => {
  const Q = matmul(X, Wq)
  const K = matmul(X, Wk)
  const V = matmul(X, Wv)
  const dk = Wq[0].length
  const raw = matmul(Q, transpose(K))
  const scaled = scale(raw, 1 / Math.sqrt(dk))
  const masked_ = masked ? causalMask(scaled) : scaled
  const weights = softmax(masked_)
  const out = matmul(weights, V)
  return { Q, K, V, raw, scaled, masked: masked_, weights, out }
}

// Deterministic pseudo-random numbers so demos look the same on every load.
export const makeRng = (seed) => {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const randomMatrix = (rows, cols, seed, amp = 1) => {
  const rng = makeRng(seed)
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.round((rng() * 2 - 1) * amp * 10) / 10),
  )
}

export const fmt = (x, digits = 2) => {
  if (x === -Infinity) return '−∞'
  const v = Math.abs(x) < 0.5 * 10 ** -digits ? 0 : x
  return v.toFixed(digits).replace('-', '−')
}
