// A small hand-made vocabulary so the examples split cleanly.
// Real tokenizers learn 30,000–200,000 pieces from huge amounts of text.

const WORDS = [
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'the', 'a', 'is', 'are', 'was', 'and', 'to', 'of', 'in', 'on', 'with',
  'love', 'like', 'play', 'learn', 'read', 'write', 'eat', 'run', 'walk', 'happy', 'sad', 'big', 'small', 'good', 'bad',
  'cat', 'dog', 'mat', 'sat', 'transform', 'understand', 'language', 'model', 'attention', 'word', 'hello', 'world',
  'lion', 'king', 'queen', 'apple', 'car',
]
const PIECES = ['un', 're', 'ing', 'ed', 'er', 'ers', 's', 'able', 'ly', 'ness', 'believ']
const PUNCTUATION = ['.', ',', '!', '?', "'"]
const CHARACTERS = [...'abcdefghijklmnopqrstuvwxyz0123456789']

export const VOCAB = ['<unk>', ...WORDS, ...PIECES, ...PUNCTUATION, ...CHARACTERS]
const INDEX = new Map(VOCAB.map((piece, id) => [piece, id]))

export const EXAMPLES = [
  'I love cats',
  'Transformers understand language',
  'unbelievable and unhappy',
  'She is playing and learning',
]

export const splitIntoWords = (text) => text.toLowerCase().match(/[a-z0-9']+|[^\sa-z0-9']/g) ?? []

// Greedy longest-match: try the whole word, then shorter and shorter starts, until a piece is in the vocabulary.
export const splitWord = (word) => {
  const steps = []
  let rest = word
  while (rest) {
    const tried = []
    let found = null
    for (let len = rest.length; len > 0 && !found; len--) {
      const candidate = rest.slice(0, len)
      tried.push(candidate)
      if (INDEX.has(candidate)) found = candidate
    }
    const piece = found ?? '<unk>'
    steps.push({ tried, piece, id: INDEX.get(piece) })
    rest = rest.slice(found ? found.length : 1)
  }
  return steps
}

export const tokenizeText = (text) =>
  splitIntoWords(text).map((word) => ({ word, steps: splitWord(word) }))
