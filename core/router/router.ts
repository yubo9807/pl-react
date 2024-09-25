import { h, Fragment, useState, useMemo, CompTree, useEffect, StyleObject } from "..";
import { RefItem } from "../hooks";
import { isObject } from "../utils";
import { collect, createRouter, queryRoute, useRouter } from "./create-router";
import { RouteConfig, RouteItem } from "./type";
import { stringifyUrl } from "./utils";

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
  const fristUrl = useMemo(() => location.href.replace(location.origin, ''), [])
  const [child, setChild] = useState(() => {
    const query = queryRoute(routes, fristUrl);
    return query && query.element;
  });

  const router = useMemo(() => {
    return createRouter({
      base: props.base,
      routes,
      controls(route) {
        setChild(route.element);
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