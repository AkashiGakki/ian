interface AppType {
  template: string
  setup: () => { state: any; click: () => void }
}
// 定义响应函数
let effective: Function = () => { }

const App: AppType = {
  // 视图
  template: `
    <input v-model="message"/>
    <button @click='click'>{{message}}</button>
  `,
  setup(): { state: any; click: () => void } {
    // 数据劫持
    const state = new Proxy({
      message: 'hello world',
    }, {
      set(target, key, value, receiver) {
        // console.log('set', target, key, value, receiver)
        const ret = Reflect.set(target, key, value, receiver)
        // 触发函数响应
        effective()
        return ret
      },
      get(target, key, receiver) {
        // console.log('get', target, key, receiver)
        return Reflect.get(target, key, receiver)
      },
    })

    const click = () => {
      // state.message = 'click'
      state.message = state.message.split('').reverse().join('')
    }

    return { state, click }
  },
}

// ---------- MiniVue ----------

const MiniVue = {
  createApp: (config: { template: string; setup: Function }) => {
    const compile = (template: string) => {
      // `content` type is setup function return
      return (content: any, dom: HTMLElement) => {
        dom.innerHTML = ''
        const input = document.createElement('input')
        input.addEventListener('keyup', (e) => {
          const value = (e.target as HTMLInputElement).value
          content.state.message = value
        })
        input.setAttribute('value', content.state.message)
        dom.appendChild(input)

        const button = document.createElement('button')
        button.addEventListener('click', () => {
          return content.click.apply(content.message)
        })
        button.innerText = content.state.message
        dom.appendChild(button)
        // console.log('template', template)
      }
    }

    const render = compile(config.template)

    return {
      mount(container: string): void {
        const dom = document.querySelector(container) as HTMLElement

        const setupResult = config.setup()

        effective = () => render(setupResult, dom)
        render(setupResult, dom)
      },
    }
  },
  templateApp: App as AppType,
}

export default MiniVue

// const { createApp } = MiniVue
// const app = createApp(App)
// app.mount('#app')
