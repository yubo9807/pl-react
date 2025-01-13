import { ExcludeKey, isClient, isEquals, isRegExp, isString, PromiseType } from "../utils"
import { BeforeEach, PartialRoute, ResultRoute, RouteItem } from "./type"
import { parseUrl, stringifyUrl } from "./utils"

export const config = {
  base:       '',
  mode:       'history' as 'history' | 'hash',
  ssrDataKey: 'g_initialProps',
}

// 当前路由
let currentRoute: ResultRoute
export function setCurrentRoute(url: string) {
  currentRoute = parseUrl(url);
}

/**
 * 根据模式获取当前 url
 * @returns 
 */
export function getUrl() {
  const { origin, href, hash } = location;
  if (config.mode === 'history') {
    return href.replace(origin + config.base, '');
  }
  return hash.slice(1);
}

/**
 * 初始化路由配置
 * @param option 
 */
export function initRouter(option: Partial<typeof config>) {
  Object.assign(config, option);
  if (!isClient()) return;
  setCurrentRoute(getUrl());
}

/**
 * 查找路由配置
 * @param routes 
 * @param pathname 
 * @returns 
 */
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
  beforeEach?: BeforeEach
}

class Router {
  option:       ExcludeKey<Option, 'fristUrl'>
  beforeEach:   BeforeEach
  currentRoute: ResultRoute

  constructor(option: Option) {
    option.prefix ??= '';
    const { beforeEach, fristUrl, ...args } = option;
    this.beforeEach = beforeEach || ((to, from, next) => next());
    this.option = args;
    const base = config.base;
    if (!fristUrl.startsWith(base)) return;
    this.change(fristUrl.replace(base, ''));
  }  

  change(target: PartialRoute | string) {
    return new Promise<{ to: ResultRoute, from: ResultRoute }>(resolve => {
      const targetStr = isString(target) ? target : stringifyUrl(target);
      const to = parseUrl(targetStr);

      const { prefix, routes, controls } = this.option;

      const from = { ...this.currentRoute };
      if (isEquals(target, from)) return;

      this.beforeEach(to, from, () => {
        this.currentRoute = to;
        const query = queryRoute(routes, to.fullPath.replace(prefix, ''));

        function finish() {
          controls(query);
          resolve({ to, from });
        }

        if (query && query.beforeEach) {
          query.beforeEach(to, from, () => {
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


type RouterChangeFunc = (to: ResultRoute, from: ResultRoute) => void;
const routerChangeSet: Set<RouterChangeFunc> = new Set();
/**
 * 路由监听
 * @param func 
 * @returns 
 */
function monitor(func: RouterChangeFunc) {
  routerChangeSet.add(func);
  func(currentRoute, currentRoute);
  return () => {
    routerChangeSet.delete(func);
  }
}

/**
 * 路由跳转
 * @param to 
 * @param type 
 */
async function jump(to: PartialRoute | string, type: 'push' | 'replace') {
  let target: PromiseType<ReturnType<Router['change']>>
  for (const router of collect.values()) {
    const res = await router.change(to);
    target = res;
  }
  if (isEquals(target.to, target.from)) return;

  // 当前路由
  currentRoute = target.to;

  // 执行注册的监听路由方法
  routerChangeSet.forEach(func => {
    func(target.to, target.from);
  })

  const url = target.to.fullPath;
  if (!isClient()) return;
  if (config.mode === 'history') {
    history[type + 'State'](isString(to) ? {} : to.meta, null, config.base + url);
  } else {
    location.hash = url;
  }
}

export function useRouter() {
  return {
    push(to: PartialRoute | string) {
      jump(to, 'push');
    },
    replace(to: PartialRoute | string) {
      jump(to, 'replace');
    },
    go(delta: number) {
      history.go(delta);
    },
    monitor,
    current: currentRoute,
  }
}
