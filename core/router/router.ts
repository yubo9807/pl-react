import { isEquals, isString } from "../utils"
import { BaseRoute, BeforeEach, Child, Meta, RouteConfig } from "./type"
import { parseUrl, stringifyUrl } from "./utils"

type RouteItem = {
  path?:       string
  element:     Child
  meta?:       Meta
  exact?:      boolean
  [k: string]: any
}
function queryRoute(pathname: string, routes: RouteItem[]) {
  for (const route of routes) {
    const { path, exact } = route;
    if (exact && pathname === path) return route;
    if ((pathname + '/').startsWith(path + '/')) return route;
    if (!route.path) return route;
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
      const query = queryRoute(href, children);
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
