// Shared numbers for the worked examples. Small integers on purpose,
// so you can check every multiplication with a pencil.

export const TOKENS = ['The', 'cat', 'sat', 'down']

// Pretend these are embeddings (+ positions) of the four tokens, d_model = 4.
export const X0 = [
  [1, 0, 1, 0],
  [0, 1, 1, 1],
  [1, 1, 0, 1],
  [0, 0, 1, 1],
]

// One attention head: d_model = 4 → d_k = d_v = 2.
export const WQ0 = [[1, 0], [0, 1], [1, -1], [0, 1]]
export const WK0 = [[1, 0], [1, 1], [0, 1], [1, -1]]
export const WV0 = [[1, 0], [0, 1], [1, 0], [0, 1]]

export const D_MODEL = 4

// Consistent colors for the roles of Q, K and V everywhere on the page.
export const ROLE_COLOR = {
  q: '#ff7ab8',
  k: '#5ee0ff',
  v: '#b6ff7a',
  x: '#a78bfa',
}
