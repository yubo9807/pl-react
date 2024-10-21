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
  }
}

type Option = {
  fristUrl:    string
  routes:      RouteItem[]
  controls:    (route?: RouteItem) => void
  prefix?:     string
  mode?:       'hash' | 'history'
  beforeEach?: BeforeEach
}

class Router {
  option: Option
  constructor(option: Option) {
    option.prefix ??= '';
    const { beforeEach, ...rest } = option;
    beforeEach && (this.beforeEach = beforeEach);
    this.option = rest;
    this.change(option.fristUrl).then((res: any) => {
      customForEach(routerChangeFuncs, func => {
        func(res.to, res.from);
      })
    })
  }

  beforeEach: BeforeEach = (to, from, next) => next();

  currentRoute: BaseRoute

  change(to: BaseRoute | string) {
    return new Promise(resolve => {
      if (isString(to)) {
        to = parseUrl(to);
      }

      const { prefix, routes, controls } = this.option;

      const href = stringifyUrl(to);
      const from = { ...this.currentRoute };
      if (isEquals(to, from)) return;

      this.beforeEach(to, from, () => {
        this.currentRoute = to as BaseRoute;
        const query = queryRoute(routes, href.replace(prefix, ''));

        function finish() {
          controls(query);
          resolve({ to, from });
        }

        if (query && query.beforeEach) {
          query.beforeEach(to as BaseRoute, from, () => {
            finish();
          })
        } else {
          finish();
        }
      });
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


type RouterChangeFunc = (to: RouteConfig, from: RouteConfig) => void;
const routerChangeFuncs: RouterChangeFunc[] = [];

async function jump(to: RouteConfig | string, type: 'push' | 'replace') {
  let target
  for (const router of collect.values()) {
    const res = await router.change(to);
    target = res;
  }
  customForEach(routerChangeFuncs, func => {
    func(target.to, target.from);
  })

  const fullPath = target.to.fullPath;
  history[type + 'State'](isString(to) ? {} : to.meta, null, fullPath);
}

export function useRouter(watch?: RouterChangeFunc) {
  watch && routerChangeFuncs.push(watch);

  return {
    push(to: RouteConfig | string) {
      jump(to, 'push');
    },
    replace(to: RouteConfig | string) {
      jump(to, 'replace');
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
