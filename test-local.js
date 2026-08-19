// Run with: node test-local.js
import fs from 'fs'
import { buildMessages, buildSVG } from './build-svg.js'

const mockWeather = { degF: 72, degC: 22, emoji: '⛅' }

const messages = buildMessages(mockWeather)
const svg = buildSVG(messages)

fs.writeFileSync('chat.svg', svg)
console.log('Wrote chat.svg using mock weather data:', mockWeather)
console.log('\nMessages used:')
messages.forEach((m, i) => console.log(`  ${i + 1}. ${m}`))
