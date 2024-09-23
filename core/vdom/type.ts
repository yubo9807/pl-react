export type BaseComponent = (props: PropsType) => any
export type ClassComponent = new (props: PropsType) => any
export type Component = BaseComponent | ClassComponent

export type Tag = keyof HTMLElementTagNameMap | Component

export type Children = Array<Tree | string | number>

export interface PropsType {
  // ref?:      { current: unknown }
  children?:   Children
  [k: string]: any
}



export interface Tree {
  tag:      Tag
  attrs:    PropsType
  children: Children
}

export interface NodeTree extends Tree {
  tag:   keyof HTMLElementTagNameMap
}

export interface CompTree extends Tree {
  tag: Component
}

export type TreeValue = Tree | string | number
