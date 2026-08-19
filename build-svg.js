import fs from 'fs'
import got from 'got'
import { formatDistance } from 'date-fns'

const CONFIG = {
  name: "Devesh Tanwar",

  location: {
    name: "IIT Roorkee, India",
    latitude: 29.8644,
    longitude: 77.8964,
  },


  role: {
    text: "building Fullstack/Ai-Integrated Web Applications",
    since: new Date(2025, 8, 25),
  },

  favoriteProject: {
    name: "JudGit",
    description:
      "it's a bot that reads your pull requests so your teammates don't have to.",
  },

  contact: "you can check me on my Portfolio:  @https://deveshtanwar.me",
};

// WMO weather codes -> emoji (Open-Meteo uses these)
const WEATHER_EMOJI = {
  0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️', 45: '🌫', 48: '🌫',
  51: '🌧', 53: '🌧', 55: '🌧', 56: '🌧', 57: '🌧',
  61: '🌧', 63: '🌧', 65: '🌧', 66: '🌧', 67: '🌧',
  71: '🌨', 73: '🌨', 75: '❄️', 77: '🌨',
  80: '🌦', 81: '🌦', 82: '🌧', 85: '🌨', 86: '❄️',
  95: '⛈', 96: '⛈', 99: '⛈',
}


async function getWeather() {
  const { latitude, longitude } = CONFIG.location
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,weather_code&temperature_unit=fahrenheit&timezone=auto`

  const response = await got(url)
  const json = JSON.parse(response.body)

  const degF = Math.round(json.daily.temperature_2m_max[0])
  const degC = Math.round(((degF - 32) * 5) / 9)
  const code = json.daily.weather_code[0]
  const emoji = WEATHER_EMOJI[code] || '🌡'

  return { degF, degC, emoji }
}

function buildMessages(weather) {
  const messages = [`Hi, I'm ${CONFIG.name} 👋`]

  messages.push(
    `I'm 4th year student at ${CONFIG.location.name}, where it's ${weather.degF}°F ` +
      `(${weather.degC}°C) and ${weather.emoji} right now.`
  )

  if (CONFIG.role) {
    const duration = formatDistance(CONFIG.role.since, new Date())
    messages.push(`I've been ${CONFIG.role.text} for ${duration} now.`)
  }

  if (CONFIG.favoriteProject) {
    messages.push(
      `My favorite project is ${CONFIG.favoriteProject.name} — ${CONFIG.favoriteProject.description}`
    )
  }

  if (CONFIG.contact) {
    messages.push(CONFIG.contact)
  }

  return messages
}


const CANVAS_WIDTH = 560
const BUBBLE_MAX_WIDTH = 500
const BUBBLE_MIN_WIDTH = 90
const LINE_HEIGHT = 23
const CHAR_WIDTH = 9.3 
const TYPING_WIDTH = 78
const TYPING_HEIGHT = 42
const GAP = 6
const TYPING_DURATION = 1.0
const APPEAR_DURATION = 0.2

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function wrapText(text, maxChars) {
  const words = text.split(' ')
  const lines = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

function typingIndicatorSVG(className) {
  return `
  <g class="${className}">
    <rect x="8.27" width="69.73" height="42" rx="20.98" class="bubble" />
    <circle cx="13.59" cy="33.09" r="7.68" class="bubble" />
    <circle cx="3.55" cy="41.95" r="3.55" class="bubble" />
    <circle cx="27.48" cy="20.98" r="5.02" fill="var(--dot-color, #999)">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
    </circle>
    <circle cx="42.84" cy="20.98" r="5.02" fill="var(--dot-color, #999)">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" begin="0.2s" repeatCount="indefinite" />
    </circle>
    <circle cx="58.21" cy="20.98" r="5.02" fill="var(--dot-color, #999)">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" begin="0.4s" repeatCount="indefinite" />
    </circle>
  </g>`
}

function buildSVG(messages) {
  let cumulativeY = 0
  let cumulativeTime = 0.2 
  const groups = []
  const keyframes = []

  messages.forEach((msg, i) => {
    const idx = i + 1
    const maxChars = Math.floor((BUBBLE_MAX_WIDTH - 30) / CHAR_WIDTH)
    const lines = wrapText(msg, maxChars)

    const longestLine = Math.max(...lines.map((l) => l.length))
    const bubbleWidth = Math.min(
      BUBBLE_MAX_WIDTH,
      Math.max(BUBBLE_MIN_WIDTH, Math.round(longestLine * CHAR_WIDTH) + 30)
    )
    const bubbleHeight = 15 + lines.length * LINE_HEIGHT

    const typingClass = `typing-${idx}`
    const msgClass = `msg-${idx}`
    const keyframeName = `slide-in-${idx}`

    keyframes.push(`
    .${typingClass} {
      opacity: 0;
      animation: wait ${cumulativeTime}s, fade-in-out ${TYPING_DURATION}s ${cumulativeTime}s;
    }`)

    const appearAt = cumulativeTime + TYPING_DURATION + 0.2

    keyframes.push(`
    @keyframes ${keyframeName} {
      0% { opacity: 0; transform: translate(10px, ${cumulativeY + 5}px); }
      100% { opacity: 1; transform: translate(10px, ${cumulativeY}px); }
    }
    .${msgClass} {
      opacity: 0;
      animation: wait ${appearAt}s, ${keyframeName} ${APPEAR_DURATION}s ${appearAt}s forwards;
    }`)

    const textLines = lines
      .map((line, li) => `<text x="15" y="${27 + li * LINE_HEIGHT}">${escapeXml(line)}</text>`)
      .join('\n      ')

    groups.push(`
  <g transform="translate(10, ${cumulativeY})" class="${typingClass}">
    <rect x="8.27" width="69.73" height="42" rx="20.98" class="bubble" />
    <circle cx="13.59" cy="33.09" r="7.68" class="bubble" />
    <circle cx="3.55" cy="41.95" r="3.55" class="bubble" />
    <circle cx="27.48" cy="20.98" r="5.02" fill="#999">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
    </circle>
    <circle cx="42.84" cy="20.98" r="5.02" fill="#999">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" begin="0.2s" repeatCount="indefinite" />
    </circle>
    <circle cx="58.21" cy="20.98" r="5.02" fill="#999">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" begin="0.4s" repeatCount="indefinite" />
    </circle>
  </g>

  <g transform="translate(10, ${cumulativeY})" class="${msgClass} bubble-group">
    <rect width="${bubbleWidth}" height="${bubbleHeight}" rx="18" class="bubble" />
    ${textLines}
  </g>`)

    const readTime = Math.max(1.2, Math.min(3.5, msg.length * 0.03))
    cumulativeTime = appearAt + APPEAR_DURATION + readTime
    cumulativeY += bubbleHeight + GAP
  })

  const totalHeight = cumulativeY + 20

  return `<svg width="${CANVAS_WIDTH}" height="${totalHeight}" viewBox="0 0 ${CANVAS_WIDTH} ${totalHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bubble { fill: #e9e9eb; }
    .bubble-group text { fill: #242424; }
    a { fill: #0079ff; }
    text {
      font-size: 18px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
      letter-spacing: -0.01em;
    }

    @keyframes wait { 0%, 100% { opacity: 0; } }
    @keyframes fade-in-out {
      0%, 100% { opacity: 0; }
      25%, 90% { opacity: 1; }
    }
    ${keyframes.join('\n')}

    @media (prefers-color-scheme: dark) {
      .bubble { fill: #3b3b3d; }
      .bubble-group text { fill: #dcdcdc; }
      a { fill: #0c82f9; }
    }
  </style>
  ${groups.join('\n')}
</svg>`
}

async function main() {
  console.log(`Fetching weather for ${CONFIG.location.name}...`)
  const weather = await getWeather()
  console.log(`Weather: ${weather.degF}°F (${weather.degC}°C) ${weather.emoji}`)

  const messages = buildMessages(weather)
  const svg = buildSVG(messages)

  fs.writeFileSync('chat.svg', svg)
  console.log('Successfully wrote chat.svg')
}

export { getWeather, buildMessages, buildSVG, wrapText, CONFIG }

if (process.argv[1] && process.argv[1].endsWith('build-svg.js')) {
  main().catch((err) => {
    console.error('Failed to build chat.svg')
    console.error(err)
    process.exit(1)
  })
}
