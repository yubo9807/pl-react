import { h, Fragment, useState, useMemo, CompTree, useEffect, StyleObject } from "..";
import { RefItem } from "../hooks";
import { renderToString } from "../server";
import { isClient, isFunction, isObject, nextTick } from "../utils";
import { createId } from "../utils/string";
import { collect, createRouter, useRouter } from "./create-router";
import { temp } from "./ssr-outlet";
import { RouteConfig, RouteItem } from "./type";
import { stringifyUrl } from "./utils";

let count = 0;

type Props = {
  base?:     string
  children?: CompTree[]
}
export function Router(props: Props) {
  const { base, children } = props;

  const routes = useMemo(() => children.map(item => {
    const route = item.attrs as RouteItem
    if (route.path) route.path = (base || '') + route.path;
    return route;
  }), []);

  const client = isClient();
  const [child, setChild] = useState(client ? null : 'r_' + createId());

  function updateChild(tree) {
    count --;
    if (client) {
      setChild(tree);
    } else {
      nextTick(() => {
        const result = temp.text.replace(child, renderToString(tree));
        count === 0 && temp.done(result);
      })
    }
  }

  const router = useMemo(() => {
    count ++;
    return createRouter({
      fristUrl: client ? location.href.replace(location.origin, '') : temp.url,
      base: props.base,
      routes,
      controls(route) {
        const tree = route.element
        const { getInitialProps } = tree.tag;
        if (isFunction(getInitialProps)) {
          getInitialProps().then(res => {
            tree.attrs.data = res;
            updateChild(tree);
          })
        } else {
          updateChild(tree);
        }
      },
    });
  }, [])

  useEffect(() => {
    return () => {
      collect.delete(router);
    }
  }, [])

  // @ts-ignore
  return h(Fragment, {}, child);
}

export function Route(props: RouteItem) {}

type LinkProps = {
  to:         RouteConfig | string
  type?:      'push' | 'replace'
  className?: string | string[]
  style?:     StyleObject
  ref?:       RefItem<HTMLAnchorElement>
  children?:  any[]
  onClick?:   (to: string, next: (to?: RouteConfig | string) => void) => void
} & {
  [K in keyof HTMLAnchorElement]?: HTMLAnchorElement[K]
}
export function Link(props: LinkProps) {
  const { to, type, children, onClick, ...args } = props;
  if (isObject(to)) {
    props.to = stringifyUrl(to);
  }

  const router = useRouter();

  function onclick(e) {
    e.preventDefault();

    function next(to = props.to) {
      router[type === 'replace' ? 'replace' : 'push'](to)
    }

    if (onClick) {
      onClick(to as string, next);
    } else {
      next();
    }
  }

  return h('a', {
    ...args,
    href: props.to,
    onclick,
  }, ...children);
}