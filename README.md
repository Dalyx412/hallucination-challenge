# Hallucination Challenge

This project is a local web game for first-year AI literacy education. The player acts as a generative AI, builds a fluent answer from a WordCloud, then fact-checks the selected words and removes hallucinated claims.

## Quick Start

Double-click:

```text
start.bat
```

This starts everything needed for sharing:

- the local challenge server on port `5173`
- an ngrok tunnel to the local server
- `ngrok-url.txt`, containing the current public URL
- `ngrok-url.url`, a clickable Windows shortcut to the current public URL
- the public ngrok URL in your browser

To stop everything, double-click:

```text
stop.bat
```

`stop.bat` closes both the local challenge server and the ngrok tunnel.

## Links

Local URL:

```text
http://127.0.0.1:5173/
```

Public URL:

After `start.bat` runs, double-click `ngrok-url.url` to open the current ngrok link again while the tunnel is still running.

Note: free random ngrok domains can show ngrok's own browser warning page before the app. The challenge itself is already reachable behind that URL. For a cleaner direct-open experience, use a reserved or custom ngrok domain with the local configuration below.

If you have a reserved ngrok domain, do not commit it as code. Set it locally through one of these options:

```powershell
$env:NGROK_URL = "https://your-reserved-domain.ngrok.app"
.\start.bat
```

or create an ignored local file:

```text
ngrok-reserved-url.local.txt
```

and put only the reserved URL in that file. Do not store ngrok authtokens, API keys, or other secrets inside this repository.

## Project Structure

```text
hallucination-challenge/
  index.html
  src/app.js
  src/styles.css
  server.js
  start.bat
  stop.bat
  package.json
```

## Current Interaction Model

- Phase 1: Click words in the WordCloud to generate a plausible answer about Napoleon Bonaparte.
- Phase 2: Spend limited fact-check clicks to reveal whether selected answer fragments are true or hallucinated.
- Phase 3: Keep or remove answer fragments based on the fact-check results.
- Phase 4: Review the final answer and AI literacy takeaways.
