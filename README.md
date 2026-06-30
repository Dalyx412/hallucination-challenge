# Hallucination Challenge

This project turns the Word prototype `Group 1_ 生成AI.docx` into a runnable local web game.

The player acts as a generative AI, clicks expression-map nodes and relation labels to assemble a fluent answer, then investigates the same map to discover weak evidence, hallucinated numbers, causal leaps, and third variables.

## Run

```powershell
node server.js
```

Then open:

```text
http://127.0.0.1:5173
```

## Project Structure

```text
hallucination-challenge/
  index.html
  data/game-data.js
  src/app.js
  src/styles.css
  server.js
  package.json
```

## Current Interaction Model

- Phase 1: Click words or relationship labels in the expression map to automatically insert answer fragments.
- Phase 2: Click map elements again to spend limited check points and reveal evidence notes.
- Phase 3: Revise the generated answer using the discovered evidence.
- Phase 4: Review the score and before/after answers.
