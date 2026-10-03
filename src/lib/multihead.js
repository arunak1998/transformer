import { attention, concatColumns, matmul, randomMatrix } from './linalg'
import { D_MODEL } from './demo'

// Multi-head attention with seeded random weights (a stand-in for learned ones).
// `numHeads` heads, each of size d_model / numHeads, results concatenated then mixed by W^O.
export const multiHeadAttention = (X, numHeads, seed = 1, options = {}) => {
  const dk = D_MODEL / numHeads
  const heads = Array.from({ length: numHeads }, (_, h) => {
    const s = seed * 100 + h * 7
    const Wq = randomMatrix(D_MODEL, dk, s + 1, 1.5)
    const Wk = randomMatrix(D_MODEL, dk, s + 2, 1.5)
    const Wv = randomMatrix(D_MODEL, dk, s + 3, 1.5)
    return { Wq, Wk, Wv, ...attention(X, Wq, Wk, Wv, options) }
  })
  const concat = concatColumns(heads.map((h) => h.out))
  const Wo = randomMatrix(D_MODEL, D_MODEL, seed * 100 + 99, 1)
  return { heads, concat, Wo, out: matmul(concat, Wo) }
}
