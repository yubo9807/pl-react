import { h, Fragment } from '../tools';
import { useState, useMemo, useEffect } from "..";
import { AnyObj, isClient, isFunction, isObject, isPromise, isString, nextTick } from "../utils";
import { createId } from "../utils";
import { collect, config, createRouter, queryRoute } from "./create-router";
import { temp } from "./ssr-outlet";
import type { Component, CompTree, Tree, TreeValue } from "../types";
import type { BeforeEach, RouteItem } from "./type";
import { parseUrl } from './utils';
import { getCurrnetInstance } from '../client';

type Props = {
  prefix?:     string
  children?:   CompTree[]
  loading?:    Component | TreeValue
  beforeEach?: BeforeEach
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

  async function changeComp(route: RouteItem, url: string) {
    if (!route) return setChild(null);

    const { path, element, meta } = route;
    const key = getRouteKey(path, url);
    const attrs: AnyObj = { path: prefix + key, meta }
    const tree = { tag: element, attrs }

    if (isPromise(element)) {
      tree.tag = (await element).default;
    }

    const { getInitialProps } = element;

    if (isFunction(getInitialProps)) {
      // @ts-ignore
      const initialProps = window[config.ssrDataKey];
      if (isObject(initialProps) && initialProps.hasOwnProperty(key)) {
        attrs.data = initialProps[key];
        setChild(tree);
        delete initialProps[key];
      } else {
        loading && setChild(loading);  // 组件无法直接渲染，先渲染loading
        getInitialProps().then(res => {
          tree.attrs.data = res;
          setChild(tree);
        })
      }
    } else {
      setChild(tree);
    }
  }

  const router = useMemo(() => {
    const fristUrl = location.pathname;
    return createRouter({
      fristUrl,
      prefix,
      routes,
      beforeEach,
      controls(route) {
        changeComp(route, fristUrl);
      },
    });
  }, [])


  useEffect(() => {
    function popstate(e: Event) {
      const { origin, href } = location;
      const url = href.replace(origin + prefix, '');
      const route = queryRoute(routes, url);
      changeComp(route, url);
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
  const [child] = useState('r_' + createId());

  function replaceStr(tree: TreeValue) {
    temp.count --;
    nextTick(() => {
      const result = temp.text.replace(child, app.renderToString(tree));
      temp.count === 0 && temp.done(result);
    })
  }

  const router = useMemo(() => {
    temp.count ??= 0;
    temp.count ++;
    const fristUrl = parseUrl(temp.url).path;
    return createRouter({
      fristUrl,
      prefix,
      routes,
      beforeEach,
      async controls(route) {
        if (!route) return replaceStr('');

        const { path, element, meta } = route;
        const key = getRouteKey(path, fristUrl);
        const attrs: AnyObj = { path: prefix + key, meta }
        const tree = { tag: element, attrs } as Tree

        if (isPromise(element)) {
          tree.tag = (await element).default;
        }

        // @ts-ignore
        const { getInitialProps } = tree.tag;
        if (isFunction(getInitialProps)) {
          getInitialProps().then(res => {
            // 服务端数据
            temp.data[key] = res;

            attrs.data = res;
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
