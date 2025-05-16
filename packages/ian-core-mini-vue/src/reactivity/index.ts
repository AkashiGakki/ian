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

function ref(rawVal: string | number | boolean): { value: any } {
  if (typeof rawVal !== 'object') {
    return {
      value: rawVal,
    }
  }
  // 如果是对象，使用 reactive 进行代理
  if (rawVal === null) {
    return {
      value: null,
    }
  }
  if (Array.isArray(rawVal)) {
    return {
      value: reactive(rawVal),
    }
  }
  if (typeof rawVal === 'object') {
    return {
      value: reactive(rawVal),
    }
  }
  // 如果是基本类型，使用 Proxy 进行代理
  // 这里的 value 是一个对象，里面有一个属性 value
  // 这个属性 value 是我们要代理的值
  const value = {
    value: rawVal,
  }

  return new Proxy(value, {
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

export {
  reactive,
  ref,
  watchEffect,
}
