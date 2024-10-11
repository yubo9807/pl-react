import { h, Fragment } from '../tools';
import { useState, useMemo, useEffect } from "..";
import { renderToString } from "../server";
import { isClient, isFunction, isObject, isString, nextTick } from "../utils";
import { createId } from "../utils/string";
import { collect, createRouter } from "./create-router";
import { temp } from "./ssr-outlet";
import type { CompTree, TreeValue } from "../types";
import type { RouteItem } from "./type";

type Props = {
  base?:     string
  children?: CompTree[]
}
function useRoutes(props: Props) {
  const { base, children } = props;
  return useMemo(() => children.map(item => {
    const route = item.attrs as RouteItem
    if (route.path) route.path = (base || '') + route.path;
    return route;
  }), []);
}
function getRouteKey(path: string | RegExp, url: string) {
  if (isString(path)) return path;
  const matched = url.match(path);
  if (matched) return matched[0];
}

export function BrowserRouter(props: Props) {
  const { base } = props;
  const routes = useRoutes(props);

  const [child, setChild] = useState(null);

  const router = useMemo(() => {
    const fristUrl = location.href.replace(location.origin, '');
    return createRouter({
      fristUrl,
      base,
      routes,
      controls(route) {
        const tree = route.element;

        const { getInitialProps } = tree.tag;
        const key = getRouteKey(route.path, fristUrl);
        // @ts-ignore
        const { g_initialProps } = window;

        if (isFunction(getInitialProps)) {
          if (isObject(g_initialProps) && g_initialProps.hasOwnProperty(key)) {
            tree.attrs.data = g_initialProps[key];
            setChild(tree);
            delete g_initialProps[key];
          } else {
            getInitialProps().then(res => {
              tree.attrs.data = res;
              setChild(tree);
            })
          }
        } else {
          setChild(tree);
        }
      },
    });
  }, [])

  // 组件卸载，删除路由
  useEffect(() => {
    return () => {
      collect.delete(router);
    }
  }, [])

  return h(Fragment, {}, child);
}

let count = 0;
export function StaticRouter(props: Props) {
  const { base } = props;

  const routes = useRoutes(props);

  const [child] = useState('r_' + createId());

  function replaceStr(tree: TreeValue) {
    count --;
    nextTick(() => {
      const result = temp.text.replace(child, renderToString(tree));
      count === 0 && temp.done(result);
    })
  }

  const router = useMemo(() => {
    count ++;
    const fristUrl = temp.url;
    return createRouter({
      fristUrl,
      base,
      routes,
      controls(route) {
        const tree = route.element;
        const { getInitialProps } = tree.tag;
        if (isFunction(getInitialProps)) {
          getInitialProps().then(res => {
            // 服务端数据
            const key = getRouteKey(route.path, fristUrl);
            temp.data[key] = res;

            tree.attrs.data = res;
            replaceStr(tree);
          })
        } else {
          replaceStr(tree);
        }
      },
    });
  }, [])

  // @ts-ignore
  return h(Fragment, {}, child);
}

export function Router(props: Props) {
  return h(isClient() ? BrowserRouter : StaticRouter, props);
}

export function Route(props: RouteItem) {}
