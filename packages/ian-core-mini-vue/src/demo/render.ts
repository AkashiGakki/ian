import type { VNode } from '../types'

export function mountElement(vNode: VNode, container: HTMLElement): void {
  const el = (vNode.el = createElement(vNode.tag))

  if (vNode.props) {
    for (const key in vNode.props) {
      const val = vNode.props[key]
      patchProp(vNode.el, key, null, val)
    }
  }

  if (vNode.children && Array.isArray(vNode.children)) {
    vNode.children.forEach((child: any) => {
      mountElement(child, el)
    })
  } else {
    insert(createText(vNode.children), el)
  }

  // 插入到视图内
  insert(el, container)
}

export function diff(v1: VNode, v2: VNode): void {
  // 如果tag不同，直接替换 => 如果一致，检测props变化 => 检测children变化

  const { props: oldProps, children: oldChildren = [] } = v1
  const { props: newProps, children: newChildren = [] } = v2

  if (v1.tag !== v2.tag) {
    v1.replaceWith(createElement(v2.tag))
  } else {
    const el = (v2.el = v1.el)

    if (newProps) {
      Object.keys(newProps).forEach((key) => {
        if (newProps[key] !== oldProps[key]) {
          patchProp(el, key, oldProps[key], newProps[key])
        }
      })

      Object.keys(oldProps).forEach((key) => {
        if (!newProps[key]) {
          patchProp(el, key, oldProps[key], null)
        }
      })
    }

    if (typeof newChildren === 'string') {
      if (typeof oldChildren === 'string') {
        if (newChildren !== oldChildren) {
          setText(el, newChildren)
        }
      } else if (Array.isArray(oldChildren)) {
        // replace old children
        v1.el.textContent = newChildren
      }
    } else if (Array.isArray(newChildren)) {
      if (typeof oldChildren === 'string') {
        // clear data && mount children
        el.innerHTML = ''
        newChildren.forEach(child => {
          mountElement(child, el)
        })
      } else if (Array.isArray(oldChildren)) {
        const length = Math.min(oldChildren.length, newChildren.length)
        for (let i = 0; i < length; i++) {
          const oldVNode = oldChildren[i]
          const newVNode = newChildren[i]
          diff(oldVNode, newVNode)
        }

        if (oldChildren.length > length) {
          // old children more than new children => delete
          for (let i = length; i < oldChildren.length; i++) {
            remove(oldChildren[i], el)
          }
        } else if (newChildren.length > length) {
          // new children more than old children => add
          for (let i = length; i < newChildren.length; i++) {
            mountElement(newChildren[i], el)
          }
        }
      }
    }
  }
}

function createElement(tag: string): HTMLElement {
  return document.createElement(tag)
}

function patchProp(
  el: HTMLElement,
  key: string,
  prevVal: any,
  nextVal: any
): void {
  // `onClick` 为例，若前两个字符为 `on`，确定为事件，事件名为后面部分
  if (key.startsWith('on')) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, nextVal)
  } else {
    if (nextVal === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextVal)
    }
  }
}

function insert(el: HTMLElement | Text, parent: HTMLElement): void {
  parent.appendChild(el)
}

function remove(el: HTMLElement, parent: HTMLElement): void {
  parent.removeChild(el)
}

function createText(text: string): Text {
  return new Text(text)
}

function setText(el: Text, text: string) {
  el.textContent = text
}
