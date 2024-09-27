import type { StyleObject } from "../client"
import type { RefItem } from "../hooks"
import { isObject } from "../utils"
import { h } from "../tools"
import { useRouter } from "./create-router"
import type { RouteConfig } from "./type"
import { stringifyUrl } from "./utils"

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
