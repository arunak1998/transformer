// Interview questions shown in the "Interview Preparation" section.
// Each answer is a short list of points; `oneLiner` is the answer to say first.
// `chapter` links back to the section of the site that explains it visually.

export const TOPICS = ['Basics', 'Tokens & embeddings', 'Attention', 'Architecture', 'Training & generation']

export const LEVELS = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' }

export const QUESTIONS = [
  /* ---------- Basics ---------- */
  {
    topic: 'Basics', level: 1, chapter: 'overview',
    q: 'What is a Transformer, and what problem did it solve?',
    oneLiner: 'A neural network built on attention instead of recurrence, so every token can look at every other token directly, and all tokens are processed in parallel.',
    points: [
      'Older sequence models (RNNs, LSTMs) read text one token at a time, so training was slow and information had to survive a long chain of steps.',
      'The Transformer drops recurrence completely and uses self-attention: each token builds its new representation by looking at all other tokens.',
      'Because there is no step-by-step dependency, the whole sequence is processed in parallel, which suits GPUs and lets models scale to billions of parameters.',
    ],
  },
  {
    topic: 'Basics', level: 1, chapter: 'overview',
    q: 'Why are Transformers better than RNNs / LSTMs?',
    oneLiner: 'Parallel training, and a direct one-step connection between any two tokens, so long-range dependencies are easy to learn.',
    points: [
      'Parallelism: an RNN must finish token t before token t+1; a Transformer computes all positions at once.',
      'Path length: in an RNN, information between two distant words passes through many steps; in attention it is a single step.',
      'Trade-off to mention: attention cost grows quadratically with sequence length, while an RNN grows linearly.',
    ],
  },
  {
    topic: 'Basics', level: 2, chapter: 'decoder',
    q: 'Encoder-only vs decoder-only vs encoder–decoder: what is the difference?',
    oneLiner: 'Encoder-only understands (BERT), decoder-only generates (GPT, Llama), encoder–decoder maps one sequence to another (T5, translation).',
    points: [
      'Encoder-only (e.g. BERT): bidirectional attention, every token sees the whole input. Good for classification, search, tagging.',
      'Decoder-only (e.g. GPT, Llama): causal (masked) attention, predicts the next token. Used by most chat LLMs.',
      'Encoder–decoder (e.g. the original Transformer, T5, BART): the encoder reads the input, the decoder generates the output using cross-attention. Good for translation and summarisation.',
    ],
  },
  {
    topic: 'Basics', level: 2, chapter: 'decoder',
    q: 'What is the difference between BERT-style and GPT-style training?',
    oneLiner: 'BERT hides some tokens and predicts them using both sides (masked LM); GPT predicts the next token from the left side only (causal LM).',
    points: [
      'Masked language modelling (BERT): about 15% of tokens are masked and the model fills them in, using context from left and right.',
      'Causal language modelling (GPT): the model predicts token t+1 from tokens 1…t. This matches how text is generated.',
    ],
  },

  /* ---------- Tokens & embeddings ---------- */
  {
    topic: 'Tokens & embeddings', level: 1, chapter: 'tokenizer',
    q: 'What is tokenization, and why do models use subwords?',
    oneLiner: 'Tokenization splits text into pieces with integer IDs; subwords keep the vocabulary small while still being able to spell any word.',
    points: [
      'Whole-word vocabularies are huge and break on new words. Character-level sequences are very long and each character carries little meaning.',
      'Subword methods (BPE, WordPiece, SentencePiece/Unigram) sit in between: common words are one token, rare words are split into reusable pieces, e.g. "unbelievable" → un + believ + able.',
    ],
  },
  {
    topic: 'Tokens & embeddings', level: 2, chapter: 'tokenizer',
    q: 'How does Byte-Pair Encoding (BPE) work?',
    oneLiner: 'Start from characters and repeatedly merge the most frequent adjacent pair into a new token, until the vocabulary reaches the target size.',
    points: [
      'Training: split every word into characters, count all adjacent pairs, merge the most frequent pair, repeat.',
      'Encoding new text: apply the learned merges in the same order.',
      'Byte-level BPE (GPT-2 onward) starts from bytes instead of characters, so there is never an unknown symbol.',
    ],
  },
  {
    topic: 'Tokens & embeddings', level: 1, chapter: 'embeddings',
    q: 'What is an embedding?',
    oneLiner: 'A learned lookup table that turns each token ID into a dense vector of size d_model, so tokens with similar meaning get similar vectors.',
    points: [
      'The table has shape vocab_size × d_model; looking up a row is the same as multiplying a one-hot vector by the table.',
      'The values start random and are learned during training.',
      'Bonus: many models tie the input embedding with the final output projection (weight tying) to save parameters.',
    ],
  },
  {
    topic: 'Tokens & embeddings', level: 2, chapter: 'positional',
    q: 'Why do Transformers need positional encoding?',
    oneLiner: 'Attention by itself ignores order, so “dog bites man” and “man bites dog” would look the same; position information is added to fix this.',
    points: [
      'Self-attention treats the input as a set: shuffling the tokens just shuffles the outputs.',
      'The original paper adds sinusoidal encodings: PE(pos, 2i) = sin(pos / 10000^(2i/d)), PE(pos, 2i+1) = cos(…). Different dimensions oscillate at different speeds.',
      'Alternatives: learned absolute positions (BERT, GPT-2), rotary embeddings / RoPE (Llama), ALiBi (adds a distance-based bias to attention scores).',
    ],
  },

  /* ---------- Attention ---------- */
  {
    topic: 'Attention', level: 1, chapter: 'attention',
    q: 'Explain Query, Key and Value.',
    oneLiner: 'Query = what a token is looking for, Key = what each token offers, Value = the information it passes on. Scores come from Q·K, and the output is a weighted mix of V.',
    points: [
      'Each is a linear projection of the same input: Q = XW_Q, K = XW_K, V = XW_V.',
      'Scores = QKᵀ (how well each query matches each key), then softmax turns each row into weights that sum to 1.',
      'Output = weights × V: every token becomes a blend of the values of the tokens it attends to.',
      'Analogy: a search engine. Query = search text, Key = page titles, Value = page content.',
    ],
  },
  {
    topic: 'Attention', level: 2, chapter: 'attention',
    q: 'Why do we divide the attention scores by √d_k?',
    oneLiner: 'Without it, dot products grow with the vector size, softmax saturates into near one-hot outputs, and gradients become tiny.',
    points: [
      'If the components of q and k have mean 0 and variance 1, their dot product has variance d_k.',
      'Dividing by √d_k brings the variance back to about 1, keeping softmax in a range where it still has useful gradients.',
    ],
  },
  {
    topic: 'Attention', level: 2, chapter: 'multihead',
    q: 'What is multi-head attention, and why use it?',
    oneLiner: 'Several attentions run in parallel on smaller projections, so the model can follow different kinds of relationships at the same time.',
    points: [
      'Each head has its own W_Q, W_K, W_V with size d_k = d_model / h. Head outputs are concatenated and mixed by W_O.',
      'Because each head is smaller, the total cost is about the same as one full-size head.',
      'Different heads tend to specialise, e.g. previous-token heads, or heads linking pronouns to nouns. The original paper used h = 8 heads with d_k = 64.',
    ],
  },
  {
    topic: 'Attention', level: 1, chapter: 'decoder',
    q: 'Self-attention vs cross-attention: what is the difference?',
    oneLiner: 'In self-attention Q, K and V come from the same sequence; in cross-attention Q comes from the decoder while K and V come from the encoder output.',
    points: [
      'Self-attention lets tokens in one sequence exchange information.',
      'Cross-attention is how the decoder “reads” the input sentence, e.g. which English word to look at while writing the next French word.',
    ],
  },
  {
    topic: 'Attention', level: 2, chapter: 'decoder',
    q: 'What is masked (causal) attention?',
    oneLiner: 'Each position may only attend to itself and earlier positions; future scores are set to −∞ before the softmax so their weights become 0.',
    points: [
      'It keeps generation honest: a token cannot see the words it is supposed to predict.',
      'It also allows training on a whole sequence in parallel (teacher forcing) while still behaving like left-to-right generation.',
    ],
  },
  {
    topic: 'Attention', level: 3, chapter: 'attention',
    q: 'What is the time and memory complexity of self-attention?',
    oneLiner: 'O(n² · d) compute and O(n²) memory for the attention matrix, where n is the sequence length; this is the main bottleneck for long contexts.',
    points: [
      'Every token is compared with every other token, giving an n × n score matrix per head.',
      'Ways around it: FlashAttention (exact attention, computed in tiles to save memory traffic), sliding-window or sparse attention, and linear-attention approximations.',
    ],
  },

  /* ---------- Architecture ---------- */
  {
    topic: 'Architecture', level: 1, chapter: 'encoder',
    q: 'What happens inside one encoder block?',
    oneLiner: 'Multi-head self-attention, then a feed-forward network, each wrapped with a residual connection and layer normalization.',
    points: [
      'h = LayerNorm(x + MultiHead(x)), then out = LayerNorm(h + FFN(h)). The output has the same shape as the input, so blocks stack N times.',
      'The original paper puts LayerNorm after the residual (post-LN). Most modern models put it before each sub-layer (pre-LN) because training is more stable.',
    ],
  },
  {
    topic: 'Architecture', level: 2, chapter: 'encoder',
    q: 'What is the feed-forward network (FFN) and why is it needed?',
    oneLiner: 'A small two-layer network applied to each token separately: expand, apply a non-linearity, project back. It adds non-linearity and most of the model’s parameters.',
    points: [
      'FFN(x) = max(0, xW₁ + b₁)W₂ + b₂. In the original model d_model = 512 and the hidden size d_ff = 2048 (4×).',
      'Attention mixes information between tokens; the FFN processes each token on its own.',
      'Modern models often use GELU or SwiGLU instead of ReLU.',
    ],
  },
  {
    topic: 'Architecture', level: 2, chapter: 'encoder',
    q: 'Why residual connections and LayerNorm?',
    oneLiner: 'Residuals give gradients a direct path through deep stacks; LayerNorm keeps each token’s activations at a stable scale.',
    points: [
      'Residual: output = x + sublayer(x). The layer only has to learn a correction, and gradients flow straight through the addition.',
      'LayerNorm normalises each token’s features to mean 0 and variance 1, then applies a learned scale and shift.',
      'Why not BatchNorm: LayerNorm works per token, so it does not depend on batch size or padded sequence lengths. Many LLMs use RMSNorm, a simpler variant.',
    ],
  },
  {
    topic: 'Architecture', level: 3, chapter: 'overview',
    q: 'What were the hyperparameters of the original Transformer (base)?',
    oneLiner: '6 encoder + 6 decoder layers, d_model = 512, 8 heads (d_k = 64), d_ff = 2048, dropout 0.1, about 65M parameters.',
    points: [
      'The “big” model used d_model = 1024, 16 heads and d_ff = 4096, about 213M parameters.',
      'Being able to quote these numbers shows you have read the paper, not just a summary.',
    ],
  },

  /* ---------- Training & generation ---------- */
  {
    topic: 'Training & generation', level: 1, chapter: 'generation',
    q: 'How is a language model like GPT trained?',
    oneLiner: 'Next-token prediction: at every position, predict the next token and minimise the cross-entropy loss; masking lets all positions train in parallel.',
    points: [
      'The input is the text, the target is the same text shifted by one token (teacher forcing).',
      'Pre-training is self-supervised, so any raw text can be used. Chat models are then fine-tuned on instructions and human preferences.',
    ],
  },
  {
    topic: 'Training & generation', level: 1, chapter: 'generation',
    q: 'How does a Transformer generate text?',
    oneLiner: 'Autoregressively: predict a probability for every token, pick one, append it to the input, and repeat until an end token.',
    points: [
      'The last hidden state goes through a linear layer (one score per vocabulary token) and a softmax.',
      'Picking strategies: greedy (always the top token), beam search (keep several candidate sequences), or sampling with temperature, top-k or top-p.',
    ],
  },
  {
    topic: 'Training & generation', level: 1, chapter: 'generation',
    q: 'What does temperature do? What are top-k and top-p?',
    oneLiner: 'Temperature divides the scores before softmax: low = confident and repetitive, high = diverse and risky. Top-k / top-p restrict sampling to the most likely tokens.',
    points: [
      'T < 1 sharpens the distribution, T > 1 flattens it, T → 0 becomes greedy.',
      'Top-k: sample only from the k most likely tokens. Top-p (nucleus): sample from the smallest set whose probabilities add up to p.',
    ],
  },
  {
    topic: 'Training & generation', level: 3, chapter: 'generation',
    q: 'What is the KV cache?',
    oneLiner: 'During generation, the keys and values of past tokens are stored, so each new step only computes Q, K, V for the newest token.',
    points: [
      'Without it, every step would recompute attention inputs for the whole prefix again.',
      'Trade-off: the cache uses memory that grows with sequence length × layers × heads, which is why long contexts are memory-hungry. Grouped-query attention (GQA) shrinks it by sharing K and V across heads.',
    ],
  },
]

// Short, high-value facts to revise right before an interview.
export const CHEAT_SHEET = [
  { title: 'Attention', tex: '\\text{softmax}\\!\\Big(\\tfrac{QK^{\\top}}{\\sqrt{d_k}}\\Big)V', note: 'match queries to keys, mix values' },
  { title: 'Multi-head', tex: '\\text{Concat}(\\text{head}_1..\\text{head}_h)\\,W^O', note: 'h heads, each of size d_model / h' },
  { title: 'Feed-forward', tex: '\\max(0,\\,xW_1+b_1)\\,W_2+b_2', note: 'per token, hidden size ≈ 4 × d_model' },
  { title: 'Encoder block', tex: '\\text{LN}(x+\\text{Attn}(x)) \\rightarrow \\text{LN}(h+\\text{FFN}(h))', note: 'residual + LayerNorm around each sub-layer' },
  { title: 'Positional encoding', tex: '\\sin\\!\\big(pos/10000^{2i/d}\\big),\\ \\cos(\\cdot)', note: 'gives the model word order' },
  { title: 'Cost', tex: 'O(n^2 \\cdot d)', note: 'quadratic in sequence length n' },
]

export const TIPS = [
  'Start with the one-line answer, then add detail only if asked.',
  'Use a small example sentence (like “The cat licked its paw”) to explain attention.',
  'Draw the diagram: embeddings → attention → add & norm → FFN → add & norm, ×N.',
  'Mention trade-offs: quadratic attention cost, KV-cache memory, context length.',
]
