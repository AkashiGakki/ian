import type { VNode } from '../types'

export function h(tag: string, props: any, children: any): VNode {
  return {
    tag,
    props,
    children,
  } as VNode
}
