import { reactive, watchEffect } from "./reactivity"
import { h, mountElement, diff } from './runtime'

interface AppType<T = any> {
  render: (content: T) => ReturnType<typeof h>;
  setup: () => T;
}

const App: AppType<{ state: { message: string }; click: () => void }> = {

  render(content) {
    return h('div', null, [
      h('h1', null, String(content.state.message)),
      h('button', { onClick: content.click }, 'click me'),
    ])
  },

  setup() {
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
  createApp: <T>(config: {
     render: (content: T) => ReturnType<typeof h>;
     setup: () => T
  }) => {
    return {
      mount(container: string): void {
        const dom = document.querySelector(container) as HTMLElement

        const setupResult = config.setup()
        const render = config.render(setupResult)

        let isMounted = false
        let prevSubTree: any = null

        watchEffect(() => {
          if (!isMounted) {
            // clear content before mounting
            dom.innerHTML = ""

            // mount
            isMounted = true
            const subTree = config.render(setupResult)
            prevSubTree = subTree
            mountElement(subTree, dom)
          } else {
            // update
            const subTree = config.render(setupResult)
            diff(prevSubTree, subTree)
            prevSubTree = subTree
          }
        })
      },
    }
  },
  templateApp: App as AppType,
}

export default MiniVue
