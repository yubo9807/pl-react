import { AnyObj, isClient, isFunction, isObject, isPromise, isString, nextTick, createId } from "../utils";
import { h, Fragment, getCurrnetInstance, useState, useMemo, useEffect } from '../instace';
import { config, createRouter, getUrl, useRouter } from "./create-router";
import { temp } from "./ssr-outlet";
import type { Component, CompTree, Tree, TreeValue } from "../types";
import type { BeforeEach, RouteItem } from "./type";

type Props = {
  prefix?:     string
  children?:   CompTree[]
  loading?:    Component | TreeValue
  beforeEach?: BeforeEach
  afterEach?:  (path: string | RegExp) => void
}
function useRoutes(props: Props) {
  return useMemo(() => props.children.map(item => {
    return item.attrs as RouteItem
  }), []);
}
function getRouteKey(path: string | RegExp, url: string) {
  if (isString(path)) return path;
  const matched = url.match(path);
  if (matched) return matched[0];
}

export function BrowserRouter(props: Props) {
  props.prefix ??= '';
  const { prefix, loading, beforeEach } = props;
  const routes = useRoutes(props);

  const [child, setChild] = useState(null);
  const collect = useMemo(() => new Set(), []);

  async function changeComp(route: RouteItem, url: string) {
    if (!route) return setChild(null);

    const { path, element, meta } = route;
    const key = getRouteKey(path, url);
    const attrs: AnyObj = { path: prefix + key, meta }
    const tree = { tag: element, attrs, children: [] }
    if (isFunction(element) && !element.prototype) {
      tree.tag = element();
    }
    if (isPromise(tree.tag)) {
      // loading && !collect.has(key) && setChild(loading);
      tree.tag = (await tree.tag).default;
    } else {
      tree.tag = element;
    }
    if (child?.tag === tree.tag) return;
    collect.add(path);

    const { getInitialProps } = tree.tag;
    if (isFunction(getInitialProps)) {
      // @ts-ignore
      const initialProps = window[config.ssrDataKey];
      if (isObject(initialProps) && initialProps.hasOwnProperty(key)) {
        attrs.data = initialProps[key];
        setChild(tree);
        delete initialProps[key];
      } else {
        loading && setChild(loading);  // 组件无法直接渲染，先渲染loading
        getInitialProps({ url, path }).then(res => {
          tree.attrs.data = res;
        }).catch(err => {
          tree.attrs.error = err;
        }).finally(() => {
          setChild(tree);
          props.afterEach?.(tree.attrs.path);
        })
      }
    } else {
      setChild(tree);
      props.afterEach?.(tree.attrs.path);
    }
  }

  const r = useRouter();
  const router = useMemo(() => {
    return createRouter({
      fristUrl: config.base + r.current.fullPath,
      prefix,
      routes,
      beforeEach,
      controls(route, to) {
        changeComp(route, to.fullPath);
      },
    });
  }, [])

  // 因为 useMemo 缓存的问题，拿不到最新的值，所以将回调重写
  router.option.controls = (route, to) => {
    changeComp(route, to.fullPath);
  }


  useEffect(() => {
    function popstate(e: Event) {
      const url = getUrl().replace(prefix, '');
      r.replace(url);
    }
    window.addEventListener('popstate', popstate);

    // 组件卸载，删除路由
    return () => {
      collect.delete(router);
      window.removeEventListener('popstate', popstate);
    }
  }, [])

  return h(Fragment, {}, child);
}

export function StaticRouter(props: Props) {
  props.prefix ??= '';
  const { prefix, beforeEach } = props;

  const routes = useRoutes(props);

  const app = getCurrnetInstance();
  const id = useMemo(() => 'r_' + createId());

  function replaceStr(tree: TreeValue) {
    nextTick(() => {
      temp.text = temp.text.replace(id, app.renderToString(tree));
      temp.count --;
      temp.count <= 0 && temp.done(temp.text);
    })
  }

  useMemo(() => {
    temp.count ??= 0;
    temp.count ++;
    const url = useRouter().current.fullPath;
    return createRouter({
      fristUrl: config.base + url,
      prefix,
      routes,
      beforeEach,
      async controls(route) {
        if (!route) return replaceStr('');

        const { path, element, meta } = route;
        const key = getRouteKey(path, url);
        const attrs: AnyObj = { path: prefix + key, meta }
        const tree = { tag: element, attrs } as Tree
        if (isFunction(element) && !element.prototype) {
          tree.tag = element();
        }
        if (isPromise(tree.tag)) {
          tree.tag = (await tree.tag).default;
        } else {
          tree.tag = element;
        }

        // @ts-ignore
        const { getInitialProps } = tree.tag;
        if (isFunction(getInitialProps)) {
          getInitialProps({ url, path }).then(res => {
            // 服务端数据
            temp.data[key] = res;
            attrs.data = res;
          }).catch(err => {
            attrs.errotr = err;
          }).finally(() => {
            replaceStr(tree);
          })
        } else {
          replaceStr(tree);
        }
      },
    });
  }, [])

  // @ts-ignore
  return h(Fragment, {}, id);
}

export function Router(props: Props) {
  return h(isClient() ? BrowserRouter : StaticRouter, props);
}

export function Route(props: RouteItem) {}
