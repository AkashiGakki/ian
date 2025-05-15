import './style.css'

import MiniVue from '@ian/mini-vue'

import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>

    <div id="template-app">
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

const { createApp, templateApp } = MiniVue
const app = createApp(templateApp)
app.mount('#template-app')
