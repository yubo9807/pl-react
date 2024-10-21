
export type Query = Record<string, string>
export type Meta = Record<string, any>
export type Child = any

export interface BaseRoute {
  path?:  string
  query?: Query
  hash?:  string
}

export interface RouteConfig extends BaseRoute {
  meta?: Meta
}

export type BeforeEach = (to: BaseRoute, from: BaseRoute, next: Function) => void

export type RouteItem = {
  path:        string | RegExp
  element:     Child
  meta?:       Meta
  exact?:      boolean
  beforeEach?: BeforeEach
  [k: string]: any
}
