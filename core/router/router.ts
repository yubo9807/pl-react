import { h, Fragment } from '../tools';
import { useState, useMemo, useEffect } from "..";
import { renderToString } from "../server";
import { isClient, isFunction, nextTick } from "../utils";
import { createId } from "../utils/string";
import { collect, createRouter } from "./create-router";
import { temp } from "./ssr-outlet";
import type { CompTree } from "../types";
import type { RouteItem } from "./type";

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
