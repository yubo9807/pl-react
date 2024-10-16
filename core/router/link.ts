import { isObject } from "../utils"
import { h } from "../tools"
import { useRouter } from "./create-router"
import { stringifyUrl } from "./utils"
import type { RouteConfig } from "./type"
import type { StyleObject } from "../types"
import type { RefItem } from "../hooks"
import { useState } from ".."

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
  const { to, type, children, onClick, className, ...args } = props;
  if (isObject(to)) {
    props.to = stringifyUrl(to);
  }

  const [classList, setClassList] = useState([]);
  const router = useRouter(to => {
    const routePath = props.to + '/', toPath = to.path + '/';
    setClassList([
      toPath.startsWith(routePath) ? 'active' : '',
      toPath === routePath ? 'exact-active' : '',
      ...[className].flat(),
    ]);
  });

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
    className: classList,
    href: props.to,
    onclick,
  }, ...children);
}
