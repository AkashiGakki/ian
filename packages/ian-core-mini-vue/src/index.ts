import { reactive, watchEffect } from "./reactivity"

interface AppType {
  template: string
  setup: () => { state: any; click: () => void }
}
// 定义响应函数
// let effective: Function = () => { }

const App: AppType = {
  // 视图
  template: `
    <input />
    <button>Button</button>
  `,
  setup(): { state: any; click: () => void } {
    // 数据劫持
    const state = reactive({
      message: 'Hello Mini Vue',
    })

    const click = () => {
      state.message = state.message.split('').reverse().join('')
    }

    return { state, click }
  },
}

// ---------- MiniVue ----------

const MiniVue = {
  createApp: (config: { template: string; setup: Function }) => {
    // 编译器
    const compile = (template: string) => {
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

    // 渲染
    const render = compile(config.template)

    return {
      mount(container: string): void {
        const dom = document.querySelector(container) as HTMLElement

        const setupResult = config.setup()

        // 修改
        // effective = () => render(setupResult, dom)
        watchEffect(() => render(setupResult, dom))

        render(setupResult, dom)
      },
    }
  },
  templateApp: App as AppType,
}

export default MiniVue
