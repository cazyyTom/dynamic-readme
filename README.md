# Dynamic README

Code powering the animated chat bubble README on my [GitHub profile](https://github.com/cazyyTom).

## Acknowledgements

This is (very heavily) developed based on the hard work of [Jason Long](https://github.com/jasonlong)! Seriously — the chat bubble styling and animation timing are directly adapted from his implementation. Go Check [his project](https://github.com/jasonlong/jasonlong).

## Architecture

The README embeds a specially-crafted SVG with inlined CSS for the typing-indicator and message animations. Rather than rendering on every page load, the SVG is generated ahead of time and committed straight into the repo, so the profile page just serves a static image — no runtime, no cold starts, nothing to keep alive.

Under the hood, it's using:
- [Node.js](https://nodejs.org) (ESM) to build the SVG string directly — no template engine, no virtual DOM
- [date-fns](https://date-fns.org) for the "how long I've been doing FullStack Development" duration math
- [got](https://github.com/sindresorhus/got) to pull live weather from [Open-Meteo](https://open-meteo.com)
- [GitHub Actions](https://github.com/features/actions) as the scheduler — runs the build daily and commits the regenerated `chat.svg` back to the repo

## Usage

No API key needed — Open-Meteo's forecast endpoint is free and keyless, so there's nothing to provision before you start.

Install dependencies:

```bash
npm install
```

Edit the `CONFIG` block at the top of `build-svg.js` with your name, location (lat/lon), role start date, favorite project, and contact info.

To preview locally without hitting the network (uses mock weather data):

```bash
npm run preview
```

To build against live weather data:

```bash
npm run build
```

Both write `chat.svg` — open it in a browser to see the animation play.

To deploy: push to a public repo named exactly after your GitHub username, then enable **Read and write permissions** for Actions under Settings → Actions → General. The scheduled workflow (`.github/workflows/update-chat-svg.yml`) takes it from there — see `SETUP.md` for the full walkthrough.

# Todo:
- [ ] Fail loudly (Slack? GH Issue?) instead of just failing the Action silently if the weather fetch errors out
- [ ] Tune the character-width estimate used for bubble sizing — wide glyphs/emoji can throw off the auto-wrap slightly
- [ ] Optional custom `@font-face` embedding (base64), like Jason's original, instead of relying on the system font stack
- [ ] Fallback weather provider in case Open-Meteo has downtime