import { isObject } from "../utils"
import { h, useEffect, useState } from "../instace"
import { config, useRouter } from "./create-router"
import { stringifyUrl } from "./utils"
import type { PartialRoute } from "./type"
import type { StyleObject } from "../types"
import type { RefItem } from "../hooks"

type LinkProps = {
  to:         PartialRoute | string
  type?:      'push' | 'replace'
  className?: string | string[]
  style?:     StyleObject
  ref?:       RefItem<HTMLAnchorElement>
  children?:  any[]
  onClick?:   (to: string, next: (to?: PartialRoute | string) => void) => void
} & {
  [K in keyof HTMLAnchorElement]?: HTMLAnchorElement[K]
}
export function Link(props: LinkProps) {
  const { to, type, children, onClick, className, ...args } = props;
  if (isObject(to)) {
    props.to = stringifyUrl(to);
  }

  const [classList, setClassList] = useState([]);

  const router = useRouter();
  // 路由监听
  useEffect(() => router.monitor(to => {
    const routePath = props.to + '/', toPath = to.path + '/';
    setClassList([
      toPath.startsWith(routePath) ? 'active' : '',
      toPath === routePath ? 'exact-active' : '',
      ...[className].flat(),
    ]);
  }), [className]);

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

  const href = config.mode === 'history' ? config.base + props.to : '#' + props.to;
  return h('a', {
    ...args,
    className: classList,
    href,
    onclick,
  }, ...children);
}
