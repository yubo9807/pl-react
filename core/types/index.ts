import type { Fragment } from "../tools"
import type { AnyObj } from "../utils"

export type BaseComponent = (props: PropsType) => any
export type ClassComponent = new (props: PropsType) => any
export type Component = BaseComponent | ClassComponent

export type Tag = keyof HTMLElementTagNameMap | Component | typeof Fragment

export type Children = Array<Tree | string | number>

export interface PropsType {
  ref?:      { current: unknown }
  key?:      string | number | symbol
  children?: Children
}



export interface Tree {
  tag:      Tag
  attrs:    AnyObj
  children: Children
}

export interface NodeTree extends Tree {
  tag: keyof HTMLElementTagNameMap
}

export interface CompTree extends Tree {
  tag: Component
}

export type TreeValue = Tree | string | number

export type StyleObject = {
  [I in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[I]
} & {
  [k: `--${string}`]: string | number
}