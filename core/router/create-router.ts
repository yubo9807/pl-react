import { customForEach, isClient, isEquals, isRegExp, isString } from "../utils"
import { temp } from "./ssr-outlet";
import { BaseRoute, BeforeEach, RouteConfig, RouteItem } from "./type"
import { parseUrl, stringifyUrl } from "./utils"

export function queryRoute(routes: RouteItem[], pathname: string) {
  for (const route of routes) {
    const { path, exact } = route;
    if (isRegExp(path) && path.test(pathname)) return route;
    if (isString(path)) {
      if (exact === false && (pathname + '/').startsWith(path + '/')) return route;
      if (pathname === path) return route;
    }
    if (!path) return route;
  }
}

type RouterChangeFunc = (to: RouteConfig, from: RouteConfig) => void;
const routerChangeFuncs: RouterChangeFunc[] = [];

type Option = {
  fristUrl:    string
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
    this._jump(option.fristUrl, () => {});
  }

  beforeEach = (from: RouteConfig, to: RouteConfig, next: Function) => next();

  currentRoute: RouteConfig
  isPass: boolean

  _jump(to: BaseRoute | string, callback: (url: string) => void) {
    this.isPass = true;
    if (isString(to)) {
      to = parseUrl(to);
    }

    const { base, routes, controls } = this.option;
    if (!to.path.startsWith(base || '')) {
      this.isPass = false;
      return;
    }

    const href = stringifyUrl(to);
    const from = { ...this.currentRoute };
    if (isEquals(to, from)) return;

    this.beforeEach(to, from, () => {
      callback(href);
      this.currentRoute = to as RouteConfig;
      const query = queryRoute(routes, href);
      query && controls(query);
      customForEach(routerChangeFuncs, func => {
        func(to as RouteConfig, from);
      })
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

export const collect = new Set<Router>();

/**
 * 创建路由
 * @param option 
 * @returns 
 */
export function createRouter(option: Option) {
  const router = new Router(option);
  collect.add(router);
  return router;
}

function common(callback: (router: Router) => void) {
  for (const router of collect.values()) {
    callback(router);
    if (router.isPass) break;
  }
}

export function useRouter(watch?: RouterChangeFunc) {
  watch && routerChangeFuncs.push(watch);
  return {
    push(to: RouteConfig | string) {
      common(router => router.push(to));
    },
    replace(to: RouteConfig | string) {
      common(router => router.replace(to));
    },
  }
}

export function useRoute() {
  if (isClient()) {
    const { href, origin } = location;
    return parseUrl(href.replace(origin, ''));
  }
  return parseUrl(temp.url);
}
