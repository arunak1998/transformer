# How Transformers Work

An interactive, visual guide to the Transformer, the architecture behind ChatGPT and modern language models.

Follow one sentence, **"The cat licked its paw"**, from raw text to the next predicted word. Each step is something you can click, play and change. You don't need a PhD.

## What's inside

| # | Chapter | What you can try |
|---|---------|------------------|
| 00 | **Big picture** | An encoder–decoder diagram where every box links to its chapter |
| 01 | **Tokenizer** | Type text and watch it split into tokens and IDs, one step at a time |
| 02 | **Embeddings** | See IDs become vectors, and find which words are closest in meaning |
| 03 | **Positional encoding** | "dog bites man" vs "man bites dog", position codes shown as counting lamps, and stamping the code onto each word |
| 04 | **Self-attention (Q · K · V)** | Query = search, Key = tags, Value = content. Match the tags, apply softmax, and pour the Values into a glass |
| 05 | **Multi-head attention** | A team of "detective" heads you can switch on and off |
| 06 | **Encoder** | The whole block as one animated tower, plus how feed-forward and Add & Norm work |
| 07 | **Decoder** | Watch it translate "the cat sleeps" into French one word at a time, with masking and cross-attention |
| 08 | **Generation** | Softmax with a temperature slider, greedy picking vs sampling, and the generation loop |
| 09 | **Recap** | The whole journey on one page |
| 10 | **Interview prep** | 22 common interview questions with one-line answers, a formula cheat sheet, topic filters and a random-question practice mode |

Each chapter also has a collapsed **"For the curious"** box with the real formulas and editable matrices.

> **Note:** some demos use hand-made, readable numbers (such as tags like `#animal`) so the idea is easy to see. Real models learn these values as unnamed numbers, but the steps are the same.

## Tech stack

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [KaTeX](https://katex.org) for formulas
- Plain CSS and SVG for every visual, with no chart or animation libraries

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
```

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # serves the production build locally
```

## Deploy to Vercel

1. Import this repository in [Vercel](https://vercel.com/new).
2. Vercel detects **Vite** automatically. The defaults are:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Click **Deploy**.

## Project structure

```
src/
├── App.jsx              # page layout and side navigation
├── styles.css           # all styling (dark theme)
├── components/          # reusable visuals: matrices, attention lines, Q/K/V story, hero demo…
├── sections/            # one file per chapter
└── lib/
    ├── linalg.js        # tiny matrix helpers, softmax, attention
    ├── multihead.js     # multi-head attention
    ├── vocab.js         # the demo tokenizer and vocabulary
    └── demo.js          # shared example numbers
```

## Reference

Vaswani et al., [*Attention Is All You Need*](https://arxiv.org/abs/1706.03762), 2017.

---

Prepared by **Arunkumar Ravichandran**.
