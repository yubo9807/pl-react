import { isEquals, isRegExp, isString } from "../utils"
import { BaseRoute, BeforeEach, Child, Meta, RouteConfig } from "./type"
import { parseUrl, stringifyUrl } from "./utils"

type RouteItem = {
  path?:       string | RegExp
  element:     Child
  meta?:       Meta
  exact?:      boolean
  [k: string]: any
}
export function queryRoute(routes: RouteItem[], pathname: string) {
  for (const route of routes) {
    const { path, exact } = route;
    if (isRegExp(path) && path.test(pathname)) return route;
    if (isString(path) && pathname === path) {
      if (exact === false && (pathname + '/').startsWith(path + '/')) return route;
      if (pathname === path) return route;
    }
    if (!path) return route;
  }
}

type Option = {
  routes:      RouteItem[]
  controls:    (route: RouteItem) => void
  base?:       string
  mode?:       'hash' | 'history'
  beforeEach?: BeforeEach
}

class Router {
  option: Option
  constructor(option: Option) {
    const { beforeEach, ...rest } = option;
    beforeEach && (this.beforeEach = beforeEach);
    this.option = rest;
    const href = location.href.replace(location.origin, '');
    this._jump(href, () => {});
  }

  beforeEach = (from: RouteConfig, to: RouteConfig, next: Function) => next();

  currentRoute: RouteConfig
  _jump(to: BaseRoute | string, callback: (url: string) => void) {
    if (isString(to)) {
      to = parseUrl(to);
    }

    const { base, routes: children, controls } = this.option;
    if (!to.path.startsWith(base || '')) return;

    const href = stringifyUrl(to);
    const from = Object.assign({}, this.currentRoute);
    if (isEquals(to, from)) return;

    this.beforeEach(to, from, () => {
      callback(href);
      this.currentRoute = to;
      const query = queryRoute(children, href);
      query && controls(query);
    });
  }

  push = (option: RouteConfig | string) => {
    this._jump(option, (href) => {
      history.pushState(isString(option) ? {} : option.meta, null, href);
    })
  }

  replace = (option: RouteConfig | string) => {
    this._jump(option, (href) => {
      history.replaceState(isString(option) ? {} : option.meta, null, href);
    })
  }

}

/**
 * 创建路由
 * @param option 
 * @returns 
 */
export function createRouter(option: Option) {
  return new Router(option);
}
