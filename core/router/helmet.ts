import { getCurrnetInstance, useEffect, useMemo } from "..";
import { Fragment, h } from "../tools";
import { nodes_replaceWith } from "../client";
import { renderToString } from "../server";
import { customForEach, isClient } from "../utils";
import { temp } from "./ssr-outlet";
import type { Tree } from "../types"

const nodeArr: [HTMLElement, HTMLElement[]][] = [];

function helmet(config: { [k: string]: Tree }) {

  const client = isClient();
  if (client) {
    const { convert } = getCurrnetInstance();
    const childNodes = [...document.head.childNodes];
    for (const key in config) {
      const query = childNodes.find(val => val.nodeType === 8 && val.nodeValue.trim() === key) as HTMLElement;
      if (!query) return;
      const tree = config[key];

      const nodes = convert(tree);
      nodes_replaceWith(nodes, [query]);
      nodeArr.push([query, nodes]);
    }
  } else {
    for (const key in config) {
      const tree = config[key];
      const str = renderToString(tree);
      temp.html = temp.html.replace(`<!-- ${key} -->`, str);
    }
  }

  function destroy() {
    if (!client) return;  // 服务端不需要销毁
    customForEach(nodeArr, val => {
      const [text, nodes] = val;
      nodes_replaceWith([text], nodes);
    })
    for (const key in config) {
      const index = nodeArr.findIndex(val => val[0].nodeValue.trim() === key);
      if (index >= 0) {
        nodeArr.splice(index, 1);
      }
    }
  }

  return destroy;
}

type Props = {
  config: Parameters<typeof helmet>[0]
}
export function Helmet(props: Props) {
  const destroy = useMemo(() => helmet(props.config), []);
  useEffect(() => destroy, []);
  return h(Fragment);
}
