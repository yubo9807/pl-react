
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

export type BeforeEach = (to: RouteConfig, from: RouteConfig, next: Function) => void