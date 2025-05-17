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

// const { createApp } = MiniVue
// const app = createApp(App)
// app.mount('#app')

// ---------- reactivity ----------
type EffectFn = () => void

let currentEffect: EffectFn | null

class Dep {
  private _effects: Set<Function>

  constructor() {
    this._effects = new Set()
  }

  // public depend(fn: Function) {
  //   this._effects.add(fn)
  // }

  // public notify() {
  //   this._effects.forEach((fn) => fn())
  // }

  depend() {
    if (currentEffect) {
      this._effects.add(currentEffect)
    }
  }

  notify() {
    this._effects.forEach((fn) => fn())
  }
}

const watchEffect = (effect: EffectFn): void => {
  currentEffect = effect
  effect()
  currentEffect = null
}

const targetMap = new WeakMap()

const getDep = (target: any, key: string | symbol) => {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

function reactive(raw: Record<string, any>): Record<string, any> {

  return new Proxy(raw, {
    get(target, key) {
      const dep = getDep(target, key)
      dep.depend()
      return Reflect.get(target, key)
    },
    set(target, key, value) {
      const dep = getDep(target, key)
      const result = Reflect.set(target, key, value)
      dep.notify()
      return result
    },
  })
}
