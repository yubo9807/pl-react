
export type Query = Record<string, string>
export type Meta = Record<string, any>
export type Child = any

export interface BaseRoute {
  path:  string
  query: Query
  hash:  string
}

export interface ResultRoute extends BaseRoute {
  fullPath: string
}
export interface PartialRoute extends Partial<BaseRoute> {
  meta?: Meta
}

export type BeforeEach = (to: BaseRoute, from: BaseRoute, next: (target?: PartialRoute | string) => void) => void

export type RouteItem = {
  path:        string | RegExp
  element:     Child
  meta?:       Meta
  exact?:      boolean
  beforeEach?: BeforeEach
  [k: string]: any
}

export type PageProps = {
  path:  string
  data:  any
  error: any
}
