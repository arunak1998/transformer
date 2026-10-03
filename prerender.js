// Runs after the client and server builds. Renders the page to HTML and puts it
// inside dist/index.html, so tools that don't run JavaScript (NotebookLM,
// search engines, link previews) still see all the text.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { render } from './dist-ssr/entry-server.js'

const file = 'dist/index.html'
const template = readFileSync(file, 'utf8')
const placeholder = '<div id="root"></div>'

if (!template.includes(placeholder)) throw new Error(`${placeholder} not found in ${file}`)

writeFileSync(file, template.replace(placeholder, `<div id="root">${render()}</div>`))
rmSync('dist-ssr', { recursive: true, force: true })
console.log('Pre-rendered page into', file)
